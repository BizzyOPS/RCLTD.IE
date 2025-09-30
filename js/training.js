/* ============================================================================
   INTERACTIVE SAFETY TRAINING SYSTEM - ROBOTICS & CONTROL LTD
   
   Comprehensive safety training platform providing interactive learning
   modules, progress tracking, and certification management for industrial
   safety and automation training programs.
   
   Features:
   - Interactive training modules with multimedia content
   - Progress tracking and completion certificates  
   - Hash-based routing for bookmarkable sessions
   - Accessibility compliance with ARIA support
   - User answer persistence and resume functionality
   - Quiz and assessment system with scoring
   
   Dependencies: training-data.js for module content
   Browser Support: Modern browsers (Chrome 60+, Firefox 55+, Safari 12+)
   Standards: WCAG 2.1 AA accessibility compliance
   ============================================================================ */

/**
 * SafetyTrainingSystem Class
 * 
 * Main training system controller that manages training modules, user progress,
 * navigation, and accessibility features for the safety training platform.
 * 
 * @constructor
 * @class SafetyTrainingSystem
 */
function SafetyTrainingSystem() {
    var self = this;
    this.currentModule = null;
    this.currentChapter = null;
    this.progress = this.loadProgress();
    this.userAnswers = this.loadUserAnswers();
    this.trainingContainer = null;
    
    // Accessibility support
    this.announcer = null;
    this.focusStack = [];
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { self.initialize(); });
    } else {
        this.initialize();
    }
}

SafetyTrainingSystem.prototype.initialize = function() {
    var self = this;
    this.createTrainingInterface();
    this.setupEventListeners();
    this.setupAccessibility();
    this.handleHashRoute();
    
    // Handle browser back/forward
    window.addEventListener('hashchange', function() { self.handleHashRoute(); });
};

// ==================== SECURITY UTILITIES ====================

SafetyTrainingSystem.prototype.escapeAttr = function(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

SafetyTrainingSystem.prototype.escapeHtml = function(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

SafetyTrainingSystem.prototype.sanitizeHTML = function(html) {
    // Additional sanitization layer before innerHTML assignment
    // Remove dangerous patterns even from static content as defense-in-depth
    var sanitized = html;
    var previousValue;
    
    // Loop to handle nested/repeated dangerous patterns
    do {
        previousValue = sanitized;
        sanitized = sanitized
            // Remove script tags and content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '')
            .replace(/<script[^>]*>/gi, '')
            // Remove event handlers
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
            // Remove dangerous protocols in links/attributes
            .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
            .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src="#"')
            .replace(/href\s*=\s*["']data:[^"']*["']/gi, 'href="#"')
            // Remove iframe, object, embed tags
            .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
            .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '')
            .replace(/<embed[^>]*>/gi, '');
    } while (sanitized !== previousValue);
    
    return sanitized;
};
    
// ==================== ACCESSIBILITY SETUP ====================

SafetyTrainingSystem.prototype.setupAccessibility = function() {
        // Create ARIA live region for announcements
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.className = 'sr-only';
        this.announcer.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;';
        document.body.appendChild(this.announcer);
        
        // Setup keyboard navigation
        var self = this;
        document.addEventListener('keydown', function(e) { self.handleKeyboardNavigation(e); });
};

SafetyTrainingSystem.prototype.announce = function(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
            var self = this;
            setTimeout(function() { self.announcer.textContent = ''; }, 100);
        }
};

SafetyTrainingSystem.prototype.handleKeyboardNavigation = function(e) {
        // Handle Escape key to return to module selection
        if (e.key === 'Escape' && this.currentModule) {
            e.preventDefault();
            this.showModuleSelection();
            this.announce('Returned to module selection');
        }
        
        // Handle arrow keys for navigation
        if (e.target.classList.contains('training-nav-btn')) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                var buttons = document.querySelectorAll('.training-nav-btn');
                var currentIndex = Array.from(buttons).indexOf(e.target);
                var newIndex = currentIndex;
                
                if (e.key === 'ArrowLeft' && currentIndex > 0) {
                    newIndex = currentIndex - 1;
                } else if (e.key === 'ArrowRight' && currentIndex < buttons.length - 1) {
                    newIndex = currentIndex + 1;
                }
                
                if (newIndex !== currentIndex) {
                    buttons[newIndex].focus();
                }
            }
        }
};

// ==================== TRAINING INTERFACE CREATION ====================

