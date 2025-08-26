/**
 * Аналитика для Яндекс Метрики
 * Функции для отслеживания событий и целей
 */

class Analytics {
    /**
     * Отслеживание события
     * @param {string} eventName - Название события
     * @param {object} params - Дополнительные параметры
     */
    static trackEvent(eventName, params = {}) {
        if (typeof ym !== 'undefined') {
            ym(12345678, 'reachGoal', eventName, params);
            console.log('Analytics event:', eventName, params);
        }
    }

    /**
     * Отслеживание просмотра страницы
     * @param {string} pageTitle - Заголовок страницы
     */
    static trackPageView(pageTitle) {
        if (typeof ym !== 'undefined') {
            ym(12345678, 'hit', window.location.href, {
                title: pageTitle
            });
        }
    }

    /**
     * Отслеживание клика по кнопке
     * @param {string} buttonName - Название кнопки
     * @param {string} location - Местоположение кнопки
     */
    static trackButtonClick(buttonName, location = '') {
        this.trackEvent('button_click', {
            button: buttonName,
            location: location,
            url: window.location.pathname
        });
    }

    /**
     * Отслеживание отправки формы
     * @param {string} formName - Название формы
     * @param {object} formData - Данные формы
     */
    static trackFormSubmit(formName, formData = {}) {
        this.trackEvent('form_submit', {
            form: formName,
            data: formData,
            url: window.location.pathname
        });
    }

    /**
     * Отслеживание прогресса квиза
     * @param {number} questionNumber - Номер вопроса
     * @param {string} answer - Ответ пользователя
     */
    static trackQuizProgress(questionNumber, answer) {
        this.trackEvent('quiz_progress', {
            question: questionNumber,
            answer: answer,
            step: questionNumber
        });
    }

    /**
     * Отслеживание завершения квиза
     * @param {object} result - Результат квиза
     */
    static trackQuizComplete(result) {
        this.trackEvent('quiz_complete', {
            result: result,
            url: window.location.pathname
        });
    }

    /**
     * Отслеживание ошибки
     * @param {string} errorType - Тип ошибки
     * @param {string} errorMessage - Сообщение об ошибке
     */
    static trackError(errorType, errorMessage) {
        this.trackEvent('error', {
            type: errorType,
            message: errorMessage,
            url: window.location.pathname
        });
    }
}

// Автоматическое отслеживание просмотра страницы при загрузке
document.addEventListener('DOMContentLoaded', function() {
    Analytics.trackPageView(document.title);
});

// Отслеживание кликов по кнопкам с классом cta-button
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('cta-button')) {
        const buttonText = e.target.textContent.trim();
        const location = e.target.closest('section')?.className || 'unknown';
        Analytics.trackButtonClick(buttonText, location);
    }
});

// Экспорт для использования в других файлах
window.Analytics = Analytics;
