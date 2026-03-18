// Cybersecurity Quiz Data - Sample questions for demo (expandable)
const quizData = {
    basic: {
        maxLevels: 100,
        questions: (() => {
            const questions = [];
            for (let level = 1; level <= 100; level++) {
                questions[level] = generateBasicQuestions(level);
            }
            return questions;
        })()
    },
    standard: {
        maxLevels: 100,
        questions: (() => {
            const questions = [];
            for (let level = 1; level <= 100; level++) {
                questions[level] = generateStandardQuestions(level);
            }
            return questions;
        })()
    },
    master: {
        maxLevels: 50,
        questions: (() => {
            const questions = [];
            for (let level = 1; level <= 50; level++) {
                questions[level] = generateMasterQuestions(level);
            }
            return questions;
        })()
    }
};

// Generate sample questions for each level
function generateBasicQuestions(level) {
    const basicTemplates = [
        {
            q: `What does ${['TCP', 'UDP', 'HTTP'][level % 3]} stand for?`,
            options: ['Transmission Control Protocol', 'User Datagram Protocol', 'HyperText Transfer Protocol'],
            correct: 0
        },
        {
            q: `Common port for ${['SSH', 'HTTP', 'HTTPS'][level % 3]}?`,
            options: ['22', '80', '443'],
            correct: level % 3
        },
        {
            q: `Linux command to list files?`,
            options: ['ls', 'dir', 'list', 'files'],
            correct: 0
        }
    ];
    return Array(10).fill().map((_, i) => ({
        question: basicTemplates[i % basicTemplates.length].q,
        options: basicTemplates[i % basicTemplates.length].options,
        correct: basicTemplates[i % basicTemplates.length].correct
    }));
}

function generateStandardQuestions(level) {
    const standardTemplates = [
        {
            q: `What attack uses ${['SQL', 'XSS', 'CSRF'][level % 3]} injection?`,
            options: ['Database', 'Script', 'Session'],
            correct: 0
        },
        {
            q: `Encryption algorithm: ${['AES', 'RSA', 'SHA'][level % 3]}?`,
            options: ['Symmetric', 'Asymmetric', 'Hash'],
            correct: level % 3
        }
    ];
    return Array(10).fill().map((_, i) => ({
        question: standardTemplates[i % 2].q,
        options: standardTemplates[i % 2].options,
        correct: standardTemplates[i % 2].correct
    }));
}

function generateMasterQuestions(level) {
    const masterTemplates = [
        {
            q: `Penetration testing phase: ${['Recon', 'Scanning', 'Exploitation'][level % 3]}?`,
            options: ['Information gathering', 'Vulnerability discovery', 'Access gaining'],
            correct: level % 3
        },
        {
            q: `Advanced attack vector: ${['Zero-day', 'DDoS', 'Ransomware'][level % 3]}?`,
            options: ['Unknown vulnerability', 'Traffic flooding', 'Encryption for ransom'],
            correct: level % 3
        }
    ];
    return Array(10).fill().map((_, i) => ({
        question: masterTemplates[i % 2].q,
        options: masterTemplates[i % 2].options,
        correct: masterTemplates[i % 2].correct
    }));
}

// Game State
let currentLevelType = '';
let currentLevelNum = 1;
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;
let progress = {};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    initEventListeners();
    updateProgressBars();
    
    // Matrix background effect
    createMatrix();
});

// Event Listeners
function initEventListeners() {
    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => startLevel(card.dataset.level));
    });
    
    // Quiz controls
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    
    // Modal buttons
    document.getElementById('next-level-btn').addEventListener('click', nextLevel);
    document.getElementById('home-btn').addEventListener('click', goHome);
}

// Start a level
function startLevel(levelType) {
    currentLevelType = levelType;
    currentLevelNum = getNextLevel(levelType);
    currentQuestionIndex = 0;
    score = 0;
    
    document.getElementById('home').classList.remove('active');
    document.getElementById('quiz').classList.add('active');
    
    document.getElementById('current-level').textContent = 
        `${levelType.toUpperCase()} LEVEL ${currentLevelNum}`;
    
    loadQuestions();
}

