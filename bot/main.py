import sys
from datetime import datetime

from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes
from config import API_BASE, BOT_TOKEN
from services.api_client import ApiClient
from handlers import (
    apnea,
    cancel,
    diary,
    focus,
    help as help_handler,
    history,
    leaderboard,
    profile,
    sounds,
    start,
    stats,
    tips,
)


BOOT_VERSION = "v4-2026-06-28-concurrent-waitfor-localfallback-errorhandler"


async def post_init(application):
    application.bot_data["api"] = ApiClient(API_BASE)
    print(f"[BOOT] {datetime.utcnow().isoformat()} VERSION={BOOT_VERSION} API_BASE={API_BASE}", file=sys.stderr, flush=True)
    # Pre-flight: delete any pre-existing webhook, drop pending updates so old polling sessions terminate cleanly
#    try:
#        await application.bot.delete_webhook(drop_pending_updates=True)
#        print(f"[BOOT] delete_webhook(drop_pending_updates=True) OK", file=sys.stderr, flush=True)
#    except Exception as e:
#        print(f"[BOOT] delete_webhook failed: {e!r}", file=sys.stderr, flush=True)
    
    import asyncio
    for attempt in range(10):
        try:
            await application.bot.get_updates(offset=-1, timeout=0, limit=1)
            print(f"[BOOT] getUpdates attempt {attempt+1}: OK (old poller dead)", file=sys.stderr, flush=True)
            break
        except Exception as e:
            msg = str(e)
            if "Conflict" in msg:
                print(f"[BOOT] getUpdates attempt {attempt+1}: conflict, waiting...", file=sys.stderr, flush=True)
                await asyncio.sleep(2)
            else:
                print(f"[BOOT] getUpdates attempt {attempt+1}: {e!r}", file=sys.stderr, flush=True)
                break

    try:
        await application.bot.delete_webhook(drop_pending_updates=True)
        print(f"[BOOT] delete_webhook OK", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"[BOOT] delete_webhook failed: {e!r}", file=sys.stderr, flush=True)


async def post_shutdown(application):
    api = application.bot_data.get("api")
    if api:
        await api.close()


async def on_error(update: object, context: ContextTypes.DEFAULT_TYPE):
    import traceback
    err = context.error
    print(f"[ERROR_HANDLER] caught: {err!r}", file=sys.stderr, flush=True)
    traceback.print_exception(type(err), err, err.__traceback__, file=sys.stderr)
    try:
        if isinstance(update, Update) and update.effective_message:
            from keyboards.menu import main_menu
            await update.effective_message.reply_text(
                "Что-то пошло не так. Попробуй /reset или /start заново.",
                reply_markup=main_menu(),
            )
    except Exception as e:
        print(f"[ERROR_HANDLER] failed to notify user: {e!r}", file=sys.stderr, flush=True)


def main():
    print(f"[STARTUP] {datetime.utcnow().isoformat()} VERSION={BOOT_VERSION}", file=sys.stderr, flush=True)
    app = (
        ApplicationBuilder()
        .token(BOT_TOKEN)
        .concurrent_updates(True)
        .post_init(post_init)
        .post_shutdown(post_shutdown)
        .build()
    )

    app.add_error_handler(on_error)

    # Global cancel/reset — runs BEFORE everything, force-resets any state
    for h in cancel.get_handlers():
        app.add_handler(h, group=-100)

    # Conversation handlers (multi-step)
    app.add_handler(start.get_handler())
    app.add_handler(diary.get_handler())
    app.add_handler(apnea.get_handler())
    app.add_handler(focus.get_handler())

    # Single-shot handlers
    for h in tips.get_handlers():
        app.add_handler(h)
    for h in sounds.get_handlers():
        app.add_handler(h)
    for h in stats.get_handlers():
        app.add_handler(h)
    for h in leaderboard.get_handlers():
        app.add_handler(h)
    for h in profile.get_handlers():
        app.add_handler(h)
    for h in history.get_handlers():
        app.add_handler(h)
    for h in help_handler.get_handlers():
        app.add_handler(h)

    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
