from fastapi import APIRouter, HTTPException

from app.services.cloudinary import CloudinaryService

router = APIRouter(prefix="/image-url")


def _handle_service_call(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/portfolio")
async def get_portfolio_tree():
    return _handle_service_call(CloudinaryService.fetch_portfolio_tree)


@router.get("/background")
async def get_background_image():
    return _handle_service_call(CloudinaryService.fetch_background_image)


@router.get("/{folder}")
async def get_images_by_folder(folder: str):
    return _handle_service_call(CloudinaryService.fetch_images_by_folder, folder)
