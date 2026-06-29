"""
Голос Orca - небольшой слой персонификации для бота.

Косатка - наш бренд-персонаж. Она всегда рядом с пользователем. Тон: спокойный, теплый, на "ты". 
"""

from datetime import datetime
import random


def _hour_now() -> int:
    return datetime.utcnow().hour + 3  # bias to MSK-ish for greetings; harmless if off


# ============================================================
# Greetings — picks by time of day
# ============================================================
_GREETINGS_MORNING = [
    "Доброе утро. Косатка проснулась раньше тебя.",
    "Утро. Лёгкое начало — это уже половина дня.",
    "С пробуждением. Я уже рядом.",
]
_GREETINGS_DAY = [
    "Привет. Косатка наблюдает с глубины.",
    "Ты в дневном цикле. Орка плывёт рядом.",
    "Привет. Давай чуть-чуть позаботимся о себе.",
]
_GREETINGS_EVENING = [
    "Добрый вечер. Скоро глубина — готовим погружение.",
    "Вечер. Самое время для теплых решений.",
    "Привет. День сворачивается, ночь раскрывается.",
]
_GREETINGS_NIGHT = [
    "Уже ночь. Косатка тихо плывёт рядом — не разбудит.",
    "Ночь. Орка не торопит, но и не забывает.",
    "Глубокая вода. Берегите фазы сна.",
]


def greeting(name: str | None = None) -> str:
    h = _hour_now() % 24
    if 5 <= h < 11:
        pool = _GREETINGS_MORNING
    elif 11 <= h < 18:
        pool = _GREETINGS_DAY
    elif 18 <= h < 23:
        pool = _GREETINGS_EVENING
    else:
        pool = _GREETINGS_NIGHT
    base = random.choice(pool)
    if name:
        return f"{base}\n\n<b>{name}</b>, выбери действие в меню."
    return base


# ============================================================
# Praise messages keyed to streak / completion
# ============================================================
_PRAISE_FIRST = "Первая запись. Косатка запоминает курс."
_PRAISE_DAILY = [
    "Запись сохранена. Орка кивает.",
    "Ещё один день в дневнике. Поверхность спокойна.",
    "Готово. Глубина медленно растёт.",
]
_PRAISE_STREAK_7 = "Семь дней подряд. Это уже не случайность — это режим."
_PRAISE_STREAK_14 = "Две недели стабильно. Орка явно гордится — настолько, насколько косатки умеют гордиться."
_PRAISE_STREAK_30 = "Месяц подряд. Это редкий результат. Уважение."


def praise(streak: int, is_first: bool = False) -> str:
    if is_first:
        return _PRAISE_FIRST
    if streak >= 30:
        return _PRAISE_STREAK_30
    if streak >= 14:
        return _PRAISE_STREAK_14
    if streak >= 7:
        return _PRAISE_STREAK_7
    return random.choice(_PRAISE_DAILY)


# ============================================================
# Narrative wrappers — short context lines for sections
# ============================================================
NARR_DIARY = "Три цифры. Опционально заметка. Это всё."
NARR_STATS = "Что Косатка увидела за неделю."
NARR_PROFILE = "Карта твоих индексов."
NARR_LEADERBOARD = "Кто сейчас глубже всех погружён в режим сна."
NARR_APNEA = "Пришли голосовое или аудио — модель послушает дыхание."
NARR_FOCUS = "Включаем погружение. Сколько минут?"
NARR_SOUNDS = "Звуки сделаны кодом, не записями. Каждый — генератор."
NARR_TIPS = "Десять карточек со ссылками на источники."
NARR_HELP = "Что я умею и как с этим жить."
NARR_HISTORY = "Последние записи. От свежих к старым."
