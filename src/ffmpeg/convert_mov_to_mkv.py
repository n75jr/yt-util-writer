import argparse
import subprocess
from pathlib import Path

import ffmpeg


def get_duration(file_path: str) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            file_path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


def format_duration(seconds: float) -> str:
    total_seconds = max(0, int(round(seconds)))
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


def build_output_path(input_path: Path) -> Path:
    return input_path.with_suffix(".mkv")


def convert_mov_to_mkv(input_file: str) -> tuple[str, float, float]:
    input_path = Path(input_file)
    if not input_path.is_file():
        raise FileNotFoundError(f"Файл не найден: {input_path}")
    if input_path.suffix.lower() != ".mov":
        raise ValueError("Скрипт принимает только .mov файлы")

    output_path = build_output_path(input_path)
    source_duration = get_duration(str(input_path))

    (
        ffmpeg
        .input(str(input_path))
        .output(str(output_path), c="copy")
        .overwrite_output()
        .run()
    )

    output_duration = get_duration(str(output_path))
    return str(output_path), source_duration, output_duration


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Конвертация MOV в MKV без перекодирования."
    )
    parser.add_argument("input_file", help="Путь к .mov файлу")
    return parser.parse_args()


def main() -> None:
    use_cli_args = True
    use_cli_args = False
    input_file = "/Users/niki75jr/My/Work/onSide/yt/upl/video/author/0003_react_groceryStore/0003_react_groceryStore_0001_merged.mov"

    if use_cli_args:
        args = parse_args()
        target_input_file = args.input_file
    else:
        target_input_file = input_file

    output_file, source_duration, output_duration = convert_mov_to_mkv(target_input_file)

    print(output_file)
    print(f"{format_duration(source_duration)} -> {format_duration(output_duration)}")


if __name__ == "__main__":
    main()
