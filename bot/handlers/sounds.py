from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.ext import CommandHandler, ContextTypes, MessageHandler, filters

from config import MINIAPP_URL
from services import orca_voice


# id -> (emoji, friendly description)
_SOUND_META = {
    "white-noise":  ("⚪️", "ровный, маскирует шум комнаты"),
    "pink-noise":   ("🌸", "мягче белого, многие лучше засыпают под него"),
    "brown-noise":  ("🟤", "глубокий низкий шум, эффект «гудит океан»"),
    "ocean-waves":  ("🌊", "медленные накатывающие волны"),
    "rain":         ("🌧",  "плотный дождь по крыше"),
    "crackle":      ("🔥",  "треск костра, негромкий и тёплый"),
    "night-drone":  ("🌌",  "ночной гул — как будто город спит"),
    "fan":          ("💨",  "вентилятор: ровный, чуть колеблется"),
}


async def sounds(update: Update, context: ContextTypes.DEFAULT_TYPE):
    lines = [
        "<b>Звуки для сна и фокуса</b>",
        f"<i>{orca_voice.NARR_SOUNDS}</i>",
        "",
    ]
    for sid, (emoji, desc) in _SOUND_META.items():
        # Pretty title from id
        title_map = {
            "white-noise":  "Белый шум",
            "pink-noise":   "Розовый шум",
            "brown-noise":  "Коричневый шум",
            "ocean-waves":  "Океан",
            "rain":         "Дождь",
            "crackle":      "Костёр",
            "night-drone":  "Ночной гул",
            "fan":          "Вентилятор",
        }
        lines.append(f"{emoji}  <b>{title_map.get(sid, sid)}</b>  —  <i>{desc}</i>")

    lines.extend([
        "",
        "<blockquote expandable>"
        "Звуки сгенерированы кодом, а не записаны микрофоном. "
        "Это значит — без лицензий, без артефактов сжатия, и любой звук можно "
        "крутить часами без зацикливания. Параметры (плотность, фильтрация, "
        "глубина LFO) живут в content/sounds.json и приходят в плеер приложения."
        "</blockquote>",
        "",
        "<i>Воспроизведение — в приложении Orca, с таймером и плавным fade-out.</i>",
    ])
    text = "\n".join(lines)

    markup = None
    if MINIAPP_URL:
        markup = InlineKeyboardMarkup(
            [[InlineKeyboardButton("Открыть Orca", web_app=WebAppInfo(url=MINIAPP_URL))]]
        )
    await update.message.reply_text(text, parse_mode="HTML", reply_markup=markup)


def get_handlers():
    return [
        CommandHandler("sounds", sounds),
        MessageHandler(filters.Regex("^Звуки$"), sounds),
    ]
