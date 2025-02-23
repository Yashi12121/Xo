const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const SQUARE_SIZE = canvas.width / 3;
const CIRCLE_RADIUS = SQUARE_SIZE / 3;
const CROSS_WIDTH = 20;
const SPACE = SQUARE_SIZE / 4;

const NEON_RED = "#ff6464";
const NEON_BLUE = "#6496ff";
const GRID_COLOR = "#323250";
const BG_COLOR = "#141428";

let board = Array(3).fill().map(() => Array(3).fill(0));
let playerTurn = true;
let gameOver = false;
let difficulty = 3;

const easyBtn = document.getElementById("easyBtn");
const medBtn = document.getElementById("medBtn");
const hardBtn = document.getElementById("hardBtn");
const resetBtn = document.getElementById("resetBtn");
const result = document.getElementById("result");

easyBtn.addEventListener("click", () => setDifficulty(1));
medBtn.addEventListener("click", () => setDifficulty(2));
hardBtn.addEventListener("click", () => setDifficulty(3));
resetBtn.addEventListener("click", resetGame);
canvas.addEventListener("click", handleClick);

function setDifficulty(level) {
    difficulty = level;
    easyBtn.classList.toggle("selected", level === 1);
    medBtn.classList.toggle("selected", level === 2);
    hardBtn.classList.toggle("selected", level === 3);
}

function drawBoard() {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 8;
    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * SQUARE_SIZE);
        ctx.lineTo(canvas.width, i * SQUARE_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i * SQUARE_SIZE, 0);
        ctx.lineTo(i * SQUARE_SIZE, canvas.height);
        ctx.stroke();
    }

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const centerX = col * SQUARE_SIZE + SQUARE_SIZE / 2;
            const centerY = row * SQUARE_SIZE + SQUARE_SIZE / 2;
            if (board[row][col] === 1) {
                ctx.strokeStyle = NEON_RED;
                ctx.lineWidth = CROSS_WIDTH;
                ctx.beginPath();
                ctx.moveTo(col * SQUARE_SIZE + SPACE, row * SQUARE_SIZE + SPACE);
                ctx.lineTo(col * SQUARE_SIZE + SQUARE_SIZE - SPACE, row * SQUARE_SIZE + SQUARE_SIZE - SPACE);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(col * SQUARE_SIZE + SQUARE_SIZE - SPACE, row * SQUARE_SIZE + SPACE);
                ctx.lineTo(col * SQUARE_SIZE + SPACE, row * SQUARE_SIZE + SQUARE_SIZE - SPACE);
                ctx.stroke();
            } else if (board[row][col] === 2) {
                ctx.strokeStyle = NEON_BLUE;
                ctx.lineWidth = CROSS_WIDTH / 2;
                ctx.beginPath();
                ctx.arc(centerX, centerY, CIRCLE_RADIUS, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
}

function handleClick(event) {
    if (!gameOver && playerTurn) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const row = Math.floor(y / SQUARE_SIZE);
        const col = Math.floor(x / SQUARE_SIZE);

        if (board[row][col] === 0) {
            board[row][col] = 1;
            drawBoard();
            if (checkWinner(1)) {
                gameOver = true;
                result.textContent = "Player Wins!";
                result.style.color = NEON_RED;
            } else if (isBoardFull()) {
                gameOver = true;
                result.textContent = "Draw!";
            } else {
                playerTurn = false;
                setTimeout(aiMove, 500);
            }
        }
    }
}

function aiMove() {
    const availableMoves = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[r][c] === 0) availableMoves.push([r, c]);
        }
    }

    if (availableMoves.length === 0) return;

    let move;
    if (difficulty === 1) {
        move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else if (difficulty === 2) {
        move = Math.random() < 0.5 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : bestMove();
    } else {
        move = bestMove();
    }

    board[move[0]][move[1]] = 2;
    drawBoard();
    if (checkWinner(2)) {
        gameOver = true;
        result.textContent = "AI Wins!";
        result.style.color = NEON_BLUE;
    } else if (isBoardFull()) {
        gameOver = true;
        result.textContent = "Draw!";
    }
    playerTurn = true;
}

function bestMove() {
    let bestScore = -Infinity;
    let move;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[r][c] === 0) {
                board[r][c] = 2;
                const score = minimax(board, 0, false);
                board[r][c] = 0;
                if (score > bestScore) {
                    bestScore = score;
                    move = [r, c];
                }
            }
        }
    }
    return move;
}

function minimax(board, depth, isMaximizing) {
    if (checkWinner(2)) return 10 - depth;
    if (checkWinner(1)) return -10 + depth;
    if (isBoardFull()) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[r][c] === 0) {
                    board[r][c] = 2;
                    const score = minimax(board, depth + 1, false);
                    board[r][c] = 0;
                    bestScore = Math.max(score, bestScore);
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (board[r][c] === 0) {
                    board[r][c] = 1;
                    const score = minimax(board, depth + 1, true);
                    board[r][c] = 0;
                    bestScore = Math.min(score, bestScore);
                }
            }
        }
        return bestScore;
    }
}

function checkWinner(player) {
    for (let i = 0; i < 3; i++) {
        if (board[i].every(cell => cell === player)) return true;
        if (board.every(row => row[i] === player)) return true;
    }
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return true;
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) return true;
    return false;
}

function isBoardFull() {
    return board.every(row => row.every(cell => cell !== 0));
}

function resetGame() {
    board = Array(3).fill().map(() => Array(3).fill(0));
    gameOver = false;
    playerTurn = true;
    result.textContent = "";
    drawBoard();
}

drawBoard();