/* Câmera opcional: captura uma foto e reutiliza o carregamento existente. */
import { loadImage } from "./imagem.js";
import { showToast } from "./feedback.js";

const openButton = document.getElementById("openCamera");
const dialog = document.getElementById("cameraDialog");
const video = document.getElementById("cameraVideo");
const closeButton = document.getElementById("cameraClose");
const switchButton = document.getElementById("cameraSwitch");
const captureButton = document.getElementById("cameraCapture");

let stream = null;
let facingMode = "environment";
let requestId = 0;
let busy = false;

function stopCamera() {
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  video.pause();
  video.srcObject = null;
  captureButton.disabled = true;
}

function closeCamera() {
  if (dialog.open) dialog.close();
  else { requestId++; stopCamera(); }
}

async function startCamera() {
  // Invalida solicitações pendentes (ex.: após trocar a câmera).
  const thisRequest = ++requestId;
  stopCamera();
  busy = true;
  switchButton.disabled = true;
  captureButton.disabled = true;

  try {
    const nextStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    // Se a permissão chegou depois do fechamento, libere a câmera.
    if (thisRequest !== requestId || !dialog.open) {
      nextStream.getTracks().forEach(track => track.stop());
      return;
    }

    stream = nextStream;
    video.srcObject = nextStream;
    await video.play();
    if (thisRequest !== requestId || !dialog.open) return;
    captureButton.disabled = video.videoWidth === 0 || video.videoHeight === 0;
  } catch (error) {
    if (thisRequest !== requestId) return;
    console.error("Falha ao abrir câmera:", error);
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      showToast("Permita o uso da câmera nas configurações do navegador.");
    } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      showToast("Nenhuma câmera disponível neste dispositivo.");
    } else {
      showToast("Não foi possível abrir a câmera. Tente novamente.");
    }
    closeCamera();
  } finally {
    if (thisRequest === requestId) {
      busy = false;
      switchButton.disabled = false;
    }
  }
}

video.addEventListener("loadedmetadata", () => {
  if (stream && dialog.open) {
    captureButton.disabled = video.videoWidth === 0 || video.videoHeight === 0;
  }
});

openButton.addEventListener("click", () => {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    showToast("A câmera requer HTTPS ou localhost e um navegador compatível.");
    return;
  }
  if (dialog.open) return;
  if (typeof dialog.showModal !== "function") {
    showToast("Seu navegador não oferece esta janela de captura.");
    return;
  }
  dialog.showModal();
  startCamera();
});

closeButton.addEventListener("click", closeCamera);
dialog.addEventListener("close", () => {
  requestId++;
  stopCamera();
  busy = false;
  switchButton.disabled = false;
});

// Fechar pelo fundo escuro também interrompe a transmissão.
dialog.addEventListener("click", event => {
  if (event.target === dialog) closeCamera();
});

switchButton.addEventListener("click", () => {
  if (busy || !dialog.open) return;
  facingMode = facingMode === "environment" ? "user" : "environment";
  startCamera();
});

captureButton.addEventListener("click", () => {
  if (!stream || !video.videoWidth || !video.videoHeight) return;
  captureButton.disabled = true;

  const snapshot = document.createElement("canvas");
  const scale = Math.min(1, 1400 / Math.max(video.videoWidth, video.videoHeight));
  snapshot.width = Math.max(1, Math.round(video.videoWidth * scale));
  snapshot.height = Math.max(1, Math.round(video.videoHeight * scale));
  const context = snapshot.getContext("2d");
  if (!context) {
    showToast("Não foi possível preparar a captura.");
    captureButton.disabled = false;
    return;
  }
  context.drawImage(video, 0, 0, snapshot.width, snapshot.height);
  snapshot.toBlob(blob => {
    if (!blob) {
      showToast("Não foi possível capturar a imagem.");
      if (dialog.open) captureButton.disabled = false;
      return;
    }
    closeCamera();
    loadImage(new File([blob], "foto_camera.png", { type: "image/png" }));
  }, "image/png");
});

// Não manter a câmera ligada quando a página ficar em segundo plano.
document.addEventListener("visibilitychange", () => {
  if (document.hidden && dialog.open) closeCamera();
});
window.addEventListener("pagehide", () => {
  requestId++;
  stopCamera();
});
