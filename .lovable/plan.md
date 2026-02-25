

# Упаковка приложения в нативное iOS-приложение через Capacitor

## Что будет сделано

Приложение будет подготовлено для запуска как настоящее нативное iOS-приложение через Capacitor -- обертку, которая позволяет запускать веб-приложение внутри нативного контейнера с полным доступом к функциям устройства.

Backend (база данных, авторизация, серверные функции) уже работает в облаке и будет работать без изменений.

## Шаги

### 1. Установка зависимостей Capacitor

Будут добавлены пакеты:
- `@capacitor/core`
- `@capacitor/cli` (dev)
- `@capacitor/ios`
- `@capacitor/android`

### 2. Создание конфигурации Capacitor

Файл `capacitor.config.ts` в корне проекта:

```text
appId:   app.lovable.c2d2ddb7eee04d3c8c511d25a45053ec
appName: yellow-sparkle-bank
webDir:  dist
server.url: https://c2d2ddb7-eee0-4d3c-8c51-1d25a45053ec.lovableproject.com?forceHideBadge=true
server.cleartext: true
```

Параметр `server.url` включает горячую перезагрузку -- при разработке приложение на телефоне будет автоматически обновляться при изменениях в Lovable.

### 3. Что нужно сделать на вашей стороне (на Mac)

После того как я внесу изменения в проект:

1. Перенесите проект на GitHub через кнопку **Export to GitHub** в настройках проекта
2. Склонируйте репозиторий на Mac:
   ```text
   git clone <ваш-репозиторий>
   cd <папка-проекта>
   ```
3. Установите зависимости:
   ```text
   npm install
   ```
4. Добавьте iOS-платформу:
   ```text
   npx cap add ios
   ```
5. Обновите зависимости платформы:
   ```text
   npx cap update ios
   ```
6. Соберите проект:
   ```text
   npm run build
   ```
7. Синхронизируйте с нативной платформой:
   ```text
   npx cap sync
   ```
8. Запустите на устройстве или эмуляторе:
   ```text
   npx cap run ios
   ```

**Требования:** Mac с установленным Xcode (бесплатно из App Store). Для публикации в App Store потребуется Apple Developer Account ($99/год).

---

## Техническая часть

### Новые файлы
- `capacitor.config.ts` -- конфигурация Capacitor с appId, appName, webDir и server URL для hot-reload

### Изменения в package.json
- Добавление зависимостей: `@capacitor/core`, `@capacitor/ios`, `@capacitor/android`
- Добавление dev-зависимости: `@capacitor/cli`

### Полезная ссылка
После настройки рекомендую прочитать подробное руководство: https://docs.lovable.dev/tips-tricks/mobile-development