SafetyTrainingSystem.prototype.createTrainingInterface = function() {
        // Find the course grid section to replace with training interface
        var courseSection = document.querySelector('.automation-services');
        if (!courseSection) {
            return;
        }
        
        // Create main training container
        this.trainingContainer = document.createElement('section');
        this.trainingContainer.className = 'training-system';
        this.trainingContainer.setAttribute('role', 'main');
        this.trainingContainer.setAttribute('aria-label', 'Interactive Safety Training System');
        
        // Replace the course grid with our training interface
        courseSection.parentNode.replaceChild(this.trainingContainer, courseSection);
        
        // Show module selection by default
        this.showModuleSelection();
};

SafetyTrainingSystem.prototype.showModuleSelection = function() {
        var modules = trainingData.modules;
        
        var self = this;
        var moduleSelectionHTML = [
            '<div class="container">',
            '    <div class="section-header">',
            '        <h2 class="section-title">Interactive Safety Training</h2>',
            '        <p class="section-subtitle">Choose a training module to begin your safety education journey</p>',
            '    </div>',
            '    ',
            '    <div class="training-modules-grid">',
            '        ' + Object.keys(modules).map(function(key) { 
                var module = modules[key]; 
                return [
                    '<div class="training-module-card" data-module="' + module.id + '">',
                    '    <div class="module-header">',
                    '        <h3 class="module-title">' + module.title + '</h3>',
                    '        <span class="module-difficulty">' + module.difficulty + '</span>',
                    '    </div>',
                    '    <p class="module-description">' + module.description + '</p>',
                    '    <div class="module-details">',
                    '        <span class="module-duration">📅 Duration: ' + module.duration + '</span>',
                    '        <span class="module-chapters">📚 ' + Object.keys(module.chapters).length + ' Chapters</span>',
                    '    </div>',
                    '    <div class="module-progress">',
                    '        <div class="progress-bar">',
                    '            <div class="progress-fill" style="width: ' + self.getModuleProgress(module.id) + '%"></div>',
                    '        </div>',
                    '        <span class="progress-text">' + Math.round(self.getModuleProgress(module.id)) + '% Complete</span>',
                    '    </div>',
                    '    <button class="btn-primary module-start-btn" ',
                    '            data-module="' + module.id + '"',
                    '            aria-describedby="module-' + module.id + '-desc">',
                    '        ' + (self.getModuleProgress(module.id) === 0 ? 'Start Training' : 'Continue Training') + ' →',
                    '    </button>',
                    '    <div id="module-' + module.id + '-desc" class="sr-only">',
                    '        ' + module.description + '. Duration: ' + module.duration + '. ' + Object.keys(module.chapters).length + ' chapters available.',
                    '    </div>',
                    '</div>'
                ].join('\n        ');
            }).join('\n        '),
            '    </div>',
            '    ',
            '    <div class="training-overview">',
            '        <h3>Training System Features</h3>',
            '        <div class="features-grid">',
            '            <div class="feature-item">',
            '                <div class="feature-icon">📋</div>',
            '                <div class="feature-content">',
            '                    <h4>Interactive Questions</h4>',
            '                    <p>Multiple choice and fill-in-the-blank exercises with immediate feedback</p>',
            '                </div>',
            '            </div>',
            '            <div class="feature-item">',
            '                <div class="feature-icon">📊</div>',
            '                <div class="feature-content">',
            '                    <h4>Progress Tracking</h4>',
            '                    <p>Your progress is automatically saved and synced across sessions</p>',
            '                </div>',
            '            </div>',
            '            <div class="feature-item">',
            '                <div class="feature-icon">🏆</div>',
            '                <div class="feature-content">',
            '                    <h4>Professional Content</h4>',
            '                    <p>Industry-standard training aligned with R&C Ltd\'s expertise</p>',
            '                </div>',
            '            </div>',
            '        </div>',
            '    </div>',
            '</div>'
        ].join('\n');
        
        this.trainingContainer.innerHTML = this.sanitizeHTML(moduleSelectionHTML);
        this.currentModule = null;
        this.currentChapter = null;
        
        // Clear URL hash
        if (window.location.hash) {
            history.pushState(null, null, window.location.pathname);
        }
        
        this.announce('Module selection loaded. Choose a training module to begin.');
    }
    
    // ==================== MODULE AND CHAPTER NAVIGATION ====================
    
