import argparse
import ffmpeg
import subprocess
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


def parse_hhmmss(value: str) -> int:
    parts = value.split(":")
    if len(parts) != 3:
        raise argparse.ArgumentTypeError(
            "Время должно быть в формате HH:MM:SS"
        )

    try:
        hours, minutes, seconds = (int(part) for part in parts)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(
            "Время должно содержать только числа"
        ) from exc

    if hours < 0 or minutes < 0 or seconds < 0:
        raise argparse.ArgumentTypeError("Время не может быть отрицательным")
    if minutes >= 60 or seconds >= 60:
        raise argparse.ArgumentTypeError(
            "Минуты и секунды должны быть в диапазоне 0-59"
        )

    return hours * 3600 + minutes * 60 + seconds


def format_duration(seconds: float) -> str:
    total_seconds = max(0, int(round(seconds)))
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


def build_output_path(input_path: Path) -> Path:
    return input_path.with_name(f"{input_path.stem}_trimmed{input_path.suffix}")


def trim_video(input_file: str, keep_until_seconds: float) -> tuple[str, float, float]:
    input_path = Path(input_file)
    output_path = build_output_path(input_path)

    source_duration = get_duration(str(input_path))
    final_duration = min(keep_until_seconds, source_duration)

    if final_duration <= 0:
        raise ValueError("Итоговая длительность должна быть больше 0 секунд")

    (
        ffmpeg
        .input(str(input_path))
        .output(
            str(output_path),
            t=final_duration,
            c="copy",
        )
        .overwrite_output()
        .run()
    )

    trimmed_duration = get_duration(str(output_path))
    return str(output_path), source_duration, trimmed_duration


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Обрезка видео без перекодирования с созданием нового файла."
    )
    parser.add_argument("input_file", help="Путь к исходному видеофайлу")
    parser.add_argument(
        "value",
        help='Время обрезки в формате "HH:MM:SS" или секунды с конца при использовании -e',
    )
    parser.add_argument(
        "-e",
        "--end-seconds",
        action="store_true",
        help="Интерпретировать value как количество секунд, удаляемых с конца",
    )
    return parser.parse_args()


def main() -> None:
    use_cli_args = True
    use_cli_args = False
    trim_map: dict[str, str] = {
        # "/absolute/path/to/video.mp4": "01:01:01",
    }

    if use_cli_args:
        args = parse_args()
        input_path = Path(args.input_file)

        if not input_path.is_file():
            raise FileNotFoundError(f"Файл не найден: {input_path}")

        source_duration = get_duration(str(input_path))

        if args.end_seconds:
            try:
                seconds_to_remove = int(args.value)
            except ValueError as exc:
                raise ValueError("При флаге -e нужно передать целое число секунд") from exc

            if seconds_to_remove < 0:
                raise ValueError("Количество секунд не может быть отрицательным")

            keep_until_seconds = source_duration - seconds_to_remove
        else:
            keep_until_seconds = parse_hhmmss(args.value)
    else:
        if len(trim_map) != 1:
            raise ValueError(
                "При use_cli_args = False в trim_map должна быть ровно одна пара: путь -> HH:MM:SS"
            )

        input_file, trim_value = next(iter(trim_map.items()))
        input_path = Path(input_file)

        if not input_path.is_file():
            raise FileNotFoundError(f"Файл не найден: {input_path}")

        keep_until_seconds = parse_hhmmss(trim_value)

    output_file, original_duration, trimmed_duration = trim_video(
        str(input_path), keep_until_seconds
    )

    print(output_file)
    print(f"{format_duration(original_duration)} -> {format_duration(trimmed_duration)}")


if __name__ == "__main__":
    main()
