from telegram import Update
from telegram.ext import CommandHandler, ContextTypes, MessageHandler, filters

from keyboards.menu import main_menu
from services import orca_voice
from services.charts import index_dial
from services.gamification import current_streak, depth_card


def _fmt(x):
    return "—" if x is None else str(x)


async def profile(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    tg_id = str(user.id)
    api = context.application.bot_data["api"]
    data = await api.get_user(tg_id)
    if not data:
        uid = await api.ensure_user(tg_id, user.full_name)
        if not uid:
            await update.message.reply_text(
                "Не смог получить профиль. Проверь API Orca.", reply_markup=main_menu()
            )
            return
        data = await api.get_user(tg_id)
    if not data:
        await update.message.reply_text(
            "Не смог получить профиль. Проверь API Orca.", reply_markup=main_menu()
        )
        return

    context.user_data["uid"] = data["id"]
    name = data.get("name") or "Без имени"
    sleep_idx = data.get("sleep_index")
    stress_idx = data.get("stress_index")
    focus_idx = data.get("focus_index")

    # Compute streak from diary entries
    entries = await api.get_diary(data["id"]) or []
    streak = current_streak([e.get("created_at") for e in entries])

    head = (
        f"<b>Профиль · {name}</b>\n"
        f"<i>{orca_voice.NARR_PROFILE}</i>\n\n"
        f"{depth_card(streak)}\n\n"
        f"<b>Индексы Orca</b> <i>(0–100, выше — лучше)</i>\n"
        f"• Сон  <b>{_fmt(sleep_idx)}</b>\n"
        f"• Стресс  <b>{_fmt(stress_idx)}</b>\n"
        f"• Фокус  <b>{_fmt(focus_idx)}</b>\n\n"
        "<blockquote expandable>"
        "Индексы рассчитаны по твоим ответам на онбординге (часы сна, "
        "латентность засыпания, утреннее самочувствие, регулярность, частота "
        "стресса и т.п.). Это rule-based значения, не клинические оценки.\n"
        "Перепройти онбординг можно командой /start."
        "</blockquote>"
    )

    # Build a dial chart if we have meaningful index values
    has_indices = any(v is not None and float(v) > 0 for v in (sleep_idx, stress_idx, focus_idx))
    if has_indices:
        try:
            chart = index_dial(
                float(sleep_idx or 0),
                float(stress_idx or 0),
                float(focus_idx or 0),
            )
        except Exception:
            chart = None
        if chart is not None and len(head) <= 1024:
            await update.message.reply_photo(
                photo=chart, caption=head, parse_mode="HTML", reply_markup=main_menu()
            )
            return
        if chart is not None:
            await update.message.reply_text(head, parse_mode="HTML", reply_markup=main_menu())
            await update.message.reply_photo(photo=chart)
            return

    await update.message.reply_text(head, parse_mode="HTML", reply_markup=main_menu())


def get_handlers():
    return [
        CommandHandler("profile", profile),
        MessageHandler(filters.Regex("^Профиль$"), profile),
    ]
