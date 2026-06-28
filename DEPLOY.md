# Orca · deploy

## cloudflare pages

build command:

```
cd app && npm install && npm run build && npx vite build --mode telegram --emptyOutDir false && npx vite build --mode demo --emptyOutDir false
```

output directory: `app/dist`

routes after deploy:

- `/` → веб-приложение
- `/telegram.html` → Mini App для Telegram
- `/demo.html` → веб-приложение в iPhone-рамке (для презентации/комиссии)

## backend, bot

на Railway, отдельные сервисы. см. `backend/railway.toml` и `bot/`.
