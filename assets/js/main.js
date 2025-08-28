// ===== SAGAN Landing Scripts =====

// Config
const CONFIG = {
	GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbydBonU1yPEZIpCZ75VWXkYizNhfM4Tck3xZ93yyEQgoLTt3sAWTJTTNkvD6l24hwuN/exec',
	YANDEX_METRIKA_ID: 103903661
};

// UTM Manager - для работы с UTM метками в localStorage
const UTMManager = {
	STORAGE_KEY: 'sagan_utm_params',
	
	// Получить UTM параметры из URL
	getUTMFromURL() {
		const params = new URLSearchParams(window.location.search);
		const utm = {};
		['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
			if (params.has(param)) utm[param] = params.get(param);
		});
		return Object.keys(utm).length > 0 ? utm : null;
	},
	
	// Сохранить UTM параметры в localStorage
	saveUTMToStorage(utmParams) {
		if (!utmParams || Object.keys(utmParams).length === 0) return;
		
		try {
			// Проверяем, есть ли уже сохраненные UTM
			const existingData = this.getUTMDataFromStorage();
			const isFirstVisit = !existingData;
			
			const utmData = {
				params: utmParams,
				timestamp: Date.now(),
				firstVisit: isFirstVisit,
				firstVisitTimestamp: isFirstVisit ? Date.now() : (existingData?.firstVisitTimestamp || Date.now()),
				visitsCount: isFirstVisit ? 1 : ((existingData?.visitsCount || 0) + 1)
			};
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(utmData));
			console.log('UTM параметры сохранены в localStorage:', utmParams);
		} catch (error) {
			console.error('Ошибка сохранения UTM в localStorage:', error);
		}
	},
	
	// Получить UTM параметры из localStorage
	getUTMFromStorage() {
		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			if (!stored) return null;
			
			const utmData = JSON.parse(stored);
			return utmData.params || null;
		} catch (error) {
			console.error('Ошибка чтения UTM из localStorage:', error);
			return null;
		}
	},
	
	// Получить полные данные UTM из localStorage
	getUTMDataFromStorage() {
		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			if (!stored) return null;
			
			return JSON.parse(stored);
		} catch (error) {
			console.error('Ошибка чтения UTM данных из localStorage:', error);
			return null;
		}
	},
	
	// Инициализация UTM менеджера
	init() {
		// Проверяем, есть ли UTM параметры в URL
		const urlUTM = this.getUTMFromURL();
		
		if (urlUTM) {
			// Если есть UTM в URL, сохраняем их в localStorage
			this.saveUTMToStorage(urlUTM);
		} else {
			// Если UTM нет в URL, проверяем localStorage
			const storedUTM = this.getUTMFromStorage();
			if (storedUTM) {
				console.log('Используем UTM из localStorage:', storedUTM);
			}
		}
		
		// Отслеживаем событие инициализации UTM
		const utmData = this.getUTMDataFromStorage();
		if (utmData) {
			Analytics.trackEvent('UTM_INITIALIZED', {
				hasUTM: !!utmData.params,
				isFirstVisit: utmData.firstVisit,
				utmSource: utmData.params?.utm_source || null,
				utmMedium: utmData.params?.utm_medium || null,
				utmCampaign: utmData.params?.utm_campaign || null
			});
		}
	},
	
	// Получить актуальные UTM параметры (приоритет: URL > localStorage)
	getCurrentUTM() {
		const urlUTM = this.getUTMFromURL();
		if (urlUTM) return urlUTM;
		
		return this.getUTMFromStorage();
	},
	
	// Очистить UTM данные из localStorage
	clearUTM() {
		try {
			localStorage.removeItem(this.STORAGE_KEY);
			console.log('UTM данные очищены из localStorage');
		} catch (error) {
			console.error('Ошибка очистки UTM из localStorage:', error);
		}
	},
	
	// Получить статистику UTM
	getUTMStats() {
		const utmData = this.getUTMDataFromStorage();
		if (!utmData) return null;
		
		const now = Date.now();
		const firstVisitAge = Math.round((now - utmData.firstVisitTimestamp) / (1000 * 60 * 60 * 24)); // дни
		const lastVisitAge = Math.round((now - utmData.timestamp) / (1000 * 60 * 60 * 24)); // дни
		
		return {
			utmParams: utmData.params,
			firstVisit: utmData.firstVisit,
			firstVisitAge: firstVisitAge,
			lastVisitAge: lastVisitAge,
			visitsCount: utmData.visitsCount,
			totalDaysSinceFirstVisit: firstVisitAge
		};
	}
};

