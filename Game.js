class Utils {
  // Preset character colors.
  static colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

  // Gives a random number between two numbers.
  static randomizeRange(floor, ceil) {
    return Math.floor(Math.random() * ceil) + floor;
  }

  // This method makes it impossible for an enemy to spawn on the player and also makes sure they spawn in the area.
  static calculateSpawn(player, boundaries) {
    const playerPos = player.position;
    const pos = { x: null, y: null };
    // Space available.
    const leftSpace = playerPos.x;
    const rightSpace = boundaries.maxX - playerPos.x;
    const upSpace = playerPos.y;
    const downSpace = boundaries.maxY - playerPos.y;
    // Side with more space.
    const dominantX = leftSpace >= rightSpace ? 'left' : 'right';
    const dominantY = upSpace >= downSpace ? 'up' : 'down';
    const dominantXDist = Math.max(leftSpace, rightSpace);
    const dominantYDist = Math.max(upSpace, downSpace);
    // How far from player is the enemy going to spawn, minimum is the width/height of player.
    const xSpawnDist = Utils.randomizeRange(player.element.offsetWidth, dominantXDist - player.element.offsetWidth);
    const ySpawnDist = Utils.randomizeRange(player.element.offsetHeight, dominantYDist - player.element.offsetHeight);
    // Calculating the spawn coords.
    if (dominantX === 'left') pos.x = playerPos.x - xSpawnDist;
    if (dominantX === 'right') pos.x = playerPos.x + xSpawnDist;
    if (dominantY === 'up') pos.y = playerPos.y - ySpawnDist;
    if (dominantY === 'down') pos.y = playerPos.y + ySpawnDist;
    return pos;
  }

  // Calculates the range of coordinates for collision detection.
  static calculateCollisonRanges(enemy, position) {
    return {
      collMinX: position.x - enemy.offsetWidth,
      collMaxX: position.x + enemy.offsetWidth,
      collMinY: position.y - enemy.offsetHeight,
      collMaxY: position.y + enemy.offsetHeight
    };
  }

  // Checks if num is in between min and max.
  static inRange(num, min, max) {
    if (num >= min && num <= max) return true;
    return false;
  }
}

class Character {
  constructor(element, position = { x: 0, y: 0 }, speed = 0, color = 'red') {
    this.element = element;
    this.position = position;
    this.speed = speed;

    element.style.backgroundColor = color;
    element.addEventListener('click', this.changeColor.bind(this));
  }

  // Randomly selects a color for the character.
  changeColor() {
    const color = Utils.randomizeRange(0, Utils.colors.length);
    this.element.style.backgroundColor = Utils.colors[color];
  }

  // Movement functions.
  movePosX() {
    this.position.x += this.speed;
    this.element.style.left = `${this.position.x}px`;
  }

  moveNegX() {
    this.position.x -= this.speed;
    this.element.style.left = `${this.position.x}px`;
  }

  movePosY() {
    this.position.y -= this.speed;
    this.element.style.top = `${this.position.y}px`;
  }

  moveNegY() {
    this.position.y += this.speed;
    this.element.style.top = `${this.position.y}px`;
  }
}

class Timer {
  constructor(duration, callback, callbackArg) {
    this.initialDuration = duration;
    this.timeLeft = duration;
    this.currentTimer = null;
    this.callback = callback;
    this.callbackArg = callbackArg;
  }

  getHours() {
    const base = this.timeLeft;
    return Math.floor(base / 3600);
  }

  getMinutes() {
    let base = this.timeLeft;
    base -= this.getHours() * 3600;
    return Math.floor(base / 60);
  }

  getSeconds() {
    let base = this.timeLeft;
    base -= this.getHours() * 3600;
    base -= this.getMinutes() * 60;
    return base;
  }

  tick() {
    if (this.timeLeft === 0) {
      clearInterval(this.currentTimer);
      this.currentTimer = null;
    }
    if (this.callback) this.callback(this.callbackArg);
    this.timeLeft -= 1;
  }

  startTimer() {
    if (this.currentTimer !== null) clearInterval(this.currentTimer);
    this.currentTimer = setInterval(this.tick.bind(this), 1000);
  }

  pauseTimer() {
    clearInterval(this.currentTimer);
  }

  resetTimer() {
    if (this.currentTimer) {
      clearInterval(this.currentTimer);
      this.currentTimer = null;
      this.timeLeft = this.initialDuration;
    }
  }
}

