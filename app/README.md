# Orca — фронтенд (React + Vite + Capacitor)

Один кодбейз: приложение в браузере, веб-демо, Telegram Mini App, сборка в iOS.

## Telegram Mini App

```bash
npm install
npm run dev:telegram      # откроет /telegram.html в браузере
```

Сборка статики для деплоя:
```bash
npm run build:telegram    # -> dist/
```
Деплой `dist/` на Vercel/Cloudflare Pages, URL указать в @BotFather через /newapp.
Mini App работает и в обычном браузере — обёртка Telegram SDK (`src/lib/telegram.ts`) делает no-op вне Telegram, так что можно запускать и снимать скриншоты без Telegram.

Экраны Mini App (по спеке): главная-обзор, дневник, звуки, образование, Orca AI, лидерборд. Без будильника и записи аудио.

## Прочие таргеты

```bash
npm run dev               # приложение в браузере (index.html)
npm run build:demo        # веб-демо
npm run build             # статика
```

iOS через Capacitor: `npm run build && npx cap add ios && npx cap open ios` (нужен Xcode).

## Структура

- `src/lib/` — telegram (SDK), platform, indices (те же формулы, что в backend), sound (Web Audio), db (IndexedDB), sse, time
- `src/services/api.ts` — клиент бэкенда (контракт совпадает с backend/), SSE для чата
- `src/store/useStore.ts` — Zustand + персист в IndexedDB
- `src/screens/tg/` — оболочка и главная Mini App
- `src/screens/` — экраны (общие для всех таргетов)
- `preview/orca_screens.html` — статичный дизайн-референс всех экранов

## Статус Mini App

- Чекпойнт 1 (готово): SDK, тема, навигация, дизайн-система, главный экран-обзор
- Чекпойнт 2 (готово): дневник (ввод + недельный график), звуки (живой Web Audio + таймер), образование (карточки из articles.json)
- Чекпойнт 3 (готово): Orca AI чат (SSE-стрим + typing + фолбэк), лидерборд (api с мок-фолбэком), haptics
