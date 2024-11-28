// Dimensions dynamiques
let WIDTH = window.innerWidth;
let HEIGHT = window.innerHeight;
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = WIDTH;
canvas.height = HEIGHT;
const ctx = canvas.getContext('2d');

// Recalibrer les dimensions si la fenêtre est redimensionnée
window.addEventListener('resize', () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
});

// Couleurs
const WHITE = '#FFFFFF';
const BLUE = '#0000FF';
const RED = '#FF0000';
const DARK_RED = '#8B0000';
const YELLOW = '#FFFF00';

// Constantes
const PLAYER_RADIUS = 25;
const PLAYER_LIVES = 5;
const PLAYER_SPEED = 5;
const PROJECTILE_SPEED_PLAYER = 10;
const PROJECTILE_SPEED_ENEMY = 6;
const ENEMY_SPAWN_RATE = 0.02;
const ENEMY_SHOOT_RATE = 0.05;

// Gestion des touches
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Classe pour le joueur
class Player {
    constructor() {
        this.radius = PLAYER_RADIUS;
        this.color = BLUE;
        this.x = WIDTH / 2;
        this.y = HEIGHT - 50;
        this.lives = PLAYER_LIVES;
        this.speed = PLAYER_SPEED;
        this.lastShot = 0;
        this.shootDelay = 500; // En millisecondes
    }

    move() {
        const dx = (keys['ArrowRight'] ? this.speed : 0) - (keys['ArrowLeft'] ? this.speed : 0);
        const dy = (keys['ArrowDown'] ? this.speed : 0) - (keys['ArrowUp'] ? this.speed : 0);
        this.x += dx;
        this.y += dy;

        // Contraindre le joueur dans le champ
        this.x = Math.max(this.radius, Math.min(WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(HEIGHT - this.radius, this.y));
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    shoot() {
        const currentTime = Date.now();
        if (keys[' '] && currentTime - this.lastShot >= this.shootDelay) {
            this.lastShot = currentTime;
            return new Projectile(this.x, this.y - this.radius, true);
        }
        return null;
    }
}

// Classe pour les projectiles
class Projectile {
    constructor(x, y, isPlayer) {
        this.x = x;
        this.y = y;
        this.isPlayer = isPlayer;
        this.width = 5;
        this.height = 10;
        this.speed = isPlayer ? PROJECTILE_SPEED_PLAYER : PROJECTILE_SPEED_ENEMY;
    }

    move() {
        this.y += this.isPlayer ? -this.speed : this.speed;
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.x - this.width / 2, this.y, this.width, this.height);
        ctx.fillStyle = this.isPlayer ? WHITE : YELLOW;
        ctx.fill();
        ctx.closePath();
    }

    isOffScreen() {
        return this.y < 0 || this.y > HEIGHT;
    }
}

// Classe pour les ennemis
class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = speed;
        this.color = RED;
        this.lastShot = 0;
    }

    move() {
        this.y += this.speed;
    }

    shoot() {
        const currentTime = Date.now();
        if (Math.random() < ENEMY_SHOOT_RATE && currentTime - this.lastShot > 1000) {
            this.lastShot = currentTime;
            return new Projectile(this.x + this.width / 2, this.y + this.height, false);
        }
        return null;
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

// Variables globales
let score = 0;
let startTime = Date.now();
let gameOver = false;

// Fonction pour afficher le score, les vies, et le chronomètre
function drawHUD(player) {
    ctx.fillStyle = WHITE;
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Lives: ${player.lives}`, 20, 60);
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    ctx.fillText(`Time: ${elapsedTime}s`, WIDTH - 150, 30);
}

// Fonction pour afficher l'écran de fin de partie
function showGameOverScreen() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = WHITE;
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Game Over!`, WIDTH / 2, HEIGHT / 2 - 50);
    ctx.fillText(`Your score: ${score}`, WIDTH / 2, HEIGHT / 2);

    const replayButton = document.createElement('button');
    const quitButton = document.createElement('button');

    replayButton.innerText = 'Replay';
    quitButton.innerText = 'Quit';

    replayButton.style.position = quitButton.style.position = 'absolute';
    replayButton.style.left = `${WIDTH / 2 - 100}px`;
    replayButton.style.top = `${HEIGHT / 2 + 50}px`;

    quitButton.style.left = `${WIDTH / 2 + 20}px`;
    quitButton.style.top = `${HEIGHT / 2 + 50}px`;

    document.body.appendChild(replayButton);
    document.body.appendChild(quitButton);

    replayButton.onclick = () => {
        document.body.removeChild(replayButton);
        document.body.removeChild(quitButton);
        window.location.reload();
    };

    quitButton.onclick = () => {
        window.close();
    };
}

// Fonction principale
function main() {
    const player = new Player();
    let enemies = [];
    let projectiles = [];

    function spawnEnemies() {
        if (Math.random() < ENEMY_SPAWN_RATE) {
            const x = Math.random() * (WIDTH - 50);
            enemies.push(new Enemy(x, 0, 2));
        }
    }

    function handleCollisions() {
        projectiles = projectiles.filter(projectile => {
            if (projectile.isPlayer) {
                return enemies.every((enemy, i) => {
                    if (
                        projectile.x > enemy.x &&
                        projectile.x < enemy.x + enemy.width &&
                        projectile.y > enemy.y &&
                        projectile.y < enemy.y + enemy.height
                    ) {
                        enemies.splice(i, 1);
                        score += 1;
                        return false;
                    }
                    return true;
                });
            }
            return true;
        });

        enemies.forEach((enemy, i) => {
            if (
                enemy.x < player.x + player.radius &&
                enemy.x + enemy.width > player.x - player.radius &&
                enemy.y < player.y + player.radius &&
                enemy.y + enemy.height > player.y - player.radius
            ) {
                enemies.splice(i, 1);
                player.lives -= 1;

                if (player.lives <= 0) {
                    gameOver = true;
                }
            }
        });
    }

    function update() {
        if (gameOver) {
            showGameOverScreen();
            return;
        }

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Déplacement et dessin du joueur
        player.move();
        player.draw();

        // Gestion des tirs du joueur
        const newProjectile = player.shoot();
        if (newProjectile) {
            projectiles.push(newProjectile);
        }

        // Gestion des projectiles
        projectiles = projectiles.filter(projectile => {
            projectile.move();
            projectile.draw();
            return !projectile.isOffScreen();
        });

        // Gestion des ennemis
        enemies = enemies.filter(enemy => {
            enemy.move();
            enemy.draw();

            const enemyProjectile = enemy.shoot();
            if (enemyProjectile) {
                projectiles.push(enemyProjectile);
            }

            return enemy.y < HEIGHT;
        });

        // Apparition des ennemis
        spawnEnemies();

        // Gestion des collisions
        handleCollisions();

        // Dessiner le HUD
        drawHUD(player);

        // Reboucle
        requestAnimationFrame(update);
    }

    update();
}

main();
