# HMS AI Finance Toolkit

HMS AI Finance Toolkit is a comprehensive, open-source AI-driven financial analysis platform inspired by the "AI Finance Guide" by @deepthinksfinance. The goal of this project is to bridge the gap between retail investors and hedge funds by leveraging open-source AI tools (like FinGPT and FinBERT) alongside free financial data APIs (like yfinance, FRED, NSEpy, and CoinGecko).

## 🚀 Architecture

This project is structured as a modern full-stack application composed of three main services:

- **Frontend (`/frontend`)**: A React application built with Vite. It features real-time financial charting using `Chart.js` and `lightweight-charts`, interactive UI elements with `lucide-react`, and internationalization support.
- **Backend (`/backend`)**: A Node.js / Express server handling user authentication via Google OAuth 2.0 and storing user settings in MongoDB.
- **ML Service (`/ml-service`)**: A Python-based FastAPI backend powered by `Langchain`, `LangGraph`, and Hugging Face `transformers`. It acts as the financial data aggregation and AI reasoning engine, connecting to multiple APIs and running sentiment analysis or trading signals.

## ✨ Features

- **Open-Source Financial AI**: Integrates powerful LLMs and AI agents to process financial text, extract sentiment, and reason over data.
- **Robust Data Integration**: Pulls data seamlessly from yfinance (Equities, Forex), FRED (Macroeconomic indicators), NSEpy (Indian Markets), CoinGecko (Crypto), and the World Bank.
- **Agentic Workflows**: Uses LangGraph to orchestrate multi-step reasoning for complex financial queries (inspired by FinQA).
- **Secure Authentication**: Ready-to-use Google OAuth and JWT-based session management.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+)
- [Python 3.9+](https://www.python.org/)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Redis](https://redis.io/) (for ML service caching/queuing)

## 📦 Setup & Installation

### 1. ML Service (Python / FastAPI)
The ML service acts as the intelligence layer for data retrieval and AI processing.

```bash
cd ml-service
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Check the .env file for required API keys (e.g., GROQ_API_KEY, FRED_API_KEY, etc.)

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```

### 2. Backend (Node.js / Express)
The backend handles user sessions, OAuth, and profile management.

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in your MONGODB_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, etc.

# Start the development server
npm run dev
```

### 3. Frontend (React / Vite)
The frontend serves the user interface and interactive charts.

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Fill in your VITE_API_BASE_URL, VITE_ML_SERVICE_URL, etc.

# Start the frontend
npm run dev
```

## 📖 Inspiration
This project operationalizes the concepts presented in the *AI Finance Guide V2.1*:
> *"Finance has always been an information game. The person with better data, faster analysis, and cooler nerves wins. AI does not change the game. It compresses timelines from days to milliseconds."*

By combining free tools and APIs, the HMS AI Finance Toolkit delivers institutional-grade analytics to your local environment.

## 📄 License
This project is open-source. Please ensure compliance with the terms of service of the individual APIs (e.g., Yahoo Finance, FRED, Alpha Vantage) when deploying to production.
