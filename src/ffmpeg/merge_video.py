import argparse
import ffmpeg
import subprocess
import tempfile
from pathlib import Path


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


def build_output_path(input_paths: list[Path]) -> Path:
    first_path = input_paths[0]
    return first_path.with_name(f"{first_path.stem}_merged{first_path.suffix}")


def build_concat_line(input_path: Path) -> str:
    escaped_path = str(input_path).replace("'", r"'\''")
    return f"file '{escaped_path}'"


def merge_videos(input_files: list[str]) -> tuple[str, float, float]:
    input_paths = [Path(file_path) for file_path in input_files]

    if len(input_paths) < 2:
        raise ValueError("Для объединения нужно минимум 2 видеофайла")

    for input_path in input_paths:
        if not input_path.is_file():
            raise FileNotFoundError(f"Файл не найден: {input_path}")

    output_path = build_output_path(input_paths)
    original_duration = sum(get_duration(str(input_path)) for input_path in input_paths)

    concat_file_content = "\n".join(
        build_concat_line(input_path) for input_path in input_paths
    )

    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".txt",
        encoding="utf-8",
        delete=True,
    ) as concat_file:
        concat_file.write(concat_file_content)
        concat_file.flush()

        (
            ffmpeg
            .input(concat_file.name, format="concat", safe=0)
            .output(str(output_path), c="copy")
            .overwrite_output()
            .run()
        )

    merged_duration = get_duration(str(output_path))
    return str(output_path), original_duration, merged_duration


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Объединение нескольких видеофайлов в один."
    )
    parser.add_argument(
        "input_files",
        nargs="+",
        help="Список путей к видеофайлам в порядке объединения",
    )
    return parser.parse_args()


def main() -> None:
    use_cli_args = False
    merge_files: list[str] = [
        # "/absolute/path/to/part1.mp4",
        # "/absolute/path/to/part2.mp4",
        "/Users/niki75jr/My/Work/onSide/yt/upl/video/author/untitled folder/0002_react_musicfy_0001.mkv",
        "/Users/niki75jr/My/Work/onSide/yt/upl/video/author/untitled folder/0002_react_musicfy_0002.mkv",
        "/Users/niki75jr/My/Work/onSide/yt/upl/video/author/untitled folder/0002_react_musicfy_0003.mkv",
    ]

    if use_cli_args:
        args = parse_args()
        input_files = args.input_files
    else:
        if len(merge_files) < 2:
            raise ValueError(
                "При use_cli_args = False в merge_files должно быть минимум 2 пути"
            )
        input_files = merge_files

    output_file, original_duration, merged_duration = merge_videos(input_files)

    print(output_file)
    print(f"{format_duration(original_duration)} -> {format_duration(merged_duration)}")


if __name__ == "__main__":
    main()
