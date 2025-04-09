from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
from dotenv import load_dotenv
import os
from textwrap import dedent
from agno.agent import Agent, RunResponse
from agno.models.groq import Groq
from agno.tools.googlesearch import GoogleSearchTools
from agno.models.huggingface import HuggingFace
from models import CaseStudyInput, CaseStudyOutput  # absolute import, valid if in same dir

load_dotenv()

app = FastAPI()

# ✅ Fixed missing parenthesis
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Web search agent
websearch_agent = Agent(
    model=Groq(id="llama-3.3-70b-versatile"),
    tools=[GoogleSearchTools()],
    description="You are a web search agent...",
    instructions=[
        "Search through the web...",
        "Summarize the client info...",
    ],
    show_tool_calls=True,
    debug_mode=True,
    markdown=True
)

# Case study enhancer agent
enhancer_agent = Agent(
    model=Groq(id="llama-3.3-70b-versatile"),
    description="Expert in elaborating case studies...",
    instructions=dedent("""\
        You must EXCLUSIVELY work with the provided input data...
    """),
    markdown=True
)

@app.post("/generate_case_study")
async def generate_case_study(input_data: CaseStudyInput) -> CaseStudyOutput:
    try:
        client_info = input_data.client_name
        if not client_info:
            raise HTTPException(status_code=400, detail="Client name is required for Web Search")

        web_search_response: RunResponse = await websearch_agent.run(client_info)
        client_background = web_search_response.content if web_search_response and web_search_response.content else "No specific client information found on the web."

        formatted_input = input_data.model_dump_json(indent=4)
        enhancer_response: RunResponse = await enhancer_agent.run(formatted_input)

        final_response = f"""
        ## About {client_info}

        {client_background}

        ## Client Requirements

        {enhancer_response.content.get("client_requirements", "") if enhancer_response and enhancer_response.content else ""}

        ## Challenges Faced

        {enhancer_response.content.get("challenges_faced", "") if enhancer_response and enhancer_response.content else ""}

        ## Solution Provided

        {enhancer_response.content.get("solution_provided", "") if enhancer_response and enhancer_response.content else ""}

        ## Results Achieved

        {enhancer_response.content.get("results_achieved", "") if enhancer_response and enhancer_response.content else ""}
        """

        return CaseStudyOutput(generated_case_study={"result": final_response})

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
