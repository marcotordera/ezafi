"""
ezAFI Pydantic Schemas
======================
Data contracts for public API request and response models.
"""

from typing import List, Union
from pydantic import BaseModel


class Citation(BaseModel):
    source: str
    page: Union[int, str]
    score: float          # Match percentage, e.g. 87.3
    text: str             # Full text excerpt of the retrieved chunk


class HealthResponse(BaseModel):
    status: str           # "ok" | "degraded"
    ollama_reachable: bool
    db_chunk_count: int
    default_model: str


class DocumentInfo(BaseModel):
    filename: str
    publication: str
    chunk_count: int
    page_count: int
    on_disk: bool


class DocumentsResponse(BaseModel):
    total_chunks: int
    documents: List[DocumentInfo]
    unindexed_on_disk: List[str]


class AskRequest(BaseModel):
    query: str



class AskResponse(BaseModel):
    query: str
    model: str
    answer: str
    citations: List[Citation]
    chunks_used: int
