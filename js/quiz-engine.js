/* quiz-engine.js */
class QuizEngine {
    constructor(stageId) {
        this.stageId = stageId;
        this.questions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.isAnswered = false;
        
        this.questionEl = document.getElementById('question');
        this.optionsEl = document.getElementById('options');
        this.feedbackEl = document.getElementById('feedback');
        this.progressEl = document.getElementById('quiz-progress');
        this.currentQEl = document.getElementById('current-q');
        this.totalQEl = document.getElementById('total-q');

        this.init();
    }

    async init() {
        try {
            const dataUrl = `../data/questions-stage${this.stageId}.json`;
            const response = await fetch(dataUrl);
            
            if (!response.ok) {
                throw new Error(`ファイルが見つかりません (${response.status}): ${dataUrl}`);
            }
            
            this.questions = await response.json();
            this.totalQEl.textContent = this.questions.length;
            this.renderQuestion();
            this.addEventListeners();
        } catch (e) {
            console.error(e);
            this.questionEl.innerHTML = `
                <div class="error-msg">
                    <p>クイズデータの読み込みに失敗しました。</p>
                    <small style="color:red;">原因: ${e.message}</small><br>
                    <small>※ローカル環境で直接 HTML を開いている場合、ブラウザのセキュリティ制限により読み込みがブロックされる場合があります。その際は python -m http.server 等で実行してください。</small>
                </div>
            `;
        }
    }

    addEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
    }

    handleKeyDown(e) {
        if (this.isAnswered) {
            if (e.key === 'Enter') {
                this.nextQuestion();
            }
            return;
        }
        const key = parseInt(e.key);
        if (key >= 1 && key <= 4 && key <= this.questions[this.currentIndex].options.length) {
            this.checkAnswer(key - 1);
        }
    }

    renderQuestion() {
        const q = this.questions[this.currentIndex];
        this.isAnswered = false;
        this.feedbackEl.classList.remove('show');
        this.questionEl.textContent = q.question || q.text;
        this.optionsEl.innerHTML = '';
        this.currentQEl.textContent = this.currentIndex + 1;
        
        const progress = ((this.currentIndex) / this.questions.length) * 100;
        this.progressEl.style.width = progress + '%';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="opt-num">${idx + 1}</span> ${opt}`;
            btn.onclick = () => this.checkAnswer(idx);
            this.optionsEl.appendChild(btn);
        });
    }

    checkAnswer(idx) {
        if (this.isAnswered) return;
        this.isAnswered = true;
        const q = this.questions[this.currentIndex];
        const isCorrect = idx === q.answer;
        if (isCorrect) this.score++;
        const btns = this.optionsEl.querySelectorAll('.option-btn');
        btns[idx].classList.add(isCorrect ? 'correct-answer' : 'wrong-answer');
        if (!isCorrect) {
            btns[q.answer].classList.add('correct-answer');
        }
        const resultStatus = document.getElementById('result-status');
        resultStatus.textContent = isCorrect ? '正解！ 🎯' : '残念... 💧';
        resultStatus.className = isCorrect ? 'result correct' : 'result wrong';
        document.getElementById('explanation').innerHTML = `<h4>解説</h4><p>${q.explanation}</p>`;
        this.feedbackEl.classList.add('show');
    }

    nextQuestion() {
        this.currentIndex++;
        if (this.currentIndex < this.questions.length) {
            this.renderQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        const totalScore = Math.round((this.score / this.questions.length) * 100);
        ProgressManager.updateStage(this.stageId, { quizScore: totalScore, lastScore: totalScore });
        const evolution = ProgressManager.getEvolution(this.stageId);
        const container = document.getElementById('quiz-container');
        container.innerHTML = `
            <div class="results-screen">
                <div class="results-evolution">${evolution.icon}</div>
                <h2>試験完了！</h2>
                <div class="score-display">${this.score} / ${this.questions.length}</div>
                <div class="results-summary">達成度：${evolution.label}（${totalScore}%）</div>
                <div class="results-actions">
                    <button onclick="location.reload()" class="btn btn-outline">もう一度挑戦</button>
                    <a href="../index.html" class="btn btn-primary">ロードマップに戻る</a>
                </div>
            </div>
        `;
        this.progressEl.style.width = '100%';
    }
}
