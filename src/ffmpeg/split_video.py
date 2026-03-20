import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import ffmpeg

DEFAULT_CHUNK_MINUTES = 60


def get_video_resolution(file_path: str) -> tuple[int, int]:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "csv=p=0:s=x",
            file_path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    width, height = result.stdout.strip().split("x")
    return int(width), int(height)


def has_audio_stream(file_path: str) -> bool:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=index",
            "-of",
            "csv=p=0",
            file_path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return bool(result.stdout.strip())


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


def build_output_path(input_path: Path, index: int) -> Path:
    return input_path.with_name(f"{input_path.stem}_{index:04d}{input_path.suffix}")


def build_concat_line(input_path: Path) -> str:
    escaped_path = str(input_path).replace("'", r"'\''")
    return f"file '{escaped_path}'"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Нарезка видео на несколько частей."
    )
    parser.add_argument("input_file", help="Путь к исходному видеофайлу")
    parser.add_argument(
        "--chunk-minutes",
        type=float,
        default=DEFAULT_CHUNK_MINUTES,
        help=f"Максимальная длина одного ролика в минутах. По умолчанию {DEFAULT_CHUNK_MINUTES}",
    )
    parser.add_argument(
        "--audio-path",
        help="Путь к аудиофайлу, который будет зациклен на каждом ролике",
    )
    parser.add_argument(
        "--intro-path",
        help="Путь к интро, которое будет добавлено в начало каждого ролика",
    )
    return parser.parse_args()


