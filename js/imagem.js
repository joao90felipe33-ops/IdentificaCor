import { imageInput, chooseImage, changeImage, dropZone, imageStage, canvas, ctx, imageMessage, emptyResult, colorResult, pixelMarker } from './elementos.js';
import { showToast } from './feedback.js';
import { displayColor, resetCurrentColor } from './resultado.js';
import { extractPalette, renderPalette } from './paleta.js';

const sampleImageButton = document.getElementById("sampleImageButton");

const SAMPLE_RADIUS = 2;
let currentImage = null;
// A funcionalidade principal é a padrão; o comparador só intercepta pontos quando ativado.
let comparePointHandler = null;
let compareImageLoaded = null;
export function hasLoadedImage() { return currentImage !== null; }
export function registerCompareHandlers({ onPoint, onImageLoaded }) {
  comparePointHandler = onPoint;
  compareImageLoaded = onImageLoaded;
}

function openPicker() { imageInput.click(); }
chooseImage.addEventListener("click", (event) => { event.stopPropagation(); openPicker(); });
changeImage.addEventListener("click", openPicker);
dropZone.addEventListener("click", (event) => {
  if (event.target !== chooseImage) openPicker();
});
dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPicker(); }
});
imageInput.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (file) loadImage(file);
  imageInput.value = "";
});

["dragenter", "dragover"].forEach(type => dropZone.addEventListener(type, event => {
  event.preventDefault(); dropZone.classList.add("dragover");
}));
["dragleave", "drop"].forEach(type => dropZone.addEventListener(type, event => {
  event.preventDefault(); dropZone.classList.remove("dragover");
}));
dropZone.addEventListener("drop", event => {
  const file = event.dataTransfer.files && event.dataTransfer.files[0];
  if (file) loadImage(file);
});

sampleImageButton.addEventListener("click", async () => {
  try {
    const response = await fetch("imagens/imagem_teste.png");

    if (!response.ok) {
      throw new Error("Imagem não encontrada");
    }

    const blob = await response.blob();

    const file = new File(
      [blob],
      "imagem_teste.png",
      { type: "image/png" }
    );

    loadImage(file);

  } catch (error) {
    showToast("Não foi possível carregar a imagem de teste.");
    console.error(error);
  }
});

function loadImage(file) {
  if (!file.type.startsWith("image/")) { showToast("Selecione um arquivo de imagem."); return; }
  if (file.size > 12 * 1024 * 1024) { showToast("A imagem deve ter até 12 MB."); return; }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      const maxSide = 1400;
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      dropZone.hidden = true;
      sampleImageButton.hidden = true;
      imageStage.hidden = false;
      changeImage.hidden = false;
      imageMessage.textContent = "Imagem carregada. Clique ou toque em um ponto para consultar a cor.";
      emptyResult.hidden = false;
      colorResult.hidden = true;
      resetCurrentColor();
      hideMarker();
      if (compareImageLoaded) compareImageLoaded();
      renderPalette(extractPalette(6), color => {
        hideMarker();
        displayColor(color.r, color.g, color.b);
      });
      showToast("Imagem carregada com sucesso!");
    };
    img.onerror = () => showToast("Não foi possível abrir essa imagem.");
    img.src = reader.result;
  };
  reader.onerror = () => showToast("Não foi possível ler o arquivo.");
  reader.readAsDataURL(file);
}

// Onde a imagem realmente aparece dentro do canvas (ele usa object-fit: contain,
// então pode haver margens vazias nas laterais ou em cima/embaixo).
function getDisplayMetrics() {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height || !canvas.width || !canvas.height) return null;
  const scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
  const w = canvas.width * scale;
  const h = canvas.height * scale;
  return { rect, scale, w, h, offsetX: (rect.width - w) / 2, offsetY: (rect.height - h) / 2 };
}

// Converte o clique em coordenadas da imagem. Retorna null se cair fora da imagem.
function getCanvasPoint(event) {
  const m = getDisplayMetrics();
  if (!m) return null;
  const px = event.clientX - m.rect.left - m.offsetX;
  const py = event.clientY - m.rect.top - m.offsetY;
  if (px < 0 || py < 0 || px >= m.w || py >= m.h) return null;
  return {
    x: Math.max(0, Math.min(canvas.width - 1, Math.floor(px / m.scale))),
    y: Math.max(0, Math.min(canvas.height - 1, Math.floor(py / m.scale)))
  };
}

/* Marcador do ponto escolhido (também usado pelo teclado). */
let marker = null;

export function positionMarker() {
  const m = marker && getDisplayMetrics();
  if (!m) { pixelMarker.hidden = true; return; }
  pixelMarker.style.left = (m.offsetX + (marker.x + 0.5) * m.scale) + "px";
  pixelMarker.style.top = (m.offsetY + (marker.y + 0.5) * m.scale) + "px";
  pixelMarker.hidden = false;
}

export function hideMarker() {
  marker = null;
  pixelMarker.hidden = true;
}

function selectPoint(x, y) {
  marker = { x, y };
  positionMarker();
  const color = averageColorAt(x, y);
  if (!color) { showToast("Esse ponto da imagem é transparente."); return; }
  // Somente no modo de comparação, coleta A/B e mantém resultado e histórico originais intactos.
  if (comparePointHandler && comparePointHandler({ x, y, r: color[0], g: color[1], b: color[2] })) return;
  displayColor(color[0], color[1], color[2]);
}

window.addEventListener("resize", positionMarker);
if ("ResizeObserver" in window) new ResizeObserver(positionMarker).observe(canvas);

// Média das cores de uma pequena área ao redor do ponto (ignora pixels transparentes).
function averageColorAt(x, y, radius = SAMPLE_RADIUS) {
  const x0 = Math.max(0, x - radius);
  const y0 = Math.max(0, y - radius);
  const x1 = Math.min(canvas.width - 1, x + radius);
  const y1 = Math.min(canvas.height - 1, y + radius);
  const data = ctx.getImageData(x0, y0, x1 - x0 + 1, y1 - y0 + 1).data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 10) continue;
    r += data[i]; g += data[i + 1]; b += data[i + 2];
    count++;
  }
  if (!count) return null;
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

canvas.addEventListener("click", event => {
  if (!currentImage) return;
  const point = getCanvasPoint(event);
  if (!point) return;
  selectPoint(point.x, point.y);
});

// Teclado: setas movem o marcador (Shift = passo maior), Enter ou Espaço identificam a cor.
const ARROW_KEYS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

function ensureMarker() {
  if (!marker) marker = { x: Math.floor(canvas.width / 2), y: Math.floor(canvas.height / 2) };
}

canvas.addEventListener("focus", () => {
  if (!currentImage) return;
  ensureMarker();
  positionMarker();
});

canvas.addEventListener("keydown", event => {
  if (!currentImage) return;
  const arrow = ARROW_KEYS[event.key];
  if (arrow) {
    event.preventDefault();
    ensureMarker();
    const base = Math.max(1, Math.round(Math.max(canvas.width, canvas.height) / 100));
    const step = event.shiftKey ? base * 5 : base;
    marker.x = Math.max(0, Math.min(canvas.width - 1, marker.x + arrow[0] * step));
    marker.y = Math.max(0, Math.min(canvas.height - 1, marker.y + arrow[1] * step));
    positionMarker();
    return;
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    ensureMarker();
    selectPoint(marker.x, marker.y);
  }
});
