import sys
from pathlib import Path

import pypdf
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Directories (relative to backend/)
BACKEND_DIR = Path(__file__).resolve().parent.parent
PDF_DIR = BACKEND_DIR / "pdfs"
DB_DIR = BACKEND_DIR / "chroma_db"

# Chunking Configuration
CHUNK_SIZE = 1000       # Target maximum characters per chunk
CHUNK_OVERLAP = 100     # Shared characters between adjacent chunks

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    separators=["\n\n", "\n", " ", ""]
)

def add_single_pdf(filename: str):
    pdf_path = Path(filename)
    if not pdf_path.is_absolute():
        pdf_path = PDF_DIR / pdf_path.name

    # Validate file exists
    if not pdf_path.exists():
        print(f"\n[Error] File not found: {pdf_path}")
        print(f"Please place '{filename}' in the '{PDF_DIR}' directory.")
        return

    print("========================================")
    print("ezAFI: Ingest Single PDF")
    print(f"File:       {pdf_path.name}")
    print(f"Chunk Size: {CHUNK_SIZE} | Overlap: {CHUNK_OVERLAP}")
    print("========================================")

    # 1. Read PDF page by page with carryover
    reader = pypdf.PdfReader(str(pdf_path))
    chunks = []
    carryover_text = ""
    total_pages = len(reader.pages)
    print(f"Reading {total_pages} page(s)...")

    for page_num, page in enumerate(reader.pages, start=1):
        raw_text = page.extract_text() or ""
        raw_text = raw_text.strip()
        if not raw_text:
            continue

        full_page_text = (carryover_text + " " + raw_text).strip() if carryover_text else raw_text
        page_chunks = text_splitter.split_text(full_page_text)

        for chunk_idx, chunk_text in enumerate(page_chunks, start=1):
            chunk_id = f"{pdf_path.stem}_p{page_num}_c{chunk_idx}"
            chunks.append({
                "id": chunk_id,
                "text": chunk_text,
                "metadata": {
                    "source": pdf_path.name,
                    "publication": pdf_path.stem.upper(),
                    "page": page_num,
                    "chunk_index": chunk_idx,
                    "char_count": len(chunk_text)
                }
            })

        carryover_text = full_page_text[-CHUNK_OVERLAP:] if len(full_page_text) >= CHUNK_OVERLAP else full_page_text

    if not chunks:
        print(f"No readable text found in {filename}.")
        return

    # 2. Connect to database and check for existing version
    client = chromadb.PersistentClient(path=str(DB_DIR))
    collection = client.get_or_create_collection("usaf_regulations")

    existing = collection.get(where={"source": pdf_path.name})
    old_count = len(existing.get("ids", []))

    if old_count > 0:
        print(f"\n[Update] '{pdf_path.name}' already exists in database ({old_count} existing chunks).")
        print(" -> Purging old version to ensure no orphaned chunks remain...")
        collection.delete(where={"source": pdf_path.name})
    else:
        print(f"\n[New] '{pdf_path.name}' is a new document. Adding to database...")

    ids = [c["id"] for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]

    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        end_idx = i + batch_size
        collection.upsert(
            ids=ids[i:end_idx],
            documents=documents[i:end_idx],
            metadatas=metadatas[i:end_idx]
        )

    print(f"\n[SUCCESS] Added {len(chunks)} chunks from '{pdf_path.name}'.")
    print(f"Total chunks now in database: {collection.count()}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python add_pdf.py <filename.pdf>")
        print("Example: python add_pdf.py dafi36-9999_cat_ownership.pdf")
        sys.exit(1)

    target_filename = sys.argv[1]
    add_single_pdf(target_filename)
