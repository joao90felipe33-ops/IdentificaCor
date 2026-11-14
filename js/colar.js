/* Imagens copiadas: Ctrl+V carrega no mesmo fluxo de upload. */
import { loadImage } from "./imagem.js";

document.addEventListener("paste", event => {
  const target = event.target;
  if (target instanceof Element && target.closest('input, textarea, [contenteditable="true"]')) {
    return; // Não intercepta a edição de texto em outros controles.
  }

  const image = Array.from(event.clipboardData?.items || [])
    .find(item => item.kind === "file" && item.type.startsWith("image/"))
    ?.getAsFile();

  if (!image) return; // A pessoa pode colar texto normalmente.
  event.preventDefault();
  loadImage(image);
});
