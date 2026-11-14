// Ponto de entrada: conectamos os módulos sem repetir a lógica de cada um.
import { initSettings } from './filtros.js';
import { initHistory } from './historico.js';
import { initResult, displayColor } from './resultado.js';
import { hideMarker } from './imagem.js';
import { initVoice } from './feedback.js';
import { initHarmonies } from './combinacoes.js';
import { initComparator } from './comparador.js';

initHistory(item => {
  hideMarker();
  displayColor(item.r, item.g, item.b, false);
});
initResult();
initVoice();
initHarmonies();
initComparator();
initSettings();
