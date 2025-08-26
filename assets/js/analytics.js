/**
 * Расширение аналитики для Яндекс Метрики
 * Дополнительные функции для отслеживания событий и целей
 */

// Расширяем существующий объект Analytics
if (typeof Analytics !== 'undefined') {
    // Добавляем новые методы к существующему объекту Analytics
    
    /**
     * Отслеживание просмотра страницы
     * @param {string} pageTitle - Заголовок страницы
     */
    Analytics.trackPageView = function(pageTitle) {
        if (typeof ym !== 'undefined') {
            ym(103903661, 'hit', window.location.href, {
                title: pageTitle
            });
        }
    };

    /**
     * Отслеживание клика по кнопке
     * @param {string} buttonName - Название кнопки
     * @param {string} location - Местоположение кнопки
     */
    Analytics.trackButtonClick = function(buttonName, location = '') {
        this.trackEvent('button_click', {
            button: buttonName,
            location: location,
            url: window.location.pathname
        });
    };

    /**
     * Отслеживание отправки формы
     * @param {string} formName - Название формы
     * @param {object} formData - Данные формы
     */
    Analytics.trackFormSubmit = function(formName, formData = {}) {
        this.trackEvent('form_submit', {
            form: formName,
            data: formData,
            url: window.location.pathname
        });
    };

    /**
     * Отслеживание прогресса квиза
     * @param {number} questionNumber - Номер вопроса
     * @param {string} answer - Ответ пользователя
     */
    Analytics.trackQuizProgress = function(questionNumber, answer) {
        this.trackEvent('quiz_progress', {
            question: questionNumber,
            answer: answer,
            step: questionNumber
        });
    };

    /**
     * Отслеживание завершения квиза
     * @param {object} result - Результат квиза
     */
    Analytics.trackQuizComplete = function(result) {
        this.trackEvent('quiz_complete', {
            result: result,
            url: window.location.pathname
        });
    };

    /**
     * Отслеживание ошибки
     * @param {string} errorType - Тип ошибки
     * @param {string} errorMessage - Сообщение об ошибке
     */
    Analytics.trackError = function(errorType, errorMessage) {
        this.trackEvent('error', {
            type: errorType,
            message: errorMessage,
            url: window.location.pathname
        });
    };

    // Автоматическое отслеживание просмотра страницы при загрузке
    document.addEventListener('DOMContentLoaded', function() {
        Analytics.trackPageView(document.title);
        
        // Отслеживание начала квиза при загрузке страницы квиза
        if (window.location.pathname.includes('quiz.html')) {
            Analytics.trackEvent('quiz_start', {
                url: window.location.href,
                referrer: document.referrer
            });
        }
    });

    // Отслеживание кликов по кнопкам с классом cta-button
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('cta-button')) {
            const buttonText = e.target.textContent.trim();
            const location = e.target.closest('section')?.className || 'unknown';
            Analytics.trackButtonClick(buttonText, location);
        }
        
        // Отслеживание кликов по ссылкам
        if (e.target.tagName === 'A') {
            const linkText = e.target.textContent.trim();
            const linkHref = e.target.href;
            Analytics.trackEvent('link_click', {
                text: linkText,
                href: linkHref,
                url: window.location.pathname
            });
        }
    });

    // Отслеживание скролла страницы
    let scrollTracked = false;
    window.addEventListener('scroll', function() {
        if (!scrollTracked && window.scrollY > window.innerHeight * 0.5) {
            Analytics.trackEvent('page_scroll_50', {
                url: window.location.pathname
            });
            scrollTracked = true;
        }
    });

    // Отслеживание фокуса на полях формы
    document.addEventListener('focus', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            Analytics.trackEvent('form_field_focus', {
                field: e.target.name || e.target.id,
                form: e.target.closest('form')?.id || 'unknown',
                url: window.location.pathname
            });
        }
    });

    // Отслеживание ввода в поля формы
    let inputTracked = {};
    document.addEventListener('input', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            const fieldId = e.target.name || e.target.id;
            if (!inputTracked[fieldId] && e.target.value.length > 0) {
                Analytics.trackEvent('form_field_input', {
                    field: fieldId,
                    form: e.target.closest('form')?.id || 'unknown',
                    url: window.location.pathname
                });
                inputTracked[fieldId] = true;
            }
        }
    });

} else {
    console.error('Объект Analytics не найден. Убедитесь, что main.js загружен перед analytics.js');
}
