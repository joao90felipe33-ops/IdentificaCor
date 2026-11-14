import { historyList, clearHistory } from './elementos.js';
import { showToast } from './feedback.js';

let history = [];
let onSelect = () => {};

export function storeHistory(item) {
  history.unshift(item);
  history = history.slice(0, 8);
  renderHistory();
}

export function renderHistory() {
  historyList.innerHTML = "";
  clearHistory.disabled = history.length === 0;
  if (!history.length) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "As cores que você selecionar aparecerão aqui.";
    historyList.appendChild(empty);
    return;
  }
  history.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.setAttribute("aria-label", `Mostrar ${item.name}, ${item.hex}`);
    const chip = document.createElement("span");
    chip.className = "history-chip";
    chip.style.backgroundColor = item.hex;
    const label = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = item.name;
    const code = document.createElement("small");
    code.textContent = item.hex;
    label.append(name, code);
    button.append(chip, label);
    button.addEventListener("click", () => onSelect(item));
    historyList.appendChild(button);
  });
}


export function initHistory(callback) {
  onSelect = callback;
clearHistory.addEventListener("click", () => {
  history = [];
  renderHistory();
  showToast("Histórico limpo.");
});

}
