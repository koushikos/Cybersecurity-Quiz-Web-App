// Professional Cybersecurity Quiz - No Repeating Questions
// Modular, clean, state-managed with localStorage tracking

class QuizApp {
  constructor() {
    this.currentLevelType = null;
    this.currentSubLevel = 1;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.totalQuestions = 0;
    this.currentQuestions = [];
    this.progress = JSON.parse(localStorage.getItem('quizProgress')) || {};
    this.usedQuestions = JSON.parse(localStorage.getItem('usedQuestions')) || [];
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateProgressBars();
    this.createMatrixBackground();
  }

  bindEvents() {
    // Category selection
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => this.startQuiz(card.dataset.level));
    });

    // Quiz controls
    document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
    document.getElementById('next-level-btn').addEventListener('click', () => this.nextSubLevel());
    document.getElementById('home-btn').addEventListener('click', () => this.goHome());

    // Load on DOM ready
    document.addEventListener('DOMContentLoaded', () => this.updateUI());
  }

  /**
   * Start quiz for specific level type
   */
  startQuiz(levelType) {
    this.currentLevelType = levelType;
    this.currentSubLevel = this.getNextSubLevel(levelType);
    
    this.loadQuestionsForSubLevel();
    
    // Show quiz screen
    document.getElementById('home').classList.remove('active');
    document.getElementById('quiz').classList.add('active');
    
    document.getElementById('current-level').textContent = `${levelType.toUpperCase()} LEVEL ${this.currentSubLevel}`;
    
    this.updateScoreDisplay();
    this.loadQuestion();
  }

  /**
   * Load and prepare questions for current sub-level (no repeats)
   */
  loadQuestionsForSubLevel() {
    let subLevelQuestions = quizData[this.currentLevelType][this.currentSubLevel] || [];
    
    // Filter out already used questions
    subLevelQuestions = subLevelQuestions.filter(q => !this.usedQuestions.includes(q.question));
    
    // Reset if exhausted (all 250 used)
    if (subLevelQuestions.length === 0) {
      if (this.usedQuestions.length >= 250) {
        console.log('All questions used - resetting!');
        this.usedQuestions = [];
        localStorage.setItem('usedQuestions', JSON.stringify(this.usedQuestions));
        subLevelQuestions = quizData[this.currentLevelType][this.currentSubLevel] || [];
      } else {
        // Fallback to original
        subLevelQuestions = quizData[this.currentLevelType][this.currentSubLevel] || [];
      }
    }
    
    // Shuffle for randomness
    this.currentQuestions = subLevelQuestions.sort(() => Math.random() - 0.5);
    this.totalQuestions = this.currentQuestions.length;
    this.currentQuestionIndex = 0;
    this.score = 0;
  }

  /**
   * Load and display current question
   */
  loadQuestion() {
    const question = this.currentQuestions[this.currentQuestionIndex];
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-num').textContent = this.currentQuestionIndex + 1;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'option';
      optionDiv.textContent = option;
      optionDiv.addEventListener('click', () => this.handleAnswer(index, question.correct));
      optionsContainer.appendChild(optionDiv);
    });
    
    document.getElementById('next-btn').disabled = true;
    this.updateQuizProgress();
  }

  /**
   * Handle answer selection
   */
  handleAnswer(selectedIndex, correctIndex) {
    // Mark question as used
    const currentQuestion = this.currentQuestions[this.currentQuestionIndex];
    if (!this.usedQuestions.includes(currentQuestion.question)) {
      this.usedQuestions.push(currentQuestion.question);
      localStorage.setItem('usedQuestions', JSON.stringify(this.usedQuestions));
    }
    
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
      option.style.pointerEvents = 'none';
      if (index === correctIndex) {
        option.classList.add('correct');
      }
      if (index === selectedIndex) {
        option.classList.add('selected');
      }
    });
    
    // Update score
    if (selectedIndex === correctIndex) {
      this.score++;
    }
    
    document.getElementById('next-btn').disabled = false;
    this.updateScoreDisplay();
  }

  /**
   * Move to next question or complete quiz
   */
  nextQuestion() {
    this.currentQuestionIndex++;
    
    if (this.currentQuestionIndex < this.totalQuestions) {
      this.loadQuestion();
    } else {
      this.showCompletionPopup();
    }
  }

  /**
   * Show completion popup
   */
  showCompletionPopup() {
    const percent = Math.round((this.score / this.totalQuestions) * 100);
    
    // Update progress
    const maxSubLevels = this.currentLevelType === 'master' ? 50 : 100;
    this.progress[this.currentLevelType] = Math.max(this.progress[this.currentLevelType] || 0, this.currentSubLevel);
    localStorage.setItem('quizProgress', JSON.stringify(this.progress));
    this.updateProgressBars();
    
    document.getElementById('final-score').textContent = `Score: ${this.score}/${this.totalQuestions} (${percent}%)`;
    document.getElementById('level-completed').textContent = `${this.currentLevelType.toUpperCase()} Level ${this.currentSubLevel} COMPLETE! 🎉`;
    
    document.getElementById('quiz').classList.remove('active');
    document.getElementById('completion-modal').classList.add('active');
    
    this.createParticles();
  }

  /**
   * Next sub-level
   */
  nextSubLevel() {
    document.getElementById('completion-modal').classList.remove('active');
    this.startQuiz(this.currentLevelType);
  }

  /**
   * Return to home
   */
  goHome() {
    document.getElementById('completion-modal').classList.remove('active');
    document.getElementById('quiz').classList.remove('active');
    document.getElementById('home').classList.add('active');
  }

  /**
   * Get next unlocked sub-level
   */
  getNextSubLevel(levelType) {
    const completed = this.progress[levelType] || 0;
    const maxLevels = levelType === 'master' ? 50 : 100;
    return Math.min(completed + 1, maxLevels);
  }

  /**
   * Update score display
   */
  updateScoreDisplay() {
    document.getElementById('score').textContent = `Score: ${this.score}`;
  }

  /**
   * Update quiz progress bar
   */
  updateQuizProgress() {
    const progressPercent = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
    document.getElementById('quiz-progress').style.width = `${progressPercent}%`;
  }

  /**
   * Update home progress bars
   */
  updateProgressBars() {
    ['basic', 'standard', 'master'].forEach(levelType => {
      const completed = this.progress[levelType] || 0;
      const maxLevels = levelType === 'master' ? 50 : 100;
      const percent = (completed / maxLevels) * 100;
      
      const fill = document.querySelector(`[data-level="${levelType}"]`);
      if (fill) fill.style.width = `${percent}%`;
    });
  }

  /**
   * Matrix background animation
   */
  createMatrixBackground() {
    const matrix = document.querySelector('.matrix-bg');
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    matrix.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff99';
      ctx.font = `${fontSize}px monospace`;
      
      drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);
        
        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      });
    };
    
    setInterval(draw, 50);
  }

  /**
   * Particle celebration effect
   */
  createParticles() {
    const container = document.querySelector('.particles');
    container.innerHTML = '';
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 6px; height: 6px;
        background: linear-gradient(45deg, #00ff99, #00ff41);
        border-radius: 50%; left: 50%; top: 50%;
        pointer-events: none;
        box-shadow: 0 0 10px #00ff99;
      `;
      
      container.appendChild(particle);
      
      setTimeout(() => {
        particle.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${Math.random()*400-200}px, ${Math.random()*400-200}px) scale(0)`, opacity: 0 }
        ], {
          duration: 2000 + Math.random() * 1000,
          easing: 'ease-out'
        });
      }, i * 50);
    }
  }
}

// Initialize app
const quiz = new QuizApp();

// Responsive resize
window.addEventListener('resize', () => {
  const canvas = document.querySelector('.matrix-bg canvas');
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});
