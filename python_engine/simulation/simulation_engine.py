import os
import sys

# Adding the parent directory to sys.path so we can import rag_query
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from rag.rag_query import get_protocol

from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from typing import TypedDict, Dict, Any

class ScenarioGenerator:
    def __init__(self, llm: BaseLanguageModel):
        self.llm = llm
        
        # Prompt to generate a medical scenario based on RAG protocols
        self.scenario_prompt = PromptTemplate(
            template="""You are an expert medical simulation designer for rural health workers (ASHA workers).
Using the following official medical protocol context, generate a realistic patient scenario for a simulation.
The scenario should be tailored to the specified difficulty level.
Difficulty Level: {difficulty} (1-10, where 1 is very basic and 10 is complex/multiple symptoms)
Topic: {topic}

Official Medical Protocol Context:
{context}

Output a JSON object with three keys:
1. "scenario": The detailed description of the patient, their symptoms, and the setting.
2. "options": A dictionary containing precisely 4 options (keys: "A", "B", "C", "D") representing possible actions the health worker could take. Only ONE option should be fully correct according to the context. The others should be plausible distractors.
3. "correct_option": The key of the correct option (e.g., "A", "B", "C", or "D").

JSON Output:""",
            input_variables=["difficulty", "topic", "context"]
        )
        self.scenario_chain = self.scenario_prompt | self.llm | JsonOutputParser()

    def generate(self, topic: str, difficulty: int) -> Dict[str, Any]:
        """Fetch protocol from RAG and generate a scenario via LLM."""
        print(f"Fetching RAG context for topic: '{topic}'...")
        context = get_protocol(topic)
        
        print(f"Generating scenario (Difficulty {difficulty}/10)...")
        response = self.scenario_chain.invoke({
            "difficulty": difficulty,
            "topic": topic,
            "context": context
        })
        
        return {
            "scenario": response.get("scenario", "Error generating scenario."),
            "options": response.get("options", {}),
            "correct_option": response.get("correct_option", ""),
            "context": context  # We return context so the analytics engine can grade against it
        }

class PerformanceAnalytics:
    def __init__(self, llm: BaseLanguageModel):
        self.llm = llm
        
        # Prompt to evaluate user performance against protocol
        self.evaluation_prompt = PromptTemplate(
            template="""You are an expert medical evaluator assessing a rural health worker's response to a simulation.
You must evaluate their choice based on the provided Official Medical Protocol Context.

Scenario Presented:
{scenario}

User's Selected Option:
{user_choice}

Correct Option according to generator:
{correct_option}

Official Medical Protocol Context:
{context}

Provide a JSON object evaluating the performance with the following keys:
1. "feedback": A detailed, constructive paragraph explaining why their choice was correct or incorrect based strictly on the protocol, and what the correct protocol actually is.
2. "passed": A boolean (true if their selected option matches the correct option, false otherwise).

JSON Output:""",
            input_variables=["scenario", "user_choice", "correct_option", "context"]
        )
        self.eval_chain = self.evaluation_prompt | self.llm | JsonOutputParser()

    def evaluate(self, scenario: str, user_choice: str, correct_option: str, context: str) -> Dict[str, Any]:
        """Evaluate the user's multiple choice selection."""
        print("Evaluating response against RAG protocols...")
        response = self.eval_chain.invoke({
            "scenario": scenario,
            "user_choice": user_choice,
            "correct_option": correct_option,
            "context": context
        })
        return response

class AdaptiveEngine:
    def __init__(self, initial_difficulty: int = 3):
        self.current_difficulty = initial_difficulty
        self.history = []

    def update(self, score: int):
        """Adjust difficulty based on the score received."""
        self.history.append(score)
        
        if score >= 85:
            self.current_difficulty = min(10, self.current_difficulty + 2)
            print("Excellent performance! Increasing difficulty significantly.")
        elif score >= 70:
            self.current_difficulty = min(10, self.current_difficulty + 1)
            print("Good performance. Increasing difficulty slightly.")
        elif score < 40:
            self.current_difficulty = max(1, self.current_difficulty - 2)
            print("Poor performance. Decreasing difficulty for reinforcement.")
        else:
            self.current_difficulty = max(1, self.current_difficulty - 1)
            print("Sub-optimal performance. Decreasing difficulty slightly.")
            
    def get_difficulty(self) -> int:
        return self.current_difficulty
