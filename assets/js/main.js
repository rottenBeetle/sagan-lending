// ===== SAGAN Landing Scripts =====

// Config
const CONFIG = {
	GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyb7McXtMKzxqZ3LbTFiyvcecQCkm7LQBZB6cXuhdqLJp9SYwhyHyIxLhE2b_K1zxss/exec',
	YANDEX_METRIKA_ID: 12345678
};

// Analytics
const Analytics = {
	trackEvent(eventName, params = {}) {
		try {
			if (typeof ym !== 'undefined') {
				ym(CONFIG.YANDEX_METRIKA_ID, 'reachGoal', eventName, params);
			}
			console.log('Событие отправлено:', eventName, params);
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
	},

	selectAnswer(answerIndex) {
		document.querySelectorAll('.quiz-answer').forEach(el => el.classList.remove('selected'));
		const selectedElement = document.querySelectorAll('.quiz-answer')[answerIndex];
		selectedElement.classList.add('selected');
		const question = this.questions[this.currentQuestion];
		const selectedAnswer = question.answers[answerIndex];
		this.answers[this.currentQuestion] = { questionIndex: this.currentQuestion, answerIndex, points: selectedAnswer.points };
		document.getElementById('next-button').classList.add('enabled');
		Analytics.trackEvent(`QUIZ_QUESTION_${this.currentQuestion + 1}`, { answer: selectedAnswer.text, points: selectedAnswer.points });
	},

	nextQuestion() {
		const nextButton = document.getElementById('next-button');
		if (!nextButton.classList.contains('enabled')) return;
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
	},

	async submitContacts(event) {
		// Prevent default submit and stop propagation to avoid any accidental reloads
		event.preventDefault();
		event.stopPropagation();
		console.debug('[Quiz] submitContacts called');
		
		// Get form element - either from event.target (form submit) or by ID (button click)
		const form = event.target.tagName === 'FORM' ? event.target : document.getElementById('contacts-form');
		if (!form) {
			console.error('[Quiz] Form not found');
			return;
		}
		
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
		const submissionData = {
			name: name.trim(),
			messenger,
			contact: contact.trim(),
			answers: this.answers,
			totalScore: this.totalScore,
			level: this.getResultLevel(),
			timestamp: new Date().toISOString(),
			utm: this.getUTMParams()
		};
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
		}
	},

async sendDataToGoogle(data) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('messenger', data.messenger);
  formData.append('contact', data.contact);
  formData.append('answers', JSON.stringify(data.answers));
  formData.append('totalScore', data.totalScore);
  formData.append('level', data.level);
  formData.append('timestamp', data.timestamp);
  if (data.utm) formData.append('utm', JSON.stringify(data.utm));

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
		formData.append('answers', JSON.stringify(data.answers));
		formData.append('totalScore', data.totalScore);
		formData.append('level', data.level);
		formData.append('timestamp', data.timestamp);
		if (data.utm) {
			formData.append('utm', JSON.stringify(data.utm));
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
		const params = new URLSearchParams(window.location.search);
		const utm = {};
		['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
			if (params.has(param)) utm[param] = params.get(param);
		});
		return Object.keys(utm).length > 0 ? utm : null;
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
	}
};

// Public start fn
function startQuiz() {
	Analytics.trackEvent('QUIZ_START');
	const landing = document.getElementById('landing');
	const quizContainer = document.getElementById('quiz-container');
	if (!quizContainer) { window.location.href = 'quiz.html'; return; }
	if (landing) landing.style.display = 'none';
	quizContainer.classList.add('active');
	Quiz.init();
}

// Init
document.addEventListener('DOMContentLoaded', function() {
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

// Helpers
Quiz.validateContact = function(messenger, value) {
	if (messenger === 'telegram') {
		return /^@?[a-zA-Z0-9_]{5,32}$/.test(value.trim());
	}
	// whatsapp phone in E.164, allow spaces/dashes which we strip
	const digits = value.replace(/[^0-9+]/g, '');
	return /^\+[1-9][0-9]{7,14}$/.test(digits);
};








