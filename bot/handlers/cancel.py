import sys

from telegram import Update
from telegram.ext import (
    ApplicationHandlerStop,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

from keyboards.menu import main_menu


def _drop_all_conv_states(application, chat_id, user_id):
    try:
        for group in application.handlers.values():
            for h in group:
                if isinstance(h, ConversationHandler):
                    convs = getattr(h, "_conversations", None)
                    if convs is None:
                        continue
                    for key in list(convs.keys()):
                        try:
                            if isinstance(key, tuple) and (chat_id in key or user_id in key):
                                convs.pop(key, None)
                        except Exception:
                            pass
    except Exception as e:
        print(f"[cancel] drop conv states failed: {e!r}", file=sys.stderr)


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat = update.effective_chat
    user = update.effective_user
    try:
        _drop_all_conv_states(
            context.application,
            chat.id if chat else None,
            user.id if user else None,
        )
    except Exception as e:
        print(f"[cancel] reset state failed: {e!r}", file=sys.stderr)

    for k in ("onboarding", "onboarding_state", "diary_draft", "focus_min", "apnea_pending"):
        context.user_data.pop(k, None)

    try:
        if update.message:
            await update.message.reply_text(
                "Окей, всё сбросил. Главное меню ниже.",
                reply_markup=main_menu(),
            )
    except Exception as e:
        print(f"[cancel] reply failed: {e!r}", file=sys.stderr)

    raise ApplicationHandlerStop


def get_handlers():
    return [
        CommandHandler("cancel", cancel),
        CommandHandler("reset", cancel),
        MessageHandler(filters.Regex(r"^(Отмена|/cancel|/reset)$"), cancel),
    ]
