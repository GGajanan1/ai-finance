"""Router: POST /api/chat"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain_groq import ChatGroq

router = APIRouter()

SYSTEM_PROMPT = """You are an expert AI Financial Analyst at a Hedge Fund.
You have access to real-time financial tools (financial ratios, stock news).
Answer questions about stocks, markets, economics, and financial concepts.
When analyzing specific stocks, use your tools to fetch current data.
Format responses in clean Markdown. Be concise but insightful."""


class ChatMsg(BaseModel):
    role:    str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMsg] = []


@router.post("/api/chat")
def chat(req: ChatRequest):
    try:
        from agent import get_financial_ratios, get_stock_news
        tools     = [get_financial_ratios, get_stock_news]
        tool_map  = {t.name: t for t in tools}

        llm_tools = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1).bind_tools(tools)

        # Build message list (cap history at 10 exchanges = 20 messages)
        messages = [HumanMessage(content=SYSTEM_PROMPT)]
        for m in req.history[-20:]:
            messages.append(
                HumanMessage(content=m.content) if m.role == "user"
                else AIMessage(content=m.content)
            )
        messages.append(HumanMessage(content=req.message))

        response    = llm_tools.invoke(messages)
        tools_used  = []

        # Execute any tool calls
        if getattr(response, "tool_calls", None):
            tool_messages = []
            for tc in response.tool_calls:
                if tc["name"] in tool_map:
                    result = tool_map[tc["name"]].invoke(tc["args"])
                    tool_messages.append(
                        ToolMessage(content=str(result), name=tc["name"], tool_call_id=tc["id"])
                    )
                    tools_used.append(tc["name"])

            # Second call with tool results included
            messages += [response] + tool_messages
            response  = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1).invoke(messages)

        return {"response": response.content, "tools_used": tools_used}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