SafetyTrainingSystem.prototype.showModule = function(moduleId, chapterId) {
        chapterId = chapterId || 1;
        var module = trainingData.modules[moduleId];
        if (!module) {
            return;
        }
        
        this.currentModule = moduleId;
        this.currentChapter = parseInt(chapterId);
        
        var self = this;
        var moduleHTML = '<div class="container">' +
            '<div class="training-breadcrumb">' +
                '<button class="breadcrumb-btn" onclick="trainingSystem.showModuleSelection()" ' +
                        'aria-label="Return to module selection">' +
                    '← All Modules' +
                '</button>' +
                '<span class="breadcrumb-separator">›</span>' +
                '<span class="breadcrumb-current">' + this.escapeHtml(module.title) + '</span>' +
            '</div>' +
            '<div class="module-header-section">' +
                '<h2 class="module-title">' + this.escapeHtml(module.title) + '</h2>' +
                '<p class="module-description">' + this.escapeHtml(module.description) + '</p>' +
                '<div class="module-meta">' +
                    '<span class="meta-item">📅 ' + this.escapeHtml(module.duration) + '</span>' +
                    '<span class="meta-item">📈 ' + this.escapeHtml(module.difficulty) + '</span>' +
                    '<span class="meta-item">✅ ' + this.getCompletedChaptersCount(moduleId) + '/' + Object.keys(module.chapters).length + ' Chapters</span>' +
                '</div>' +
            '</div>' +
            '<div class="training-content">' +
                '<div class="chapter-navigation">' +
                    '<h3>Chapters</h3>' +
                    '<div class="chapter-list" role="list">' +
                        Object.values(module.chapters).map(function(chapter, index) {
                            var chapterNum = index + 1;
                            var isCompleted = self.isChapterCompleted(moduleId, chapterNum);
                            var isCurrent = chapterNum === self.currentChapter;
                                
                            return '<button class="chapter-item ' + (isCurrent ? 'current' : '') + ' ' + (isCompleted ? 'completed' : '') + '"' +
                                        'onclick="trainingSystem.showChapter(\'' + self.escapeAttr(moduleId) + '\', ' + chapterNum + ')"' +
                                        'role="listitem"' +
                                        'aria-current="' + (isCurrent ? 'page' : 'false') + '"' +
                                        'aria-describedby="chapter-' + chapterNum + '-status">' +
                                    '<div class="chapter-number">' + chapterNum + '</div>' +
                                    '<div class="chapter-info">' +
                                        '<h4 class="chapter-title">' + self.escapeHtml(chapter.title) + '</h4>' +
                                        '<div class="chapter-status" id="chapter-' + chapterNum + '-status">' +
                                            (isCompleted ? '✓ Completed' : 'Not started') +
                                        '</div>' +
                                    '</div>' +
                                '</button>';
                        }).join('') +
                    '</div>' +
                '</div>' +
                    
                    '<div class="chapter-content">' +
                        self.renderChapter(moduleId, self.currentChapter) +
                    '</div>' +
                '</div>' +
            '</div>';
        
        this.trainingContainer.innerHTML = this.sanitizeHTML(moduleHTML);
        this.updateURL(moduleId, this.currentChapter);
        this.announce(module.title + ' module loaded. Currently viewing chapter ' + this.currentChapter + '.');
    }
    
SafetyTrainingSystem.prototype.showChapter = function(moduleId, chapterId) {
        var module = trainingData.modules[moduleId];
        var chapter = module && module.chapters ? module.chapters[chapterId] : null;
        
        if (!chapter) {
            return;
        }
        
        this.currentChapter = parseInt(chapterId);
        
        // Re-render the entire module view with the new chapter
        this.showModule(moduleId, chapterId);
    }
    
