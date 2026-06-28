from telegram import Update
from telegram.ext import (
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

from keyboards.menu import main_menu, scale_keyboard
from services import orca_voice


(
    SLEEP_HOURS,
    SLEEP_LATENCY,
    WAKE_FEELING,
    BEDTIME_REGULARITY,
    STRESS_FREQ,
    THOUGHTS_RACING,
    OVERLOAD,
    FOCUS_DIFFICULTY,
    DISTRACTION,
) = range(9)


CANCEL_TOKENS = {"Отмена", "отмена", "/cancel", "Cancel", "cancel"}


questions = [
    ("sleep_hours",
     "Сколько часов ты обычно спишь? Можно ответить числом, например <b>7.5</b>.",
     SLEEP_HOURS, "free"),
    ("sleep_latency_min",
     "За сколько минут ты обычно засыпаешь?",
     SLEEP_LATENCY, "free"),
    ("wake_feeling",
     "Как ты обычно чувствуешь себя после пробуждения? <b>1</b> — разбито, <b>5</b> — отлично.",
     WAKE_FEELING, "scale"),
    ("bedtime_regularity",
     "Насколько регулярно ты ложишься спать в одно и то же время? <b>1</b> — хаос, <b>5</b> — стабильно.",
     BEDTIME_REGULARITY, "scale"),
    ("stress_freq",
     "Как часто ты чувствуешь стресс? <b>1</b> — редко, <b>5</b> — почти постоянно.",
     STRESS_FREQ, "scale"),
    ("thoughts_racing",
     "Как часто мысли мешают расслабиться? <b>1</b> — редко, <b>5</b> — очень часто.",
     THOUGHTS_RACING, "scale"),
    ("overload",
     "Как часто ты чувствуешь перегруз? <b>1</b> — редко, <b>5</b> — очень часто.",
     OVERLOAD, "scale"),
    ("focus_difficulty",
     "Насколько сложно тебе концентрироваться? <b>1</b> — легко, <b>5</b> — очень сложно.",
     FOCUS_DIFFICULTY, "scale"),
    ("distraction",
     "Как часто отвлекаешься? <b>1</b> — редко, <b>5</b> — постоянно.",
     DISTRACTION, "scale"),
]


WELCOME = (
    "<b>Привет. Я Orca.</b>\n"
    "Косатка, которая плавает рядом и помогает тебе со сном, стрессом и фокусом.\n\n"
    "<i>Сейчас короткий онбординг — 9 вопросов на пару минут. "
    "Из ответов я посчитаю твои индексы Сна, Стресса и Фокуса. "
    "Их можно перепройти в любой момент командой /start.</i>\n\n"
    "<blockquote>"
    "Цифры — это не оценка тебя. Это начальная точка, от которой "
    "видно прогресс. Орка не судит — Орка плывёт рядом."
    "</blockquote>"
)


def _is_cancel(text: str) -> bool:
    return text.strip() in CANCEL_TOKENS


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data["onboarding"] = {}
    context.user_data["onboarding_state"] = 0
    await update.message.reply_text(WELCOME, parse_mode="HTML")
    first_q = questions[0]
    await update.message.reply_text(first_q[1], parse_mode="HTML")
    return first_q[2]


def parse_float(text):
    try:
        x = float(text.replace(",", "."))
        if x < 0:
            return None
        return x
    except ValueError:
        return None


def parse_scale(text):
    try:
        x = int(text)
        if 1 <= x <= 5:
            return x
        return None
    except ValueError:
        return None


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    context.user_data.pop("onboarding", None)
    context.user_data.pop("onboarding_state", None)
    await update.message.reply_text(
        "Окей, остановились. Можно вернуться к онбордингу командой /start.",
        reply_markup=main_menu(),
    )
    return ConversationHandler.END


async def save_answer(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if _is_cancel(text):
        return await cancel(update, context)
    state = context.user_data.get("onboarding_state", 0)
    key, _prompt, _state_id, kind = questions[state]

    if kind == "free":
        value = parse_float(text)
        if value is None:
            await update.message.reply_text("Нужно неотрицательное число. Например: <b>7.5</b>",
                                            parse_mode="HTML")
            return _state_id
    else:
        value = parse_scale(text)
        if value is None:
            await update.message.reply_text("Нужно число от 1 до 5.", reply_markup=scale_keyboard())
            return _state_id

    context.user_data["onboarding"][key] = value
    next_state = state + 1

    if next_state >= len(questions):
        import asyncio, sys, traceback
        user = update.effective_user
        api = context.application.bot_data["api"]
        uid_log = user.id if user else "?"
        print(f"[save_answer uid={uid_log}] entering final step", file=sys.stderr, flush=True)

        async def safe_reply(text, **kw):
            try:
                await asyncio.wait_for(update.message.reply_text(text, **kw), timeout=8.0)
                print(f"[save_answer uid={uid_log}] reply OK ({text[:40]!r})", file=sys.stderr, flush=True)
                return True
            except Exception as e:
                print(f"[save_answer uid={uid_log}] reply FAILED ({text[:40]!r}): {e!r}", file=sys.stderr, flush=True)
                return False

        await safe_reply("Считаю индексы…")

        data = None
        try:
            print(f"[save_answer uid={uid_log}] calling api.create_user", file=sys.stderr, flush=True)
            data = await asyncio.wait_for(
                api.create_user(str(user.id), user.full_name, context.user_data["onboarding"]),
                timeout=6.0,
            )
            print(f"[save_answer uid={uid_log}] api.create_user returned: {bool(data)}", file=sys.stderr, flush=True)
        except asyncio.TimeoutError:
            print(f"[save_answer uid={uid_log}] api.create_user TIMEOUT after 6s", file=sys.stderr, flush=True)
        except Exception as e:
            print(f"[save_answer uid={uid_log}] api.create_user EXC: {e!r}", file=sys.stderr, flush=True)
            traceback.print_exc(file=sys.stderr)

        # Compute local fallback ALWAYS (cheap), use it if backend failed
        idx_local = None
        try:
            from services.local_indices import compute_indices_local
            idx_local = compute_indices_local(context.user_data["onboarding"])
            print(f"[save_answer uid={uid_log}] local indices: {idx_local}", file=sys.stderr, flush=True)
        except Exception as e:
            print(f"[save_answer uid={uid_log}] local indices FAILED: {e!r}", file=sys.stderr, flush=True)
            traceback.print_exc(file=sys.stderr)

        if data:
            context.user_data["uid"] = data["id"]
            sleep_v = data.get("sleep_index")
            stress_v = data.get("stress_index")
            focus_v = data.get("focus_index")
            note = ""
        elif idx_local:
            sleep_v = idx_local["sleep_index"]
            stress_v = idx_local["stress_index"]
            focus_v = idx_local["focus_index"]
            note = " (локально — бэкенд не ответил вовремя)"
        else:
            sleep_v = stress_v = focus_v = "?"
            note = " (расчёт не удался)"

        # Plain text only, no HTML, no parse_mode — minimize failure surface
        result_text = (
            f"Готово, профиль создан{note}.\n\n"
            f"Индексы Orca:\n"
            f"Сон: {sleep_v}\n"
            f"Стресс: {stress_v}\n"
            f"Фокус: {focus_v}\n\n"
            f"Меню кнопок ниже. /help — команды."
        )
        sent = await safe_reply(result_text, reply_markup=main_menu())
        if not sent:
            # last-ditch ultra-short message
            await safe_reply("Профиль готов. Открой меню.", reply_markup=main_menu())

        context.user_data.pop("onboarding", None)
        context.user_data.pop("onboarding_state", None)
        print(f"[save_answer uid={uid_log}] returning END", file=sys.stderr, flush=True)
        return ConversationHandler.END

    context.user_data["onboarding_state"] = next_state
    q_key, q_prompt, _, q_kind = questions[next_state]
    markup = scale_keyboard() if q_kind == "scale" else None
    await update.message.reply_text(q_prompt, parse_mode="HTML", reply_markup=markup)
    return next_state


def get_handler():
    step = [MessageHandler(filters.TEXT & ~filters.COMMAND, save_answer)]
    return ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={s: step for s in range(9)},
        fallbacks=[
            CommandHandler("cancel", cancel),
            MessageHandler(filters.Regex("^Отмена$"), cancel),
        ],
        allow_reentry=True,
    )
