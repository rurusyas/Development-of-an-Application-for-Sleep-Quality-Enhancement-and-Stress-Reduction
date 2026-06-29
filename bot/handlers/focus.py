from telegram import ReplyKeyboardMarkup, Update
from telegram.ext import (
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

from keyboards.menu import main_menu
from services import orca_voice

DURATION = 50
CANCEL_TOKENS = {"Отмена", "отмена", "/cancel", "Cancel", "cancel"}


def _is_cancel(text: str) -> bool:
    return text.strip() in CANCEL_TOKENS


async def get_uid(update, context):
    if context.user_data.get("uid"):
        return context.user_data["uid"]
    user = update.effective_user
    uid = await context.application.bot_data["api"].ensure_user(str(user.id), user.full_name)
    if uid:
        context.user_data["uid"] = uid
    return uid


async def focus(update: Update, context: ContextTypes.DEFAULT_TYPE):
    uid = await get_uid(update, context)
    if not uid:
        await update.message.reply_text(
            "Не смог получить профиль. Проверь API Orca.", reply_markup=main_menu()
        )
        return ConversationHandler.END
    text = (
        "<b>Фокус-сессия</b>\n"
        f"<i>{orca_voice.NARR_FOCUS}</i>\n\n"
        "Выбери длину или напиши своё число минут."
    )
    await update.message.reply_text(
        text,
        parse_mode="HTML",
        reply_markup=ReplyKeyboardMarkup(
            [["25", "50"], ["90", "120"], ["Отмена"]],
            resize_keyboard=True,
            one_time_keyboard=True,
        ),
    )
    return DURATION


async def save_focus(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if _is_cancel(text):
        return await cancel(update, context)
    try:
        minutes = int(text)
    except ValueError:
        await update.message.reply_text("Нужно число минут. Например: <b>25</b>", parse_mode="HTML")
        return DURATION
    if minutes <= 0 or minutes > 600:
        await update.message.reply_text("Нужно число от 1 до 600.")
        return DURATION
    uid = await get_uid(update, context)
    data = await context.application.bot_data["api"].post_focus(uid, minutes)
    if not data:
        await update.message.reply_text(
            "Не смог сохранить фокус-сессию. Проверь API Orca.", reply_markup=main_menu()
        )
        return ConversationHandler.END

    # Pick a praise line proportional to duration
    if minutes >= 90:
        nudge = "Это серьезное погружение. Косатка одобряет."
    elif minutes >= 50:
        nudge = "Pomodoro-формат для тех, кто хочет глубже."
    elif minutes >= 25:
        nudge = "Классический интервал. Маленький, зато честный."
    else:
        nudge = "Лучше короткое, чем никакое."

    result = (
        "<b>Фокус-сессия сохранена</b>\n\n"
        f"Длительность: <b>{minutes} мин</b>\n\n"
        f"<i>{nudge}</i>"
    )
    await update.message.reply_text(result, parse_mode="HTML", reply_markup=main_menu())
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Окей, вернул главное меню.", reply_markup=main_menu())
    return ConversationHandler.END


def get_handler():
    return ConversationHandler(
        entry_points=[
            CommandHandler("focus", focus),
            MessageHandler(filters.Regex("^Фокус$"), focus),
        ],
        states={DURATION: [MessageHandler(filters.TEXT & ~filters.COMMAND, save_focus)]},
        fallbacks=[
            CommandHandler("cancel", cancel),
            MessageHandler(filters.Regex("^Отмена$"), cancel),
        ],
    )
