import sys
from pathlib import Path

import chromadb

# Directories (relative to backend/)
BACKEND_DIR = Path(__file__).resolve().parent.parent
DB_DIR = BACKEND_DIR / "chroma_db"

def remove_single_pdf(filename: str):
    # Ensure we use just the filename, even if a full path was passed
    clean_filename = Path(filename).name

    print("========================================")
    print("ezAFI: Remove Single PDF from Database")
    print(f"Target: {clean_filename}")
    print("========================================")

    # 1. Connect to local Chroma database
    client = chromadb.PersistentClient(path=str(DB_DIR))
    try:
        collection = client.get_collection("usaf_regulations")
    except Exception:
        print("Database or collection not found.")
        return

    initial_count = collection.count()

    # 2. Check if chunks exist for this source
    existing = collection.get(where={"source": clean_filename})
    matched_ids = existing.get("ids", [])

    if not matched_ids:
        print(f"\n[Notice] No chunks found for '{clean_filename}' in database.")
        print(f"Total chunks in database: {initial_count}")
        return

    # 3. Delete only the chunks belonging to this PDF
    print(f"Found {len(matched_ids)} chunk(s) for '{clean_filename}'. Deleting...")
    collection.delete(where={"source": clean_filename})

    final_count = collection.count()
    print(f"\n[SUCCESS] Removed {len(matched_ids)} chunks for '{clean_filename}'.")
    print(f"Remaining total chunks in database: {final_count}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python remove_pdf.py <filename.pdf>")
        print("Example: python remove_pdf.py dafi36-9999_cat_ownership.pdf")
        sys.exit(1)

    target_filename = sys.argv[1]
    remove_single_pdf(target_filename)
