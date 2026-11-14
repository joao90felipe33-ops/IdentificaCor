import { largeSwatch, closeHarmony, harmonyDialog, harmonySwatch, harmonyName, harmonyHex, harmonyGroups } from './elementos.js';
import { rgbToHex, approximateColorName, rgbToHsl, hslToRgb } from './cores.js';
import { getCurrentColor } from './resultado.js';
import { copyText } from './feedback.js';

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

function makeColor([r, g, b]) {
  return { r, g, b, hex: rgbToHex(r, g, b), name: approximateColorName(r, g, b) };
}

function variant(base, hueShift, lightShift) {
  const [h, s, l] = rgbToHsl(base.r, base.g, base.b);
  return makeColor(hslToRgb(h + hueShift, s, clamp(l + lightShift, 0.06, 0.95)));
}

function uniqueColors(list, excludeHex) {
  const seen = new Set([excludeHex]);
  return list.filter(color => {
    if (seen.has(color.hex)) return false;
    seen.add(color.hex);
    return true;
  });
}

function buildHarmony(base) {
  const [h, s, l] = rgbToHsl(base.r, base.g, base.b);
  const groups = [];

  groups.push({
    title: "Cores semelhantes",
    text: "Tons parecidos com a cor escolhida: um pouco mais claros, mais escuros ou com o matiz levemente deslocado.",
    colors: uniqueColors([
      variant(base, 0, -0.2), variant(base, 0, -0.1),
      variant(base, 0, 0.1), variant(base, 0, 0.2),
      variant(base, -15, 0), variant(base, 15, 0)
    ], base.hex)
  });

  if (s < 0.1) {
    // Cores neutras (cinza, preto, branco) não têm matiz: sugerimos cores de destaque.
    const light = clamp(l, 0.38, 0.6);
    groups.push({
      title: "Combinam com esta cor",
      text: "Esta é uma cor neutra e combina com praticamente qualquer outra. Alguns destaques que funcionam bem:",
      colors: [215, 0, 140, 45].map(hue => makeColor(hslToRgb(hue, 0.6, light)))
    });
  } else {
    groups.push({
      title: "Complementar",
      text: "Fica no lado oposto do círculo de cores e cria o contraste mais forte.",
      colors: [variant(base, 180, 0)]
    });
    groups.push({
      title: "Análogas",
      text: "Vizinhas no círculo de cores: formam combinações suaves e harmoniosas.",
      colors: [variant(base, -30, 0), variant(base, 30, 0)]
    });
    groups.push({
      title: "Tríade",
      text: "Três cores bem distribuídas no círculo: combinação vibrante e equilibrada.",
      colors: [variant(base, 120, 0), variant(base, 240, 0)]
    });
  }
  return groups;
}

function createChip(color) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "color-chip";
  button.setAttribute("aria-label", `${color.name}, ${color.hex}. Copiar código.`);
  const swatch = document.createElement("span");
  swatch.className = "chip-color";
  swatch.style.backgroundColor = color.hex;
  const info = document.createElement("span");
  info.className = "chip-info";
  const name = document.createElement("strong");
  name.textContent = color.name;
  const hex = document.createElement("small");
  hex.textContent = color.hex;
  info.append(name, hex);
  button.append(swatch, info);
  button.addEventListener("click", () => copyText(color.hex, `${color.hex} copiado!`));
  return button;
}

function renderHarmony(base) {
  harmonySwatch.style.backgroundColor = base.hex;
  harmonyName.textContent = base.name;
  harmonyHex.textContent = `${base.hex} · RGB ${base.r}, ${base.g}, ${base.b}`;
  harmonyGroups.innerHTML = "";
  buildHarmony(base).forEach(group => {
    const section = document.createElement("section");
    section.className = "harmony-group";
    const title = document.createElement("h3");
    title.textContent = group.title;
    const text = document.createElement("p");
    text.textContent = group.text;
    const chips = document.createElement("div");
    chips.className = "color-chips";
    group.colors.forEach(color => chips.appendChild(createChip(color)));
    section.append(title, text, chips);
    harmonyGroups.appendChild(section);
  });
}

function openHarmony() {
  const color = getCurrentColor();
  if (!color) return;
  renderHarmony(color);
  document.body.classList.add("modal-open");
  if (typeof harmonyDialog.showModal === "function") harmonyDialog.showModal();
  else harmonyDialog.setAttribute("open", "");
  harmonyDialog.querySelector(".dialog-card").scrollTop = 0;
}

function closeHarmonyDialog() {
  if (typeof harmonyDialog.close === "function") harmonyDialog.close();
  else harmonyDialog.removeAttribute("open");
  document.body.classList.remove("modal-open");
}


export function initHarmonies() {
largeSwatch.addEventListener("click", openHarmony);
closeHarmony.addEventListener("click", closeHarmonyDialog);
harmonyDialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
});
// Clicar fora do cartão (no fundo escuro) também fecha.
harmonyDialog.addEventListener("click", event => {
  if (event.target === harmonyDialog) closeHarmonyDialog();
});

}