SafetyTrainingSystem.prototype.renderChapter = function(moduleId, chapterId) {
        var module = trainingData.modules[moduleId];
        var chapter = module.chapters[chapterId];
        
        if (!chapter) {
            return '<div class="error-message">Chapter not found</div>';
        }
        
        var nextChapter = module.chapters[chapterId + 1];
        var prevChapter = module.chapters[chapterId - 1];
        
        var self = this;
        return '<div class="chapter-container">' +
            '<div class="chapter-header">' +
                '<h3 class="chapter-title">Chapter ' + chapterId + ': ' + chapter.title + '</h3>' +
                '<div class="learning-objectives">' +
                    '<h4>Learning Objectives</h4>' +
                    '<ul>' +
                        chapter.learningObjectives.map(function(obj) { return '<li>' + obj + '</li>'; }).join('') +
                    '</ul>' +
                '</div>' +
            '</div>' +
            '<div class="chapter-content-text">' +
                chapter.content +
            '</div>' +
            '<div class="chapter-questions">' +
                '<h4>Knowledge Check</h4>' +
                '<p>Test your understanding of the concepts covered in this chapter.</p>' +
                chapter.questions.map(function(question, index) {
                    return self.renderQuestion(moduleId, chapterId, index, question);
                }).join('') +
            '</div>' +
            '<div class="chapter-navigation-footer">' +
                '<div class="nav-buttons">' +
                    (prevChapter ? 
                        '<button class="btn-secondary training-nav-btn" ' +
                                'onclick="trainingSystem.showChapter(\'' + moduleId + '\', ' + (chapterId - 1) + ')" ' +
                                'aria-label="Go to previous chapter: ' + prevChapter.title + '">' +
                            '← Previous: ' + prevChapter.title +
                        '</button>' : '') +
                    '<button class="btn-primary complete-chapter-btn training-nav-btn" ' +
                            'onclick="trainingSystem.completeChapter(\'' + moduleId + '\', ' + chapterId + ')" ' +
                            (this.isChapterCompleted(moduleId, chapterId) ? 'disabled' : '') + ' ' +
                            'aria-describedby="complete-chapter-help">' +
                        (this.isChapterCompleted(moduleId, chapterId) ? '✓ Chapter Completed' : 'Mark Complete') +
                    '</button>' +
                    (nextChapter ? 
                        '<button class="btn-secondary training-nav-btn" ' +
                                'onclick="trainingSystem.showChapter(\'' + moduleId + '\', ' + (chapterId + 1) + ')" ' +
                                'aria-label="Go to next chapter: ' + nextChapter.title + '">' +
                            'Next: ' + nextChapter.title + ' →' +
                        '</button>' : 
                        '<button class="btn-primary training-nav-btn" ' +
                                'onclick="trainingSystem.showModuleSelection()" ' +
                                'aria-label="Return to module selection">' +
                            'Back to Modules →' +
                        '</button>') +
                '</div>' +
                '<div id="complete-chapter-help" class="help-text">' +
                    'Complete all questions above before marking this chapter as complete.' +
                '</div>' +
            '</div>' +
        '</div>';
    }
    
    // ==================== QUESTION RENDERING AND HANDLING ====================
    
SafetyTrainingSystem.prototype.renderQuestion = function(moduleId, chapterId, questionIndex, question) {
        var questionId = moduleId + '-' + chapterId + '-' + questionIndex;
        var userAnswer = this.userAnswers[questionId];
        var isAnswered = userAnswer !== undefined;
        
        if (question.type === 'multiple-choice') {
            return this.renderMultipleChoice(questionId, question, userAnswer, isAnswered);
        } else if (question.type === 'fill-in-blank') {
            return this.renderFillInBlank(questionId, question, userAnswer, isAnswered);
        }
        
        return '';
    }
    
