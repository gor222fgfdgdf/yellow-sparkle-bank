

# Исправление черного экрана на iOS в Capacitor

## Проблема

При запуске нативного iOS-приложения через Capacitor отображается черный экран. Логи Xcode показывают:
- `JS Eval error A JavaScript exception occurred` -- JavaScript не может выполниться в WKWebView
- `Could not create a sandbox extension` -- iOS не может создать расширение песочницы для приложения
- `UIScene lifecycle will soon be required` -- предупреждение о необходимости перехода на UIScene (не критично)

Основная причина: приложение загружается через `server.url` с удаленного сервера, и WKWebView на iOS блокирует выполнение JS из-за отсутствия настроек навигации и возможных проблем с CORS/CSP.

## Что будет сделано

### 1. Добавить `allowNavigation` в `capacitor.config.ts`

Разрешить WKWebView загружать контент с домена Lovable:

```text
server: {
  url: 'https://c2d2ddb7-eee0-4d3c-8c51-1d25a45053ec.lovableproject.com?forceHideBadge=true',
  cleartext: true,
  allowNavigation: ['*.lovableproject.com']
}
```

### 2. Добавить `appendUserAgent` для корректной идентификации

Помогает серверу правильно отдавать контент для Capacitor WebView:

```text
server: {
  ...
  appendUserAgent: 'CapacitorApp'
}
```

### 3. Включить `loggingBehavior` для отладки

Для диагностики добавить логирование в конфиг:

```text
loggingBehavior: 'debug'
```

## После применения изменений

На вашей стороне нужно выполнить:

```text
git pull
npx cap sync ios
npx cap run ios
```

## Технические детали

Единственный файл изменения -- `capacitor.config.ts`. Итоговый конфиг будет содержать `allowNavigation` для домена Lovable, что позволит WKWebView корректно загружать и исполнять JavaScript с удаленного сервера.

Предупреждение `UIScene lifecycle` -- это информационное сообщение от Apple, оно не вызывает черный экран и не требует действий на данный момент.

Ошибка `sandbox extension` связана с тем, что iOS пытается создать расширение для локального бандла, но приложение загружает контент удаленно -- это нормальное поведение при использовании `server.url`.

