from __future__ import annotations

import os
import random
import shutil
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

DIRECTORY_PATH = "/Users/niki75jr/My/Work/onSide/yt/upl/video/author"
SOURCE_FILE_NAME = "cover0000.png"
OUTPUT_IMAGE_COUNT = 20


def get_directory_number(directory_name: str) -> int | None:
    prefix = directory_name[:4]
    if len(prefix) != 4 or not prefix.isdigit():
        return None
    return int(prefix)


def normalize_directory_number(argument: str) -> int:
    normalized_argument = argument.strip()
    if not normalized_argument:
        raise ValueError("Номер директории не может быть пустым")

    try:
        directory_number = int(normalized_argument)
    except ValueError as error:
        raise ValueError(f"Некорректный номер директории: {argument}") from error

    if directory_number < 0:
        raise ValueError(f"Номер директории не может быть отрицательным: {argument}")

    return directory_number


def get_directory_prefix(directory_number: int) -> str:
    return f"{directory_number:04d}"


def get_directory_path(base_path: Path, directory_number: int) -> Path | None:
    prefix = get_directory_prefix(directory_number)

    for item in base_path.iterdir():
        if item.is_dir() and item.name.startswith(prefix):
            return item

    return None


def get_target_numbers() -> list[int]:
    if len(sys.argv) < 2:
        raise ValueError("Передайте номера директорий через аргументы. Например: python cover_number_generator.py 1 6 10")

    target_numbers: list[int] = []
    for argument in sys.argv[1:]:
        target_numbers.append(normalize_directory_number(argument))

    return target_numbers


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


def apply_file_dates(file_path: Path, file_datetime: datetime) -> None:
    timestamp = file_datetime.timestamp()
    os.utime(file_path, (timestamp, timestamp))

    setfile_path = shutil.which("SetFile")
    if setfile_path is None:
        return

    formatted_datetime = file_datetime.strftime("%m/%d/%Y %H:%M:%S")
    subprocess.run(
        [setfile_path, "-d", formatted_datetime, str(file_path)],
        check=False,
        capture_output=True,
    )
    subprocess.run(
        [setfile_path, "-m", formatted_datetime, str(file_path)],
        check=False,
        capture_output=True,
    )


def process_directory(directory_number: int, directory_path: Path) -> bool:
    cover_path = directory_path / "cover"
    source_file_path = cover_path / SOURCE_FILE_NAME

    if not cover_path.is_dir() or not source_file_path.is_file():
        return False

    current_datetime = datetime.now()
    for image_number in range(1, OUTPUT_IMAGE_COUNT + 1):
        target_file_path = cover_path / f"cover{image_number:04d}.png"
        shutil.copy2(source_file_path, target_file_path)
        draw_number(target_file_path, image_number)
        apply_file_dates(target_file_path, current_datetime)
        current_datetime += timedelta(minutes=random.randint(1, 5))

    return True


def main() -> None:
    base_path = Path(DIRECTORY_PATH)
    if not base_path.is_dir():
        raise FileNotFoundError(f"Directory not found: {base_path}")

    target_numbers = get_target_numbers()
    processed_count = 0
    for directory_number in target_numbers:
        directory_path = get_directory_path(base_path, directory_number)
        if directory_path is None:
            print(f"Directory not found for number prefix: {get_directory_prefix(directory_number)}")
            continue

        if process_directory(directory_number, directory_path):
            processed_count += OUTPUT_IMAGE_COUNT
        else:
            print(f"Cover not found in directory: {directory_path}")

    print(f"Processed {processed_count} cover images.")


if __name__ == "__main__":
    main()
