import { fontDown, fontUp, contrastToggle, visionOptions, visionNote, visionControl, visionTrigger } from './elementos.js';
import { showToast } from './feedback.js';
import { updateVisualIdentity } from './identidade.js';
import { positionMarker } from './imagem.js';

const SETTINGS_KEY = "identificaCor.settings";
const FONT_LEVELS = [
  { percent: 100, label: "normal" },
  { percent: 115, label: "grande" },
  { percent: 130, label: "muito grande" }
];
let fontLevel = 0;
let highContrast = false;
const VISION_LABELS = {
  normal: "Original (azul)",
  protanopia: "Protanopia",
  deuteranopia: "Deuteranopia",
  tritanopia: "Tritanopia",
  acromatopsia: "Acromatopsia"
};
let vision = "normal";



function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    fontLevel = Math.max(0, Math.min(FONT_LEVELS.length - 1, parseInt(saved.font, 10) || 0));
    highContrast = Boolean(saved.contrast);
    vision = Object.hasOwn(VISION_LABELS, saved.vision) ? saved.vision : "normal";
  } catch { /* sem armazenamento: usa o padrão */ }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ font: fontLevel, contrast: highContrast, vision }));
  } catch { /* ignorar */ }
}

export function applySettings() {
  document.documentElement.style.fontSize = FONT_LEVELS[fontLevel].percent + "%";
  if (highContrast) document.documentElement.setAttribute("data-contrast", "high");
  else document.documentElement.removeAttribute("data-contrast");
  fontDown.disabled = fontLevel === 0;
  fontUp.disabled = fontLevel === FONT_LEVELS.length - 1;
  contrastToggle.setAttribute("aria-pressed", String(highContrast));
  document.documentElement.setAttribute("data-vision", vision);
  updateVisualIdentity(vision);
  visionOptions.forEach(option => {
    const selected = option.dataset.vision === vision;
    option.setAttribute("aria-pressed", String(selected));
    option.classList.toggle("is-active", selected);
  });
  visionNote.textContent = highContrast
    ? "Alto contraste está ativo e tem prioridade sobre o modo de cores. A imagem e seus códigos continuam originais."
    : vision === "normal"
      ? "Os modos de cores alteram somente a interface, não as cores nem os códigos da imagem enviada."
      : `Paleta de interface para ${VISION_LABELS[vision]} ativa. Não é uma simulação médica nem altera sua fotografia ou seus códigos HEX/RGB.`;
  requestAnimationFrame(positionMarker);
}


export function initSettings() {
  loadSettings();
  applySettings();
fontDown.addEventListener("click", () => {
  if (fontLevel > 0) fontLevel--;
  applySettings(); saveSettings();
  showToast(`Tamanho do texto: ${FONT_LEVELS[fontLevel].label}`);
});
fontUp.addEventListener("click", () => {
  if (fontLevel < FONT_LEVELS.length - 1) fontLevel++;
  applySettings(); saveSettings();
  showToast(`Tamanho do texto: ${FONT_LEVELS[fontLevel].label}`);
});
contrastToggle.addEventListener("click", () => {
  highContrast = !highContrast;
  applySettings(); saveSettings();
  showToast(highContrast ? "Alto contraste ativado" : "Alto contraste desativado");
});
visionOptions.forEach(option => {
  option.addEventListener("click", () => {
    vision = Object.hasOwn(VISION_LABELS, option.dataset.vision) ? option.dataset.vision : "normal";
    applySettings(); saveSettings();
    visionControl.open = false;
    visionTrigger.focus();
    showToast(highContrast ? "Desative o alto contraste para ver a nova paleta." : `Modo de cores: ${VISION_LABELS[vision]}`);
  });
});

// Fecha o menu se a pessoa clicar fora ou apertar Escape.
document.addEventListener("click", event => {
  if (visionControl.open && !visionControl.contains(event.target)) visionControl.open = false;
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && visionControl.open) {
    visionControl.open = false;
    visionTrigger.focus();
  }
});


}
