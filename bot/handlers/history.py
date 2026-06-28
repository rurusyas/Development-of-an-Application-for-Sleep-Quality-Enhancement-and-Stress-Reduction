from datetime import datetime

from telegram import Update
from telegram.ext import CommandHandler, ContextTypes, MessageHandler, filters

from keyboards.menu import main_menu
from services import orca_voice
from services.charts import streak_chart
from services.gamification import current_streak, depth_card


# Emoji used for the mood column (1..5)
_MOOD_GLYPH = {
    1: "😞",
    2: "😕",
    3: "😐",
    4: "🙂",
    5: "😄",
}


async def _get_uid(update, context):
    if context.user_data.get("uid"):
        return context.user_data["uid"]
    user = update.effective_user
    api = context.application.bot_data["api"]
    uid = await api.ensure_user(str(user.id), user.full_name)
    if uid:
        context.user_data["uid"] = uid
    return uid


def _format_entry(e: dict) -> str:
    """Single-entry HTML block for diary feed."""
    try:
        dt = datetime.fromisoformat(e["created_at"].replace("Z", ""))
        when = dt.strftime("%d.%m  %H:%M")
    except Exception:
        when = "—"
    mood = int(e.get("mood") or 0)
    glyph = _MOOD_GLYPH.get(mood, "·")
    sleep_q = e.get("sleep_quality")
    stress = e.get("stress")
    energy = e.get("energy")
    note = (e.get("note") or "").strip()

    head = (
        f"<b>{when}</b>  ·  {glyph} <b>{mood}</b>  "
        f"·  сон <b>{sleep_q}</b>  ·  энергия <b>{energy}</b>  ·  стресс <b>{stress}</b>"
    )
    if note:
        # Escape minimal HTML in the user-supplied note
        safe = (
            note.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
        )
        return head + f"\n<blockquote>{safe}</blockquote>"
    return head


async def history(update: Update, context: ContextTypes.DEFAULT_TYPE):
    uid = await _get_uid(update, context)
    if not uid:
        await update.message.reply_text(
            "Не смог получить профиль. Проверь API Orca.", reply_markup=main_menu()
        )
        return

    api = context.application.bot_data["api"]
    entries = await api.get_diary(uid)
    if entries is None:
        await update.message.reply_text(
            "Не смог получить дневник. Проверь API Orca.", reply_markup=main_menu()
        )
        return

    if not entries:
        intro = (
            "<b>История</b>\n"
            f"<i>{orca_voice.NARR_HISTORY}</i>\n\n"
            "Пока пусто. Запиши первое настроение через «Дневник» — и здесь появится лента."
        )
        await update.message.reply_text(intro, parse_mode="HTML", reply_markup=main_menu())
        return

    # Most recent first; show up to 7
    shown = entries[:7]
    streak = current_streak([e.get("created_at") for e in entries])

    blocks = [
        f"<b>История дневника</b>",
        f"<i>{orca_voice.NARR_HISTORY}</i>",
        "",
        depth_card(streak),
        "",
        "<b>Последние записи</b>",
    ]
    for e in shown:
        blocks.append(_format_entry(e))
        blocks.append("")
    if len(entries) > len(shown):
        blocks.append(f"<i>Всего записей: {len(entries)}. Показаны последние {len(shown)}.</i>")

    text = "\n".join(blocks).strip()
    # Telegram caption max 1024; text limit is 4096. We send as text (no photo).
    if len(text) > 4000:
        text = text[:3990] + "\n…"

    # Send the streak chart as a separate message after the text
    await update.message.reply_text(text, parse_mode="HTML", reply_markup=main_menu())
    try:
        chart = streak_chart([e.get("created_at") for e in entries])
        await update.message.reply_photo(photo=chart)
    except Exception:
        pass


def get_handlers():
    return [
        CommandHandler("history", history),
        MessageHandler(filters.Regex("^История$"), history),
    ]
