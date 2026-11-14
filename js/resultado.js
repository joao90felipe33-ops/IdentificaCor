import { largeSwatch, colorName, hexValue, rgbValue, emptyResult, colorResult } from './elementos.js';
import { rgbToHex, approximateColorName } from './cores.js';
import { announce, copyText } from './feedback.js';
import { storeHistory } from './historico.js';

let currentColor = null;
export function getCurrentColor() { return currentColor; }
export function resetCurrentColor() { currentColor = null; }

export function displayColor(r, g, b, addToHistory = true) {
  const hex = rgbToHex(r, g, b);
  const name = approximateColorName(r, g, b);
  currentColor = { r, g, b, hex, name };

  const colorPreview = document.getElementById("colorPreview");

  colorPreview.style.backgroundColor = hex;

  colorPreview.setAttribute(
    "aria-label",
    `Prévia da cor ${name}, código ${hex}`
  );

  largeSwatch.setAttribute("aria-label", `Amostra da cor ${name}, ${hex}. Abrir cores semelhantes e combinações.`);
  colorName.textContent = name;
  hexValue.textContent = hex;
  rgbValue.textContent = `${r}, ${g}, ${b}`;
  emptyResult.hidden = true;
  colorResult.hidden = false;
  announce(`Cor ${name}, código ${hex}`);

  if (addToHistory) {
    storeHistory({ r, g, b, hex, name });
  }
}


export function initResult() {
  document.querySelectorAll(".copy-button").forEach(button => {
    button.addEventListener("click", () => {
      const value = button.dataset.copy === "hex" ? hexValue.textContent : rgbValue.textContent;
      copyText(value);
    });
  });

}
