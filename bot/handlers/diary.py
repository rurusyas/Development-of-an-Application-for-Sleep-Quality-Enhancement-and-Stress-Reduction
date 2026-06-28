from datetime import datetime

from telegram import ReplyKeyboardMarkup, Update
from telegram.ext import (
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

from keyboards.menu import main_menu, scale_keyboard
from services import orca_voice
from services.charts import weekly_diary_chart
from services.gamification import current_streak, depth_card

MOOD, ENERGY, STRESS, SLEEP_QUALITY, NOTE = range(20, 25)

CANCEL_TOKENS = {"Отмена", "отмена", "/cancel", "Cancel", "cancel"}


async def get_uid(update, context):
    if context.user_data.get("uid"):
        return context.user_data["uid"]
    user = update.effective_user
    api = context.application.bot_data["api"]
    uid = await api.ensure_user(str(user.id), user.full_name)
    if uid:
        context.user_data["uid"] = uid
    return uid


def parse_scale(text):
    try:
        x = int(text)
        if 1 <= x <= 5:
            return x
        return None
    except ValueError:
        return None


def _is_cancel(text: str) -> bool:
    return text.strip() in CANCEL_TOKENS


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data.pop("diary", None)
    await update.message.reply_text("Окей, дневник отменён.", reply_markup=main_menu())
    return ConversationHandler.END


async def start_diary(update: Update, context: ContextTypes.DEFAULT_TYPE):
    uid = await get_uid(update, context)
    if not uid:
        await update.message.reply_text(
            "Не смог получить профиль. Проверь API Orca.", reply_markup=main_menu()
        )
        return ConversationHandler.END
    context.user_data["diary"] = {}
    intro = (
        "<b>Дневник</b>\n"
        f"<i>{orca_voice.NARR_DIARY}</i>\n\n"
        "Настроение сегодня? <b>1</b> — плохо, <b>5</b> — отлично."
    )
    await update.message.reply_text(intro, parse_mode="HTML", reply_markup=scale_keyboard())
    return MOOD


async def _ask_scale(update, prompt_html, next_state):
    await update.message.reply_text(prompt_html, parse_mode="HTML", reply_markup=scale_keyboard())
    return next_state


async def mood(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if _is_cancel(text):
        return await cancel(update, context)
    x = parse_scale(text)
    if x is None:
        await update.message.reply_text(
            "Нужно число от 1 до 5. Или нажми «Отмена».", reply_markup=scale_keyboard()
        )
        return MOOD
    context.user_data["diary"]["mood"] = x
    return await _ask_scale(
        update,
        "Энергия? <b>1</b> — нет сил, <b>5</b> — много энергии.",
        ENERGY,
    )


async def energy(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if _is_cancel(text):
        return await cancel(update, context)
    x = parse_scale(text)
    if x is None:
        await update.message.reply_text(
            "Нужно число от 1 до 5. Или нажми «Отмена».", reply_markup=scale_keyboard()
        )
        return ENERGY
    context.user_data["diary"]["energy"] = x
    return await _ask_scale(
        update,
        "Стресс? <b>1</b> — спокойно, <b>5</b> — очень высокий.",
        STRESS,
    )


async def stress(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if _is_cancel(text):
        return await cancel(update, context)
    x = parse_scale(text)
    if x is None:
        await update.message.reply_text(
            "Нужно число от 1 до 5. Или нажми «Отмена».", reply_markup=scale_keyboard()
        )
        return STRESS
    context.user_data["diary"]["stress"] = x
    return await _ask_scale(
        update,
        "Качество сна? <b>1</b> — плохо, <b>5</b> — отлично.",
        SLEEP_QUALITY,
    )


async def sleep_quality(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if _is_cancel(text):
        return await cancel(update, context)
    x = parse_scale(text)
    if x is None:
        await update.message.reply_text(
            "Нужно число от 1 до 5. Или нажми «Отмена».", reply_markup=scale_keyboard()
        )
        return SLEEP_QUALITY
    context.user_data["diary"]["sleep_quality"] = x
    await update.message.reply_text(
        "Добавь короткую заметку или отправь /skip, чтобы сохранить как есть.",
        reply_markup=ReplyKeyboardMarkup(
            [["/skip"], ["Отмена"]], resize_keyboard=True, one_time_keyboard=True
        ),
    )
    return NOTE


async def note(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if _is_cancel(text):
        return await cancel(update, context)
    return await save_diary(update, context, text)


async def skip(update: Update, context: ContextTypes.DEFAULT_TYPE):
    return await save_diary(update, context, None)


async def save_diary(update: Update, context: ContextTypes.DEFAULT_TYPE, text):
    uid = await get_uid(update, context)
    data = context.user_data["diary"]
    api = context.application.bot_data["api"]
    result = await api.post_diary(
        uid, data["mood"], data["energy"], data["stress"], data["sleep_quality"], text
    )
    if not result:
        await update.message.reply_text(
            "Не смог сохранить дневник. Проверь API Orca.", reply_markup=main_menu()
        )
        return ConversationHandler.END

    # Fetch all entries for streak calc + weekly chart
    entries = await api.get_diary(uid) or []
    streak = current_streak([e.get("created_at") for e in entries])
    is_first = len(entries) <= 1

    # Build confirmation text
    pretty = (
        f"<b>Запись сохранена</b>  ·  <code>{datetime.utcnow().strftime('%d.%m %H:%M')}</code> UTC\n\n"
        f"Настроение  <b>{data['mood']}</b>  ·  Энергия  <b>{data['energy']}</b>\n"
        f"Стресс  <b>{data['stress']}</b>  ·  Сон  <b>{data['sleep_quality']}</b>\n\n"
        f"<i>{orca_voice.praise(streak, is_first=is_first)}</i>\n\n"
        f"{depth_card(streak)}"
    )

    # Send weekly chart as photo, with confirmation as caption (or split if too long)
    try:
        chart = weekly_diary_chart(entries)
    except Exception:
        chart = None

    if chart is not None and len(pretty) <= 1024:
        await update.message.reply_photo(
            photo=chart, caption=pretty, parse_mode="HTML", reply_markup=main_menu()
        )
    else:
        await update.message.reply_text(pretty, parse_mode="HTML", reply_markup=main_menu())
        if chart is not None:
            await update.message.reply_photo(photo=chart)

    context.user_data.pop("diary", None)
    return ConversationHandler.END


def get_handler():
    return ConversationHandler(
        entry_points=[
            CommandHandler("diary", start_diary),
            MessageHandler(filters.Regex("^Дневник$"), start_diary),
        ],
        states={
            MOOD: [MessageHandler(filters.TEXT & ~filters.COMMAND, mood)],
            ENERGY: [MessageHandler(filters.TEXT & ~filters.COMMAND, energy)],
            STRESS: [MessageHandler(filters.TEXT & ~filters.COMMAND, stress)],
            SLEEP_QUALITY: [MessageHandler(filters.TEXT & ~filters.COMMAND, sleep_quality)],
            NOTE: [
                CommandHandler("skip", skip),
                MessageHandler(filters.TEXT & ~filters.COMMAND, note),
            ],
        },
        fallbacks=[
            CommandHandler("cancel", cancel),
            MessageHandler(filters.Regex("^Отмена$"), cancel),
        ],
    )
