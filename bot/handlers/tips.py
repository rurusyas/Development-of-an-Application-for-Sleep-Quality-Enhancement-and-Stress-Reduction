import html as html_mod

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from services import orca_voice


# Per-article emoji prefix
_ARTICLE_EMOJI = {
    "two-process-model":          "🌗",
    "circadian-rhythms":          "🕰",
    "light-melatonin":            "💡",
    "social-jetlag":              "🌐",
    "sleep-apnea":                "🫁",
    "stress-sleep":               "🌀",
    "sleep-deprivation-cognition":"🧠",
    "sleep-metabolism":           "🍎",
    "focus-flow":                 "🎯",
    "breathing-practices":        "🌬",
}


def _esc(s: str) -> str:
    """Escape user/content text for HTML parse mode."""
    return html_mod.escape(s, quote=False)


def _format_index(articles):
    """Top-level: list of cards with hook (summary), button to read full."""
    lines = [
        "<b>Советы по сну от Orca</b>",
        f"<i>{orca_voice.NARR_TIPS}</i>",
        "",
    ]
    buttons = []
    for a in articles:
        emoji = _ARTICLE_EMOJI.get(a["id"], "📘")
        title = _esc(a["title"])
        summary = _esc(a["summary"])
        lines.append(f"{emoji}  <b>{title}</b>")
        lines.append(f"{summary}")
        lines.append("")
        buttons.append([InlineKeyboardButton(f"{emoji}  {a['title']}", callback_data=f"article_{a['id']}")])

    lines.append(
        "<blockquote expandable>"
        "Все карточки опираются на конкретные исследования — ссылки на DOI/PubMed "
        "найдёшь внутри каждой. Если хочешь сразу длинное чтение — нажми кнопку с темой."
        "</blockquote>"
    )
    return "\n".join(lines), InlineKeyboardMarkup(buttons)


def _format_article(article):
    """Full article view: emoji + title + summary + expandable body + sources."""
    emoji = _ARTICLE_EMOJI.get(article["id"], "📘")
    title = _esc(article["title"])
    summary = _esc(article["summary"])
    body = _esc(article.get("body") or "").strip()
    sources = article.get("sources") or []

    parts = [
        f"{emoji}  <b>{title}</b>",
        "",
        f"<i>{summary}</i>",
        "",
    ]
    if body:
        # Expandable blockquote — single tap unfolds the science
        parts.append("<b>Подробнее</b>")
        parts.append(f"<blockquote expandable>{body}</blockquote>")
        parts.append("")
    if sources:
        parts.append("<b>Источники</b>")
        for s in sources:
            parts.append(f"• {_esc(s)}")
    parts.append("")
    parts.append("<i>↩ Вернись в меню или открой другую карточку.</i>")
    return "\n".join(parts)


async def sleep_tips(update: Update, context: ContextTypes.DEFAULT_TYPE):
    api = context.application.bot_data["api"]
    articles = await api.get_articles()
    if not articles:
        await update.message.reply_text("Советы пока недоступны. Проверь API Orca.")
        return
    context.application.bot_data["articles"] = {str(a["id"]): a for a in articles}
    text, markup = _format_index(articles)
    # If too long, send without keyboard buttons (very unlikely with 10 short hooks)
    if len(text) > 4000:
        text = text[:3990] + "\n…"
    await update.message.reply_text(text, parse_mode="HTML", reply_markup=markup)


async def article_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    article_id = (q.data or "").replace("article_", "", 1)

    article = context.application.bot_data.get("articles", {}).get(article_id)
    if not article:
        articles = await context.application.bot_data["api"].get_articles()
        if articles:
            context.application.bot_data["articles"] = {str(a["id"]): a for a in articles}
            article = context.application.bot_data["articles"].get(article_id)
    if not article:
        await q.message.reply_text("Не смог найти карточку.")
        return

    text = _format_article(article)
    if len(text) > 4000:
        text = text[:3990] + "\n…"
    await q.message.reply_text(text, parse_mode="HTML", disable_web_page_preview=True)


def get_handlers():
    return [
        CommandHandler("sleep_tips", sleep_tips),
        MessageHandler(filters.Regex("^Советы по сну$"), sleep_tips),
        CallbackQueryHandler(article_callback, pattern="^article_"),
    ]
