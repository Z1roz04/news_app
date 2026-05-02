from typing import Literal, Optional, List

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class AiChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="用户输入")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="历史消息")
    stream: bool = Field(default=False, description="是否流式")


class AiChatReply(BaseModel):
    reply: str = Field(..., description="模型回复正文")
