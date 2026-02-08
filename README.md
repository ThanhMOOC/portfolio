# Quick Start: Dự án Portfolio (FastAPI)

Cài đặt lần đầu (Chỉ làm 1 lần)

## Tạo môi trường ảo:
python3 -m venv .venv

## Kích hoạt môi trường:

Windows: ..venv\Scripts\activate

Mac/Linux: source .venv/bin/activate

## Cài đặt thư viện:
pip install -r requirements.txt

# Chạy dự án (Hàng ngày)

Bước 1: Mở Terminal tại thư mục dự án (thư mục portfolio).

Bước 2: Kích hoạt venv.

Bước 3: Chạy server (Lưu ý đường dẫn app.main):

uvicorn app.main:app --reload

Truy cập: http://127.0.0.1:8000