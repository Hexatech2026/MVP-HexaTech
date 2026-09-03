// game.js — cena Phaser 3 da cobrança de pênalti. Não usa nenhum asset de
// imagem externo: tudo é desenhado com formas do próprio Phaser, para manter
// o protótipo leve e fácil de publicar.
//
// A escolha de direção (esquerda/centro/direita) acontece em botões HTML
// grandes fora do canvas — não em toques pequenos dentro do jogo — para
// respeitar o requisito de alvo de toque grande do projeto.

const LARGURA_JOGO = 640;
const ALTURA_JOGO = 360;

const POSICOES_X = { esquerda: 200, centro: 320, direita: 440 };

function criarJogoPenalti(containerId, corTime) {
  let cena = null;
  let bola = null;
  let goleiro = null;
  let emAnimacao = false;

  class CenaPenalti extends Phaser.Scene {
    constructor() {
      super('CenaPenalti');
    }

    create() {
      cena = this;

      // Campo
      this.add.rectangle(LARGURA_JOGO / 2, ALTURA_JOGO / 2, LARGURA_JOGO, ALTURA_JOGO, 0x2e9e5b);
      for (let i = 0; i < 5; i++) {
        this.add.rectangle(LARGURA_JOGO / 2, 40 + i * 70, LARGURA_JOGO, 6, 0x000000, 0.05);
      }

      // Trave (gol)
      const golX = LARGURA_JOGO / 2;
      const golY = 70;
      this.add.rectangle(golX, golY, 320, 100, 0xfffdf6, 0.12).setStrokeStyle(6, 0xfffdf6);
      // Rede (linhas simples)
      const rede = this.add.graphics();
      rede.lineStyle(1, 0xfffdf6, 0.4);
      for (let x = golX - 160; x <= golX + 160; x += 20) {
        rede.lineBetween(x, golY - 50, x, golY + 50);
      }
      for (let y = golY - 50; y <= golY + 50; y += 15) {
        rede.lineBetween(golX - 160, y, golX + 160, y);
      }

      // Marca do pênalti
      this.add.circle(LARGURA_JOGO / 2, 300, 4, 0xfffdf6);

      // Goleiro
      goleiro = this.add.container(POSICOES_X.centro, 90);
      const corpoGoleiro = this.add.rectangle(0, 0, 34, 46, 0x21303b, 1).setStrokeStyle(3, 0xfffdf6);
      const cabecaGoleiro = this.add.circle(0, -32, 14, 0xe8b98c);
      goleiro.add([corpoGoleiro, cabecaGoleiro]);

      // Bola
      bola = this.add.circle(LARGURA_JOGO / 2, 300, 12, 0xfffdf6).setStrokeStyle(2, 0x21303b);
    }
  }

  const config = {
    type: Phaser.AUTO,
    width: LARGURA_JOGO,
    height: ALTURA_JOGO,
    parent: containerId,
    backgroundColor: '#2e9e5b',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },
    scene: [CenaPenalti]
  };

  const jogo = new Phaser.Game(config);

  function resetarBola() {
    if (!bola || !goleiro) return;
    bola.setPosition(LARGURA_JOGO / 2, 300);
    goleiro.setPosition(POSICOES_X.centro, 90);
  }

  // chuta a bola na direção escolhida e decide se é gol ou defesa.
  // Chance de defesa é baixa de propósito — o foco do jogo é a matemática,
  // não punir a criança na parte do futebol.
  function chutar(direcao, aoFinalizar) {
    if (emAnimacao || !cena || !bola || !goleiro) return;
    emAnimacao = true;

    const destinoX = POSICOES_X[direcao];
    const direcoesPossiveis = Object.keys(POSICOES_X);
    const direcaoGoleiro = direcoesPossiveis[Math.floor(Math.random() * direcoesPossiveis.length)];
    const chanceDeDefesa = 0.2;
    const defendeu = direcaoGoleiro === direcao && Math.random() < (chanceDeDefesa / 0.34);

    cena.tweens.add({
      targets: goleiro,
      x: POSICOES_X[direcaoGoleiro],
      duration: 420,
      ease: 'Sine.easeOut'
    });

    cena.tweens.add({
      targets: bola,
      x: destinoX,
      y: defendeu ? 90 : 60,
      duration: 480,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        emAnimacao = false;
        if (aoFinalizar) aoFinalizar({ gol: !defendeu });
        cena.time.delayedCall(900, resetarBola);
      }
    });
  }

  function destruir() {
    if (jogo) jogo.destroy(true);
  }

  return { chutar, destruir };
}