SafetyTrainingSystem.prototype.renderMultipleChoice = function(questionId, question, userAnswer, isAnswered) {
        var self = this;
        return `
            <div class="question-container multiple-choice" data-question-id="${questionId}">
                <div class="question-header">
                    <h5 class="question-text">${this.escapeHtml(question.question)}</h5>
                </div>
                
                <div class="question-options" role="radiogroup" aria-labelledby="question-${questionId}-text">
                    ${question.options.map((option, index) => {
                        var isSelected = userAnswer === index;
                        var isCorrect = index === question.correct;
                        var optionClass = 'option';
                        
                        if (isAnswered) {
                            if (isSelected && isCorrect) {
                                optionClass += ' correct selected';
                            } else if (isSelected && !isCorrect) {
                                optionClass += ' incorrect selected';
                            } else if (isCorrect) {
                                optionClass += ' correct';
                            }
                        }
                        
                        return `
                            <label class="${optionClass}">
                                <input type="radio" 
                                       name="question-${questionId}" 
                                       value="${index}"
                                       ${isSelected ? 'checked' : ''}
                                       ${isAnswered ? 'disabled' : ''}
                                       onchange="trainingSystem.handleMultipleChoiceAnswer('${questionId}', ${index})"
                                       aria-describedby="${isAnswered ? 'feedback-' + questionId : ''}">
                                <span class="option-text">${this.escapeHtml(option)}</span>
                                ${isAnswered && isCorrect ? '<span class="correct-indicator" aria-label="Correct answer">✓</span>' : ''}
                            </label>
                        `;
                    }).join('')}
                </div>
                
                ${isAnswered ? `
                    <div class="question-feedback ${userAnswer === question.correct ? 'correct' : 'incorrect'}" 
                         id="feedback-${questionId}" 
                         role="status" 
                         aria-live="polite">
                        <div class="feedback-icon">
                            ${userAnswer === question.correct ? '✅' : '❌'}
                        </div>
                        <div class="feedback-text">
                            <strong>${userAnswer === question.correct ? 'Correct!' : 'Incorrect.'}</strong>
                            ${this.escapeHtml(question.explanation)}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
SafetyTrainingSystem.prototype.renderFillInBlank = function(questionId, question, userAnswer, isAnswered) {
        var blanks = question.blanks;
        var userBlanks = userAnswer || [];
        
        // Create the question text with input fields
        var questionWithInputs = question.question;
        blanks.forEach((blank, index) => {
            var inputId = `${questionId}-blank-${index}`;
            var inputValue = userBlanks[index] || '';
            var isCorrect = isAnswered && this.checkBlankAnswer(inputValue, blank, question.flexibleAnswers);
            
            var inputClass = isAnswered ? (isCorrect ? 'correct' : 'incorrect') : '';
            var inputHTML = `
                <input type="text" 
                       class="fill-blank-input ${inputClass}"
                       id="${inputId}"
                       value="${this.escapeAttr(inputValue)}"
                       ${isAnswered ? 'readonly' : ''}
                       placeholder="Type your answer"
                       aria-label="Fill in the blank ${index + 1}"
                       ${!isAnswered ? `oninput="trainingSystem.handleFillInBlankInput('${questionId}', ${index}, this.value)"` : ''}>
            `;
            questionWithInputs = questionWithInputs.replace('_____', inputHTML);
        });
        
        return `
            <div class="question-container fill-in-blank" data-question-id="${questionId}">
                <div class="question-header">
                    <h5 class="question-text">${questionWithInputs}</h5>
                </div>
                
                ${!isAnswered ? `
                    <div class="question-actions">
                        <button class="btn-primary check-answer-btn" 
                                onclick="trainingSystem.checkFillInBlankAnswer('${questionId}')"
                                aria-describedby="check-answer-help-${questionId}">
                            Check Answer
                        </button>
                        <div id="check-answer-help-${questionId}" class="help-text">
                            Fill in all blanks and click to check your answer.
                        </div>
                    </div>
                ` : ''}
                
                ${isAnswered ? `
                    <div class="question-feedback ${this.isAllBlanksCorrect(questionId, question) ? 'correct' : 'incorrect'}" 
                         role="status" 
                         aria-live="polite">
                        <div class="feedback-icon">
                            ${this.isAllBlanksCorrect(questionId, question) ? '✅' : '❌'}
                        </div>
                        <div class="feedback-text">
                            <strong>${this.isAllBlanksCorrect(questionId, question) ? 'Correct!' : 'Some answers need correction.'}</strong>
                            ${this.escapeHtml(question.explanation)}
                            ${!this.isAllBlanksCorrect(questionId, question) ? `
                                <div class="correct-answers">
                                    <strong>Correct answers:</strong> ${this.escapeHtml(blanks.join(', '))}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    // ==================== ANSWER HANDLING ====================
    
SafetyTrainingSystem.prototype.handleMultipleChoiceAnswer = function(questionId, selectedOption) {
        this.userAnswers[questionId] = selectedOption;
        this.saveUserAnswers();
        
        // Re-render the question to show feedback
        var questionContainer = document.querySelector(`[data-question-id="${questionId}"]`);
        if (questionContainer) {
            var [moduleId, chapterId, questionIndex] = questionId.split('-');
            var module = trainingData.modules[moduleId];
            var question = module.chapters[chapterId].questions[questionIndex];
            
            questionContainer.outerHTML = this.renderQuestion(moduleId, chapterId, questionIndex, question);
            
            // Announce the result
            var isCorrect = selectedOption === question.correct;
            this.announce(isCorrect ? 'Correct answer!' : 'Incorrect answer. Please review the explanation.');
        }
    }
    
SafetyTrainingSystem.prototype.handleFillInBlankInput = function(questionId, blankIndex, value) {
        if (!this.userAnswers[questionId]) {
            this.userAnswers[questionId] = [];
        }
        this.userAnswers[questionId][blankIndex] = value;
        this.saveUserAnswers();
    }
    
SafetyTrainingSystem.prototype.checkFillInBlankAnswer = function(questionId) {
        var [moduleId, chapterId, questionIndex] = questionId.split('-');
        var module = trainingData.modules[moduleId];
        var question = module.chapters[chapterId].questions[questionIndex];
        
        var userBlanks = this.userAnswers[questionId] || [];
        
        // Check if all blanks are filled
        if (userBlanks.length < question.blanks.length || userBlanks.some(blank => !blank || blank.trim() === '')) {
            this.announce('Please fill in all blanks before checking your answer.');
            return;
        }
        
        // Re-render the question to show feedback
        var questionContainer = document.querySelector(`[data-question-id="${questionId}"]`);
        if (questionContainer) {
            questionContainer.outerHTML = this.renderQuestion(moduleId, chapterId, questionIndex, question);
            
            // Announce the result
            var allCorrect = this.isAllBlanksCorrect(questionId, question);
            this.announce(allCorrect ? 'All answers correct!' : 'Some answers need correction. Please review the feedback.');
        }
    }
    
SafetyTrainingSystem.prototype.checkBlankAnswer = function(userAnswer, correctAnswer, flexibleAnswers) {
        flexibleAnswers = flexibleAnswers || [];
        if (!userAnswer || !correctAnswer) return false;
        
        var normalizedUser = userAnswer.trim().toLowerCase();
        var normalizedCorrect = correctAnswer.trim().toLowerCase();
        
        // Check exact match first
        if (normalizedUser === normalizedCorrect) return true;
        
        // Check flexible answers if provided
        if (flexibleAnswers) {
            for (var i = 0; i < flexibleAnswers.length; i++) {
                var flexAnswer = flexibleAnswers[i];
                if (flexAnswer && flexAnswer.pattern && typeof flexAnswer.pattern.test === 'function') {
                    try {
                        if (flexAnswer.pattern.test(userAnswer)) {
                            return true;
                        }
                    } catch (e) {
                        // Skip invalid patterns to prevent blocking other validation
                        continue;
                    }
                }
            }
        }
        
        return false;
    }
    
SafetyTrainingSystem.prototype.isAllBlanksCorrect = function(questionId, question) {
        var userBlanks = this.userAnswers[questionId] || [];
        return question.blanks.every((correctAnswer, index) => 
            this.checkBlankAnswer(userBlanks[index], correctAnswer, question.flexibleAnswers)
        );
    }
    
    // ==================== PROGRESS TRACKING ====================
    
SafetyTrainingSystem.prototype.loadProgress = function() {
        try {
            var saved = localStorage.getItem('rcltd-training-progress');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }
    
SafetyTrainingSystem.prototype.saveProgress = function() {
        try {
            localStorage.setItem('rcltd-training-progress', JSON.stringify(this.progress));
        } catch (e) {
        }
    }
    
SafetyTrainingSystem.prototype.loadUserAnswers = function() {
        try {
            var saved = localStorage.getItem('rcltd-training-answers');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }
    
SafetyTrainingSystem.prototype.saveUserAnswers = function() {
        try {
            localStorage.setItem('rcltd-training-answers', JSON.stringify(this.userAnswers));
        } catch (e) {
        }
    }
    
SafetyTrainingSystem.prototype.completeChapter = function(moduleId, chapterId) {
        if (!this.progress[moduleId]) {
            this.progress[moduleId] = {};
        }
        
        var score = this.calculateChapterScore(moduleId, chapterId);
        this.progress[moduleId][chapterId] = score >= 90 ? true : 'failed';
        this.saveProgress();
        
        // Show grading results
        this.showGradingResults(moduleId, chapterId, score);
        
        // Re-render to update UI
        this.showModule(moduleId, chapterId);
        this.announce(`Chapter ${chapterId} completed with ${score}% score!`);
    }
    
SafetyTrainingSystem.prototype.calculateChapterScore = function(moduleId, chapterId) {
        var module = trainingData.modules[moduleId];
        if (!module || !module.chapters[chapterId]) return 0;
        
        var chapter = module.chapters[chapterId];
        var questions = chapter.questions;
        if (!questions || questions.length === 0) return 100;
        
        var correctAnswers = 0;
        
        questions.forEach((question, index) => {
            var questionId = `${moduleId}-${chapterId}-${index}`;
            var userAnswer = this.userAnswers[questionId];
            
            if (question.type === 'multiple-choice') {
                if (userAnswer === question.correct) {
                    correctAnswers++;
                }
            } else if (question.type === 'fill-in-blank') {
                var correctAnswers_fillIn = Array.isArray(question.correct) ? question.correct : [question.correct];
                if (correctAnswers_fillIn.some(answer => 
                    answer.toLowerCase().trim() === String(userAnswer || '').toLowerCase().trim()
                )) {
                    correctAnswers++;
                }
            }
        });
        
        return Math.round((correctAnswers / questions.length) * 100);
    }
    
SafetyTrainingSystem.prototype.showGradingResults = function(moduleId, chapterId, score) {
        var passed = score >= 90;
        var gradeElement = document.createElement('div');
        gradeElement.className = `grading-modal ${passed ? 'passed' : 'failed'}`;
        
        // Create elements safely using DOM methods
        var overlay = document.createElement('div');
        overlay.className = 'grading-overlay';
        
        var content = document.createElement('div');
        content.className = 'grading-content';
        
        // Header section
        var header = document.createElement('div');
        header.className = 'grading-header';
        
        var title = document.createElement('h3');
        title.textContent = 'Chapter ' + chapterId + ' Results';
        header.appendChild(title);
        
        var icon = document.createElement('div');
        icon.className = passed ? 'success-icon' : 'fail-icon';
        icon.textContent = passed ? '✅' : '❌';
        header.appendChild(icon);
        
        // Score section
        var scoreSection = document.createElement('div');
        scoreSection.className = 'grading-score';
        
        var scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'score-display';
        
        var scoreNumber = document.createElement('span');
        scoreNumber.className = 'score-number';
        scoreNumber.textContent = score + '%';
        scoreDisplay.appendChild(scoreNumber);
        
        var scoreLabel = document.createElement('span');
        scoreLabel.className = 'score-label';
        scoreLabel.textContent = 'Score';
        scoreDisplay.appendChild(scoreLabel);
        
        var passStatus = document.createElement('div');
        passStatus.className = 'pass-status ' + (passed ? 'passed' : 'failed');
        passStatus.textContent = passed ? 'PASSED' : 'FAILED';
        
        scoreSection.appendChild(scoreDisplay);
        scoreSection.appendChild(passStatus);
        
        // Message section
        var message = document.createElement('div');
        message.className = 'grading-message';
        
        var messageParagraph = document.createElement('p');
        messageParagraph.textContent = passed 
            ? 'Congratulations! You have successfully completed this chapter.'
            : 'You need 90% or higher to pass. Please review the material and try again.';
        message.appendChild(messageParagraph);
        
        // Actions section
        var actions = document.createElement('div');
        actions.className = 'grading-actions';
        
        var primaryButton = document.createElement('button');
        primaryButton.className = 'btn-primary';
        primaryButton.textContent = passed ? 'Continue' : 'Review Material';
        primaryButton.addEventListener('click', () => {
            gradeElement.remove();
        });
        actions.appendChild(primaryButton);
        
        if (!passed) {
            var retryButton = document.createElement('button');
            retryButton.className = 'btn-secondary';
            retryButton.textContent = 'Retry Questions';
            retryButton.addEventListener('click', () => {
                trainingSystem.retryChapter(moduleId, chapterId);
            });
            actions.appendChild(retryButton);
        }
        
        // Assemble the modal
        content.appendChild(header);
        content.appendChild(scoreSection);
        content.appendChild(message);
        content.appendChild(actions);
        overlay.appendChild(content);
        gradeElement.appendChild(overlay);
        
        document.body.appendChild(gradeElement);
        
        // Add celebration effect for perfect scores
        if (score === 100) {
            this.showCelebrationEffect();
        }
        
        // Auto-focus on the modal
        setTimeout(() => {
            var button = gradeElement.querySelector('button');
            if (button) button.focus();
        }, 100);
    }
    
SafetyTrainingSystem.prototype.showCelebrationEffect = function() {
        var celebration = document.createElement('div');
        celebration.className = 'celebration-container';
        
        // Create confetti container
        var confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Create celebration message
        var message = document.createElement('div');
        message.className = 'celebration-message';
        message.textContent = '🎉 Perfect Score! 🎉';
        
        var subtitle = document.createElement('div');
        subtitle.className = 'celebration-subtitle';
        subtitle.textContent = 'Outstanding work!';
        message.appendChild(subtitle);
        
        celebration.appendChild(confetti);
        celebration.appendChild(message);
        
        document.body.appendChild(celebration);
        
        // Create confetti effect
        this.createConfetti(celebration);
        
        // Remove after animation
        setTimeout(() => {
            celebration.remove();
        }, 4000);
    }
    
SafetyTrainingSystem.prototype.createConfetti = function(container) {
        var colors = ['#0891b2', '#67e8f9', '#f59e0b', '#10b981', '#f43f5e'];
        
        for (var i = 0; i < 50; i++) {
            var confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                transform: rotate(${Math.random() * 360}deg);
                animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
            `;
            
            container.appendChild(confetti);
        }
    }
    
SafetyTrainingSystem.prototype.retryChapter = function(moduleId, chapterId) {
        // Clear chapter answers
        var module = trainingData.modules[moduleId];
        if (module && module.chapters[chapterId]) {
            var chapter = module.chapters[chapterId];
            chapter.questions.forEach((question, index) => {
                var questionId = `${moduleId}-${chapterId}-${index}`;
                delete this.userAnswers[questionId];
            });
        }
        
        // Clear progress
        if (this.progress[moduleId]) {
            delete this.progress[moduleId][chapterId];
        }
        
        this.saveUserAnswers();
        this.saveProgress();
        
        // Close grading modal
        var modal = document.querySelector('.grading-modal');
        if (modal) modal.remove();
        
        // Re-render chapter
        this.showModule(moduleId, chapterId);
        this.announce('Chapter reset. You can now retry the questions.');
    }
    
SafetyTrainingSystem.prototype.isChapterCompleted = function(moduleId, chapterId) {
        return !!(this.progress[moduleId] && this.progress[moduleId][chapterId] === true);
    }
    
SafetyTrainingSystem.prototype.getCompletedChaptersCount = function(moduleId) {
        if (!this.progress[moduleId]) return 0;
        return Object.values(this.progress[moduleId]).filter(Boolean).length;
    }
    
SafetyTrainingSystem.prototype.getModuleProgress = function(moduleId) {
        var module = trainingData.modules[moduleId];
        if (!module) return 0;
        
        var totalChapters = Object.keys(module.chapters).length;
        var completedChapters = this.getCompletedChaptersCount(moduleId);
        
        return totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
    }
    
    // ==================== URL ROUTING ====================
    
SafetyTrainingSystem.prototype.updateURL = function(moduleId, chapterId) {
        var newHash = `#/module/${moduleId}/chapter/${chapterId}`;
        if (window.location.hash !== newHash) {
            history.pushState(null, null, newHash);
        }
    }
    
SafetyTrainingSystem.prototype.handleHashRoute = function() {
        var hash = window.location.hash;
        
        // Parse hash route: #/module/{moduleId}/chapter/{chapterId}
        var routeMatch = hash.match(/^#\/module\/([^\/]+)\/chapter\/(\d+)$/);
        
        if (routeMatch) {
            var [, moduleId, chapterId] = routeMatch;
            if (trainingData.modules[moduleId] && trainingData.modules[moduleId].chapters[chapterId]) {
                this.showModule(moduleId, parseInt(chapterId));
                return;
            }
        }
        
        // If no valid route, show module selection
        if (hash && hash !== '#/') {
            this.showModuleSelection();
        }
    }
    
    // ==================== EVENT LISTENERS ====================
    
SafetyTrainingSystem.prototype.setupEventListeners = function() {
        // Module start buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('module-start-btn')) {
                var moduleId = e.target.getAttribute('data-module');
                this.showModule(moduleId, 1);
            }
        });
        
        // Focus management for better accessibility
        document.addEventListener('focusin', (e) => {
            this.focusStack.push(e.target);
            if (this.focusStack.length > 10) {
                this.focusStack.shift(); // Keep stack manageable
            }
        });
    }
    
    // ==================== UTILITY METHODS ====================
    
SafetyTrainingSystem.prototype.resetProgress = function() {
        if (confirm('Are you sure you want to reset all training progress? This action cannot be undone.')) {
            this.progress = {};
            this.userAnswers = {};
            this.saveProgress();
            this.saveUserAnswers();
            this.showModuleSelection();
            this.announce('All training progress has been reset.');
        }
    }
    
SafetyTrainingSystem.prototype.exportProgress = function() {
        var data = {
            progress: this.progress,
            answers: this.userAnswers,
            timestamp: new Date().toISOString()
        };
        
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = `rcltd-training-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.announce('Training progress exported successfully.');
    }

// Initialize the training system when the script loads
var trainingSystem = new SafetyTrainingSystem();

// Make it globally available for onclick handlers
window.trainingSystem = trainingSystem;