// Analytics
const Analytics = {
	_clientId: null,
	getClientId() {
		// Returns Promise<string|null>
		return new Promise(resolve => {
			try {
				if (this._clientId) { resolve(this._clientId); return; }
				if (typeof ym === 'undefined') { resolve(null); return; }
				const self = this;
				ym(CONFIG.YANDEX_METRIKA_ID, 'getClientID', function(clientId){ self._clientId = clientId || null; resolve(self._clientId); });
			} catch (_) { resolve(null); }
		});
	},
	async trackEvent(eventName, params = {}) {
		try {
			const clientId = await this.getClientId();
			const payload = clientId ? Object.assign({ clientId }, params) : params;
			if (typeof ym !== 'undefined') {
				ym(CONFIG.YANDEX_METRIKA_ID, 'reachGoal', eventName, payload);
			}
			console.log('Событие отправлено:', eventName, payload);
		} catch (error) {
			console.error('Ошибка отправки события:', error);
		}
	}
};

// Quiz Module
const Quiz = {
	currentQuestion: 0,
	answers: [],
	totalScore: 0,
	startTime: null,
	questionStartTime: null,
	// Prevent duplicate submits
	isSubmittingContacts: false,

	questions: [
		{
			text: 'Как часто дочка сама рассказывает, что у неё происходит на самом деле?',
			answers: [
				{ text: 'Почти каждый день', points: 0 },
				{ text: 'Иногда, если сама в настроении', points: 2 },
				{ text: 'Почти никогда', points: 3 }
			]
		},
		{
			text: 'Что она делает, когда ты достаёшь телефон или камеру, чтобы запечатлеть момент?',
			answers: [
				{ text: 'Улыбается или спокойно соглашается', points: 0 },
				{ text: 'Может согласиться, но чаще «с настроением»', points: 2 },
				{ text: 'Отворачивается, прячется или раздражается', points: 3 }
			]
		},
		{
			text: 'Где она обычно проводит время после школы, когда день ещё не закончился?',
			answers: [
				{ text: 'С подругами, в кружках или на улице', points: 0 },
				{ text: 'Иногда с друзьями, но часто дома за телефоном', points: 2 },
				{ text: 'Почти всегда одна, дома за телефоном или компьютером, отгородившись от всех', points: 3 }
			]
		},
		{
			text: 'Как она отвечает, когда ты спрашиваешь: «Как дела?»',
			answers: [
				{ text: 'Рассказывает подробно, делится деталями', points: 0 },
				{ text: 'Отвечает одним-двумя словами вроде «нормально» или «ок»', points: 2 },
				{ text: 'Молчит или отмахивается, давая понять, что разговора не будет', points: 3 }
			]
		},
		{
			text: 'Если у неё проблемы или что-то не получается, как она себя ведёт?',
			answers: [
				{ text: 'Делится с тобой, рассказывает и просит совета', points: 0 },
				{ text: 'Иногда рассказывает, но часто замыкается в себе', points: 2 },
				{ text: 'Скрывает до последнего, переживает одна, и ты узнаёшь об этом случайно', points: 3 }
			]
		}
	],

	results: {
		critical: {
			title: 'Вы почти потеряли контакт.',
			description: `
				<p>Это не «просто подростковый возраст» — это привычка закрываться.</p>
				<p>Каждый день, пока вы ничего не делаете, стена между вами становится толще.</p>
				<p>Ей нужна среда, где никто не сравнит и не осудит, где можно быть собой и снова увидеть в зеркале: «Я красивая. Я важная. Я нужна».</p>
				<p>В SAGAN девочки, которые вчера отворачивались, уже на первом пробном поднимают голову, улыбаются камере, а через два месяца — выходят на сцену под аплодисменты.</p>
				<p><strong>Каждый день промедления — минус шанс её вернуть. Сделайте первый шаг прямо сейчас.</strong></p>
			`,
			cta: 'Вернуть контакт — записаться на бесплатное пробное'
		},
		warning: {
			title: 'Вы уже теряете близость.',
			description: `
				<p>Она стала тише, делится всё реже, а паузы между вами — длиннее.</p>
				<p>Если ждать, привычка молчать закрепится, и «разговоры по душам» уйдут в прошлое.</p>
				<p>Ей не нужны допросы или нотации. Ей нужно пространство, где её слушают без давления, принимают без условий и верят в неё.</p>
				<p>В SAGAN девочки, которые вчера прятались, уже через час пробного начинают улыбаться и говорить. А мамы выходят с чувством: «Я снова её вижу».</p>
				<p><strong>Связь ещё можно укрепить — но действовать надо сейчас.</strong></p>
			`,
			cta: 'Сохранить близость — записаться на пробное'
		},
		light: {
			title: 'Доверие ещё есть — но оно хрупкое.',
			description: `
				<p>Первые звоночки, что она уходит в себя, уже появились.</p>
				<p>Если пустить на самотёк, однажды вы поймёте, что она делится всё меньше.</p>
				<p>Сейчас — момент, когда можно не только сохранить, но и укрепить вашу связь.</p>
				<p>Дайте ей опыт, в котором она чувствует себя свободной, принятой и важной. Где никто не оценивает, не сравнивает и не говорит «будь как…».</p>
				<p>В SAGAN девочки уже на первом пробном расправляют плечи, смотрят в камеру с интересом и уходят с новым взглядом на себя. А через пару месяцев — уверенно стоят на сцене.</p>
				<p><strong>Закрепите это сейчас — пока она ещё открыта.</strong></p>
			`,
			cta: 'Укрепить контакт — записаться на бесплатное пробное'
		}
	},

	init() {
		this.currentQuestion = 0;
		this.answers = [];
		this.totalScore = 0;
		this.startTime = Date.now();
		this.questionStartTime = Date.now();
		this.showQuestion();
		this.updateProgress();
	},

	showQuestion() {
		const question = this.questions[this.currentQuestion];
		const content = document.getElementById('quiz-content');
		content.innerHTML = `
			<div class="quiz-question">${question.text}</div>
			<div class="quiz-answers">
				${question.answers.map((answer, index) => `
					<div class="quiz-answer" onclick="Quiz.selectAnswer(${index})" data-points="${answer.points}">${answer.text}</div>
				`).join('')}
			</div>
		`;
		const nextButton = document.getElementById('next-button');
		nextButton.classList.remove('enabled');
		
		// Отслеживание показа вопроса
		Analytics.trackEvent('quiz_question_shown', {
			questionNumber: this.currentQuestion + 1,
			questionText: question.text.substring(0, 50) + '...'
		});
		
		this.questionStartTime = Date.now();
	},

	selectAnswer(answerIndex) {
		document.querySelectorAll('.quiz-answer').forEach(el => el.classList.remove('selected'));
		const selectedElement = document.querySelectorAll('.quiz-answer')[answerIndex];
		selectedElement.classList.add('selected');
		const question = this.questions[this.currentQuestion];
		const selectedAnswer = question.answers[answerIndex];
		this.answers[this.currentQuestion] = { questionIndex: this.currentQuestion, answerIndex, points: selectedAnswer.points };
		document.getElementById('next-button').classList.add('enabled');
	},

	nextQuestion() {
		const nextButton = document.getElementById('next-button');
		if (!nextButton.classList.contains('enabled')) return;
		// Отправляем событие ответа только при подтверждении (клик Далее)
		const question = this.questions[this.currentQuestion];
		const answerRecord = this.answers[this.currentQuestion];
		if (answerRecord) {
			const selectedAnswer = question.answers[answerRecord.answerIndex];
			Analytics.trackEvent(`QUIZ_QUESTION_${this.currentQuestion + 1}`, {
				answer: selectedAnswer.text,
				points: selectedAnswer.points,
				questionNumber: this.currentQuestion + 1,
				timeSpent: this.getTimeSpentOnQuestion()
			});
		}
		this.currentQuestion++;
		this.updateProgress();
		if (this.currentQuestion < this.questions.length) {
			this.showQuestion();
		} else {
			this.calculateResult();
			this.showContactsForm();
		}
	},

	updateProgress() {
		document.querySelectorAll('.progress-heart').forEach((heart, index) => {
			if (index < this.currentQuestion) heart.classList.add('active');
			else heart.classList.remove('active');
		});
	},

	calculateResult() {
		this.totalScore = this.answers.reduce((sum, answer) => sum + answer.points, 0);
	},

	getResultLevel() {
		if (this.totalScore >= 10) return 'critical';
		if (this.totalScore >= 7) return 'warning';
		return 'light';
	},

	showContactsForm() {
		document.getElementById('quiz-container').classList.remove('active');
		document.getElementById('contacts-container').classList.add('active');
		
		// Отслеживание завершения квиза
		Analytics.trackEvent('quiz_complete', {
			totalScore: this.totalScore,
			level: this.getResultLevel(),
			answers: this.answers.length,
			totalTime: this.getTotalQuizTime()
		});
	},

	async submitContacts(event) {
		// Prevent default submit and stop propagation to avoid any accidental reloads
		event.preventDefault();
		event.stopPropagation();
		console.debug('[Quiz] submitContacts called');

		// Guard: prevent double submit
		if (this.isSubmittingContacts) {
			console.debug('[Quiz] submit blocked: already submitting');
			return;
		}
		
		// Get form element - either from event.target (form submit) or by ID (button click)
		const form = event.target.tagName === 'FORM' ? event.target : document.getElementById('contacts-form');
		if (!form) {
			console.error('[Quiz] Form not found');
			return;
		}

		// Resolve CTA button (for both button click and Enter submit)
		const ctaButton = form.querySelector('.cta-button');

		const formData = new FormData(form);
		const name = formData.get('name');
		const messenger = formData.get('messenger');
		const contact = formData.get('contact');
		// Inline validation
		const contactInput = document.getElementById('contact');
		const errorEl = document.getElementById('contact-error');
		errorEl.classList.add('hidden');
		contactInput.classList.remove('error');

		if (!name.trim()) { alert('Пожалуйста, укажите ваше имя'); return; }
		if (!messenger) { alert('Пожалуйста, выберите мессенджер'); return; }
		if (!contact || !Quiz.validateContact(messenger, contact)) {
			contactInput.classList.add('error');
			errorEl.textContent = messenger === 'telegram' ? 'Укажите ник в формате @username' : 'Укажите телефон в международном формате +79991234567';
			errorEl.classList.remove('hidden');
			return;
		}

		// Enter loading state
		this.isSubmittingContacts = true;
		let originalButtonHTML = '';
		if (ctaButton) {
			originalButtonHTML = ctaButton.innerHTML;
			ctaButton.classList.add('loading');
			ctaButton.setAttribute('disabled', 'disabled');
			ctaButton.innerHTML = '<span class="spinner" aria-hidden="true"></span><span>Отправка…</span>';
		}
		const submissionData = {
			name: name.trim(),
			messenger,
			contact: contact.trim(),
			level: this.getResultLevel(),
			timestamp: new Date().toISOString(),
			utm: this.getUTMParams()
		};

		// Attach Metrika IDs
		try {
			const clientId = await Analytics.getClientId();
			submissionData.clientId = clientId || '';
			submissionData.userId = Analytics.uid;
		} catch (_) {}
		try {
			await this.sendDataToGoogle(submissionData);
			Analytics.trackEvent('CONTACTS_FORM_SUBMIT', { level: submissionData.level, score: submissionData.totalScore });
			this.showResult();
		} catch (error) {
			console.error('Ошибка отправки данных (основной канал):', error);
			// Попытка фолбэка без CORS с форм-данными, чтобы не блокироваться политикой CORS
			try {
				await this.sendDataToGoogleFallback(submissionData);
				Analytics.trackEvent('CONTACTS_FORM_SUBMIT_FALLBACK', { level: submissionData.level, score: submissionData.totalScore });
				this.showResult();
			} catch (fallbackError) {
				console.error('Ошибка отправки данных (фолбэк):', fallbackError);
				alert('Произошла ошибка. Пожалуйста, попробуйте еще раз.');
			}
		} finally {
			// Exit loading state
			this.isSubmittingContacts = false;
			if (ctaButton) {
				ctaButton.classList.remove('loading');
				ctaButton.removeAttribute('disabled');
				if (originalButtonHTML) ctaButton.innerHTML = originalButtonHTML;
			}
		}
	},

async sendDataToGoogle(data) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('messenger', data.messenger);
  formData.append('contact', data.contact);
  // Do not send answers/totalScore per new requirements
  formData.append('level', data.level);
  formData.append('timestamp', data.timestamp);
  if (data.clientId) formData.append('clientId', data.clientId);
  
  // Расширенная информация о UTM
  if (data.utm) {
    const utmStats = UTMManager.getUTMStats();
    const enhancedUTM = {
      ...data.utm,
      stats: utmStats ? {
        visitsCount: utmStats.visitsCount,
        totalDaysSinceFirstVisit: utmStats.totalDaysSinceFirstVisit,
        isFirstVisit: utmStats.firstVisit
      } : null
    };
    formData.append('utm', JSON.stringify(enhancedUTM));
  }

  await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  });

  return true; // ответа не будет, просто успех
}
,

	async sendDataToGoogleFallback(data) {
		// Use form data with no-cors as fallback
		const formData = new FormData();
		formData.append('name', data.name);
		formData.append('messenger', data.messenger);
		formData.append('contact', data.contact);
		// Do not send answers/totalScore per new requirements
		formData.append('level', data.level);
		formData.append('timestamp', data.timestamp);
		if (data.clientId) formData.append('clientId', data.clientId);
		
		// Расширенная информация о UTM
		if (data.utm) {
			const utmStats = UTMManager.getUTMStats();
			const enhancedUTM = {
				...data.utm,
				stats: utmStats ? {
					visitsCount: utmStats.visitsCount,
					totalDaysSinceFirstVisit: utmStats.totalDaysSinceFirstVisit,
					isFirstVisit: utmStats.firstVisit
				} : null
			};
			formData.append('utm', JSON.stringify(enhancedUTM));
		}
		
		await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
			method: 'POST',
			mode: 'no-cors',
			body: formData,
			credentials: 'omit'
		});
		return true;
	},

	getUTMParams() {
		// Используем UTMManager для получения UTM параметров
		return UTMManager.getCurrentUTM();
	},

	showResult() {
		const level = this.getResultLevel();
		const result = this.results[level];
		document.getElementById('contacts-container').classList.remove('active');
		const resultContent = document.getElementById('result-content');
		resultContent.innerHTML = `
			<div class="result-level">${result.title}</div>
			<div class="result-description">${result.description}</div>
		`;
		document.getElementById('result-container').classList.add('active');
		
		// Отслеживание показа результата
		Analytics.trackEvent('result_shown', {
			level: level,
			score: this.totalScore
		});
	},
	
	// Функции для отслеживания времени
	getTimeSpentOnQuestion() {
		return Math.round((Date.now() - this.questionStartTime) / 1000);
	},
	
	getTotalQuizTime() {
		return Math.round((Date.now() - this.startTime) / 1000);
	}
};

