# Результаты тестирования Orca

**Дата прогона:** 28 июня 2026
**Итого:** 27 из 27 тестов зелёные (100%)

- Frontend (Vitest): **12 / 12** ✓
- Backend (pytest): **15 / 15** ✓

---

## Frontend — `npm test` в `app/`

```
 RUN  v2.1.9 /home/claude/project/sleep_thesis/app

 ✓ src/__tests__/indices.test.ts (4 tests)
 ✓ src/__tests__/sound.test.ts (3 tests)
 ✓ src/__tests__/time.test.ts (2 tests)
 ✓ src/__tests__/sse.test.ts (3 tests)

 Test Files  4 passed (4)
      Tests  12 passed (12)
```

## Backend — `pytest backend/tests/`

```
backend/tests/test_api.py::test_health PASSED                            [  6%]
backend/tests/test_api.py::test_user_upsert_and_get PASSED               [ 13%]
backend/tests/test_api.py::test_get_user_404 PASSED                      [ 20%]
backend/tests/test_api.py::test_diary_add_and_list PASSED                [ 26%]
backend/tests/test_api.py::test_stats PASSED                             [ 33%]
backend/tests/test_api.py::test_content_articles PASSED                  [ 40%]
backend/tests/test_api.py::test_apnea_analyze_with_mock_model PASSED     [ 46%]
backend/tests/test_api.py::test_apnea_stub_when_no_model PASSED          [ 53%]
backend/tests/test_api.py::test_chat_stub_without_key PASSED             [ 60%]
backend/tests/test_api.py::test_chat_mock_llm PASSED                     [ 66%]
backend/tests/test_api.py::test_focus_add_and_list PASSED                [ 73%]
backend/tests/test_api.py::test_leaderboard PASSED                       [ 80%]
backend/tests/test_api.py::test_indices_formulas PASSED                  [ 86%]
backend/tests/test_api.py::test_apnea_real_vad_model PASSED              [ 93%]
backend/tests/test_api.py::test_apnea_browser_webm_decodes PASSED        [100%]

15 passed, 22 warnings in 1.12s
```

22 warning — `DeprecationWarning` от FastAPI (`on_event` → lifespan) и SQLAlchemy (`datetime.utcnow`). На функциональность не влияют.

---

## Исправленные баги

**🔴 Декодинг аудио из браузера (фикс перед защитой).** `MediaRecorder` в браузере пишет webm/opus (Chrome/Firefox) или mp4/AAC (Safari), а `apnea_model` читал только через `soundfile`/`wave` (WAV/FLAC/OGG). На реальной записи анализ апноэ всегда возвращал «Норма / 0%». Добавлен fallback-декодер через ffmpeg (`apnea_model._decode_with_ffmpeg`), `imageio-ffmpeg` в requirements и `ffmpeg` в Dockerfile. Покрыто тестом `test_apnea_browser_webm_decodes` (реальный webm/opus → `has_apnea=True`).
