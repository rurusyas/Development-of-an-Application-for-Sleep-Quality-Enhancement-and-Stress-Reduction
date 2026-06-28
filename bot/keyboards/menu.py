import sys
from telegram import KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from config import MINIAPP_URL


def _valid_https(url):
    if not url:
        return False
    u = str(url).strip().lower()
    if not u.startswith("https://"):
        return False
    if " " in u:
        return False
    if len(u) < 12:
        return False
    # Telegram WebApp button rejects t.me / telegram.me — those are deep-links, not hosted pages
    host = u[len("https://"):].split("/", 1)[0]
    if host in ("t.me", "telegram.me", "telegram.dog"):
        return False
    return True


_MINIAPP_URL_VALID = _valid_https(MINIAPP_URL)
if MINIAPP_URL and not _MINIAPP_URL_VALID:
    print(
        f"[menu] WARNING: MINIAPP_URL={MINIAPP_URL!r} is invalid for KeyboardButton.web_app. "
        f"It must be the HOSTED Mini App URL (e.g. https://your-app.pages.dev/telegram.html), "
        f"NOT a t.me deep-link. WebApp button DISABLED.",
        file=sys.stderr, flush=True,
    )


def main_menu():
    rows = [
        ["Дневник", "История"],
        ["Советы по сну", "Звуки"],
        ["Статистика", "Профиль"],
        ["Апноэ", "Фокус"],
        ["Лидерборд", "Помощь"],
    ]
    if _MINIAPP_URL_VALID:
        try:
            rows.append([KeyboardButton("Открыть Orca", web_app=WebAppInfo(url=MINIAPP_URL))])
        except Exception as e:
            print(f"[menu] WebApp button build failed: {e!r}", file=sys.stderr, flush=True)
    return ReplyKeyboardMarkup(rows, resize_keyboard=True)


def scale_keyboard():
    return ReplyKeyboardMarkup([["1", "2", "3", "4", "5"], ["Отмена"]], resize_keyboard=True, one_time_keyboard=True)
