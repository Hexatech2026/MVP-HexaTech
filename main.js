// main.js — orquestra a navegação entre telas e o estado do jogador durante
// a sessão. Progresso ainda não é persistido em backend (isso vem na próxima
// etapa, com Firestore); por enquanto fica só em memória/localStorage local.

const estado = {
  apelido: '',
  selecaoId: null,
  dificuldadeId: null,
  cobrancaAtual: 0, // 0, 1, 2
  gols: 0,
  perguntaAtual: null,
  jogoPenalti: null
};

const TOTAL_COBRANCAS = 3;

function mostrarTela(idTela) {
  document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('tela-ativa'));
  document.getElementById(idTela).classList.add('tela-ativa');
}

/* ---------------------------- Menu ---------------------------- */

function initMenu() {
  document.getElementById('botao-jogar').addEventListener('click', () => {
    irParaApelido();
  });
}

/* ---------------------------- Apelido ---------------------------- */

function irParaApelido() {
  sortearNovoApelido();
  mostrarTela('tela-apelido');
}

function sortearNovoApelido() {
  estado.apelido = sortearApelido();
  document.getElementById('texto-apelido').textContent = estado.apelido;
}

function initApelido() {
  document.getElementById('botao-sortear-apelido').addEventListener('click', () => {
    sortearNovoApelido();
    Narracao.falar(`Novo apelido sorteado: ${estado.apelido}`);
  });
  document.getElementById('botao-confirmar-apelido').addEventListener('click', () => {
    irParaSelecao();
  });
}

/* ---------------------------- Seleção ---------------------------- */

function irParaSelecao() {
  const grade = document.getElementById('grade-selecoes');
  grade.innerHTML = '';
  SELECOES.forEach(selecao => {
    const cartao = document.createElement('button');
    cartao.className = 'cartao';
    cartao.type = 'button';
    cartao.setAttribute('data-id', selecao.id);
    cartao.innerHTML = `
      <span class="cartao-emblema" style="background: linear-gradient(135deg, ${selecao.corPrimaria} 50%, ${selecao.corSecundaria} 50%);"></span>
      <span class="cartao-titulo">${selecao.nome}</span>
    `;
    cartao.addEventListener('click', () => {
      grade.querySelectorAll('.cartao').forEach(c => c.classList.remove('cartao-selecionado'));
      cartao.classList.add('cartao-selecionado');
      estado.selecaoId = selecao.id;
      document.getElementById('botao-confirmar-selecao').disabled = false;
      Narracao.falar(`Seleção ${selecao.nome} escolhida`);
    });
    grade.appendChild(cartao);
  });
  document.getElementById('botao-confirmar-selecao').disabled = true;
  mostrarTela('tela-selecao');
}

function initSelecao() {
  document.getElementById('botao-confirmar-selecao').addEventListener('click', () => {
    irParaDificuldade();
  });
}

/* ---------------------------- Dificuldade ---------------------------- */

function irParaDificuldade() {
  const grade = document.getElementById('grade-dificuldades');
  grade.innerHTML = '';
  DIFICULDADES.forEach(dificuldade => {
    const cartao = document.createElement('button');
    cartao.className = 'cartao';
    cartao.type = 'button';
    cartao.innerHTML = `
      <span class="cartao-titulo">${dificuldade.icone}</span>
      <span class="cartao-titulo">${dificuldade.nome}</span>
      <span class="cartao-descricao">${dificuldade.descricao}</span>
    `;
    cartao.addEventListener('click', () => {
      grade.querySelectorAll('.cartao').forEach(c => c.classList.remove('cartao-selecionado'));
      cartao.classList.add('cartao-selecionado');
      estado.dificuldadeId = dificuldade.id;
      document.getElementById('botao-confirmar-dificuldade').disabled = false;
      Narracao.falar(`Dificuldade ${dificuldade.nome} escolhida`);
    });
    grade.appendChild(cartao);
  });
  document.getElementById('botao-confirmar-dificuldade').disabled = true;
  mostrarTela('tela-dificuldade');
}

function initDificuldade() {
  document.getElementById('botao-confirmar-dificuldade').addEventListener('click', () => {
    iniciarFase1();
  });
}

/* ---------------------------- Fase 1 ---------------------------- */

