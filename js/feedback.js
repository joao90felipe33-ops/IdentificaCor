import { toast, liveRegion, speakColorButton, speakHarmony } from './elementos.js';
import { getCurrentColor } from './resultado.js';

let toastTimer;
export function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}


export function announce(message) {
  // Limpa antes para o leitor de tela repetir mensagens iguais.
  liveRegion.textContent = "";
  setTimeout(() => { liveRegion.textContent = message; }, 30);
}


export async function copyText(value, message = "Informação copiada!") {
  try {
    await navigator.clipboard.writeText(value);
    showToast(message);
  } catch {
    showToast("Não foi possível copiar automaticamente.");
  }
}


export function speakText(text) {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    showToast("Seu navegador não oferece leitura em voz alta.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.95;
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang === "pt-BR") ||
                voices.find(v => v.lang.toLowerCase().startsWith("pt"));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}


export function speakColorName(name) {
  speakText(`Cor aproximada: ${name}.`);
}

export function initVoice() {
speakColorButton.addEventListener("click", () => {
  const color = getCurrentColor();
  if (color) speakColorName(color.name);
});
speakHarmony.addEventListener("click", () => {
  const color = getCurrentColor();
  if (color) speakColorName(color.name);
});

}
