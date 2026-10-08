"""
ezAFI FastAPI Application
=========================
Public API for Air Force Instructions Q&A.
Run with:  uvicorn api.app:app --reload --port 8000
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import ollama as ollama_client
import chromadb
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from api.schemas import HealthResponse, DocumentsResponse, AskRequest, AskResponse, Citation
from llm.ask_llm import ask, DEFAULT_MODEL
from rag.list_pdfs import get_indexed_docs_data

DB_DIR = BACKEND_DIR / "chroma_db"

app = FastAPI(
    title="ezAFI API",
    description="Public RAG Q&A API for U.S. Air Force Instructions",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health():
    ollama_ok = False
    try:
        ollama_client.list()
        ollama_ok = True
    except Exception:
        pass

    db_count = 0
    try:
        client = chromadb.PersistentClient(path=str(DB_DIR))
        col = client.get_collection("usaf_regulations")
        db_count = col.count()
    except Exception:
        pass

    return HealthResponse(
        status="ok" if ollama_ok else "degraded",
        ollama_reachable=ollama_ok,
        db_chunk_count=db_count,
        default_model=DEFAULT_MODEL,
    )


@app.get("/documents", response_model=DocumentsResponse, tags=["Documents"])
def get_documents():
    """
    Returns indexed publications in ChromaDB along with chunk counts, page counts,
    and any unindexed PDFs found on disk.
    """
    return get_indexed_docs_data()


@app.post("/ask", response_model=AskResponse, tags=["Q&A"])
def ask_question(req: AskRequest):
    try:
        result = ask(query_text=req.query)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))

    citations = [Citation(**c) for c in result["citations"]]
    return AskResponse(
        query=req.query,
        model=result["model"],
        answer=result["answer"],
        citations=citations,
        chunks_used=result["chunks_used"],
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.app:app", host="0.0.0.0", port=8000, reload=True)
