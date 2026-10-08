import sys
from pathlib import Path
import argparse

import chromadb

# Ensure Windows terminal can print unicode symbols cleanly
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Directories (relative to backend/)
BACKEND_DIR = Path(__file__).resolve().parent.parent
DB_DIR = BACKEND_DIR / "chroma_db"

def get_matching_chunks(query_text: str, max_chunks: int = 10, min_score: float = 0.50):
    """
    Reusable search engine for ChromaDB.
    Returns a list of dicts for all chunks meeting the minimum similarity score.
    """
    if not DB_DIR.exists():
        return []

    client = chromadb.PersistentClient(path=str(DB_DIR))
    try:
        collection = client.get_collection("usaf_regulations")
    except Exception:
        return []

    results = collection.query(
        query_texts=[query_text],
        n_results=max_chunks
    )

    if not results or not results["documents"] or not results["documents"][0]:
        return []

    docs = results["documents"][0]
    metas = results["metadatas"][0]
    ids = results["ids"][0]
    distances = results["distances"][0]

    matched_chunks = []
    for doc_id, meta, text, dist in zip(ids, metas, docs, distances):
        # Cosine similarity on normalized vectors: 1.0 - (L2_distance / 2.0)
        similarity = round(max(0.0, 1.0 - (dist / 2.0)), 3)
        match_pct = round(similarity * 100, 1)

        if similarity >= min_score:
            matched_chunks.append({
                "id": doc_id,
                "source": meta.get("source", "AFI"),
                "page": meta.get("page", "?"),
                "publication": meta.get("publication", "N/A"),
                "char_count": meta.get("char_count", len(text)),
                "score": match_pct,
                "raw_similarity": similarity,
                "distance": round(dist, 3),
                "text": text.strip()
            })

    return matched_chunks

def print_search_results(query_text: str, max_chunks: int = 10, min_score: float = 0.50):
    """CLI runner to print search results in a clean format."""
    print("========================================")
    print("ezAFI Filtered Vector Search")
    print(f"Query:        \"{query_text}\"")
    print(f"Max Chunks:   {max_chunks}")
    print(f"Min Match:    {int(min_score * 100)}%")
    print("========================================")

    chunks = get_matching_chunks(query_text, max_chunks=max_chunks, min_score=min_score)

    print(f"\nResults: Found {len(chunks)} chunk(s) meeting >= {int(min_score * 100)}% match:\n")

    if not chunks:
        print("No chunks reached the minimum match threshold.")
        print("Tip: Try lowering the threshold or using different keywords.")
        return

    for i, c in enumerate(chunks, start=1):
        print(f"--- [Match #{i}] Match: {c['score']}% (Distance: {c['distance']}) ---")
        print(f"Source:      {c['source']} (Page {c['page']})")
        print(f"Chunk ID:    {c['id']}")
        print(f"Characters:  {c['char_count']}")
        print("\nExcerpt:")
        print(c["text"])
        print("-" * 50 + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ezAFI Search with Similarity Filtering")
    parser.add_argument("query", nargs="?", default="Can I wear a mustache with a medical shaving waiver?", help="Search question")
    parser.add_argument("--max", type=int, default=10, help="Max chunks to retrieve (default: 10)")
    parser.add_argument("--score", type=int, default=50, help="Minimum match percentage threshold (default: 50)")
    args = parser.parse_args()

    print_search_results(args.query, max_chunks=args.max, min_score=args.score / 100.0)
