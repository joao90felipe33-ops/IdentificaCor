/* Identifica Cor v1.2.0
 * Comparador opcional e independente do identificador principal.
 * Não escreve no histórico, na cor atual, nem altera os pixels do canvas.
 */
import {
  canvas, pixelMarker, compareToggle, compareToggleLabel, compareWorkspace,
  compareStatus, compareReset, compareSpeak, compareSummary,
  compareDescription, compareContrast, compareMarkerA, compareMarkerB
} from './elementos.js';
import { rgbToHex, approximateColorName, rgbToHsl } from './cores.js';
import { registerCompareHandlers, hasLoadedImage, hideMarker } from './imagem.js';
import { showToast, announce, speakText } from './feedback.js';

let active = false;
let first = null;
let second = null;
let explanation = '';
let contrastExplanation = '';
const sampleNodes = ['A', 'B'].map(id => ({
  preview: document.getElementById(`comparePreview${id}`),
  name: document.getElementById(`compareName${id}`),
  hex: document.getElementById(`compareHex${id}`)
}));

function colorForPoint(point) {
  return {
    ...point,
    hex: rgbToHex(point.r, point.g, point.b),
    name: approximateColorName(point.r, point.g, point.b)
  };
}

function showSample(node, color) {
  node.preview.style.background = color ? color.hex : '';
  node.name.textContent = color ? color.name : 'Aguardando seleção';
  node.hex.textContent = color ? color.hex : '—';
}

function rgbLuminance(color) {
  const linear = [color.r, color.g, color.b].map(v => {
    const s = v / 255;
    return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
  });
  return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
}

// Luminosidade perceptual OKLab para construir frases mais naturais.
function oklabLightness(color) {
  const linear = [color.r, color.g, color.b].map(v => {
    const s = v / 255;
    return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
  });
  const [r, g, b] = linear;
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return .2104542553 * l + .7936177850 * m - .0040720468 * s;
}

function describeDifference(a, b) {
  if (a.hex === b.hex) return 'As duas amostras têm os mesmos valores RGB e HEX.';
  const statements = [];
  const lightDiff = oklabLightness(a) - oklabLightness(b);
  if (Math.abs(lightDiff) < .035) {
    statements.push('As duas cores possuem luminosidade semelhante');
  } else {
    statements.push(`A cor A é ${lightDiff > 0 ? 'mais clara' : 'mais escura'} que a cor B`);
  }
  const satA = rgbToHsl(a.r, a.g, a.b)[1];
  const satB = rgbToHsl(b.r, b.g, b.b)[1];
  const saturationDiff = satA - satB;
  if (Math.abs(saturationDiff) > .12) {
    statements.push(`a cor A é ${saturationDiff > 0 ? 'mais intensa (saturada)' : 'menos intensa (saturada)'} que a cor B`);
  } else {
    statements.push('elas têm níveis de saturação semelhantes');
  }
  return statements[0] + ', e ' + statements[1] + '.';
}

function updateSummary() {
  if (!first || !second) {
    explanation = '';
    contrastExplanation = '';
    compareSummary.hidden = true;
    compareSpeak.disabled = true;
    return;
  }
  explanation = describeDifference(first, second);
  const lumA = rgbLuminance(first), lumB = rgbLuminance(second);
  const ratio = (Math.max(lumA, lumB) + .05) / (Math.min(lumA, lumB) + .05);
  contrastExplanation = `Contraste de luminância entre elas: ${ratio.toFixed(2).replace('.', ',')}:1.`;
  compareDescription.textContent = explanation;
  compareContrast.textContent = contrastExplanation;

  // Atualiza a comparação visual
  const visualA = document.getElementById("compareVisualA");
  const visualB = document.getElementById("compareVisualB");
  visualA.style.backgroundColor = first.hex;
  visualB.style.backgroundColor = second.hex;
  
  compareSummary.hidden = false;
  compareSpeak.disabled = false;
}

function updateStatus() {
  if (!hasLoadedImage()) {
    compareStatus.textContent = 'Envie uma fotografia no campo “Sua imagem” para começar.';
  } else if (!first) {
    compareStatus.textContent = 'Comparador ativado: selecione o primeiro ponto (cor A) na imagem acima.';
  } else if (!second) {
    compareStatus.textContent = 'Cor A registrada! Agora selecione outro ponto para definir a cor B.';
  } else {
    compareStatus.textContent = 'Comparação concluída. Clique novamente na imagem para iniciar outra comparação.';
  }
}

function positionOneMarker(marker, sample) {
  if (!active || !sample || !canvas.width || !canvas.height) {
    marker.hidden = true;
    return;
  }
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) { marker.hidden = true; return; }
  const scale = Math.min(rect.width / canvas.width, rect.height / canvas.height);
  const offsetX = (rect.width - canvas.width * scale) / 2;
  const offsetY = (rect.height - canvas.height * scale) / 2;
  marker.style.left = (offsetX + (sample.x + .5) * scale) + 'px';
  marker.style.top = (offsetY + (sample.y + .5) * scale) + 'px';
  marker.hidden = false;
}

function updateMarkers() {
  positionOneMarker(compareMarkerA, first);
  positionOneMarker(compareMarkerB, second);
}

function update() {
  showSample(sampleNodes[0], first);
  showSample(sampleNodes[1], second);
  updateSummary();
  updateStatus();
  updateMarkers();
}

function resetComparison(announceReset = false) {
  first = null;
  second = null;
  update();
  if (announceReset) showToast('Comparação limpa. Selecione novamente as cores A e B.');
}

function setActive(nextActive) {
  active = nextActive;
  compareToggle.setAttribute('aria-pressed', String(active));
  compareToggleLabel.textContent = active ? 'Desativar comparador' : 'Ativar comparador';
  compareWorkspace.hidden = !active;
  canvas.closest('.canvas-wrap').classList.toggle('compare-active', active);
  // Não altera o resultado principal; ao encerrar, o clique volta a funcionar como antes.
  hideMarker();
  update();
  showToast(active ? 'Comparador ativo: escolha as cores A e B na foto.' : 'Identificador principal ativo.');
}

function capturePoint(point) {
  if (!active) return false;
  const color = colorForPoint(point);
  if (!first || second) {
    first = color;
    second = null;
  } else {
    second = color;
  }
  update();
  announce(second ? `Comparação concluída: ${explanation} ${contrastExplanation}` : `Cor A selecionada: ${first.name}. Selecione a cor B.`);
  return true;
}

export function initComparator() {
  registerCompareHandlers({
    onPoint: capturePoint,
    onImageLoaded: () => {
      resetComparison();
      if (active) announce('Nova imagem carregada. Selecione a primeira cor para comparar.');
    }
  });
  compareToggle.addEventListener('click', () => setActive(!active));
  compareReset.addEventListener('click', () => resetComparison(true));
  compareSpeak.addEventListener('click', () => {
    if (first && second) speakText(`Cor A: ${first.name}. Cor B: ${second.name}. ${explanation} ${contrastExplanation}`);
  });
  window.addEventListener('resize', updateMarkers);
  if ('ResizeObserver' in window) new ResizeObserver(updateMarkers).observe(canvas);
  update();
}
