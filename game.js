class SimonGame {
  constructor() {
    this.buttonColors = ["red", "blue", "green", "yellow"];
    this.gamePattern = [];
    this.userClickedPattern = [];
    this.started = false;
    this.level = 0;
    this.highScore = parseInt(localStorage.getItem('simonHighScore')) || 0;
    this.difficulty = 'medium';
    this.speeds = { easy: 800, medium: 600, hard: 400 };
    this.showingSequence = false;
    
    this.init();
  }

  init() {
    this.updateHighScore();
    this.bindEvents();
    this.setupAudioContext();
  }

  setupAudioContext() {
    this.audioContext = null;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  bindEvents() {
    document.getElementById('start-btn').addEventListener('click', () => {
      this.startGame();
    });

    document.addEventListener('keypress', (e) => {
      if (e.code === 'Space' && !this.started) {
        this.startGame();
      }
    });

    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (this.started && !this.showingSequence) {
          this.handleButtonClick(e.target.id);
        }
      });
    });

    document.getElementById('difficulty').addEventListener('change', (e) => {
      this.difficulty = e.target.value;
    });
  }

  startGame() {
    if (!this.started) {
      this.started = true;
      this.level = 0;
      this.gamePattern = [];
      document.getElementById('start-btn').style.display = 'none';
      document.getElementById('level-title').textContent = 'Watch Carefully!';
      setTimeout(() => this.nextSequence(), 500);
    }
  }

  nextSequence() {
    this.userClickedPattern = [];
    this.level++;
    this.updateLevel();

    const randomNumber = Math.floor(Math.random() * 4);
    const randomChosenColor = this.buttonColors[randomNumber];
    this.gamePattern.push(randomChosenColor);

    document.getElementById('center-display').textContent = this.level;

    setTimeout(() => {
      this.playSequence();
    }, 500);
  }

  async playSequence() {
    this.showingSequence = true;
    document.getElementById('level-title').textContent = 'Watch...';

    for (let i = 0; i < this.gamePattern.length; i++) {
      await this.delay(200);
      await this.animateButton(this.gamePattern[i]);
    }

    this.showingSequence = false;
    document.getElementById('level-title').textContent = 'Your Turn!';
  }

  async animateButton(color) {
    const button = document.getElementById(color);
    button.classList.add('pressed');
    this.playSound(color);
    
    await this.delay(this.speeds[this.difficulty]);
    button.classList.remove('pressed');
  }

  handleButtonClick(userChosenColor) {
    this.userClickedPattern.push(userChosenColor);
    this.playSound(userChosenColor);
    this.animatePress(userChosenColor);
    this.checkAnswer(this.userClickedPattern.length - 1);
  }

  checkAnswer(currentLevel) {
    if (this.gamePattern[currentLevel] === this.userClickedPattern[currentLevel]) {
      if (this.userClickedPattern.length === this.gamePattern.length) {
        setTimeout(() => {
          this.nextSequence();
        }, 1000);
      }
    } else {
      this.gameOver();
    }
  }

  gameOver() {
    this.playSound('wrong');
    document.body.classList.add('game-over');
    
    setTimeout(() => {
      document.body.classList.remove('game-over');
    }, 500);

    document.getElementById('level-title').textContent = 'Game Over!';
    document.getElementById('center-display').textContent = '💀';

    if (this.level - 1 > this.highScore) {
      this.highScore = this.level - 1;
      localStorage.setItem('simonHighScore', this.highScore);
      this.updateHighScore();
      document.getElementById('level-title').textContent = 'New High Score!';
    }

    this.startOver();
  }

  startOver() {
    this.level = 0;
    this.gamePattern = [];
    this.userClickedPattern = [];
    this.started = false;
    this.showingSequence = false;
    
    setTimeout(() => {
      document.getElementById('start-btn').style.display = 'block';
      document.getElementById('level-title').textContent = 'SIMON';
      document.getElementById('center-display').textContent = 'GO!';
      this.updateLevel();
    }, 2000);
  }

  playSound(name) {
    if (this.audioContext) {
      const frequencies = {
        red: 220,
        blue: 330,
        green: 440,
        yellow: 550,
        wrong: 100
      };

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequencies[name], this.audioContext.currentTime);
      oscillator.type = name === 'wrong' ? 'sawtooth' : 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    }
  }

  animatePress(currentColor) {
    const button = document.getElementById(currentColor);
    button.classList.add('pressed');
    setTimeout(() => {
      button.classList.remove('pressed');
    }, 150);
  }

  updateLevel() {
    document.getElementById('current-level').textContent = this.level;
  }

  updateHighScore() {
    document.getElementById('high-score').textContent = this.highScore;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
  new SimonGame();
});