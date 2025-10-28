import os
import sys
import time
import random
from typing import Final

DIRECTORY_PATH: Final[str] = "./data"
SOURCE_FILE_NAME: Final[str] = "1"
TARGET_FILE_EXTENSION: Final[str] = ".py"

# скорость печатания
SPEED_TYPING_LOW: Final[float] = 0.17
SPEED_TYPING_UPPER: Final[float] = 0.25

# период когда сделать паузу
SPEED_PAUSE_RANGE_LOW: Final[float] = 3.0
SPEED_PAUSE_RANGE_MAX: Final[float] = 3.0

# период паузы
SPEED_PAUSE_LOW: Final[float] = 0.5
SPEED_PAUSE_MAX: Final[float] = 1.5


def main():
    target_directory = sys.argv[1]
    dir_path = os.path.join(DIRECTORY_PATH, target_directory)
    source_file = os.path.join(dir_path, SOURCE_FILE_NAME)

    # выбираем первый .py файл в директории
    py_files = [f for f in os.listdir(dir_path) if f.endswith(TARGET_FILE_EXTENSION)]
    if not py_files:
        print("Нет .py файла в директории")
        return
    target_file = os.path.join(dir_path, py_files[0])

    # Прочитаем содержимое исходного файла
    with open(source_file, 'r', encoding='utf-8') as f:
        content = list(f.read())  # преобразуем в список символов

    # Очистим целевой файл перед записью
    with open(target_file, 'a', encoding='utf-8') as f:
        f.write('')

    # Планируем первую "длинную" паузу
    next_pause_at = time.time() + random.uniform(SPEED_PAUSE_LOW, SPEED_PAUSE_MAX)

    # Цикл записи с удалением
    with open(target_file, 'a', encoding='utf-8') as tf:
        while content:
            char = content.pop(0)  # берём первый символ

            # Записываем в файл-назначение
            tf.write(char)
            tf.flush()

            # Обновляем исходный файл — перезаписываем без уже "набранного" символа
            with open(source_file, 'w', encoding='utf-8') as sf:
                sf.write(''.join(content))

            # Задержки
            current_time = time.time()
            if current_time >= next_pause_at:
                time.sleep(random.uniform(SPEED_PAUSE_LOW, SPEED_PAUSE_MAX))  # "замешательство"
                next_pause_at = current_time + random.uniform(SPEED_PAUSE_LOW, SPEED_PAUSE_MAX)
            else:
                time.sleep(random.uniform(SPEED_TYPING_LOW, SPEED_TYPING_UPPER))


if __name__ == "__main__":
    main()
