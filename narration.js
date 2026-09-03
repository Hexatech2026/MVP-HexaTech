// narration.js — camada fina sobre a Web Speech API (SpeechSynthesis) do
// navegador. Sem custo, sem serviço externo. Pode ser ligada/desligada pela
// criança no menu de acessibilidade.

const Narracao = (() => {
  let ativa = true;
  let vozPt = null;

  function carregarVoz() {
    if (!('speechSynthesis' in window)) return;
    const vozes = window.speechSynthesis.getVoices();
    vozPt = vozes.find(v => v.lang && v.lang.toLowerCase().startsWith('pt')) || null;
  }

  if ('speechSynthesis' in window) {
    carregarVoz();
    window.speechSynthesis.onvoiceschanged = carregarVoz;
  }

  function falar(texto) {
    if (!ativa || !('speechSynthesis' in window) || !texto) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    if (vozPt) utterance.voice = vozPt;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  function alternar(valor) {
    ativa = valor;
    if (!ativa && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function estaAtiva() {
    return ativa;
  }

  return { falar, alternar, estaAtiva };
})();
