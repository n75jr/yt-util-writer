import os
import shutil
import sys
import time
import random
from typing import Final

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

    # Очистим целевой файл перед записью
    with open(target_file, 'a', encoding='utf-8') as f:
        f.write('')

    # Планируем первую "длинную" паузу
    next_pause_at = time.time() + random.uniform(SPEED_PAUSE_LOW, SPEED_PAUSE_MAX)

    # Цикл записи с удалением
    print("Запись....")
    with open(target_file_path, 'a', encoding='utf-8') as tf:
        while content:
            char = content.pop(0)  # берём первый символ

            # Записываем в файл-назначение
            tf.write(char)
            tf.flush()

            # Обновляем исходный файл — перезаписываем без уже "набранного" символа
            with open(source_file_path, 'w', encoding='utf-8') as sf:
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
