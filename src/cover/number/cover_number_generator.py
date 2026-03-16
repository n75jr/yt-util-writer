from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

DIRECTORY_PATH = "/Users/niki75jr/My/Work/onSide/yt/upl/video/author"
EXCLUDED_NUMBERS = [
    0,
    2, 3, 4, 5
]
MAX_IMAGES = 20
SOURCE_FILE_NAME = "cover000.png"


def get_directory_number(directory_name: str) -> int | None:
    prefix = directory_name[:4]
    if len(prefix) != 4 or not prefix.isdigit():
        return None
    return int(prefix)


def iter_target_directories(base_path: Path) -> list[tuple[int, Path]]:
    directories: list[tuple[int, Path]] = []

    for item in base_path.iterdir():
        if not item.is_dir():
            continue

        directory_number = get_directory_number(item.name)
        if directory_number is None or directory_number in EXCLUDED_NUMBERS:
            continue

        directories.append((directory_number, item))

    directories.sort(key=lambda item: item[0])
    return directories[:MAX_IMAGES]


def draw_number(image_path: Path, number: int) -> None:
    with Image.open(image_path) as image:
        canvas = image.convert("RGBA")
        overlay = Image.new("RGBA", canvas.size, (255, 255, 255, 0))
        drawer = ImageDraw.Draw(overlay)

        font_size = max(48, min(canvas.size) // 8)
        try:
            font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
        except OSError:
            try:
                font = ImageFont.truetype("Arial.ttf", font_size)
            except OSError:
                font = ImageFont.load_default()

        text = str(number)
        padding = max(20, font_size // 3)
        text_bbox = drawer.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        background_box = (
            padding // 2,
            padding // 2,
            padding + text_width + padding // 2,
            padding + text_height + padding // 2,
        )

        drawer.rounded_rectangle(background_box, radius=16, fill=(255, 255, 255, 180))
        drawer.text((padding, padding), text, fill=(0, 0, 0, 255), font=font)

        result = Image.alpha_composite(canvas, overlay).convert(image.mode)
        result.save(image_path)


def process_directory(directory_number: int, directory_path: Path) -> bool:
    cover_path = directory_path / "cover"
    source_file_path = cover_path / SOURCE_FILE_NAME

    if not cover_path.is_dir() or not source_file_path.is_file():
        return False

    target_file_path = cover_path / f"{directory_number:04d}.png"
    shutil.copy2(source_file_path, target_file_path)
    draw_number(target_file_path, directory_number)
    return True


def main() -> None:
    base_path = Path(DIRECTORY_PATH)
    if not base_path.is_dir():
        raise FileNotFoundError(f"Directory not found: {base_path}")

    processed_count = 0
    for directory_number, directory_path in iter_target_directories(base_path):
        if process_directory(directory_number, directory_path):
            processed_count += 1

    print(f"Processed {processed_count} cover images.")


if __name__ == "__main__":
    main()
