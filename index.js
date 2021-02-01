const square = document.getElementById('square');
const board = document.getElementById('game');
const timer = document.getElementById('timer');
const start = document.getElementById('start');
const pause = document.getElementById('pause');
const info = document.getElementById('info');
const attack = document.getElementById('attack');
const levelUp = document.getElementById('levelUp');
const startSound = document.getElementById('startSound');
const lose = document.getElementById('lose');
const victory = document.getElementById('victory');
const game = new Game(square, board);
const scoreboard = () => `Level:${game.level} Score:${game.score}`;

const keyMap = {
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
};

const gameLoop = setInterval(() => {
  if (keyMap.ArrowUp) game.move('up');
  if (keyMap.ArrowDown) game.move('down');
  if (keyMap.ArrowRight) game.move('right');
  if (keyMap.ArrowLeft) game.move('left');
}, 20);

const playSound = (sound) => {
  if (sound.paused) {
    sound.play();
  } else {
    sound.currentTime = 0;
  }
};

const controls = (e) => {
  e.preventDefault();
  if (e.type === 'keydown') {
    e.key in keyMap ? keyMap[e.key] = true : null;
  } else {
    e.key in keyMap ? keyMap[e.key] = false : null;
  }
};

const enableControls = () => {
  document.addEventListener('keydown', controls);
  document.addEventListener('keyup', controls);
};

const disableControls = () => {
  document.removeEventListener('keydown', controls);
  document.removeEventListener('keyup', controls);
};

const pauseGame = () => {
  game.paused ? enableControls() : disableControls();
  info.textContent = game.paused ? scoreboard() : 'Paused';
  pause.textContent = pause.textContent === 'Pause' ? 'Resume' : 'Pause';
  game.togglePause();
};

const updateInfo = () => {
  if (game.score !== 0) playSound(attack);
  info.textContent = scoreboard();
};

const playLevelUpSound = () => {
  info.textContent = scoreboard();
  playSound(levelUp);
};

const gameEnd = () => {
  disableControls();
  keyMap.ArrowUp = false; keyMap.ArrowDown = false; keyMap.ArrowRight = false; keyMap.ArrowLeft = false;
  pause.style.display = 'none';
  start.style.display = 'initial';
  start.textContent = 'Play Again';
  if (game.score < 30) {
    info.textContent = `You have failed! Score:${game.score}`;
    playSound(lose);
  } else if (game.score === 30) {
    info.textContent = 'You saved the world!';
    playSound(victory);
  }
};

const handleTimeTick = (e) => {
  timer.textContent = `${e.detail.minutes}:${e.detail.seconds}`;
};

start.addEventListener('click', () => {
  playSound(startSound);
  if (game.gameOver) enableControls();
  game.startGame();
  updateInfo();
  start.style.display = 'none';
  pause.style.display = 'initial';
  start.textContent = 'Start';
});
pause.addEventListener('click', pauseGame);
pause.style.display = 'none';
document.addEventListener('level-up', playLevelUpSound);
document.addEventListener('timeTick', handleTimeTick);
document.addEventListener('game-over', gameEnd);
document.addEventListener('scored', updateInfo);
enableControls();
