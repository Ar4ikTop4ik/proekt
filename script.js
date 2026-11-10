// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const GRID_SIZE = 24;
const TILE_SIZE = canvas.width / GRID_SIZE; // 20px на квадрат

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let gameInterval = null;
const GAME_SPEED = 120; //мс

function initGame() {
    snake = [
        { x: 10, y: 12 },
        { x: 9, y: 12 },
        { x: 8, y: 12 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreElement.textContent = score;
    spawnFood();
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, GAME_SPEED);
}

function spawnFood() {
    while (true) {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        
        const isOnSnake = snake.some(segment => segment.x === x && segment.y === y);
        if (!isOnSnake) {
            food = { x, y };
            break;
        }
    }
}

function gameLoop() {
    update();
    draw();
}

function update() {
    direction = { ...nextDirection };
    
    const head = { 
        x: snake[0].x + direction.x, 
        y: snake[0].y + direction.y 
    };

    // Проверка столкновений со стенами
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return resetGame();
    }

    // Проверка столкновения с собой
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return resetGame();
    }

    snake.unshift(head);

    // Проверка съедания яблока
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        spawnFood();
    } else {
        snake.pop();
    }
}

function draw() {
    // Очистка поля
    ctx.fillStyle = '#0d0d0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Сетка (пиксельный стиль)
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 1;
    for (let i = 0; i < GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(canvas.width, i * TILE_SIZE);
        ctx.stroke();
    }

    // Отрисовка яблока (пиксель)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
        food.x * TILE_SIZE + 1, 
        food.y * TILE_SIZE + 1, 
        TILE_SIZE - 2, 
        TILE_SIZE - 2
    );
    
    // Блик на яблоке
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(
        food.x * TILE_SIZE + 3, 
        food.y * TILE_SIZE + 3, 
        4, 
        4
    );

    // Отрисовка змейки
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        ctx.fillStyle = isHead ? '#4ade80' : '#22c55e';
        
        ctx.fillRect(
            segment.x * TILE_SIZE + 1, 
            segment.y * TILE_SIZE + 1, 
            TILE_SIZE - 2, 
            TILE_SIZE - 2
        );

        // Пиксельные глаза на голове
        if (isHead) {
            ctx.fillStyle = '#09090b';
            let eye1 = { x: 0, y: 0 };
            let eye2 = { x: 0, y: 0 };

            if (direction.x === 1) { // Вправо
                eye1 = { x: 13, y: 4 };
                eye2 = { x: 13, y: 12 };
            } else if (direction.x === -1) { // Влево
                eye1 = { x: 3, y: 4 };
                eye2 = { x: 3, y: 12 };
            } else if (direction.y === -1) { // Вверх
                eye1 = { x: 4, y: 3 };
                eye2 = { x: 12, y: 3 };
            } else if (direction.y === 1) { // Вниз
                eye1 = { x: 4, y: 13 };
                eye2 = { x: 12, y: 13 };
            }

            ctx.fillRect(segment.x * TILE_SIZE + eye1.x, segment.y * TILE_SIZE + eye1.y, 3, 3);
            ctx.fillRect(segment.x * TILE_SIZE + eye2.x, segment.y * TILE_SIZE + eye2.y, 3, 3);
        }
    });
}

function resetGame() {
    initGame();
}

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            break;
    }
});

initGame();