function iniciarFase1() {
  estado.cobrancaAtual = 0;
  estado.gols = 0;
  mostrarTela('tela-fase1');
  atualizarBolinhasProgresso();

  if (estado.jogoPenalti) {
    estado.jogoPenalti.destruir();
    estado.jogoPenalti = null;
  }
  document.getElementById('jogo-penalti').innerHTML = '';
  document.getElementById('area-jogo').style.display = 'none';
  document.getElementById('area-pergunta').style.display = 'flex';

  carregarProximaPergunta();
}

function atualizarBolinhasProgresso() {
  const container = document.getElementById('cabecalho-fase');
  container.innerHTML = '';
  for (let i = 0; i < TOTAL_COBRANCAS; i++) {
    const bolinha = document.createElement('span');
    bolinha.className = 'bolinha-cobranca';
    if (i < estado.cobrancaAtual) bolinha.classList.add('feita');
    else if (i === estado.cobrancaAtual) bolinha.classList.add('atual');
    container.appendChild(bolinha);
  }
}

function carregarProximaPergunta() {
  estado.perguntaAtual = gerarPergunta(estado.dificuldadeId);
  document.getElementById('mensagem-feedback').textContent = '';
  document.getElementById('pergunta-texto').textContent = estado.perguntaAtual.texto;

  const grade = document.getElementById('grade-alternativas');
  grade.innerHTML = '';
  estado.perguntaAtual.alternativas.forEach(alt => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao-alternativa';
    botao.textContent = alt.valor;
    botao.addEventListener('click', () => responderPergunta(alt, botao));
    grade.appendChild(botao);
  });

  Narracao.falar(estado.perguntaAtual.textoFalado);
}

function responderPergunta(alternativa, botaoClicado) {
  const botoes = document.querySelectorAll('#grade-alternativas .botao-alternativa');
  botoes.forEach(b => b.disabled = true);

  if (alternativa.correta) {
    botaoClicado.classList.add('acertou');
    document.getElementById('mensagem-feedback').textContent = 'Isso aí! Agora escolhe o canto do chute. ⚽';
    Narracao.falar('Resposta certa! Agora escolha o canto do chute.');
    setTimeout(irParaChute, 700);
  } else {
    botaoClicado.classList.add('tentar-de-novo');
    document.getElementById('mensagem-feedback').textContent = 'Quase! Vamos tentar outra conta. 💪';
    Narracao.falar('Quase! Vamos tentar outra conta.');
    setTimeout(carregarProximaPergunta, 1100);
  }
}

function irParaChute() {
  document.getElementById('area-pergunta').style.display = 'none';
  document.getElementById('area-jogo').style.display = 'flex';

  if (!estado.jogoPenalti) {
    estado.jogoPenalti = criarJogoPenalti('jogo-penalti', estado.selecaoId);
  }

  const botoesDirecao = document.querySelectorAll('.botao-direcao');
  botoesDirecao.forEach(b => (b.disabled = false));
}

function initFase1() {
  document.querySelectorAll('.botao-direcao').forEach(botao => {
    botao.addEventListener('click', () => {
      const direcao = botao.getAttribute('data-direcao');
      document.querySelectorAll('.botao-direcao').forEach(b => (b.disabled = true));
      estado.jogoPenalti.chutar(direcao, resultado => {
        finalizarCobranca(resultado.gol);
      });
    });
  });
}

function finalizarCobranca(foiGol) {
  if (foiGol) {
    estado.gols++;
    document.getElementById('mensagem-feedback').textContent = 'GOOOL! 🎉';
    Narracao.falar('Gol!');
  } else {
    document.getElementById('mensagem-feedback').textContent = 'Quase! Foi uma boa cobrança. 👏';
    Narracao.falar('Quase! Foi uma boa cobrança.');
  }

  estado.cobrancaAtual++;
  atualizarBolinhasProgresso();

  setTimeout(() => {
    if (estado.cobrancaAtual >= TOTAL_COBRANCAS) {
      irParaResultado();
    } else {
      document.getElementById('area-jogo').style.display = 'none';
      document.getElementById('area-pergunta').style.display = 'flex';
      carregarProximaPergunta();
    }
  }, 1400);
}

/* ---------------------------- Resultado ---------------------------- */

