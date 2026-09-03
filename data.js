// data.js — listas fixas usadas para gerar o apelido genérico, as seleções
// disponíveis e os níveis de dificuldade. Nenhum campo de texto livre existe
// no app: o "apelido" é sempre uma combinação de um item de PERSONAGENS
// com um item de ANIMAIS.

const PERSONAGENS = [
  'Capitão', 'Fera', 'Relâmpago', 'Craque', 'Foguete',
  'Estrela', 'Furacão', 'Campeão', 'Guerreiro', 'Fenômeno'
];

const ANIMAIS = [
  'Tigre', 'Águia', 'Onça', 'Leão', 'Gavião',
  'Puma', 'Lobo', 'Falcão', 'Pantera', 'Tubarão'
];

// 6 seleções para essa primeira versão do front (fácil de testar/validar).
// Cada seleção usa duas cores próprias em vez de bandeiras reais, para não
// depender de assets de imagem nessa fase do protótipo.
const SELECOES = [
  { id: 'brasil',    nome: 'Brasil',    corPrimaria: '#2E9E5B', corSecundaria: '#FFC63B' },
  { id: 'argentina', nome: 'Argentina', corPrimaria: '#6EC1E4', corSecundaria: '#FFFDF6' },
  { id: 'alemanha',  nome: 'Alemanha',  corPrimaria: '#21303B', corSecundaria: '#E0343B' },
  { id: 'franca',    nome: 'França',    corPrimaria: '#3A5FCD', corSecundaria: '#E0343B' },
  { id: 'japao',     nome: 'Japão',     corPrimaria: '#FFFDF6', corSecundaria: '#E0343B' },
  { id: 'portugal',  nome: 'Portugal',  corPrimaria: '#2E9E5B', corSecundaria: '#E0343B' }
];

// Níveis de dificuldade que a criança escolhe antes da Fase 1.
const DIFICULDADES = [
  {
    id: 'facil',
    nome: 'Fácil',
    descricao: 'Soma e subtração até 10',
    icone: '⭐'
  },
  {
    id: 'medio',
    nome: 'Médio',
    descricao: 'Soma, subtração até 20 e tabuada até 5',
    icone: '⭐⭐'
  },
  {
    id: 'dificil',
    nome: 'Difícil',
    descricao: 'Multiplicação e divisão exata',
    icone: '⭐⭐⭐'
  }
];

function sortearApelido() {
  const personagem = PERSONAGENS[Math.floor(Math.random() * PERSONAGENS.length)];
  const animal = ANIMAIS[Math.floor(Math.random() * ANIMAIS.length)];
  return `${personagem} ${animal}`;
}
