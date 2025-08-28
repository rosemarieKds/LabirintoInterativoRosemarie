// Configuração do jogo
const boardSize = 15;
let playerPosition = { x: 1, y: 1 };
let score = 0;
let coinsCollected = 0;
let totalCoins = 5;
let lives = 3;
let timeLeft = 60;
let gameInterval;
let enemyPositions = [{x: 7, y: 7}, {x: 10, y: 3}];
let powerUpPosition = {x: 13, y: 13};
let hasPowerUp = false;
let powerUpEndTime = 0;

// Definição do mapa (0 = caminho, 1 = parede, 2 = moeda, 3 = saída)
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 2, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 2, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Inicializar o tabuleiro
function initializeBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            if (map[y][x] === 1) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('path');
                
                if (map[y][x] === 2) {
                    cell.classList.add('coin');
                } else if (map[y][x] === 3) {
                    cell.classList.add('exit');
                }
            }
            
            // Adicionar power-up
            if (x === powerUpPosition.x && y === powerUpPosition.y) {
                cell.classList.add('power-up');
            }
            
            gameBoard.appendChild(cell);
        }
    }
    
    // Adicionar inimigos
    enemyPositions.forEach(enemy => {
        const enemyCell = document.querySelector(`.cell[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
        enemyCell.classList.add('enemy');
    });
    
    updatePlayerPosition();
}

// Atualizar a posição do jogador
function updatePlayerPosition() {
    // Limpar todas as células do jogador
    document.querySelectorAll('.player').forEach(cell => {
        cell.classList.remove('player');
    });
    
    // Adicionar o jogador na nova posição
    const playerCell = document.querySelector(`.cell[data-x="${playerPosition.x}"][data-y="${playerPosition.y}"]`);
    playerCell.classList.add('player');
    
    // Verificar se coletou uma moeda
    if (playerCell.classList.contains('coin')) {
        playerCell.classList.remove('coin');
        score += 10;
        coinsCollected++;
        document.getElementById('score').textContent = score;
        document.getElementById('coins').textContent = `${coinsCollected}/${totalCoins}`;
        
        // Verificar se coletou todas as moedas
        if (coinsCollected === totalCoins) {
            const exitCell = document.querySelector('.exit');
            exitCell.style.boxShadow = '0 0 15px #00ff33, 0 0 30px #00ff33';
        }
    }
    
    // Verificar se pegou o power-up
    if (playerCell.classList.contains('power-up')) {
        playerCell.classList.remove('power-up');
        hasPowerUp = true;
        powerUpEndTime = Date.now() + 10000; // 10 segundos
        alert("Power-up ativado! Você é invencível por 10 segundos!");
    }
    
    // Verificar se chegou à saída
    if (playerCell.classList.contains('exit')) {
        if (coinsCollected === totalCoins) {
            clearInterval(gameInterval);
            alert(`Parabéns! Você completou o labirinto com ${score} pontos!`);
            resetGame();
        } else {
            alert("Você precisa coletar todas as moedas primeiro!");
        }
    }
    
    // Verificar colisão com inimigos
    if (playerCell.classList.contains('enemy')) {
        if (!hasPowerUp) {
            lives--;
            document.getElementById('lives').textContent = lives;
            
            if (lives <= 0) {
                clearInterval(gameInterval);
                alert("Game Over! Suas vidas acabaram!");
                resetGame();
            } else {
                alert("O inimigo te pegou! Perdeu uma vida.");
                resetPlayerPosition();
            }
        } else {
            // Se tem power-up, destrói o inimigo
            playerCell.classList.remove('enemy');
            enemyPositions = enemyPositions.filter(enemy => 
                !(enemy.x === playerPosition.x && enemy.y === playerPosition.y)
            );
            score += 20;
            document.getElementById('score').textContent = score;
        }
    }
}

// Reiniciar a posição do jogador
function resetPlayerPosition() {
    playerPosition = { x: 1, y: 1 };
    updatePlayerPosition();
}

// Reiniciar o jogo
function resetGame() {
    playerPosition = { x: 1, y: 1 };
    score = 0;
    coinsCollected = 0;
    lives = 3;
    timeLeft = 60;
    hasPowerUp = false;
    
    document.getElementById('score').textContent = score;
    document.getElementById('coins').textContent = `${coinsCollected}/${totalCoins}`;
    document.getElementById('lives').textContent = lives;
    document.getElementById('timer').textContent = timeLeft;
    
    clearInterval(gameInterval);
    startGame();
}

// Movimentação do jogador
document.addEventListener('keydown', (e) => {
    let newX = playerPosition.x;
    let newY = playerPosition.y;
    
    switch(e.key) {
        case 'ArrowUp':
            newY--;
            break;
        case 'ArrowDown':
            newY++;
            break;
        case 'ArrowLeft':
            newX--;
            break;
        case 'ArrowRight':
            newX++;
            break;
        case 'r':
        case 'R':
            resetGame();
            return;
        default:
            return; // Sai se não for uma tecla de movimento
    }
    
    // Verificar se o movimento é válido (não é parede)
    if (newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize && map[newY][newX] !== 1) {
        playerPosition.x = newX;
        playerPosition.y = newY;
        updatePlayerPosition();
    }
});

// Movimentar inimigos
function moveEnemies() {
    enemyPositions.forEach((enemy, index) => {
        // Limpar a célula do inimigo
        const enemyCell = document.querySelector(`.cell[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
        enemyCell.classList.remove('enemy');
        
        // Movimento simples do inimigo (poderia ser melhorado com IA)
        const directions = [
            {x: 0, y: -1}, // cima
            {x: 1, y: 0},  // direita
            {x: 0, y: 1},  // baixo
            {x: -1, y: 0}  // esquerda
        ];
        
        const validDirections = directions.filter(dir => {
            const newX = enemy.x + dir.x;
            const newY = enemy.y + dir.y;
            return newX >= 0 && newX < boardSize && 
                   newY >= 0 && newY < boardSize && 
                   map[newY][newX] !== 1;
        });
        
        if (validDirections.length > 0) {
            const randomDir = validDirections[Math.floor(Math.random() * validDirections.length)];
            enemy.x += randomDir.x;
            enemy.y += randomDir.y;
        }
        
        // Atualizar a posição do inimigo no mapa
        const newEnemyCell = document.querySelector(`.cell[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
        newEnemyCell.classList.add('enemy');
    });
    
    // Verificar se o jogador foi pego por um inimigo após o movimento
    const playerCell = document.querySelector(`.cell[data-x="${playerPosition.x}"][data-y="${playerPosition.y}"]`);
    if (playerCell.classList.contains('enemy') && !hasPowerUp) {
        lives--;
        document.getElementById('lives').textContent = lives;
        
        if (lives <= 0) {
            clearInterval(gameInterval);
            alert("Game Over! Suas vidas acabaram!");
            resetGame();
        } else {
            alert("O inimigo te pegou! Perdeu uma vida.");
            resetPlayerPosition();
        }
    }
}

// Verificar power-up
function checkPowerUp() {
    if (hasPowerUp && Date.now() > powerUpEndTime) {
        hasPowerUp = false;
        alert("Power-up acabou! Você não está mais invencível.");
    }
}

// Atualizar timer
function updateTimer() {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    
    if (timeLeft <= 0) {
        clearInterval(gameInterval);
        alert("Tempo esgotado! Game Over!");
        resetGame();
    }
}

// Iniciar o jogo
function startGame() {
    initializeBoard();
    
    // Iniciar o timer do jogo
    gameInterval = setInterval(() => {
        moveEnemies();
        updateTimer();
        checkPowerUp();
    }, 1000);
}

// Botão de reiniciar
document.getElementById('restart-btn').addEventListener('click', resetGame);

// Iniciar o jogo quando a página carregar
window.addEventListener('load', startGame);