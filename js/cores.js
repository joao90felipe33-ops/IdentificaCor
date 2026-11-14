// Conversões RGB/HSL e nome aproximado da cor.
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}

// Nome aproximado a partir do matiz (cor), da saturação e da luminosidade (HSL).
// Em vez de procurar a cor mais próxima em uma lista fixa, o nome é montado:
// família da cor + "claro"/"escuro" conforme a luminosidade (ex.: "Azul escuro").
export function approximateColorName(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Preto, branco e cinzas
  if (l < 0.1) return "Preto";
  if (l > 0.95 || (l > 0.9 && s < 0.5)) return "Branco";
  if (s < 0.1) {
    if (l < 0.3) return "Cinza escuro";
    if (l > 0.72) return "Cinza claro";
    return "Cinza";
  }

  // Marrom, bege, dourado e pêssego (tons quentes que não são "laranja" nem "amarelo")
  if (h >= 14 && h < 52) {
    if (l < 0.45 || (s < 0.45 && l < 0.6)) return l < 0.22 ? "Marrom escuro" : "Marrom";
    if (h >= 36 && l < 0.62 && s >= 0.4 && s < 0.78) return "Dourado";
    if (l > 0.72) return s < 0.6 ? "Bege" : "Pêssego";
  }

  // Tons de vermelho: vinho, vermelho escuro, salmão e rosa
  if (h >= 335 || h < 14) {
    if (l < 0.28) return "Vinho";
    if (h >= 345 || h < 14) {
      if (l >= 0.8) return "Rosa claro";
      if (l >= 0.62 && s > 0.35) return h >= 345 ? "Rosa" : "Salmão";
      if (l < 0.4) return "Vermelho escuro";
      return "Vermelho";
    }
    // 335° a 345°: rosa-avermelhado
    if (l >= 0.8) return "Rosa claro";
    if (l >= 0.55) return "Rosa";
    return "Magenta";
  }

  // Oliva: amarelo-esverdeado escuro
  if (h >= 52 && h < 72 && l < 0.42) return "Verde-oliva";

  // Azul bem escuro vira "azul-marinho"
  if (h >= 210 && h < 255 && l < 0.32 && s >= 0.3) return "Azul-marinho";

  // Lilás é um roxo claro
  if (h >= 255 && h < 290 && l >= 0.68) return "Lilás";

  let base;
  if (h < 42) base = "Laranja";
  else if (h < 68) base = "Amarelo";
  else if (h < 90) base = "Verde-limão";
  else if (h < 155) base = "Verde";
  else if (h < 178) base = "Turquesa";
  else if (h < 196) base = "Ciano";
  else if (h < 255) base = "Azul";
  else if (h < 290) base = "Roxo";
  else base = "Magenta";

  // Luminosidade: escuro / claro
  let light = "";
  if (l < 0.2) light = "muito escuro";
  else if (l < 0.36) light = "escuro";
  else if (l >= 0.82) light = "muito claro";
  else if (l >= 0.6) light = "claro";

  // Cores com pouca saturação parecem "lavadas"
  const dull = s < 0.22 && l > 0.15 && l < 0.85 ? " acinzentado" : "";
  return base + dull + (light ? " " + light : "");
}


export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, s, l];
}

export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
