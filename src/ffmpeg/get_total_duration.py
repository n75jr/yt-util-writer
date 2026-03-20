import argparse
import subprocess
from pathlib import Path

VIDEO_EXTENSIONS = {
    ".mp4",
    ".mkv",
    ".mov",
    ".avi",
    ".webm",
    ".m4v",
    ".mpg",
    ".mpeg",
}


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


def get_video_files(directory_path: str) -> list[Path]:
    directory = Path(directory_path)

    if not directory.is_dir():
        raise NotADirectoryError(f"Директория не найдена: {directory}")

    return sorted(
        path for path in directory.iterdir()
        if path.is_file() and path.suffix.lower() in VIDEO_EXTENSIONS
    )


def get_total_duration(directory_path: str) -> tuple[int, float]:
    video_files = get_video_files(directory_path)

    if not video_files:
        raise ValueError("В директории не найдено видеофайлов")

    total_duration = sum(get_duration(str(video_file)) for video_file in video_files)
    return len(video_files), total_duration


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Подсчёт общей длительности всех видеофайлов в директории."
    )
    parser.add_argument("directory_path", help="Путь к директории с видео")
    return parser.parse_args()


def main() -> None:
    use_cli_args = False
    # directory_path = "/absolute/path/to/videos"
    directory_path = "/Users/niki75jr/My/Work/onSide/yt/upl/video/author/_prepare"

    if use_cli_args:
        args = parse_args()
        target_directory = args.directory_path
    else:
        target_directory = directory_path

    file_count, total_duration = get_total_duration(target_directory)

    print(f"Видео файлов: {file_count}")
    print(f"Общая длительность: {format_duration(total_duration)}")


if __name__ == "__main__":
    main()
