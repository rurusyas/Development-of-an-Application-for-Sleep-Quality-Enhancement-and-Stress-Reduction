# План тестирования Orca

Дата: 28 июня 2026

## Сводка

| Слой | Фреймворк | Кол-во | Запуск |
|---|---|---|---|
| Backend (FastAPI) | pytest | 15 | `pytest backend/tests/` |
| Frontend (TS lib) | Vitest | 12 | `npm test` в `app/` |
| **Итого** | | **27** | |

## Frontend (Vitest) — app/src/__tests__/

| Модуль | Что тестируется | Метод | Ожидание | Статус |
|---|---|---|---|---|
| `indices.ts` | `sleepIndex` на экстремумах | unit | worst → 0, best → 100 | ✓ passed |
| `indices.ts` | `stressIndex` / `focusIndex` на экстремумах | unit | stress: 0↔100; focus инвертирован | ✓ passed |
| `indices.ts` | средние значения онбординга | unit | индексы не на границах, stress/focus ≈ 50 | ✓ passed |
| `indices.ts` | `computeIndices` целиком | unit | объект с 3 ключами, корректные значения | ✓ passed |
| `time.ts` | `fmtMMSS` границы | unit | 0→"0:00", 59→"0:59", 60→"1:00", 3661→"61:01", отрицательное→"0:00" | ✓ passed |
| `time.ts` | `progressPct` границы | unit | clamp [0,1], total=0 → 0 | ✓ passed |
| `sse.ts` | корректный SSE-чанк | unit | возвращает `["hello"]` | ✓ passed |
| `sse.ts` | битый JSON и keep-alive | unit | игнорируется, валидное парсится | ✓ passed |
| `sse.ts` | мультистрочный чанк | unit | парсит все `data:` строки по порядку | ✓ passed |
| `sound.ts` | `clampVolume` | unit | clamp в [0,1] | ✓ passed |
| `sound.ts` | `fadeSteps` монотонность | unit | N значений, монотонный ramp, последнее = `to` | ✓ passed |
| `sound.ts` | `resolveSound` по id | unit | найден → объект, не найден → `null` | ✓ passed |

## Backend (pytest) — backend/tests/test_api.py

| Эндпоинт / модуль | Что тестируется | Метод | Ожидание | Статус |
|---|---|---|---|---|
| `/health` | health-чек | TestClient | 200, `{"status":"ok"}` | ✓ passed |
| `/user/{tg_id}` POST | апсерт пользователя с онбордингом | TestClient | 200, индексы посчитаны, `sleep_index > 50` для здорового профиля | ✓ passed |
| `/user/{tg_id}` GET | 404 на несуществующего | TestClient | 404 | ✓ passed |
| `/diary` POST + GET | добавление и листинг записей | TestClient | 200, запись в списке | ✓ passed |
| `/stats` | агрегаты за 7 дней | TestClient | 200, поля статистики | ✓ passed |
| `/content/articles` | список статей | TestClient | 200, непустой массив | ✓ passed |
| `/apnea/analyze` | с мок-моделью | TestClient + monkeypatch | 200, `has_apnea` из мока | ✓ passed |
| `/apnea/analyze` | заглушка без модели | TestClient + monkeypatch | 200, mode="stub" | ✓ passed |
| `/chat` | заглушка без LLM ключа | TestClient + monkeypatch | 200, fallback-сообщение | ✓ passed |
| `/chat` | поток от мок-LLM | TestClient + monkeypatch | 200, SSE-чанки получены | ✓ passed |
| `/focus` POST + GET | сессии фокуса | TestClient | 200, сессия в списке | ✓ passed |
| `/leaderboard` | топ за неделю | TestClient | 200, упорядоченный список | ✓ passed |
| `indices` (функции) | формулы compute_all | unit | значения в [0,100], корректные на эталоне | ✓ passed |
| `/apnea/analyze` | реальная VAD-эвристика | TestClient + numpy | сгенерированный wav с паузой 15с → `has_apnea=True` | ✓ passed |
| `/apnea/analyze` | декодинг webm из браузера | TestClient + ffmpeg | webm/opus с паузой 15с → `has_apnea=True` (регресс на баг с форматом) | ✓ passed |

## Не покрыто автоматическими тестами (ручной чек-лист на демо)

- MediaRecorder запись 30 сек в `Apnea.tsx` (требует браузер)
- Web Audio синтез звуков в `Sounds.tsx` (требует AudioContext)
- Telegram WebApp SDK интеграция (требует Telegram-клиент)
- Capacitor iOS-сборка (требует Xcode, нет Apple Dev аккаунта)

Покрытие смотри в `DEMO_CHECKLIST.md`.
