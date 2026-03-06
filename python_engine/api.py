from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from simulation.simulation_engine import ScenarioGenerator, PerformanceAnalytics
from langchain_google_genai import ChatGoogleGenerativeAI

# Load the root project .env file instead of just the python folder's
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=env_path)

# LangChain uses GOOGLE_API_KEY, but Next.js uses GEMINI_API_KEY
if not os.environ.get("GOOGLE_API_KEY") and os.environ.get("GEMINI_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Initializing LangChain and FAISS Vectorstore...")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)
generator = ScenarioGenerator(llm)
analytics = PerformanceAnalytics(llm)
print("Initialization complete. API ready.")

class GenerateRequest(BaseModel):
    topic: str
    difficulty: int = 3

class EvaluateRequest(BaseModel):
    scenario: str
    user_choice: str
    correct_option: str
    context: str

@app.post("/generate")
async def generate_scenario(req: GenerateRequest):
    try:
        result = generator.generate(req.topic, req.difficulty)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate")
async def evaluate_response(req: EvaluateRequest):
    try:
        result = analytics.evaluate(req.scenario, req.user_choice, req.correct_option, req.context)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
