const GameState = {
    jogadorAtual: null,
    dados: { ele: null, ela: null },
    perguntaAtual: null,
    castigosUsados: { ele: new Set(), ela: new Set() },
    recompensasUsadas: { ele: new Set(), ela: new Set() },
    score: {
        ele: { acertos: 0, erros: 0 },
        ela: { acertos: 0, erros: 0 }
    }
};

// ELEMENTOS
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const startGameBtn = document.getElementById("startGameBtn");
const firstQuestionBtn = document.getElementById("firstQuestionBtn");

const turnText = document.getElementById("turn-text");
const questionContainer = document.getElementById("question-container");
const questionText = document.getElementById("question-text");

const hitBtn = document.getElementById("hitBtn");
const missBtn = document.getElementById("missBtn");

const resultContainer = document.getElementById("result-container");
const resultText = document.getElementById("result-text");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");

// SCORE
const elaHits = document.getElementById("ela-hits");
const elaMisses = document.getElementById("ela-misses");
const eleHits = document.getElementById("ele-hits");
const eleMisses = document.getElementById("ele-misses");

// EVENTOS
startGameBtn.addEventListener("click", iniciarJogo);
firstQuestionBtn.addEventListener("click", novaPergunta);
hitBtn.addEventListener("click", () => resolverPergunta(true));
missBtn.addEventListener("click", () => resolverPergunta(false));
nextQuestionBtn.addEventListener("click", proximaRodada);

// FUNÇÕES
async function iniciarJogo() {
    GameState.jogadorAtual = Math.random() < 0.5 ? "ele" : "ela";
    await carregarDados();

    startScreen.classList.add("d-none");
    gameScreen.classList.remove("d-none");
}

async function carregarDados() {
    const [eleRes, elaRes] = await Promise.all([
        fetch("./ele.json"),
        fetch("./ela.json")
    ]);
    GameState.dados.ele = await eleRes.json();
    GameState.dados.ela = await elaRes.json();
}

function novaPergunta() {
    const perguntas = GameState.dados[GameState.jogadorAtual].perguntas;
    const index = Math.floor(Math.random() * perguntas.length);

    GameState.perguntaAtual = { index, texto: perguntas[index] };

    turnText.textContent =
        GameState.jogadorAtual === "ele" ? "Ele responde" : "Ela responde";

    questionText.textContent = perguntas[index];

    firstQuestionBtn.classList.add("d-none");
    resultContainer.classList.add("d-none");
    questionContainer.classList.remove("d-none");
}

function resolverPergunta(acertou) {
    const jogador = GameState.jogadorAtual;
    const tipo = acertou ? "recompensas" : "castigos";
    const usados = acertou
        ? GameState.recompensasUsadas[jogador]
        : GameState.castigosUsados[jogador];

    GameState.score[jogador][acertou ? "acertos" : "erros"]++;
    atualizarPlacar();

    const lista = GameState.dados[jogador][tipo];
    const disponiveis = lista.map((_, i) => i).filter(i => !usados.has(i));
    const index = disponiveis[Math.floor(Math.random() * disponiveis.length)];

    usados.add(index);
    resultText.textContent = lista[index];

    questionContainer.classList.add("d-none");
    resultContainer.classList.remove("d-none");
}

function proximaRodada() {
    GameState.jogadorAtual = GameState.jogadorAtual === "ele" ? "ela" : "ele";
    novaPergunta();
}

function atualizarPlacar() {
    elaHits.textContent = GameState.score.ela.acertos;
    elaMisses.textContent = GameState.score.ela.erros;
    eleHits.textContent = GameState.score.ele.acertos;
    eleMisses.textContent = GameState.score.ele.erros;
}
