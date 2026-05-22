import os
from typing import TypedDict, Annotated, Sequence
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END
from langchain_core.tools import tool
import yfinance as yf

# Define the State for LangGraph
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]

# Define Tools
@tool
def get_financial_ratios(ticker: str) -> str:
    """Gets basic financial ratios for a given stock ticker."""
    try:
        t = yf.Ticker(ticker)
        info = t.info
        metrics = {
            "Market Cap": info.get("marketCap", "N/A"),
            "Trailing PE": info.get("trailingPE", "N/A"),
            "Forward PE": info.get("forwardPE", "N/A"),
            "Price to Book": info.get("priceToBook", "N/A"),
            "EBITDA": info.get("ebitda", "N/A"),
            "Debt to Equity": info.get("debtToEquity", "N/A"),
            "Return on Equity": info.get("returnOnEquity", "N/A"),
            "52 Week High": info.get("fiftyTwoWeekHigh", "N/A"),
            "52 Week Low": info.get("fiftyTwoWeekLow", "N/A"),
        }
        return str(metrics)
    except Exception as e:
        return f"Error fetching financials: {e}"

@tool
def get_stock_news(ticker: str) -> str:
    """Gets the latest news headlines from Yahoo Finance for a given stock ticker."""
    try:
        t = yf.Ticker(ticker)
        news = t.news
        if not news:
            return "No news found on Yahoo Finance."
        headlines = [f"{item['content']['title']} - {item['content']['provider']['displayName']}" for item in news[:5]]
        return "\\n".join(headlines)
    except Exception as e:
        return f"Error fetching news: {e}"

tools = [get_financial_ratios, get_stock_news]

# Initialize Model
def get_llm():
    return ChatGroq(model="llama-3.1-8b-instant", temperature=0.1)

# Node: Call Model
def call_model(state: AgentState):
    messages = state['messages']
    # Bind tools
    llm = get_llm().bind_tools(tools)
    response = llm.invoke(messages)
    return {"messages": [response]}

# Node: Execute Tools
def execute_tools(state: AgentState):
    messages = state['messages']
    last_message = messages[-1]
    
    # We construct a ToolNode manually for simplicity
    from langchain_core.messages import ToolMessage
    
    tool_messages = []
    if hasattr(last_message, "tool_calls"):
        for tool_call in last_message.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            
            tool_instance = next(t for t in tools if t.name == tool_name)
            try:
                result = tool_instance.invoke(tool_args)
                tool_messages.append(ToolMessage(content=str(result), name=tool_name, tool_call_id=tool_call["id"]))
            except Exception as e:
                tool_messages.append(ToolMessage(content=str(e), name=tool_name, tool_call_id=tool_call["id"]))
                
    return {"messages": tool_messages}

# Edge mapping
def should_continue(state: AgentState):
    messages = state['messages']
    last_message = messages[-1]
    if getattr(last_message, 'tool_calls', None):
        return "continue"
    return "end"

# Build Graph
def build_agent():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", execute_tools)
    
    workflow.set_entry_point("agent")
    
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "continue": "tools",
            "end": END
        }
    )
    
    workflow.add_edge("tools", "agent")
    
    return workflow.compile()

app_agent = build_agent()

PERIOD_LABELS = {
    "1W": "1 week", "1M": "1 month",
    "3M": "3 months", "6M": "6 months", "1Y": "1 year",
}

def run_analyst_agent(ticker: str, period: str = "1W") -> str:
    label = PERIOD_LABELS.get(period.upper(), "1 week")
    prompt = f"""You are a professional Hedge Fund AI Analyst.
The user wants a fundamental and sentiment analysis of: **{ticker}**
They are currently viewing **{label}** of price data — tailor your analysis to this timeframe.

Use the provided tools to:
1. Fetch basic financial ratios.
2. Fetch latest stock-specific news.

Produce a professional Markdown report structured as:
## Executive Summary ({label} view)
## Financial Health
## Recent News & Sentiment
## AI Investment Thesis
Do not hallucinate data. If something is unavailable, say so."""

    inputs = {"messages": [HumanMessage(content=prompt)]}
    final_state = app_agent.invoke(inputs)
    return final_state["messages"][-1].content
