const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');

// Селекторы настроек
const difficultySelect = document.getElementById('difficulty');
const gridSizeSelect = document.getElementById('gridSize');
const foodCountSelect = document.getElementById('foodCount');
const startButton = document.getElementById('startButton');

let gridSize = 24;
let tileSize = canvas.width / gridSize;
let gameSpeed = 120;
let targetFoodCount = 1;

let snake = [];
let foods = [];
let dx = 1;
let dy = 0;
let nextDx = 1;
let nextDy = 0;
let score = 0;
let gameLoop = null;
let isGameOver = false;
let isGameRunning = false;

function applySettings() {
  gridSize = parseInt(gridSizeSelect.value, 10);
  tileSize = canvas.width / gridSize;
  gameSpeed = parseInt(difficultySelect.value, 10);
  targetFoodCount = parseInt(foodCountSelect.value, 10);
}

function setSettingsDisabled(disabled) {
  difficultySelect.disabled = disabled;
  gridSizeSelect.disabled = disabled;
  foodCountSelect.disabled = disabled;
  startButton.disabled = disabled;
}

function initGame() {
  applySettings();

  const startX = Math.floor(gridSize / 2);
  const startY = Math.floor(gridSize / 2);

  snake = [];
  const initialLength = Math.min(3, gridSize);
  for (let i = 0; i < initialLength; i++) {
    const posX = startX - i;
    if (posX >= 0) {
      snake.push({ x: posX, y: startY });
    }
  }

  dx = 1;
  dy = 0;
  nextDx = 1;
  nextDy = 0;
  score = 0;
  isGameOver = false;
  isGameRunning = true;

  scoreElement.textContent = score;
  gameOverElement.classList.add('hidden');
  setSettingsDisabled(true);

  foods = [];
  spawnAllFood();

  if (gameLoop) clearInterval(gameLoop);
  draw();
  gameLoop = setInterval(update, gameSpeed);
}

function spawnSingleFood() {
  let attempts = 0;
  while (attempts < 500) {
    const fx = Math.floor(Math.random() * gridSize);
    const fy = Math.floor(Math.random() * gridSize);

    const onSnake = snake.some(s => s.x === fx && s.y === fy);
    const onFood = foods.some(f => f.x === fx && f.y === fy);

    if (!onSnake && !onFood) {
      return { x: fx, y: fy };
    }
    attempts++;
  }
  return null;
}

function spawnAllFood() {
  while (foods.length < targetFoodCount) {
    const newFood = spawnSingleFood();
    if (newFood) {
      foods.push(newFood);
    } else {
      break;
    }
  }
}

function update() {
  if (isGameOver) return;

  dx = nextDx;
  dy = nextDy;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Проверка столкновения со стенами
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    return handleGameOver();
  }

  // Проверка столкновения со своим телом
  if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
    return handleGameOver();
  }

  snake.unshift(head);

  // Проверка поедания яблока
  const eatenIndex = foods.findIndex(f => f.x === head.x && f.y === head.y);
  if (eatenIndex !== -1) {
    score++;
    scoreElement.textContent = score;
    foods.splice(eatenIndex, 1);
    spawnAllFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  // Фон
  ctx.fillStyle = '#0f0f15';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Сеточные линии
  ctx.strokeStyle = '#181824';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(canvas.width, i * tileSize);
    ctx.stroke();
  }

  // Отрисовка всех яблок
  foods.forEach(food => {
    ctx.fillStyle = '#ff3344';
    ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);

    const highlightSize = Math.max(1, Math.floor(tileSize / 5));
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(
      food.x * tileSize + Math.max(1, Math.floor(tileSize / 8)),
      food.y * tileSize + Math.max(1, Math.floor(tileSize / 8)),
      highlightSize,
      highlightSize
    );
  });

  // Отрисовка змейки
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#00ff88' : '#00aa55';
    ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);

    ctx.strokeStyle = '#0f0f15';
    ctx.lineWidth = Math.max(1, Math.floor(tileSize / 10));
    ctx.strokeRect(segment.x * tileSize, segment.y * tileSize, tileSize, tileSize);
  });
}

function handleGameOver() {
  isGameOver = true;
  isGameRunning = false;
  clearInterval(gameLoop);
  gameOverElement.classList.remove('hidden');
  setSettingsDisabled(false);
}

// Нажатие на кнопку Старт
startButton.addEventListener('click', () => {
  initGame();
});

// Управление змейкой
document.addEventListener('keydown', (e) => {
  if (!isGameRunning || isGameOver) return;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      if (dy !== 1) { nextDx = 0; nextDy = -1; }
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      if (dy !== -1) { nextDx = 0; nextDy = 1; }
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      if (dx !== 1) { nextDx = -1; nextDy = 0; }
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      if (dx !== -1) { nextDx = 1; nextDy = 0; }
      break;
  }
});

// Начальная отрисовка сетки до первого старта
applySettings();
draw();