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

    // Move player 1 paddle
    if (keysPressed['w'] && player1.y > 0) {
        player1.y -= player1.speed;
    }
    if (keysPressed['s'] && player1.y < canvas.height - player1.height) {
        player1.y += player1.speed;
    }

    // AI for player 2 paddle (simple)
    let player2Center = player2.y + player2.height / 2;
    if (player2Center < ball.y - 20 && player2.y < canvas.height - player2.height) {
        player2.y += player2.speed;
    } else if (player2Center > ball.y + 20 && player2.y > 0) {
        player2.y -= player2.speed;
    }

    // Keep AI paddle within bounds
    if (player2.y < 0) player2.y = 0;
    if (player2.y > canvas.height - player2.height) player2.y = canvas.height - player2.height;

    // Move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with top/bottom walls
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius; // reposition to prevent sticking
        ball.speedY = -ball.speedY;
    } else if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius; // reposition to prevent sticking
        ball.speedY = -ball.speedY;
    }

    const MAX_SPEED = 15; // cap to keep game playable

    // Ball collision with player 1 paddle (left)
    if (ball.x - ball.radius < player1.x + player1.width &&
        ball.x + ball.radius > player1.x &&
        ball.y + ball.radius > player1.y &&
        ball.y - ball.radius < player1.y + player1.height) {

        ball.x = player1.x + player1.width + ball.radius; // reposition outside paddle
        ball.speedX = Math.abs(ball.speedX) * 1.05;       // always move right, then cap
        ball.speedX = Math.min(ball.speedX, MAX_SPEED);
        let deltaY = ball.y - (player1.y + player1.height / 2);
        ball.speedY = deltaY * 0.15;
    }

    // Ball collision with player 2 paddle (right)
    if (ball.x + ball.radius > player2.x &&
        ball.x - ball.radius < player2.x + player2.width &&
        ball.y + ball.radius > player2.y &&
        ball.y - ball.radius < player2.y + player2.height) {

        ball.x = player2.x - ball.radius;                  // reposition outside paddle
        ball.speedX = -Math.abs(ball.speedX) * 1.05;       // always move left, then cap
        ball.speedX = Math.max(ball.speedX, -MAX_SPEED);
        let deltaY = ball.y - (player2.y + player2.height / 2);
        ball.speedY = deltaY * 0.15;
    }

    // Score points
    if (ball.x - ball.radius < 0) {        // Player 2 scores
        player2.score++;
        updateScores();
        resetBall();
        checkWin();
    } else if (ball.x + ball.radius > canvas.width) { // Player 1 scores
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
