

# Исправление редиректа на логин Lovable в iOS-приложении

## Проблема

Capacitor загружает preview URL (`https://c2d2ddb7-...lovableproject.com`), который требует авторизации в аккаунте Lovable. В нативном WKWebView пользователь не авторизован в Lovable, поэтому происходит редирект на страницу входа Lovable.

## Решение

Заменить preview URL на опубликованный (published) URL приложения в `capacitor.config.ts`.

### Изменения в `capacitor.config.ts`

Заменить:
```text
url: 'https://c2d2ddb7-eee0-4d3c-8c51-1d25a45053ec.lovableproject.com?forceHideBadge=true'
```

На:
```text
url: 'https://yellow-sparkle-bank.lovable.app?forceHideBadge=true'
```

Также обновить `allowNavigation`:
```text
allowNavigation: ['*.lovable.app']
```

## Важно

Перед этим убедитесь, что приложение **опубликовано** (нажмите кнопку "Publish" в Lovable). Публичный URL доступен без авторизации.

## После применения

```text
git pull
npx cap sync ios
npx cap run ios
```

## Техническая справка

Единственный файл изменения -- `capacitor.config.ts`. Preview URL предназначен для разработки в браузере, где вы авторизованы в Lovable. Published URL -- публичный и работает в любом контексте, включая нативный WebView.

