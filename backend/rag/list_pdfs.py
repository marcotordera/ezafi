from pathlib import Path
from collections import Counter

import chromadb

# Directories (relative to backend/)
BACKEND_DIR = Path(__file__).resolve().parent.parent
PDF_DIR = BACKEND_DIR / "pdfs"
DB_DIR = BACKEND_DIR / "chroma_db"

def get_indexed_docs_data() -> dict:
    """
    Returns a structured dict describing the indexed state of the ChromaDB collection.
    """
    if not DB_DIR.exists():
        return {"total_chunks": 0, "documents": [], "unindexed_on_disk": []}

    client = chromadb.PersistentClient(path=str(DB_DIR))
    try:
        collection = client.get_collection("usaf_regulations")
    except Exception:
        return {"total_chunks": 0, "documents": [], "unindexed_on_disk": []}

    total_chunks = collection.count()
    if total_chunks == 0:
        return {"total_chunks": 0, "documents": [], "unindexed_on_disk": []}

    results = collection.get(include=["metadatas"])
    metadatas = results.get("metadatas", [])

    file_counts = Counter()
    pub_names = {}
    max_pages = {}

    for meta in metadatas:
        source = meta.get("source", "Unknown")
        file_counts[source] += 1
        pub_names[source] = meta.get("publication", "N/A")
        page = meta.get("page", 0)
        if page > max_pages.get(source, 0):
            max_pages[source] = page

    disk_files = {f.name for f in PDF_DIR.glob("*.pdf")} if PDF_DIR.exists() else set()
    indexed_files = set(file_counts.keys())

    documents = [
        {
            "filename": source,
            "publication": pub_names.get(source, "N/A"),
            "chunk_count": count,
            "page_count": max_pages.get(source, 0),
            "on_disk": source in disk_files,
        }
        for source, count in file_counts.most_common()
    ]

    unindexed_on_disk = sorted(disk_files - indexed_files)

    return {
        "total_chunks": total_chunks,
        "documents": documents,
        "unindexed_on_disk": unindexed_on_disk,
    }

def list_indexed_documents():
    print("========================================")
    print("ezAFI Indexed Publications Status")
    print("========================================")

    data = get_indexed_docs_data()
    total_chunks = data["total_chunks"]
    print(f"Total Chunks in Database: {total_chunks}\n")

    if total_chunks == 0:
        print("Database is currently empty.")
        print("========================================")
        return

    print("Indexed in ChromaDB:")
    for doc in data["documents"]:
        print(f" * {doc['filename']:<32} -> {doc['chunk_count']:>4} chunks  ({doc['page_count']} pages)")

    if data["unindexed_on_disk"]:
        print("\n[Notice] Found PDF(s) in pdfs/ folder NOT yet indexed:")
        for u in data["unindexed_on_disk"]:
            print(f" ! {u} (Run 'python rag/add_pdf.py {u}' to index)")
    else:
        print("\nAll files in pdfs/ are indexed and in sync.")

    print("========================================")

if __name__ == "__main__":
    list_indexed_documents()
