import sys
sys.path.append("../")

import os
from dotenv import load_dotenv

# Ensure the Google API key is loaded
load_dotenv()

if not os.getenv("GOOGLE_API_KEY"):
    print("WARNING: GOOGLE_API_KEY environment variable not found.")
    print("Please set it in your environment or a .env file to run the simulation.")
    print("Example: export GOOGLE_API_KEY='your-gemini-key'")
    exit(1)

from simulation_engine import ScenarioGenerator, PerformanceAnalytics, AdaptiveEngine
from langchain_google_genai import ChatGoogleGenerativeAI

def main():
    print("==================================================")
    print("   Sushrusha Adaptive Simulation Engine (RAG)     ")
    print("==================================================")
    
    # Initialize the LLM using Google Gemini
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)
    
    generator = ScenarioGenerator(llm)
    analytics = PerformanceAnalytics(llm)
    adaptive_engine = AdaptiveEngine(initial_difficulty=3)
    
    topics = [
        "snake bite first aid for rural health worker",
        "diarrhea management in children",
        "TB medication administration"
    ]
    
    print("\nWelcome to the adaptive training simulation.")
    print("You will be presented with scenarios based on official ASHA protocols.")
    print("Type 'quit' at any time to exit.\n")
    
    for round_num, topic in enumerate(topics, 1):
        print(f"\n--- Round {round_num} ---")
        difficulty = adaptive_engine.get_difficulty()
        
        # 1. Generate Scenario based on RAG Context
        try:
            scenario_data = generator.generate(topic, difficulty)
        except Exception as e:
            import traceback
            traceback.print_exc()
            break
            
        scenario_text = scenario_data["scenario"]
        options = scenario_data["options"]
        correct_option = scenario_data["correct_option"]
        protocol_context = scenario_data["context"]
        
        print(f"\n[SCENARIO - Difficulty {difficulty}/10]")
        print(scenario_text)
        print("\nOptions:")
        for key, text in options.items():
            print(f"  {key}) {text}")
        print("-" * 50)
        
        # 2. Get User Response
        user_response = ""
        while user_response not in ['a', 'b', 'c', 'd', 'quit', 'exit']:
            user_response = input("\nSelect your action (A/B/C/D) or 'quit': ").strip().lower()
            
        if user_response in ['quit', 'exit']:
            break
            
        user_choice_key = user_response.upper()
        user_choice_text = options.get(user_choice_key, "Unknown")
            
        # 3. Evaluate Performance
        try:
            evaluation = analytics.evaluate(
                scenario=scenario_text,
                user_choice=user_choice_text,
                correct_option=options.get(correct_option, "Unknown"),
                context=protocol_context
            )
        except Exception as e:
            print(f"Error evaluating response: {e}")
            break
            
        passed = evaluation.get("passed", False)
        score = 100 if passed else 0
        feedback = evaluation.get("feedback", "No feedback available.")
        
        print(f"\n[EVALUATION]")
        print(f"Result: {'✅ CORRECT' if passed else '❌ INCORRECT'}")
        print(f"Feedback: {feedback}")
        
        # 4. Adapt Difficulty
        adaptive_engine.update(score)
        
    print("\nSimulation Session Complete. Good work!")

if __name__ == "__main__":
    main()