// Public start fn
function startQuiz() {
	Analytics.trackEvent('QUIZ_START');
	Analytics.trackEvent('BLOCK_1_CTA_CLICK'); // Track CTA click from block 1
	
	const landing = document.getElementById('landing');
	const quizContainer = document.getElementById('quiz-container');
	if (!quizContainer) { window.location.href = 'quiz.html'; return; }
	if (landing) landing.style.display = 'none';
	quizContainer.classList.add('active');
	Quiz.init();
}

// Init
document.addEventListener('DOMContentLoaded', function() {
	// Инициализация UTM менеджера
	UTMManager.init();
	
	// Header CTA
	const headerCta = document.getElementById('header-cta');
	if (headerCta) {
		headerCta.addEventListener('click', function(){ Analytics.trackEvent('HEADER_CTA_CLICK'); });
	}

	// Existing CTAs
	document.querySelectorAll('button.cta-button').forEach(button => {
		button.addEventListener('click', function() {
			if (this.onclick) return;
			Analytics.trackEvent('MAIN_CTA_CLICK');
			window.location.href = 'quiz.html';
		});
	});

	// Preload images
	[''].filter(Boolean).forEach(src => { const img = new Image(); img.src = src; });

	// Simple client-side routing: /quiz shows quiz immediately
	const hrefLower = (window.location && window.location.href || '').toLowerCase();
	const isQuizRoute = hrefLower.endsWith('quiz.html');
	if (isQuizRoute) {
		const landing = document.getElementById('landing');
		if (landing) landing.style.display = 'none';
		document.getElementById('quiz-container').classList.add('active');
		Quiz.init();
	} else {
		// Handle block navigation for main page
		handleBlockNavigation();
		
		// Track first block view if no specific block is requested
		const urlParams = new URLSearchParams(window.location.search);
		const targetBlock = urlParams.get('block');
		if (!targetBlock) {
			// Track first block view
			Analytics.trackEvent('BLOCK_1_VIEWED');
			const viewedBlocks = getViewedBlocks();
			viewedBlocks.add(1);
			saveViewedBlocks(viewedBlocks);
			Analytics.trackEvent('TOTAL_BLOCKS_VIEWED', { 
				count: viewedBlocks.size,
				blocks: Array.from(viewedBlocks).join(',')
			});
		}
	}

	// Messenger selector behavior
	const selector = document.querySelector('.messenger-selector');
	const hiddenMessenger = document.getElementById('messenger');
	const contactInput = document.getElementById('contact');
	const hintEl = document.getElementById('contact-hint');
	const errorEl = document.getElementById('contact-error');
	if (selector && hiddenMessenger && contactInput) {
		selector.querySelectorAll('.messenger-option').forEach(btn => {
			btn.addEventListener('click', () => {
				selector.querySelectorAll('.messenger-option').forEach(b => {
					b.classList.remove('selected');
					b.setAttribute('aria-pressed', 'false');
				});
				btn.classList.add('selected');
				btn.setAttribute('aria-pressed', 'true');
				hiddenMessenger.value = btn.dataset.value;
				// Update placeholder and hint
				if (btn.dataset.value === 'telegram') {
					contactInput.placeholder = '@username';
					hintEl.textContent = 'Укажите ник Telegram. Пример: @mama_anna';
				} else {
					contactInput.placeholder = '+7 999 123-45-67';
					hintEl.textContent = 'Укажите номер WhatsApp в международном формате';
				}
				errorEl.classList.add('hidden');
				contactInput.classList.remove('error');
				contactInput.focus();
			});
		});

		// Live validation on blur
		contactInput.addEventListener('blur', () => {
			if (!hiddenMessenger.value || !contactInput.value) return;
			const valid = Quiz.validateContact(hiddenMessenger.value, contactInput.value);
			if (!valid) {
				contactInput.classList.add('error');
				errorEl.textContent = hiddenMessenger.value === 'telegram' ? 'Укажите ник в формате @username' : 'Укажите телефон в международном формате +79991234567';
				errorEl.classList.remove('hidden');
			} else {
				contactInput.classList.remove('error');
				errorEl.classList.add('hidden');
			}
		});
	}

	// Ensure contacts form submits via JS handler
	const contactsForm = document.getElementById('contacts-form');
	if (contactsForm) {
		contactsForm.addEventListener('submit', function(e) { Quiz.submitContacts(e); });
	}
});