class Game {
  constructor(player, map) {
    this.levels = {
      1: { par: 5, time: 60, speed: 1.5 },
      2: { par: 10, time: 50, speed: 2 },
      3: { par: 15, time: 30, speed: 2.5 },
      4: { par: 20, time: 20, speed: 3 },
      5: { par: 30, time: 15, speed: 3.5 }, // MWAHAHAHAHAHA!!!
    };
    this.player = new Character(player, { x: player.offsetLeft, y: player.offsetTop }, 1, 'red');
    this.map = map;
    this.level = 1;
    this.boundaries = {
      maxX: map.offsetWidth - player.offsetWidth,
      minX: 0,
      maxY: map.offsetHeight - player.offsetHeight,
      minY: 0,
    };
    this.scored = new Event('scored');
    this.levelUp = new Event('level-up');
    this.paused = false;
    this.gameOver = false;
  }

  // Movement function. It makes sure character cant move outside the bounds as well.
  move(direction) {
    if (direction === 'up' && this.player.position.y > this.boundaries.minY) this.player.movePosY();
    if (direction === 'down' && this.player.position.y < this.boundaries.maxY) this.player.moveNegY();
    if (direction === 'right' && this.player.position.x < this.boundaries.maxX) this.player.movePosX();
    if (direction === 'left' && this.player.position.x > this.boundaries.minX) this.player.moveNegX();
    if (this.enemy) this.checkCollision();
  }

  // Checks if player is within the collision ranges. Kills the enemy if it is.
  checkCollision() {
    const {
      collMinX, collMaxX, collMinY, collMaxY
    } = this.enemy.collision;
    if (Utils.inRange(this.player.position.x, collMinX, collMaxX)
    && Utils.inRange(this.player.position.y, collMinY, collMaxY)) {
      this.killEnemy();
    }
  }

  // Obliterates the enemy, spawns a new one and increases score. Level up if score is appropriate.
  killEnemy() {
    this.enemy.el.remove();
    this.score += 1;
    if (this.score < 30) {
      this.enemy = this.addEnemy();
    } else {
      this.enemy = null;
    }
    document.dispatchEvent(this.scored);
    if (this.score === this.goal) this.nextLevel();
  }

  // Creates an element that becomes the enemy.
  createEnemy(pos) {
    const enemy = document.createElement('div');
    enemy.style.height = `${this.player.element.offsetHeight}px`;
    enemy.style.width = `${this.player.element.offsetWidth}px`;
    enemy.style.backgroundColor = 'white';
    enemy.style.position = 'absolute';
    enemy.style.left = `${pos.x}px`;
    enemy.style.top = `${pos.y}px`;
    return enemy;
  }

  // Renders an enemy. The enemy's element, position and collision ranges are saved.
  addEnemy() {
    const position = Utils.calculateSpawn(this.player, this.boundaries);
    const enemy = this.createEnemy(position);
    this.map.appendChild(enemy);
    return { el: enemy, position, collision: Utils.calculateCollisonRanges(enemy, position) };
  }

  // Does a lot of initialization for the starting of a new game.
  startGame() {
    if (this.enemy) this.enemy.el.remove();
    this.enemy = this.addEnemy();
    this.level = 1;
    this.score = 0;
    this.goal = this.levels[this.level].par;
    this.player.speed = this.levels[this.level].speed;
    this.timer = new Timer(this.levels[this.level].time, this.timerHandler, this);
    this.timerHandler.bind(this.timer)();
    this.timer.startTimer();
    this.paused = false;
    this.gameOver = false;
  }

  // Stops the timer.
  togglePause() {
    if (this.paused) {
      this.timer.startTimer();
    } else {
      this.timer.pauseTimer();
    }
    this.paused = !this.paused;
  }

  // Does all of the reassignemnt specific to each level.
  nextLevel() {
    if (this.level === 5) {
      this.gameEnd();
      return;
    }
    this.level += 1;
    document.dispatchEvent(this.levelUp);
    this.player.speed = this.levels[this.level].speed;
    this.goal = this.levels[this.level].par;
    this.timer.pauseTimer();
    this.timer.timeLeft = this.levels[this.level].time;
    this.timerHandler.bind(this.timer)();
    this.timer.startTimer();
  }

  gameEnd() {
    if (this.timer.timeLeft > 0) this.timer.pauseTimer();
    const gameOver = new Event('game-over');
    this.gameOver = true;
    document.dispatchEvent(gameOver);
  }

  // This runs every second of the timer, and sends out an event.
  timerHandler() {
    const minutes = this.getMinutes() < 10 ? `0${this.getMinutes()}` : this.getMinutes();
    const seconds = this.getSeconds() < 10 ? `0${this.getSeconds()}` : this.getSeconds();
    const timeTick = new CustomEvent('timeTick', { detail: { minutes, seconds } });
    document.dispatchEvent(timeTick);
    if (this.timeLeft === 0) {
      this.callbackArg.gameEnd();
    }
  }
}