def build_segment_plan(total_duration: float, chunk_minutes: float) -> list[tuple[float, float]]:
    if chunk_minutes <= 0:
        raise ValueError("chunk_minutes должно быть больше 0")

    chunk_seconds = chunk_minutes * 60
    if total_duration <= chunk_seconds:
        return []

    part_count = int(total_duration // chunk_seconds)
    if part_count <= 0:
        return []

    base_duration = chunk_seconds
    remainder = total_duration - (part_count * base_duration)
    extra_per_part = remainder / part_count if remainder > 0 else 0

    plan: list[tuple[float, float]] = []
    start_time = 0.0
    for index in range(part_count):
        duration = base_duration + extra_per_part

        if index == part_count - 1:
            duration = total_duration - start_time

        plan.append((start_time, duration))
        start_time += duration

    return plan


def cut_segment(input_file: str, start_time: float, duration: float, output_path: Path) -> None:
    (
        ffmpeg
        .input(input_file, ss=start_time, t=duration)
        .output(str(output_path), c="copy", avoid_negative_ts="make_zero")
        .overwrite_output()
        .run()
    )


def remux_for_concat(input_path: Path, output_path: Path) -> None:
    (
        ffmpeg
        .input(str(input_path))
        .output(str(output_path), c="copy", avoid_negative_ts="make_zero")
        .global_args("-fflags", "+genpts")
        .overwrite_output()
        .run()
    )


def normalize_intro_to_source(
    intro_path: Path,
    output_path: Path,
    target_width: int,
    target_height: int,
) -> None:
    intro_input = ffmpeg.input(str(intro_path))
    scaled_video = (
        intro_input.video
        .filter("scale", target_width, target_height, force_original_aspect_ratio="decrease")
        .filter("pad", target_width, target_height, "(ow-iw)/2", "(oh-ih)/2")
    )

    if has_audio_stream(str(intro_path)):
        (
            ffmpeg
            .output(
                scaled_video,
                intro_input.audio,
                str(output_path),
                vcodec="libx264",
                acodec="copy",
                pix_fmt="yuv420p",
            )
            .overwrite_output()
            .run()
        )
        return

    (
        ffmpeg
        .output(
            scaled_video,
            str(output_path),
            vcodec="libx264",
            pix_fmt="yuv420p",
        )
        .overwrite_output()
        .run()
    )


def concat_files(input_files: list[Path], output_path: Path) -> None:
    concat_file_content = "\n".join(
        build_concat_line(input_file) for input_file in input_files
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
            .output(str(output_path), c="copy", avoid_negative_ts="make_zero")
            .global_args("-fflags", "+genpts")
            .overwrite_output()
            .run()
        )


def add_looped_audio(input_video: Path, audio_path: Path, output_path: Path) -> None:
    video_input = ffmpeg.input(str(input_video))
    audio_input = ffmpeg.input(str(audio_path), stream_loop=-1)

    (
        ffmpeg
        .output(
            video_input.video,
            audio_input.audio,
            str(output_path),
            c="copy",
            shortest=None,
            avoid_negative_ts="make_zero",
        )
        .overwrite_output()
        .run()
    )


def split_video(
        input_file: str,
        chunk_minutes: float,
        audio_path: str | None = None,
        intro_path: str | None = None,
) -> list[tuple[Path, float]]:
    input_path = Path(input_file)
    if not input_path.is_file():
        raise FileNotFoundError(f"Файл не найден: {input_path}")

    intro_file_path = Path(intro_path) if intro_path else None
    audio_file_path = Path(audio_path) if audio_path else None

    if intro_file_path and not intro_file_path.is_file():
        raise FileNotFoundError(f"Интро не найдено: {intro_file_path}")
    if audio_file_path and not audio_file_path.is_file():
        raise FileNotFoundError(f"Аудио не найдено: {audio_file_path}")

    source_duration = get_duration(str(input_path))
    source_resolution = get_video_resolution(str(input_path))

    segment_plan = build_segment_plan(source_duration, chunk_minutes)

    if not segment_plan:
        print(
            f"Исходный файл короче или равен {chunk_minutes} мин: "
            f"{format_duration(source_duration)}. Нарезка не требуется."
        )
        return []

    output_files: list[tuple[Path, float]] = []
    for index, (start_time, duration) in enumerate(segment_plan, start=1):
        output_path = build_output_path(input_path, index)

        if intro_file_path is None and audio_file_path is None:
            cut_segment(str(input_path), start_time, duration, output_path)
            output_files.append((output_path, get_duration(str(output_path))))
            continue

        with tempfile.TemporaryDirectory() as temp_dir_name:
            temp_dir = Path(temp_dir_name)
            segment_path = temp_dir / f"segment{input_path.suffix}"
            cut_segment(str(input_path), start_time, duration, segment_path)

            current_path = segment_path
            if intro_file_path is not None:
                normalized_intro_path = temp_dir / f"intro_normalized{input_path.suffix}"
                normalized_segment_path = temp_dir / f"segment_normalized{input_path.suffix}"
                intro_output_path = temp_dir / f"with_intro{input_path.suffix}"
                normalize_intro_to_source(
                    intro_file_path,
                    normalized_intro_path,
                    source_resolution[0],
                    source_resolution[1],
                )
                remux_for_concat(current_path, normalized_segment_path)
                concat_files([normalized_intro_path, normalized_segment_path], intro_output_path)
                current_path = intro_output_path

            if audio_file_path is not None:
                add_looped_audio(current_path, audio_file_path, output_path)
            else:
                shutil.move(str(current_path), str(output_path))

        output_files.append((output_path, get_duration(str(output_path))))

    return output_files


def main() -> None:
    use_cli_args = False
    input_file = "/Users/niki75jr/My/Work/onSide/yt/upl/video/author/_prepare/0001_react_weatherDashboard.mkv"
    chunk_minutes = DEFAULT_CHUNK_MINUTES
    audio_path: str | None = None
    # audio_path: str | None = "/Users/niki75jr/My/Work/onSide/yt/upl/video/author/0000_util/sound_keyboard_typing.mp3"
    intro_path: str | None = "/Users/niki75jr/My/Work/onSide/yt/upl/video/author/0001_react_weatherDashboard/0000.mov"

    if use_cli_args or len(sys.argv) > 1:
        args = parse_args()
        target_input_file = args.input_file
        target_chunk_minutes = args.chunk_minutes
        target_audio_path = args.audio_path
        target_intro_path = args.intro_path
    else:
        target_input_file = input_file
        target_chunk_minutes = chunk_minutes
        target_audio_path = audio_path
        target_intro_path = intro_path

    output_files = split_video(
        input_file=target_input_file,
        chunk_minutes=target_chunk_minutes,
        audio_path=target_audio_path,
        intro_path=target_intro_path,
    )

    if not output_files:
        return

    source_duration = get_duration(target_input_file)
    print(f"Длина исходного видео: {format_duration(source_duration)}")
    print(f"Создано файлов: {len(output_files)}")
    for output_file, output_duration in output_files:
        print(f"{output_file} -> {format_duration(output_duration)}")


if __name__ == "__main__":
    main()
