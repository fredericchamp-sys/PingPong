document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('rppGameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('rppStartButton');
    const player1ScoreEl = document.getElementById('rppPlayer1Score');
    const player2ScoreEl = document.getElementById('rppPlayer2Score');
    const winMessageEl = document.getElementById('rppWinMessage');
    const instructionsEl = document.getElementById('rppInstructions');

    // Add class to body for specific page styling
    if (document.querySelector('.rpp-game-container')) {
        document.body.classList.add('rpp-active-page');
    }

    // Game settings
    const PADDLE_HEIGHT = 100;
    const PADDLE_WIDTH = 10;
    const BALL_RADIUS = 7;
    const WINNING_SCORE = 5;
    let gameRunning = false;
    let animationFrameId;

    canvas.width = 600;
    canvas.height = 400;

    // Game objects
    let player1 = { x: 10, y: canvas.height / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0, speed: 8 };
    let player2 = { x: canvas.width - PADDLE_WIDTH - 10, y: canvas.height / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0, speed: 4 }; // AI speed
    let ball = { x: canvas.width / 2, y: canvas.height / 2, radius: BALL_RADIUS, speedX: 5, speedY: 5 };

    // Player controls
    let keysPressed = {};
    document.addEventListener('keydown', (e) => { keysPressed[e.key.toLowerCase()] = true; });
    document.addEventListener('keyup', (e) => { keysPressed[e.key.toLowerCase()] = false; });

    function drawRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, h);
    }

    function drawCircle(x, y, r, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
    }

    function drawNet() {
        for (let i = 0; i < canvas.height; i += 15) {
            drawRect(canvas.width / 2 - 1, i, 2, 10, '#555');
        }
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5; // Random horizontal direction
        ball.speedY = (Math.random() * 6) - 3;      // Random vertical direction, less steep
        if (Math.abs(ball.speedY) < 2) ball.speedY = ball.speedY < 0 ? -2 : 2; // Ensure not too flat
    }

    function updateScores() {
        player1ScoreEl.textContent = player1.score;
        player2ScoreEl.textContent = player2.score;
    }

    function checkWin() {
        if (player1.score >= WINNING_SCORE || player2.score >= WINNING_SCORE) {
            gameRunning = false;
            winMessageEl.textContent = (player1.score >= WINNING_SCORE ? 'Player 1 Wins!' : 'Player 2 Wins!');
            winMessageEl.style.display = 'block';
            startButton.textContent = 'Restart Game';
            startButton.style.display = 'block';
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        }
    }

  function update() {
    if (!gameRunning) return;

    movePlayer1();
    movePlayer2AI();
    moveBall();
    handleWallCollisions();
    handlePaddleCollisions();
    handleScoring();
}

function movePlayer1() {
    if (keysPressed['w'] && player1.y > 0) {
        player1.y -= player1.speed;
    }
    if (keysPressed['s'] && player1.y < canvas.height - player1.height) {
        player1.y += player1.speed;
    }
}

function movePlayer2AI() {
    const player2Center = player2.y + player2.height / 2;
    if (player2Center < ball.y - 20 && player2.y < canvas.height - player2.height) {
        player2.y += player2.speed;
    } else if (player2Center > ball.y + 20 && player2.y > 0) {
        player2.y -= player2.speed;
    }
    player2.y = Math.max(0, Math.min(player2.y, canvas.height - player2.height));
}

function moveBall() {
    ball.x += ball.speedX;
    ball.y += ball.speedY;
}

function handleWallCollisions() {
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.speedY = -ball.speedY;
    } else if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.speedY = -ball.speedY;
    }
}

function handlePaddleCollisions() {
    if (isBallCollidingWith(player1)) {
        ball.x = player1.x + player1.width + ball.radius;
        applyPaddleBounce(player1, 1);
    }
    if (isBallCollidingWith(player2)) {
        ball.x = player2.x - ball.radius;
        applyPaddleBounce(player2, -1);
    }
}

function isBallCollidingWith(paddle) {
    return ball.x - ball.radius < paddle.x + paddle.width &&
           ball.x + ball.radius > paddle.x &&
           ball.y + ball.radius > paddle.y &&
           ball.y - ball.radius < paddle.y + paddle.height;
}

function applyPaddleBounce(paddle, direction) {
    const MAX_SPEED = 15;
    ball.speedX = direction * Math.min(Math.abs(ball.speedX) * 1.05, MAX_SPEED);
    ball.speedY = (ball.y - (paddle.y + paddle.height / 2)) * 0.15;
}

function handleScoring() {
    if (ball.x - ball.radius < 0) {
        player2.score++;
        updateScores();
        resetBall();
        checkWin();
    } else if (ball.x + ball.radius > canvas.width) {
        player1.score++;
        updateScores();
        resetBall();
        checkWin();
    }
}

    function render() {
        // Clear canvas
        drawRect(0, 0, canvas.width, canvas.height, '#000000');
        drawNet();
        // Draw paddles
        drawRect(player1.x, player1.y, player1.width, player1.height, '#00ff00');
        drawRect(player2.x, player2.y, player2.width, player2.height, '#00ff00');
        // Draw ball
        drawCircle(ball.x, ball.y, ball.radius, '#ffffff');
    }

    function gameLoop() {
        if (gameRunning) {
            update();
            render();
            animationFrameId = requestAnimationFrame(gameLoop);
        }
    }

    function startGame() {
        player1.score = 0;
        player2.score = 0;
        player1.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
        player2.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
        updateScores();
        resetBall();
        gameRunning = true;
        winMessageEl.style.display = 'none';
        startButton.style.display = 'none';
        instructionsEl.style.display = 'block';
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        gameLoop();
    }

    startButton.addEventListener('click', startGame);
    
    // Initial render (e.g. to show paddles before game starts)
    render(); 
    updateScores();
});
