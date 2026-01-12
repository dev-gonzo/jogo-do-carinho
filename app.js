const GameState = {
    jogadorAtual: null,

    dados: {
        ele: null,
        ela: null
    },

    perguntaAtual: null,

    castigosUsados: {
        ele: new Set(),
        ela: new Set()
    },

    recompensasUsadas: {
        ele: new Set(),
        ela: new Set()
    },

    score: {
        ele: { acertos: 0, erros: 0 },
        ela: { acertos: 0, erros: 0 }
    },

    trocaDisponivel: true,

    resultadoAtual: {
        tipo: null,     // "castigos" | "recompensas"
        jogador: null
    }
};

/* ========= ELEMENTOS ========= */

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
const swapBtn = document.getElementById("swapBtn");

/* SCORE */
const elaHits = document.getElementById("ela-hits");
const elaMisses = document.getElementById("ela-misses");
const eleHits = document.getElementById("ele-hits");
const eleMisses = document.getElementById("ele-misses");

/* ========= EVENTOS ========= */

startGameBtn.addEventListener("click", iniciarJogo);
firstQuestionBtn.addEventListener("click", novaPergunta);

hitBtn.addEventListener("click", () => resolverPergunta(true));
missBtn.addEventListener("click", () => resolverPergunta(false));

swapBtn.addEventListener("click", trocarResultado);
nextQuestionBtn.addEventListener("click", proximaRodada);

/* ========= FUNÇÕES ========= */

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
    const jogador = GameState.jogadorAtual;
    const perguntas = GameState.dados[jogador].perguntas;

    const index = Math.floor(Math.random() * perguntas.length);

    GameState.perguntaAtual = {
        jogador,
        index,
        texto: perguntas[index]
    };

    turnText.textContent = jogador === "ele"
        ? "Ele responde"
        : "Ela responde";

    questionText.textContent = perguntas[index];

    GameState.trocaDisponivel = true;

    firstQuestionBtn.classList.add("d-none");
    resultContainer.classList.add("d-none");
    questionContainer.classList.remove("d-none");
}

function resolverPergunta(acertou) {
    const jogador = GameState.jogadorAtual;
    const tipo = acertou ? "recompensas" : "castigos";

    // Atualiza score
    GameState.score[jogador][acertou ? "acertos" : "erros"]++;
    atualizarPlacar();

    const usadosSet = tipo === "recompensas"
        ? GameState.recompensasUsadas[jogador]
        : GameState.castigosUsados[jogador];

    const lista = GameState.dados[jogador][tipo];

    const disponiveis = lista
        .map((_, i) => i)
        .filter(i => !usadosSet.has(i));

    if (disponiveis.length === 0) {
        resultText.textContent = "Sem mais opções disponíveis.";
    } else {
        const index = disponiveis[Math.floor(Math.random() * disponiveis.length)];
        usadosSet.add(index);
        resultText.textContent = lista[index];
    }

    GameState.resultadoAtual = { tipo, jogador };
    GameState.trocaDisponivel = true;
    swapBtn.disabled = false;

    questionContainer.classList.add("d-none");
    resultContainer.classList.remove("d-none");
}

function trocarResultado() {
    if (!GameState.trocaDisponivel) return;

    const { tipo, jogador } = GameState.resultadoAtual;

    const usadosSet = tipo === "recompensas"
        ? GameState.recompensasUsadas[jogador]
        : GameState.castigosUsados[jogador];

    const lista = GameState.dados[jogador][tipo];

    const disponiveis = lista
        .map((_, i) => i)
        .filter(i => !usadosSet.has(i));

    if (disponiveis.length === 0) return;

    const index = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    usadosSet.add(index);

    resultText.textContent = lista[index];

    GameState.trocaDisponivel = false;
    swapBtn.disabled = true;
}

function proximaRodada() {
    GameState.resultadoAtual = { tipo: null, jogador: null };
    GameState.trocaDisponivel = true;

    GameState.jogadorAtual =
        GameState.jogadorAtual === "ele" ? "ela" : "ele";

    novaPergunta();
}

function atualizarPlacar() {
    elaHits.textContent = GameState.score.ela.acertos;
    elaMisses.textContent = GameState.score.ela.erros;
    eleHits.textContent = GameState.score.ele.acertos;
    eleMisses.textContent = GameState.score.ele.erros;
}
