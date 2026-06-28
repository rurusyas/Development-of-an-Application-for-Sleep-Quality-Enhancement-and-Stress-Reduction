from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.ext import CommandHandler, ContextTypes, MessageHandler, filters

from config import MINIAPP_URL
from keyboards.menu import _valid_https
from services import orca_voice


async def sounds(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = (
        "<b>Звуки для сна и фокуса</b>\n\n"
        "Воспроизведение — в приложении Orca, с таймером и плавным fade-out.\n\n"
        "Доступны в MiniApp: https://t.me/orca_miniapp_bot/orcathesleepwhale"
    )

    markup = None
    if _valid_https(MINIAPP_URL):
        try:
            markup = InlineKeyboardMarkup(
                [[InlineKeyboardButton("Открыть Orca", web_app=WebAppInfo(url=MINIAPP_URL))]]
            )
        except Exception:
            markup = None
    try:
        await update.message.reply_text(text, parse_mode="HTML", reply_markup=markup)
    except Exception:
        await update.message.reply_text(text)


def get_handlers():
    return [
        CommandHandler("sounds", sounds),
        MessageHandler(filters.Regex("^Звуки$"), sounds),
    ]