function irParaResultado() {
  if (estado.jogoPenalti) {
    estado.jogoPenalti.destruir();
    estado.jogoPenalti = null;
  }

  document.getElementById('placar-final').textContent = `${estado.gols} / ${TOTAL_COBRANCAS}`;

  const mensagens = {
    3: 'Fase perfeita! Você é o Craque das Contas! 🏆',
    2: 'Muito bem! Só faltou um gol pra fase perfeita. ⭐',
    1: 'Bom começo! Bora treinar mais um pouco. 💪',
    0: 'Valeu por jogar! Vamos treinar mais e voltar pro gol. 🙂'
  };
  document.getElementById('resumo-resultado').textContent = mensagens[estado.gols];

  // TODO(backend): enviar { apelido, selecaoId, dificuldadeId, gols } para
  // POST /api/progress quando o back-end estiver pronto. Por enquanto,
  // guarda só localmente para não perder o resultado ao recarregar.
  try {
    localStorage.setItem('mathgol_ultimo_resultado', JSON.stringify({
      apelido: estado.apelido,
      selecaoId: estado.selecaoId,
      dificuldadeId: estado.dificuldadeId,
      gols: estado.gols,
      data: new Date().toISOString()
    }));
  } catch (e) {
    // localStorage pode falhar (modo privado etc.) — não é crítico pro MVP.
  }

  Narracao.falar(mensagens[estado.gols]);
  mostrarTela('tela-resultado');
}

function initResultado() {
  document.getElementById('botao-voltar-menu').addEventListener('click', () => {
    mostrarTela('tela-menu');
  });
}

/* ---------------------------- Acessibilidade ---------------------------- */

function carregarPreferenciasAcessibilidade() {
  let prefs = {};
  try {
    prefs = JSON.parse(localStorage.getItem('mathgol_acessibilidade') || '{}');
  } catch (e) {
    prefs = {};
  }

  const altoContraste = !!prefs.altoContraste;
  const espacoDislexia = !!prefs.espacoDislexia;
  const narracaoAtiva = prefs.narracaoAtiva !== undefined ? prefs.narracaoAtiva : true;

  document.body.classList.toggle('alto-contraste', altoContraste);
  document.body.classList.toggle('espaco-dislexia', espacoDislexia);
  Narracao.alternar(narracaoAtiva);

  document.getElementById('opcao-alto-contraste').checked = altoContraste;
  document.getElementById('opcao-espaco-dislexia').checked = espacoDislexia;
  document.getElementById('opcao-narracao').checked = narracaoAtiva;
}

function salvarPreferenciasAcessibilidade() {
  const prefs = {
    altoContraste: document.getElementById('opcao-alto-contraste').checked,
    espacoDislexia: document.getElementById('opcao-espaco-dislexia').checked,
    narracaoAtiva: document.getElementById('opcao-narracao').checked
  };
  try {
    localStorage.setItem('mathgol_acessibilidade', JSON.stringify(prefs));
  } catch (e) {
    // ignora se não conseguir persistir
  }
  document.body.classList.toggle('alto-contraste', prefs.altoContraste);
  document.body.classList.toggle('espaco-dislexia', prefs.espacoDislexia);
  Narracao.alternar(prefs.narracaoAtiva);
}

function initAcessibilidade() {
  const sobreposicao = document.getElementById('sobreposicao-acessibilidade');
  document.getElementById('botao-acessibilidade').addEventListener('click', () => {
    sobreposicao.classList.add('aberta');
  });
  document.getElementById('botao-fechar-acessibilidade').addEventListener('click', () => {
    sobreposicao.classList.remove('aberta');
  });
  sobreposicao.addEventListener('click', (evento) => {
    if (evento.target === sobreposicao) sobreposicao.classList.remove('aberta');
  });

  ['opcao-alto-contraste', 'opcao-espaco-dislexia', 'opcao-narracao'].forEach(id => {
    document.getElementById(id).addEventListener('change', salvarPreferenciasAcessibilidade);
  });

  carregarPreferenciasAcessibilidade();
}

/* ---------------------------- Inicialização ---------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initAcessibilidade();
  initMenu();
  initApelido();
  initSelecao();
  initDificuldade();
  initFase1();
  initResultado();
  mostrarTela('tela-menu');
});
