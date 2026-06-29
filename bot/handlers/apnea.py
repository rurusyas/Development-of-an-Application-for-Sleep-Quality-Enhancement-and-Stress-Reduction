from telegram import Update
from telegram.ext import (
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

from keyboards.menu import main_menu
from services import orca_voice
from services.charts import apnea_history_chart

WAIT_AUDIO = 40

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


async def apnea(update: Update, context: ContextTypes.DEFAULT_TYPE):
    uid = await get_uid(update, context)
    if not uid:
        await update.message.reply_text(
            "Не смог получить профиль. Проверь API Orca.", reply_markup=main_menu()
        )
        return ConversationHandler.END
    text = (
        "<b>Анализ апноэ</b>\n"
        f"<i>{orca_voice.NARR_APNEA}</i>\n\n"
        "Запиши голосовое сообщение или прикрепи аудиофайл. Модель прослушает "
        "дыхание и вернёт результат с уверенностью.\n\n"
        "<blockquote expandable>"
        "Полноценный ночной режим (запись всей ночью в фоне) доступен в "
        "iOS-приложении Orca"
        "</blockquote>"
    )
    await update.message.reply_text(text, parse_mode="HTML")
    return WAIT_AUDIO


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Окей, вернул главное меню.", reply_markup=main_menu())
    return ConversationHandler.END


async def receive_audio(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # text fallback to cancel during waiting state
    if update.message.text and _is_cancel(update.message.text):
        return await cancel(update, context)

    uid = await get_uid(update, context)
    if update.message.voice:
        tg_file = await update.message.voice.get_file()
        filename = "voice.ogg"
    elif update.message.audio:
        tg_file = await update.message.audio.get_file()
        filename = update.message.audio.file_name or "audio.ogg"
    else:
        await update.message.reply_text("Нужно прислать голосовое сообщение или аудиофайл.")
        return WAIT_AUDIO

    raw = await tg_file.download_as_bytearray()
    api = context.application.bot_data["api"]
    data = await api.analyze_apnea(uid, bytes(raw), filename)
    if not data:
        await update.message.reply_text(
            "Не смог проанализировать аудио. Проверь API Orca.", reply_markup=main_menu()
        )
        return ConversationHandler.END

    has = bool(data.get("has_apnea"))
    confidence = data.get("confidence")
    conf_text = "нет данных" if confidence is None else f"{float(confidence) * 100:.1f}%"
    used_model = bool(data.get("used_model"))
    verdict = "⚠️  Возможны признаки апноэ" if has else "✓  Признаков апноэ не выявлено"

    summary = (
        "<b>Результат проверки</b>\n\n"
        f"{verdict}\n"
        f"Уверенность модели: <b>{conf_text}</b>\n"
    )
    if not used_model:
        summary += "\n<i>Демо-режим: ML-модель не подключена, используется детерминированная заглушка.</i>\n"
    summary += (
        "\n<blockquote>"
        "Это не диагноз. Если такие сигналы повторяются — это повод записаться "
        "на полисомнографию к сомнологу."
        "</blockquote>"
    )

    await update.message.reply_text(summary, parse_mode="HTML", reply_markup=main_menu())

    # Send history chart if we have multiple checks
    try:
        history = await api.get_apnea_history(uid)
    except Exception:
        history = None
    if history and len(history) >= 2:
        try:
            chart = apnea_history_chart(history)
        except Exception:
            chart = None
        if chart is not None:
            await update.message.reply_photo(photo=chart)

    return ConversationHandler.END


def get_handler():
    return ConversationHandler(
        entry_points=[
            CommandHandler("apnea", apnea),
            MessageHandler(filters.Regex("^Апноэ$"), apnea),
        ],
        states={
            WAIT_AUDIO: [
                MessageHandler(filters.VOICE | filters.AUDIO, receive_audio),
                MessageHandler(filters.Regex("^Отмена$"), cancel),
            ]
        },
        fallbacks=[
            CommandHandler("cancel", cancel),
            MessageHandler(filters.Regex("^Отмена$"), cancel),
        ],
    )
