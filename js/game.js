// game.js — cena Phaser 3 do pênalti. Cada zona do gol corresponde a uma
// alternativa da pergunta (ver main.js e o overlay de botões em
// #zonas-gol no HTML). Chutar em uma zona É responder a pergunta:
// zona certa = gol, zona errada = o goleiro defende ali mesmo.
//
// As coordenadas aqui (ZONAS) precisam bater com as porcentagens usadas
// nos botões .botao-zona do CSS — os dois lados representam a mesma grade
// de 640x360.

const LARGURA_JOGO = 640;
const ALTURA_JOGO = 360;

const ZONAS = {
  'topo-esquerda':   { x: 230, y: 55 },
  'topo-direita':    { x: 410, y: 55 },
  'meio':            { x: 320, y: 80 },
  'baixo-esquerda':  { x: 230, y: 110 },
  'baixo-direita':   { x: 410, y: 110 }
};

const POSICAO_INICIAL_BOLA = { x: 320, y: 300 };
const POSICAO_INICIAL_GOLEIRO = ZONAS.meio;

function criarJogoPenalti(containerId) {
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

      // Trave (gol) — de x160 a x480, y20 a y140
      const golX = LARGURA_JOGO / 2;
      const golY = 80;
      this.add.rectangle(golX, golY, 320, 120, 0xfffdf6, 0.12).setStrokeStyle(6, 0xfffdf6);

      // Rede
      const rede = this.add.graphics();
      rede.lineStyle(1, 0xfffdf6, 0.4);
      for (let x = golX - 160; x <= golX + 160; x += 20) {
        rede.lineBetween(x, golY - 60, x, golY + 60);
      }
      for (let y = golY - 60; y <= golY + 60; y += 15) {
        rede.lineBetween(golX - 160, y, golX + 160, y);
      }

      // Marca do pênalti
      this.add.circle(POSICAO_INICIAL_BOLA.x, POSICAO_INICIAL_BOLA.y, 4, 0xfffdf6);

      // Goleiro
      goleiro = this.add.container(POSICAO_INICIAL_GOLEIRO.x, POSICAO_INICIAL_GOLEIRO.y);
      const corpoGoleiro = this.add.rectangle(0, 0, 34, 46, 0x21303b, 1).setStrokeStyle(3, 0xfffdf6);
      const cabecaGoleiro = this.add.circle(0, -32, 14, 0xe8b98c);
      goleiro.add([corpoGoleiro, cabecaGoleiro]);

      // Bola
      bola = this.add.circle(POSICAO_INICIAL_BOLA.x, POSICAO_INICIAL_BOLA.y, 12, 0xfffdf6).setStrokeStyle(2, 0x21303b);
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
    bola.setPosition(POSICAO_INICIAL_BOLA.x, POSICAO_INICIAL_BOLA.y);
    goleiro.setPosition(POSICAO_INICIAL_GOLEIRO.x, POSICAO_INICIAL_GOLEIRO.y);
  }

  // Chuta a bola na zona escolhida. `correta` decide o resultado:
  // certa -> o goleiro pula para outra zona (gol); errada -> o goleiro
  // pula exatamente para a zona chutada (defesa). Sem sorteio: o resultado
  // sempre reflete se a criança acertou a conta.
  function chutar(zonaId, correta, aoFinalizar) {
    if (emAnimacao || !cena || !bola || !goleiro) return;
    const destinoBola = ZONAS[zonaId];
    if (!destinoBola) return;
    emAnimacao = true;

    let destinoGoleiro;
    if (correta) {
      const outrasZonas = Object.keys(ZONAS).filter(id => id !== zonaId);
      const zonaEscolhida = outrasZonas[Math.floor(Math.random() * outrasZonas.length)];
      destinoGoleiro = ZONAS[zonaEscolhida];
    } else {
      destinoGoleiro = destinoBola;
    }

    cena.tweens.add({
      targets: goleiro,
      x: destinoGoleiro.x,
      y: destinoGoleiro.y,
      duration: 420,
      ease: 'Sine.easeOut'
    });

    cena.tweens.add({
      targets: bola,
      x: destinoBola.x,
      y: destinoBola.y,
      duration: 480,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        emAnimacao = false;
        if (aoFinalizar) aoFinalizar({ gol: correta });
        cena.time.delayedCall(950, resetarBola);
      }
    });
  }

  function destruir() {
    if (jogo) jogo.destroy(true);
  }

  return { chutar, destruir };
}
