import ffmpeg
import subprocess
from pathlib import Path
import sys


def get_duration(file_path: str) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            file_path
        ],
        capture_output=True,
        text=True,
        check=True
    )
    return float(result.stdout.strip())


def cut_last_seconds(input_file: str, seconds: int = 120) -> str:
    input_path = Path(input_file)
    output_path = input_path.with_name(input_path.stem + "_copy" + input_path.suffix)

    duration = get_duration(input_file)
    new_duration = duration - seconds

    if new_duration <= 0:
        raise ValueError("Видео слишком короткое")

    (
        ffmpeg
        .input(str(input_path))
        .output(
            str(output_path),
            t=new_duration,
            c="copy"
        )
        .run(overwrite_output=True)
    )

    return str(output_path)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Использование: python cut_video.py <путь_к_видео> [секунды]")
        sys.exit(1)

    input_file = sys.argv[1]
    seconds = int(sys.argv[2]) if len(sys.argv) > 2 else 120

    result = cut_last_seconds(input_file, seconds)
    print("Готово:", result)