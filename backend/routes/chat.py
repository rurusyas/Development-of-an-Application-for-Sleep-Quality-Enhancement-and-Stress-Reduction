import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ..schemas import ChatIn
from ..services.llm import stream_chat

router = APIRouter(tags=["chat"])


@router.post("/chat")
async def chat(payload: ChatIn):
    async def event_source():
        async for chunk in stream_chat(payload.message, payload.history):
            yield "data: " + json.dumps({"delta": chunk}, ensure_ascii=False) + "\n\n"
        yield "data: " + json.dumps({"done": True}) + "\n\n"

    return StreamingResponse(event_source(), media_type="text/event-stream")
