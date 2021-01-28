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
const game = new Game(square, board);

const keyMap = {
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
};

const playSound = (sound) => {
  if (sound.paused) {
    sound.play();
  } else {
    sound.currentTime = 0;
  }
};

const controls = (e) => {
  if (e.type === 'keydown') {
    e.key in keyMap ? keyMap[e.key] = true : null;
  } else {
    e.key in keyMap ? keyMap[e.key] = false : null;
  }
  if (keyMap.ArrowUp) game.move('up');
  if (keyMap.ArrowDown) game.move('down');
  if (keyMap.ArrowRight) game.move('right');
  if (keyMap.ArrowLeft) game.move('left');
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
  pause.textContent = pause.textContent === 'Pause' ? 'Resume' : 'Pause';
  game.togglePause();
};

const updateInfo = () => {
  if (game.score !== 0) playSound(attack);
  info.textContent = `Level:${game.level} Score:${game.score}`;
};

const playLevelUpSound = () => {
  playSound(levelUp);
};

const gameEnd = () => {
  disableControls();
  pause.style.display = 'none';
  start.style.display = 'initial';
  start.textContent = 'Restart';
  if (game.score < 30) {
    info.textContent = `You have failed! Score:${game.score}`;
    playSound(lose);
  } else if (game.score === 30) {
    info.textContent = 'You saved the world!!!';
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
