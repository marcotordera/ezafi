import uvicorn
from pathlib import Path

if __name__ == "__main__":
    backend_dir = Path(__file__).resolve().parent
    print("Starting ezAFI API server at http://127.0.0.1:8000 ...")
    print("Interactive Swagger docs: http://127.0.0.1:8000/docs")
    uvicorn.run(
        "api.app:app",
        app_dir=str(backend_dir),
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
