# UTM Система SAGAN

## Обзор

UTM система автоматически сохраняет UTM метки при первом посещении сайта в localStorage и использует их при последующих действиях пользователя (например, при отправке формы).

## Как это работает

### 1. При заходе на сайт
- Система проверяет наличие UTM параметров в URL
- Если UTM есть в URL - сохраняет их в localStorage
- Если UTM нет в URL - использует сохраненные из localStorage (если есть)

### 2. При отправке формы
- Система автоматически добавляет UTM параметры к данным формы
- Отправляет расширенную информацию о UTM (статистика посещений, время первого визита и т.д.)

## Структура данных в localStorage

```json
{
  "params": {
    "utm_source": "google",
    "utm_medium": "cpc", 
    "utm_campaign": "brand",
    "utm_term": "sagan",
    "utm_content": "banner1"
  },
  "timestamp": 1703123456789,
  "firstVisit": false,
  "firstVisitTimestamp": 1703123456789,
  "visitsCount": 3
}
```

## API UTMManager

### Основные методы

#### `UTMManager.init()`
Инициализация UTM системы. Вызывается автоматически при загрузке страницы.

#### `UTMManager.getCurrentUTM()`
Получить актуальные UTM параметры (приоритет: URL > localStorage)

#### `UTMManager.getUTMFromURL()`
Получить UTM параметры только из URL

#### `UTMManager.getUTMFromStorage()`
Получить UTM параметры только из localStorage

#### `UTMManager.getUTMDataFromStorage()`
Получить полные данные UTM из localStorage (включая метаданные)

#### `UTMManager.getUTMStats()`
Получить статистику UTM:
```json
{
  "utmParams": { "utm_source": "google", ... },
  "firstVisit": false,
  "firstVisitAge": 5,
  "lastVisitAge": 0,
  "visitsCount": 3,
  "totalDaysSinceFirstVisit": 5
}
```

#### `UTMManager.saveUTMToStorage(utmParams)`
Сохранить UTM параметры в localStorage

#### `UTMManager.clearUTM()`
Очистить UTM данные из localStorage

## Примеры использования

### Проверка наличия UTM
```javascript
const utm = UTMManager.getCurrentUTM();
if (utm) {
    console.log('UTM найдены:', utm);
} else {
    console.log('UTM не найдены');
}
```

### Получение статистики
```javascript
const stats = UTMManager.getUTMStats();
if (stats) {
    console.log(`Пользователь посетил сайт ${stats.visitsCount} раз`);
    console.log(`Первый визит был ${stats.totalDaysSinceFirstVisit} дней назад`);
}
```

### Ручное сохранение UTM
```javascript
const utmParams = {
    utm_source: 'email',
    utm_medium: 'newsletter',
    utm_campaign: 'spring2024'
};
UTMManager.saveUTMToStorage(utmParams);
```

## Интеграция с формами

UTM параметры автоматически добавляются к данным формы при отправке:

```javascript
// В Quiz.submitContacts()
const submissionData = {
    name: name.trim(),
    messenger,
    contact: contact.trim(),
    level: this.getResultLevel(),
    timestamp: new Date().toISOString(),
    utm: this.getUTMParams() // Автоматически использует UTMManager
};
```

## Расширенная информация в формах

При отправке формы система добавляет дополнительную информацию:

```json
{
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "brand",
  "stats": {
    "visitsCount": 3,
    "totalDaysSinceFirstVisit": 5,
    "isFirstVisit": false
  }
}
```

## Тестирование

Для тестирования UTM системы используйте файл `test-utm.html`:

1. Откройте `test-utm.html` в браузере
2. Используйте тестовые ссылки с UTM параметрами
3. Проверьте сохранение и восстановление UTM
4. Симулируйте отправку формы

### Тестовые ссылки
- `index.html?utm_source=test&utm_medium=email&utm_campaign=test_campaign`
- `quiz.html?utm_source=facebook&utm_medium=social&utm_campaign=quiz_test`
- `index.html?utm_source=google&utm_medium=cpc&utm_campaign=brand&utm_term=sagan`

## Отслеживание событий

Система автоматически отправляет события в Яндекс.Метрику:

- `UTM_INITIALIZED` - при инициализации UTM системы
- `CONTACTS_FORM_SUBMIT` - при отправке формы с UTM данными

## Совместимость

- Работает во всех современных браузерах
- Поддерживает localStorage
- Graceful fallback при ошибках
- Не блокирует основной функционал при проблемах с UTM

## Безопасность

- UTM данные хранятся только в localStorage браузера
- Не передаются на сторонние сервисы без необходимости
- Автоматически очищаются при очистке данных браузера