// Get next unlocked level
function getNextLevel(levelType) {
    const completed = progress[levelType] || 0;
    return Math.min(completed + 1, quizData[levelType].maxLevels);
}

// Load questions for current level
function loadQuestions() {
    const questions = quizData[currentLevelType].questions[currentLevelNum];
    totalQuestions = questions.length;
    
    showQuestion(questions[currentQuestionIndex]);
    updateScore();
    updateProgress();
}

// Show current question
function showQuestion(question) {
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-num').textContent = currentQuestionIndex + 1;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.textContent = option;
        optionEl.addEventListener('click', () => selectOption(index, question.correct));
        optionsContainer.appendChild(optionEl);
    });
    
    document.getElementById('next-btn').disabled = true;
}

// Handle option selection
function selectOption(selectedIndex, correctIndex) {
    const options = document.querySelectorAll('.option');
    
    options.forEach((option, index) => {
        option.style.pointerEvents = 'none';
        if (index === correctIndex) {
            option.classList.add('correct');
        } else if (index === selectedIndex && index !== correctIndex) {
            option.classList.add('wrong');
        }
        
        if (index === selectedIndex) {
            option.classList.add('selected');
        }
    });
    
    if (selectedIndex === correctIndex) {
        score++;
    }
    
    document.getElementById('next-btn').disabled = false;
}

// Next question
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < totalQuestions) {
        const questions = quizData[currentLevelType].questions[currentLevelNum];
        showQuestion(questions[currentQuestionIndex]);
        updateScore();
        updateProgress();
    } else {
        completeLevel();
    }
}

// Complete level
function completeLevel() {
    const levelPercent = Math.round((score / totalQuestions) * 100);
    progress[currentLevelType] = Math.max(progress[currentLevelType] || 0, currentLevelNum);
    saveProgress();
    updateProgressBars();
    
    document.getElementById('final-score').textContent = `Final Score: ${score}/${totalQuestions} (${levelPercent}%)`;
    document.getElementById('level-completed').textContent = 
        `${currentLevelType.toUpperCase()} Level ${currentLevelNum} COMPLETED!`;
    
    document.getElementById('quiz').classList.remove('active');
    document.getElementById('completion-modal').classList.add('active');
    
    // Particle animation
    createParticles();
}

// Next level
function nextLevel() {
    document.getElementById('completion-modal').classList.remove('active');
    startLevel(currentLevelType);
}

// Go home
function goHome() {
    document.getElementById('completion-modal').classList.remove('active');
    document.getElementById('quiz').classList.remove('active');
    document.getElementById('home').classList.add('active');
}

// Update UI
function updateScore() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

function updateProgress() {
    const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    document.getElementById('quiz-progress').style.width = `${progressPercent}%`;
}

function updateProgressBars() {
    ['basic', 'standard', 'master'].forEach(levelType => {
        const completed = progress[levelType] || 0;
        const maxLevels = quizData[levelType].maxLevels;
        const percent = (completed / maxLevels) * 100;
        
        const fill = document.querySelector(`[data-level="${levelType}"]`);
        if (fill) fill.style.width = `${percent}%`;
    });
}

// LocalStorage
function saveProgress() {
    localStorage.setItem('cyberQuizProgress', JSON.stringify(progress));
}

function loadProgress() {
    const saved = localStorage.getItem('cyberQuizProgress');
    progress = saved ? JSON.parse(saved) : {};
}

// Matrix background
function createMatrix() {
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
    
    function draw() {
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
    }
    
    setInterval(draw, 50);
}

// Particle explosion for completion
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: linear-gradient(45deg, #00ff99, #00ff41);
            border-radius: 50%;
            left: 50%;
            top: 50%;
            pointer-events: none;
            box-shadow: 0 0 10px #00ff99;
        `;
        
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.random() * 400 - 200}px, ${Math.random() * 400 - 200}px) scale(0)`, opacity: 0 }
            ], {
                duration: 2000 + Math.random() * 1000,
                easing: 'ease-out'
            });
        }, i * 50);
    }
}

// Responsive resize
window.addEventListener('resize', () => {
    const matrix = document.querySelector('.matrix-bg canvas');
    if (matrix) {
        matrix.width = window.innerWidth;
        matrix.height = window.innerHeight;
    }
});
