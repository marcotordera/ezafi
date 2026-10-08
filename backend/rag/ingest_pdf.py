import os
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
CHUNK_OVERLAP = 100     # Number of characters carried over to prevent cutting sentences

# Initialize the text splitter (splits on paragraphs first, then lines, then spaces)
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    separators=["\n\n", "\n", " ", ""]
)

def extract_chunks_from_pdf(pdf_path: Path):
    """
    Reads a PDF page by page, applies a 100-character carryover across page boundaries,
    and splits into ~1000 character chunks.
    """
    print(f"\n[Reading] {pdf_path.name} ...")
    reader = pypdf.PdfReader(str(pdf_path))
    chunks = []
    
    total_pages = len(reader.pages)
    print(f" -> Found {total_pages} pages.")

    carryover_text = ""

    for page_num, page in enumerate(reader.pages, start=1):
        raw_text = page.extract_text() or ""
        raw_text = raw_text.strip()
        
        # Skip truly blank pages
        if not raw_text:
            continue

        # Combine any carryover from previous page to prevent boundary cuts
        full_page_text = (carryover_text + " " + raw_text).strip() if carryover_text else raw_text

        # Split page content into 1000-char chunks with 100-char overlap
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

        # Save trailing characters for the next page's carryover
        carryover_text = full_page_text[-CHUNK_OVERLAP:] if len(full_page_text) >= CHUNK_OVERLAP else full_page_text

    print(f" -> Generated {len(chunks)} chunks (size: {CHUNK_SIZE}, overlap: {CHUNK_OVERLAP})")
    return chunks

def main():
    print("========================================")
    print("ezAFI PDF Ingestion & Sync")
    print(f"Chunk Size: {CHUNK_SIZE} | Overlap: {CHUNK_OVERLAP}")
    print("========================================")

    # 1. Connect to local Chroma database
    print(f"Connecting to database at: {DB_DIR}")
    client = chromadb.PersistentClient(path=str(DB_DIR))
    
    # Create or get collection
    collection = client.get_or_create_collection(
        name="usaf_regulations",
        metadata={"description": "Air Force Instructions and Manuals"}
    )

    # 2. Find all PDF files currently in the pdfs/ folder
    pdf_files = list(PDF_DIR.glob("*.pdf"))
    current_file_names = {f.name for f in pdf_files}

    # Sync: Clean up any files that were deleted from the pdfs/ folder
    existing = collection.get(include=["metadatas"])
    if existing and existing.get("metadatas"):
        indexed_sources = {m["source"] for m in existing["metadatas"] if "source" in m}
        removed_sources = indexed_sources - current_file_names
        for removed in removed_sources:
            print(f"\n[Sync] Removing deleted PDF from database: {removed}")
            collection.delete(where={"source": removed})

    if not pdf_files:
        print(f"No PDF files found in {PDF_DIR}")
        return

    print(f"Found {len(pdf_files)} PDF(s) to process:")
    for f in pdf_files:
        print(f" - {f.name}")

    # 3. Process each PDF and save into ChromaDB
    total_indexed = 0
    for pdf_file in pdf_files:
        chunks = extract_chunks_from_pdf(pdf_file)
        if not chunks:
            continue

        # Prepare batch for Chroma
        ids = [c["id"] for c in chunks]
        documents = [c["text"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]

        # Upsert into Chroma (in batches of 50 to keep it smooth)
        batch_size = 50
        for i in range(0, len(chunks), batch_size):
            end_idx = i + batch_size
            collection.upsert(
                ids=ids[i:end_idx],
                documents=documents[i:end_idx],
                metadatas=metadatas[i:end_idx]
            )
        
        total_indexed += len(chunks)
        print(f" -> Saved {len(chunks)} chunks into database.")

    print("\n========================================")
    print(f"SUCCESS! Total chunks indexed in database: {collection.count()}")
    print("========================================")

if __name__ == "__main__":
    main()
