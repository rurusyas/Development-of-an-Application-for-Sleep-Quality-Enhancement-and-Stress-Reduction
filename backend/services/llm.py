import os
import sys
from .content import articles_as_context

STUB_MESSAGE = "Configure LLM_API_KEY to enable AI responses"
ERROR_MESSAGE = "Не могу ответить сейчас. Попробуй ещё раз чуть позже."

SYSTEM_BASE = (
    "ты orca ai, ассистент исключительно по теме сна. "
    "отвечай ТОЛЬКО на вопросы о сне: гигиена сна, циркадные ритмы, бессонница, "
    "сонливость, апноэ, сновидения, режим, мелатонин, кофеин в контексте сна, "
    "стресс и концентрация — только в той части, где они напрямую влияют на сон. "
    "если вопрос НЕ про сон (программирование, политика, рецепты, фитнес, бизнес, что угодно ещё), "
    "вежливо откажись одной фразой: \"я отвечаю только на вопросы про сон\", и предложи переформулировать. "
    "не выдумывай факты, опирайся на материалы ниже. "
    "если вопрос медицинский и серьёзный, мягко советуй обратиться к специалисту. "
    "ВАЖНО про форматирование: пиши обычным текстом, без markdown. "
    "не используй ** для жирного, * для курсива, # для заголовков, ` для кода, - или * для списков. "
    "если нужен список — нумеруй цифрами или пиши через запятую. "
    "переносы строк допустимы для разделения мыслей.\n\n"
    "материалы:\n"
)


def _provider_key():
    anth = os.getenv("ANTHROPIC_API_KEY")
    oai = os.getenv("OPENAI_API_KEY")
    generic = os.getenv("LLM_API_KEY")
    if anth:
        return "anthropic", anth
    if oai:
        return "openai", oai
    if generic:
        if generic.startswith("sk-ant"):
            return "anthropic", generic
        return "openai", generic
    return None, None


def _system_prompt():
    return SYSTEM_BASE + articles_as_context()


async def stream_chat(message, history):
    provider, key = _provider_key()
    if not provider:
        yield STUB_MESSAGE
        return
    emitted = False
    try:
        if provider == "anthropic":
            async for chunk in _stream_anthropic(message, history, key):
                emitted = True
                yield chunk
        else:
            async for chunk in _stream_openai(message, history, key):
                emitted = True
                yield chunk
        if not emitted:
            yield ERROR_MESSAGE
    except Exception as e:
        print(f"[llm] {provider} error: {e}", file=sys.stderr, flush=True)
        if not emitted:
            yield ERROR_MESSAGE


async def _stream_anthropic(message, history, key):
    from anthropic import AsyncAnthropic

    client = AsyncAnthropic(api_key=key)
    msgs = [{"role": m.role, "content": m.content} for m in history]
    msgs.append({"role": "user", "content": message})
    async with client.messages.stream(
        model=os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001"),
        max_tokens=600,
        system=_system_prompt(),
        messages=msgs,
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def _stream_openai(message, history, key):
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=key)
    msgs = [{"role": "system", "content": _system_prompt()}]
    msgs += [{"role": m.role, "content": m.content} for m in history]
    msgs.append({"role": "user", "content": message})
    stream = await client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=msgs,
        max_tokens=600,
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
