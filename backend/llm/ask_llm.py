import sys
from pathlib import Path

# Add backend directory to sys.path so we can import rag modules
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Ensure Windows terminal can print unicode symbols cleanly
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import ollama
from rag.search_pdf import get_matching_chunks

# Default Model
DEFAULT_MODEL = "llama3.2:1b"

def ask(query_text: str, model: str = DEFAULT_MODEL, min_score: float = 0.30, max_chunks: int = 2) -> dict:
    """
    Run a RAG query against the ChromaDB vector store and synthesize an answer
    via Ollama.
    """
    # 1. Search matching chunks via rag layer
    matching_chunks = get_matching_chunks(query_text, max_chunks=max_chunks, min_score=min_score)

    if not matching_chunks:
        raise ValueError(
            f"No relevant Air Force Instruction policy met the "
            f"{int(min_score * 100)}% match threshold."
        )

    # 2. Assemble context blocks for the LLM
    context_blocks = []
    citations = []

    for c in matching_chunks:
        context_blocks.append(f"[{c['source']}, Page {c['page']}]:\n{c['text']}")
        citations.append({
            "source": c["source"],
            "page": c["page"],
            "score": c["score"],
            "text": c["text"],
        })

    combined_context = "\n\n---\n\n".join(context_blocks)

    # 3. Formulate the Grounded Military Prompt
    system_prompt = (
        "You are ezAFI, an expert regulatory guidance assistant for the U.S. Air Force.\n"
        "Your task is to answer the user's question accurately using ONLY the provided official AFI excerpts.\n\n"
        "RULES:\n"
        "1. Strict Grounding: Rely ONLY on the provided text. Do NOT speculate or make up unwritten rules.\n"
        "2. Precision: Distinguish between mandatory requirements ('SHALL', 'MUST', 'WILL NOT') and discretionary options ('MAY').\n"
        "3. Citations: You MUST cite the source publication and page number(s) provided in the context.\n"
        "4. Tone: Professional, direct, military-standard."
    )

    user_message = (
        f"OFFICIAL PUBLICATION CONTEXT:\n"
        f"{combined_context}\n\n"
        f"USER QUESTION:\n"
        f"{query_text}\n\n"
        "Provide a clear, direct answer with official citations."
    )

    # 4. Generate synthesis from Ollama
    try:
        response = ollama.chat(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            options={"temperature": 0.1}
        )
    except Exception as e:
        raise RuntimeError(f"Ollama error: {e}") from e

    answer = response["message"]["content"]

    return {
        "answer": answer,
        "citations": citations,
        "chunks_used": len(matching_chunks),
        "model": model
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        question = " ".join(sys.argv[1:])
    else:
        question = "Can I wear a mustache with a medical shaving waiver?"

    print("========================================")
    print("ezAFI Question & Answer Engine")
    print(f"Query:  \"{question}\"")
    print(f"Model:  {DEFAULT_MODEL}")
    print("========================================")

    try:
        result = ask(question)
        print("\n=================== DETERMINATION ===================")
        print(result["answer"])
        print("=====================================================")
        print("\nOfficial Sources Used:")
        for c in result["citations"]:
            print(f" * {c['source']} (Page {c['page']}) [Match: {c['score']}%]")
    except ValueError as e:
        print(f"\n[No Results] {e}")
    except RuntimeError as e:
        print(f"\n[Error] {e}")
        print("Make sure Ollama is running.")
