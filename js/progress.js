/* progress.js */
const ProgressManager = {
    updateStage(stageId, data) {
        const key = `azure_study_progress_${stageId}`;
        const current = this.getStageProgress(stageId);
        const updated = { ...current, ...data };
        localStorage.setItem(key, JSON.stringify(updated));
    },

    getStageProgress(stageId) {
        const key = `azure_study_progress_${stageId}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : { studyCompleted: false, quizScore: 0, lastScore: 0 };
    },

    getOverallStats() {
        let totalPerfect = 0;
        let totalLearned = 0;
        // Azure stages 0-9
        for (let i = 0; i <= 9; i++) {
            const p = this.getStageProgress(i);
            if (p.quizScore === 100) totalPerfect++;
            else if (p.studyCompleted || p.quizScore > 0) totalLearned++;
        }
        return { totalPerfect, totalLearned };
    },

    getEvolution(stageId) {
        const p = this.getStageProgress(stageId);
        if (p.quizScore === 100) {
            return { icon: '👑', class: 'perfect', label: 'Master' };
        } else if (p.quizScore >= 80) {
            return { icon: '🔥', class: 'pro', label: 'Pro' };
        } else if (p.studyCompleted) {
            return { icon: '🌱', class: 'learned', label: 'Learned' };
        } else {
            return { icon: '🐣', class: 'begin', label: 'Beginner' };
        }
    }
};

/* quiz-engine.js (will be in the same file or separate, but I'll write it as a separate write call next) */
