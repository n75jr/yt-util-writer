import os
import shutil
import sys
import time
import random
from typing import Final, Optional

INIT_ARG_NAME = "-i"

DIRECTORY_PATH: Final[str] = "./data"
ORIGINAL_DIRECTORY_PATH: Final[str] = f"{DIRECTORY_PATH}/000_original"
SOURCE_FILE_NAME: Final[str] = "1"

# скорость печатания
SPEED_TYPING_LOW: Final[float] = 0.17
SPEED_TYPING_UPPER: Final[float] = 0.25

# период когда сделать паузу
SPEED_PAUSE_RANGE_LOW: Final[float] = 3.0
SPEED_PAUSE_RANGE_MAX: Final[float] = 3.0

# период паузы
SPEED_PAUSE_LOW: Final[float] = 0.5
SPEED_PAUSE_MAX: Final[float] = 1.5

TYPO_CHANCE: Final[float] = 0.035
LONG_PAUSE_CHANCE: Final[float] = 0.08
THINKING_PAUSE_CHANCE: Final[float] = 0.025
SPEED_SHIFT_CHANCE: Final[float] = 0.12

TYPO_NEIGHBORS: Final[dict[str, str]] = {
    "a": "sqz",
    "b": "vghn",
    "c": "xdfv",
    "d": "erfcxs",
    "e": "wrds",
    "f": "rtgvcd",
    "g": "tyhbvf",
    "h": "yujnbg",
    "i": "uojk",
    "j": "uikmnh",
    "k": "iolmj",
    "l": "opk",
    "m": "njk",
    "n": "bhjm",
    "o": "ipkl",
    "p": "ol",
    "q": "wa",
    "r": "tfde",
    "s": "wedxza",
    "t": "rygf",
    "u": "yihj",
    "v": "cfgb",
    "w": "qase",
    "x": "zsdc",
    "y": "tugh",
    "z": "asx",
    "0": "19",
    "1": "2q",
    "2": "13w",
    "3": "24e",
    "4": "35r",
    "5": "46t",
    "6": "57y",
    "7": "68u",
    "8": "79i",
    "9": "80o",
}


def _pick_typo_char(char: str) -> Optional[str]:
    lower_char = char.lower()
    neighbors = TYPO_NEIGHBORS.get(lower_char)
    if not neighbors:
        return None

    typo_char = random.choice(neighbors)
    return typo_char.upper() if char.isupper() else typo_char


def _update_source_file(source_file_path: str, content: list[str]) -> None:
    with open(source_file_path, 'w', encoding='utf-8') as sf:
        sf.write(''.join(content))


def _erase_last_chars(target_file, chars_count: int) -> None:
    if chars_count <= 0:
        return

    target_file.seek(0)
    file_content = target_file.read()
    target_file.seek(0)
    target_file.truncate(0)
    target_file.write(file_content[:-chars_count])
    target_file.flush()


def _human_delay(char: str, current_delay: float) -> float:
    if char == "\n":
        return random.uniform(0.35, 1.1)

    if char in ".!?":
        return random.uniform(0.28, 0.95)

    if char in ",;:":
        return random.uniform(0.18, 0.55)

    if char in ")]}":
        return random.uniform(0.09, 0.24)

    if char == " ":
        return random.uniform(0.03, 0.12)

    return max(0.02, random.uniform(current_delay * 0.7, current_delay * 1.35))


def init(source_file_path: str, target_file_path: str, target_file: str) -> None:
    print("Режим init")
    file_directory_path = os.path.join(DIRECTORY_PATH, target_file)
    os.makedirs(file_directory_path, exist_ok=True)
    print(f"Создана директория {file_directory_path}")

    with open(target_file_path, 'w', encoding='utf-8') as f:
        pass
    print(f"Создан файл {target_file_path}")

    origin_file_path = os.path.join(ORIGINAL_DIRECTORY_PATH, target_file)
    shutil.copy(origin_file_path, source_file_path)
    print(f"Скопирован файл {origin_file_path} в {target_file_path}")


def to_write(source_file_path: str, target_file_path: str, content: list[str]) -> None:
    # Базовый темп печати периодически меняется, чтобы набор не был монотонным.
    current_delay = random.uniform(SPEED_TYPING_LOW, SPEED_TYPING_UPPER)
    next_pause_at = time.time() + random.uniform(SPEED_PAUSE_RANGE_LOW, SPEED_PAUSE_RANGE_MAX)

    with open(target_file_path, 'a+', encoding='utf-8') as tf:
        while content:
            if random.random() < SPEED_SHIFT_CHANCE:
                current_delay = random.uniform(SPEED_TYPING_LOW * 0.55, SPEED_TYPING_UPPER * 1.35)

            char = content.pop(0)

            if (
                    char not in "\n\t "
                    and random.random() < TYPO_CHANCE
            ):
                typo_char = _pick_typo_char(char)
                if typo_char is not None and typo_char != char:
                    tf.write(typo_char)
                    tf.flush()
                    time.sleep(random.uniform(0.04, 0.18))

                    # Для обычного файла нужно реально удалить ошибочный символ,
                    # иначе управляющие символы попадут в текст как мусор.
                    _erase_last_chars(tf, 1)
                    time.sleep(random.uniform(0.06, 0.22))

            tf.write(char)
            tf.flush()

            _update_source_file(source_file_path, content)

            current_time = time.time()
            if current_time >= next_pause_at:
                time.sleep(random.uniform(SPEED_PAUSE_LOW, SPEED_PAUSE_MAX))
                next_pause_at = current_time + random.uniform(SPEED_PAUSE_RANGE_LOW, SPEED_PAUSE_RANGE_MAX)

            if random.random() < LONG_PAUSE_CHANCE and char in ".!?\n":
                time.sleep(random.uniform(0.45, 1.8))

            if random.random() < THINKING_PAUSE_CHANCE and char == " ":
                time.sleep(random.uniform(0.12, 0.45))

            time.sleep(_human_delay(char, current_delay))


def main():
    file_number = sys.argv[1]

    # выбираем файл в директории
    target_file = None
    for f in os.listdir(ORIGINAL_DIRECTORY_PATH):
        if f.startswith(file_number):
            target_file = f
    if not target_file:
        print(f"Нет {file_number} файла в директории")
        return

    target_file_directory_path = os.path.join(DIRECTORY_PATH, target_file)
    target_file_path = os.path.join(target_file_directory_path, target_file)
    source_file_path = os.path.join(target_file_directory_path, SOURCE_FILE_NAME)
    is_init = len(list(filter(lambda a: a == INIT_ARG_NAME, sys.argv))) != 0
    if is_init:
        init(source_file_path=source_file_path, target_file_path=target_file_path, target_file=target_file)
        print("Инициализация завершена")
        return

    # Прочитаем содержимое исходного файла
    with open(source_file_path, 'r', encoding='utf-8') as f:
        content = list(f.read())  # преобразуем в список символов
        print(f"Прочитано содержимое {source_file_path}: {len(content)}")

    if not os.path.exists(target_file_path):
        with open(target_file_path, 'w', encoding='utf-8'):
            pass

    # Цикл записи с удалением
    print("Запись....")
    try:
        to_write(source_file_path=source_file_path, target_file_path=target_file_path, content=content)
    except KeyboardInterrupt:
        print("Завершена запись")


if __name__ == "__main__":
    main()
