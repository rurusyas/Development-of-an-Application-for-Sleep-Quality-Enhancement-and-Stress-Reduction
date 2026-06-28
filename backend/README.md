# Orca backend (FastAPI + SQLite)

Один сервис для бота, Mini App и iOS-приложения. Сюда же подключается модель апноэ и LLM.

## Запуск

Из **корня репозитория** (важно: пакетный запуск, чтобы резолвились относительные импорты и `apnea_model`):

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

Или в Docker: `docker compose up backend`. Swagger: `http://localhost:8000/docs`.

## Эндпоинты

- `GET /user/{tg_id}`, `POST /user/{tg_id}` — апсерт пользователя, онбординг считает индексы
- `POST /diary`, `GET /diary/{user_id}`
- `GET /stats/{user_id}` — средние за 7 дней, минуты фокуса, число проверок апноэ
- `GET /content/articles`, `GET /content/article/{id}` — из `content/articles.json`
- `POST /apnea/analyze` (multipart: `file`, опц. `user_id`, `mode`) -> `{has_apnea, confidence, mode, used_model}`
- `GET /apnea/history/{user_id}`
- `POST /chat` -> SSE-стрим (`data: {"delta": "..."}`, затем `data: {"done": true}`)
- `GET /leaderboard` — топ по avg sleep_quality за 7 дней
- `POST /focus`, `GET /focus/{user_id}`
- `GET /health`

## Модель апноэ

`POST /apnea/analyze` вызывает `apnea_model.predict(audio_path) -> (bool, float)`. Если модели нет — детерминированная заглушка (`used_model: false`). См. `apnea_model/README.md`.

## AI Chat

`services/llm.py` берёт ключ из env. Приоритет: `ANTHROPIC_API_KEY` -> `OPENAI_API_KEY` -> `LLM_API_KEY` (по префиксу `sk-ant` определяет провайдера). System prompt = все статьи из `content/articles.json` (RAG). Без ключа — заглушка `Configure LLM_API_KEY to enable AI responses`.

## Telegram initData

`services/telegram_auth.verify_init_data(init_data, bot_token)` проверяет hash по схеме Telegram Web Apps. Подключается на эндпоинтах, вызываемых из Mini App.

## Тесты

```bash
python -m pytest backend/tests -q
```

12 тестов: все эндпоинты, мок модели апноэ, мок и заглушка LLM, формулы индексов.