// Error tracking
window.addEventListener('error', function(event) {
	console.error('JavaScript Error:', event.error);
	Analytics.trackEvent('JS_ERROR', { message: event.message, filename: event.filename, lineno: event.lineno });
});

// Time on page
let pageLoadTime = Date.now();
window.addEventListener('beforeunload', function() {
	const timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000);
	if (timeOnPage > 10) Analytics.trackEvent('TIME_ON_PAGE', { seconds: timeOnPage });
});

// Expose to window
window.Quiz = Quiz;
window.startQuiz = startQuiz;
window.UTMManager = UTMManager;

// Block Navigation System
function showBlock(blockNumber) {
	// Hide all blocks
	document.querySelectorAll('.block').forEach(block => {
		block.classList.remove('active');
	});
	
	// Show target block
	const targetBlock = document.getElementById(`block-${blockNumber}`);
	if (targetBlock) {
		targetBlock.classList.add('active');
		
		// Scroll to top of the page for smooth transition
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
		
		// Track block navigation
		Analytics.trackEvent('BLOCK_NAVIGATION', { 
			fromBlock: getCurrentBlock(), 
			toBlock: blockNumber 
		});
		
		// Track specific block views for Yandex Metrika
		Analytics.trackEvent(`BLOCK_${blockNumber}_VIEWED`);
		
		// Track total blocks viewed
		const viewedBlocks = getViewedBlocks();
		viewedBlocks.add(blockNumber);
		saveViewedBlocks(viewedBlocks);
		Analytics.trackEvent('TOTAL_BLOCKS_VIEWED', { 
			count: viewedBlocks.size,
			blocks: Array.from(viewedBlocks).join(',')
		});
	}
}

