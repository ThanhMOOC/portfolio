import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from app.routers.portfolio import router as portfolio_router

# Load environment variables
load_dotenv()

app = FastAPI()

# Cấu hình đường dẫn tuyệt đối để tránh lỗi khi chạy ở các thư mục khác nhau
# File này nằm ở portfolio/app/main.py
# BASE_DIR sẽ là .../portfolio/app
BASE_DIR = Path(__file__).resolve().parent

# CLIENT_DIR sẽ là .../portfolio/client
CLIENT_DIR = BASE_DIR.parent / "client"


def _configure_cors(application: FastAPI) -> None:
    origins = [os.getenv("CORS_ORIGIN", "*")]
    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


def _mount_static_files(application: FastAPI, client_dir: Path) -> None:
    if client_dir.exists():
        application.mount("/", StaticFiles(directory=str(client_dir), html=True), name="static")
    else:
        print(f"WARNING: Client directory not found at {client_dir}")

_configure_cors(app)

# API Routes
app.include_router(portfolio_router)

# Serve static files (HTML, CSS, JS)
# Kiểm tra folder tồn tại để tránh crash nếu chưa tạo
_mount_static_files(app, CLIENT_DIR)