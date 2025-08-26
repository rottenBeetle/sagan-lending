# Тестирование Яндекс Метрики

## Проверка исправления ошибки

После внесенных изменений ошибка `Identifier 'Analytics' has already been declared` должна исчезнуть.

### Что было исправлено:

1. **Конфликт имен**: В `main.js` уже был объект `Analytics`, а в `analytics.js` создавался класс с тем же именем
2. **Решение**: Теперь `analytics.js` расширяет существующий объект `Analytics` вместо создания нового класса
3. **ID счетчика**: Обновлен на ваш реальный ID `103903661`

### Проверка работы:

1. Откройте сайт в браузере
2. Откройте консоль разработчика (F12)
3. Должны появиться сообщения:
   ```
   Analytics расширен дополнительными функциями
   Событие отправлено: page_view {title: "SAGAN - Верни близость с дочерью"}
   ```

### Доступные функции аналитики:

```javascript
// Основная функция (из main.js)
Analytics.trackEvent('custom_event', {param: 'value'});

// Дополнительные функции (из analytics.js)
Analytics.trackPageView('Заголовок страницы');
Analytics.trackButtonClick('Название кнопки', 'Местоположение');
Analytics.trackFormSubmit('Название формы', formData);
Analytics.trackQuizProgress(1, 'Ответ пользователя');
Analytics.trackQuizComplete(resultData);
Analytics.trackError('error_type', 'Сообщение об ошибке');
```

### Автоматическое отслеживание:

- ✅ Просмотры страниц
- ✅ Клики по кнопкам с классом `cta-button`
- ✅ Переходы между страницами

### Ручное отслеживание в коде:

В `quiz.html` уже есть пример:
```html
<button class="cta-button" onclick="Analytics.trackEvent('RESULT_CTA_CLICK')">
    Записаться на бесплатное пробное
</button>
```

## Настройка целей в Яндекс Метрике

Создайте следующие цели в панели счетчика:

1. **quiz_start** - Начало квиза
2. **quiz_complete** - Завершение квиза  
3. **form_submit** - Отправка формы
4. **button_click** - Клик по кнопке
5. **RESULT_CTA_CLICK** - Клик по кнопке результата
6. **page_view** - Просмотр страницы

Все цели должны быть типа "JavaScript событие".