function getCurrentBlock() {
	const activeBlock = document.querySelector('.block.active');
	if (activeBlock) {
		const blockId = activeBlock.id;
		return parseInt(blockId.replace('block-', ''));
	}
	return 1;
}

function getViewedBlocks() {
	// Get viewed blocks from sessionStorage
	const viewed = sessionStorage.getItem('viewedBlocks');
	return new Set(viewed ? JSON.parse(viewed) : []);
}

function saveViewedBlocks(blocks) {
	sessionStorage.setItem('viewedBlocks', JSON.stringify(Array.from(blocks)));
}

function returnToMainPage() {
	// Track the return event
	Analytics.trackEvent('RETURN_TO_MAIN_PAGE');
	
	// Redirect to main page and show block 2
	window.location.href = 'index.html?block=2';
}

// Handle URL parameters for block navigation
function handleBlockNavigation() {
	const urlParams = new URLSearchParams(window.location.search);
	const targetBlock = urlParams.get('block');
	
	if (targetBlock && !isNaN(targetBlock)) {
		// Wait for DOM to be ready
		setTimeout(() => {
			showBlock(parseInt(targetBlock));
		}, 100);
	}
}

// Helpers
Quiz.validateContact = function(messenger, value) {
	if (messenger === 'telegram') {
		return /^@?[a-zA-Z0-9_]{5,32}$/.test(value.trim());
	}
	// whatsapp phone in E.164, allow spaces/dashes which we strip
	const digits = value.replace(/[^0-9+]/g, '');
	return /^\+[1-9][0-9]{7,14}$/.test(digits);
};

