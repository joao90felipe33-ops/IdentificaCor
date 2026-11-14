/* Identidade visual: logo da página e ícone da aba para cada paleta. */
const VISION_ASSETS = {
  normal: { logo: "imagens/logo.png", icon: "imagens/icone.png" },
  protanopia: { logo: "imagens/logo-protanopia.png", icon: "imagens/icone_protanopia.png" },
  deuteranopia: { logo: "imagens/logo-deuteranopia.png", icon: "imagens/icone_deuteranopia.png" },
  tritanopia: { logo: "imagens/logo-tritanopia.png", icon: "imagens/icone_tritanopia.png" },
  acromatopsia: { logo: "imagens/logo-acromatopsia.png", icon: "imagens/icone_acromatopsia.png" }
};

export function updateVisualIdentity(vision) {
  const assets = VISION_ASSETS[vision] || VISION_ASSETS.normal;

  // Atualiza cabeçalho, logo central e rodapé (somente as versões normais).
  document.querySelectorAll("img.logo-normal").forEach(img => {
    if (img.getAttribute("src") !== assets.logo) img.src = assets.logo;
  });

  // Troca o pequeno ícone da aba do Chrome.
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon) favicon.href = assets.icon + "?v=3";

  // Mantém o atalho de tela inicial com o mesmo ícone, quando suportado.
  const touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
  if (touchIcon) touchIcon.href = assets.icon + "?v=3";

  // A logo de alto contraste permanece sendo imagens/logo-contraste.png.
}
