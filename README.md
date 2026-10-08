# ezAFI - Regulatory Guidance RAG Engine

**ezAFI** is a RAG (Retrieval-Augmented Generation) system for U.S. Air Force Instructions (AFIs) and Manuals (DAFMANs), organized cleanly into 3 dedicated subfolders: **`api/`**, **`rag/`**, and **`llm/`**.

---

## 📁 Project Structure

```text
EZAFI/
├── backend/
│   ├── api/
│   │   ├── app.py           # Public FastAPI server (/health & /ask)
│   │   └── schemas.py       # Pydantic data models
│   │
│   ├── rag/
│   │   ├── ingest_pdf.py    # Batch ingest and synchronize all PDFs in pdfs/
│   │   ├── add_pdf.py       # Ingest a single PDF file
│   │   ├── search_pdf.py    # Vector similarity search viewer
│   │   ├── list_pdfs.py     # Check database indexing status
│   │   └── remove_pdf.py    # Remove a PDF from ChromaDB
│   │
│   ├── llm/
│   │   └── ask_llm.py       # Grounded Q&A determination engine (Ollama)
│   │
│   ├── pdfs/                # Source PDF files
│   ├── chroma_db/           # ChromaDB vector store
│   └── requirements.txt     # Python dependencies
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.10+**
- **[Ollama](https://ollama.com/)** running locally with `llama3.2:latest`:
  ```bash
  ollama pull llama3.2:latest
  ```

### 2. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

---

## 💻 CLI Commands by Layer

Inside `backend/`:

### 📚 RAG / Retrieval Layer (`rag/`)
* **Sync / Ingest all PDFs in `pdfs/`**:
  ```bash
  python rag/ingest_pdf.py
  ```
* **Add a single PDF**:
  ```bash
  python rag/add_pdf.py dafi36-2903.pdf
  ```
* **Check database status**:
  ```bash
  python rag/list_pdfs.py
  ```
* **Vector similarity search**:
  ```bash
  python rag/search_pdf.py "grooming standards" --max 3 --score 50
  ```
* **Remove a document from the database**:
  ```bash
  python rag/remove_pdf.py <filename.pdf>
  ```

### 🤖 LLM Layer (`llm/`)
* **Ask a question directly in terminal**:
  ```bash
  python llm/ask_llm.py "Can I wear a mustache with a medical shaving waiver?"
  ```

---

## 🌐 Public FastAPI Backend (`api/`)

Start the API server:
```bash
cd backend
python run.py
```

*Or directly with uvicorn:*
```bash
cd backend
uvicorn api.app:app --reload --port 8000
```

Interactive API documentation:
* **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Public Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Liveness check & database chunk count |
| `GET` | `/documents` | Indexed publications, chunk counts & sync status |
| `POST` | `/ask` | Grounded RAG determination with official citations |