// Expose block navigation functions to window
window.showBlock = showBlock;
window.returnToMainPage = returnToMainPage;

// ===== Модальное окно подтверждения =====
function showConfirmationModal() {
	// Отслеживание клика по кнопке в блоке 4
	Analytics.trackEvent('BLOCK_4_CTA_CLICK');
	
	const modal = document.getElementById('confirmation-modal');
	if (modal) {
		modal.classList.add('active');
		document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
		
		// Отслеживание показа модального окна
		Analytics.trackEvent('CONFIRMATION_MODAL_SHOWN');
	}
}

function closeConfirmationModal() {
	const modal = document.getElementById('confirmation-modal');
	if (modal) {
		modal.classList.remove('active');
		document.body.style.overflow = ''; // Восстанавливаем прокрутку страницы
		
		// Отслеживание закрытия модального окна
		Analytics.trackEvent('CONFIRMATION_MODAL_CLOSED');
	}
}

// Закрытие модального окна при клике вне его
document.addEventListener('DOMContentLoaded', function() {
	const modal = document.getElementById('confirmation-modal');
	if (modal) {
		modal.addEventListener('click', function(event) {
			if (event.target === modal) {
				closeConfirmationModal();
			}
		});
	}
	
	// Закрытие модального окна по клавише Escape
	document.addEventListener('keydown', function(event) {
		if (event.key === 'Escape') {
			const modal = document.getElementById('confirmation-modal');
			if (modal && modal.classList.contains('active')) {
				closeConfirmationModal();
			}
		}
	});
});

// Expose modal functions to window
window.showConfirmationModal = showConfirmationModal;
window.closeConfirmationModal = closeConfirmationModal;








