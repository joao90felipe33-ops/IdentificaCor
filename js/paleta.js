import { canvas, paletteBar, paletteList } from './elementos.js';
import { rgbToHex, approximateColorName } from './cores.js';

export function extractPalette(count = 6) {
  if (!canvas.width || !canvas.height) return [];
  const maxSide = 80;
  const scale = Math.min(1, maxSide / Math.max(canvas.width, canvas.height));
  const w = Math.max(1, Math.round(canvas.width * scale));
  const h = Math.max(1, Math.round(canvas.height * scale));
  const small = document.createElement("canvas");
  small.width = w;
  small.height = h;
  const smallCtx = small.getContext("2d", { willReadFrequently: true });
  smallCtx.drawImage(canvas, 0, 0, w, h);
  const data = smallCtx.getImageData(0, 0, w, h).data;

  // Agrupa pixels parecidos em "baldes" (4 bits por canal) e conta quantos há em cada um.
  const buckets = new Map();
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    let entry = buckets.get(key);
    if (!entry) { entry = { r: 0, g: 0, b: 0, n: 0 }; buckets.set(key, entry); }
    entry.r += r; entry.g += g; entry.b += b; entry.n++;
    total++;
  }
  if (!total) return [];

  const items = [...buckets.values()].map(e => ({ r: e.r / e.n, g: e.g / e.n, b: e.b / e.n, n: e.n }));
  const channels = ["r", "g", "b"];
  const boxes = [items];

  while (boxes.length < count) {
    let bestIndex = -1, bestScore = 0, bestChannel = "r";
    boxes.forEach((box, index) => {
      if (box.length < 2) return;
      const ranges = channels.map(ch => {
        let min = 255, max = 0;
        for (const p of box) { if (p[ch] < min) min = p[ch]; if (p[ch] > max) max = p[ch]; }
        return max - min;
      });
      const widest = Math.max(...ranges);
      const population = box.reduce((sum, p) => sum + p.n, 0);
      const score = population * widest;
      if (score > bestScore) {
        bestScore = score; bestIndex = index; bestChannel = channels[ranges.indexOf(widest)];
      }
    });
    if (bestIndex < 0) break;
    const box = boxes[bestIndex];
    box.sort((a, b) => a[bestChannel] - b[bestChannel]);
    const half = box.reduce((sum, p) => sum + p.n, 0) / 2;
    let acc = 0, cut = 1;
    for (let i = 0; i < box.length; i++) {
      acc += box[i].n;
      if (acc >= half) { cut = i + 1; break; }
    }
    cut = Math.min(Math.max(cut, 1), box.length - 1);
    boxes.splice(bestIndex, 1, box.slice(0, cut), box.slice(cut));
  }

  const swatches = boxes.map(box => {
    const n = box.reduce((sum, p) => sum + p.n, 0);
    return {
      r: box.reduce((s, p) => s + p.r * p.n, 0) / n,
      g: box.reduce((s, p) => s + p.g * p.n, 0) / n,
      b: box.reduce((s, p) => s + p.b * p.n, 0) / n,
      n
    };
  }).sort((a, b) => b.n - a.n);

  // Junta cores quase idênticas para não repetir tons na lista.
  const merged = [];
  for (const s of swatches) {
    const near = merged.find(m => Math.hypot(m.r - s.r, m.g - s.g, m.b - s.b) < 40);
    if (near) {
      const n = near.n + s.n;
      near.r = (near.r * near.n + s.r * s.n) / n;
      near.g = (near.g * near.n + s.g * s.n) / n;
      near.b = (near.b * near.n + s.b * s.n) / n;
      near.n = n;
    } else {
      merged.push({ ...s });
    }
  }
  return merged
    .sort((a, b) => b.n - a.n)
    .map(s => ({ r: Math.round(s.r), g: Math.round(s.g), b: Math.round(s.b), share: s.n / total }));
}

export function renderPalette(colors, onSelect) {
  paletteList.innerHTML = "";
  paletteBar.innerHTML = "";
  if (!colors.length) {
    paletteBar.hidden = true;
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = "Não foi possível identificar as cores principais desta imagem.";
    paletteList.appendChild(empty);
    return;
  }
  paletteBar.hidden = false;
  colors.forEach(color => {
    const hex = rgbToHex(color.r, color.g, color.b);
    const name = approximateColorName(color.r, color.g, color.b);
    const percent = Math.max(1, Math.round(color.share * 100));

    const segment = document.createElement("span");
    segment.style.flexGrow = String(color.share);
    segment.style.backgroundColor = hex;
    paletteBar.appendChild(segment);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    button.setAttribute("aria-label", `${name}, ${hex}, cerca de ${percent}% da imagem. Mostrar detalhes.`);
    const chip = document.createElement("span");
    chip.className = "history-chip";
    chip.style.backgroundColor = hex;
    const label = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = name;
    const small = document.createElement("small");
    small.textContent = `${hex} · ${percent}%`;
    label.append(strong, small);
    button.append(chip, label);
    button.addEventListener("click", () => onSelect(color));
    paletteList.appendChild(button);
  });
}
