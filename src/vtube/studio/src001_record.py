import asyncio
import sys

import websockets
import json
import os
import time
import re

APP_NAME = "VTS Recorder"
APP_AUTHOR = "RichMan"
URL_HOST = "localhost"
URL_PORT = 8001
RECORD_INTERVAL = 0.033
RECORD_FOLDER = "./data/record"
TOKEN_FILE_TEMPLATE = "./data/token_%s.json"
TOKEN_FILE = None

# Глобальный флаг остановки
STOP_RECORDING = False

# Глобальный массив для всех кадров
recorded_frames = []


def get_next_filename():
    """Определяем следующий номер файла в папке RECORD_FOLDER"""
    if not os.path.exists(RECORD_FOLDER):
        os.makedirs(RECORD_FOLDER)

    existing_files = os.listdir(RECORD_FOLDER)
    max_num = 0
    pattern = re.compile(r"record(\d+)\.json")
    for f in existing_files:
        match = pattern.match(f)
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num
    next_num = max_num + 1
    return os.path.join(RECORD_FOLDER, f"record{next_num:03}.json")


async def send(ws, msg_type, data=None, req_id=None):
    payload = {
        "apiName": "VTubeStudioPublicAPI",
        "apiVersion": "1.0",
        "requestID": req_id or msg_type,
        "messageType": msg_type,
        "data": data or {}
    }
    await ws.send(json.dumps(payload))
    return json.loads(await ws.recv())


def get_token() -> str | None:
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "r", encoding="utf-8") as f:
            return json.load(f).get("authToken")
    return None


async def request_new_token(ws) -> str | None:
    print("🔑 Запрашиваем новый токен...")
    resp = await send(ws, "AuthenticationTokenRequest", {
        "pluginName": APP_NAME,
        "pluginDeveloper": APP_AUTHOR
    })
    token = resp.get("data", {}).get("authenticationToken")
    if not token:
        print("❌ Не удалось получить токен (разрешите подключение в VTS).")
        return None
    with open(TOKEN_FILE, "w", encoding="utf-8") as f:
        json.dump({"authToken": token}, f)
    print("💾 Токен сохранён в", TOKEN_FILE)
    return token


async def record_task(ws):
    global STOP_RECORDING, recorded_frames
    recorded_frames = []
    output_file = get_next_filename()
    print(f"\n🎥 Начинаем запись... Введите Enter для остановки. Файл: {output_file}")
    start_time = time.time()

    while not STOP_RECORDING:
        frame_time = time.time() - start_time

        # Получаем параметры
        resp = await send(ws, "InputParameterListRequest")
        all_params = resp["data"]["defaultParameters"]

        frame = {
            "timestamp": round(frame_time, 3),
            "values": all_params
        }

        recorded_frames.append(frame)
        await asyncio.sleep(RECORD_INTERVAL)

    # Сохраняем весь массив в файл после остановки
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(recorded_frames, f, ensure_ascii=False, indent=2)

    print("🛑 Запись остановлена.")
    print(f"💾 Сохранено в {output_file}")


async def main():
    try:
        sys.argv[1]
        port = int(sys.argv[1])
    except Exception:
        print(f"Ошибка при извлечении порта: {sys.argv[1]}")
        return

    global STOP_RECORDING
    global TOKEN_FILE
    TOKEN_FILE = TOKEN_FILE_TEMPLATE % port

    uri = f"ws://{URL_HOST}:{port}"
    async with websockets.connect(uri) as ws:
        print("✅ Подключено к VTube Studio!")

        # Токен
        token = get_token()
        if not token:
            token = await request_new_token(ws)
            if not token:
                return

        # Авторизация
        print("🔐 Аутентификация...")
        resp = await send(ws, "AuthenticationRequest", {
            "pluginName": APP_NAME,
            "pluginDeveloper": APP_AUTHOR,
            "authenticationToken": token
        })
        if not resp.get("data", {}).get("authenticated", False):
            print("❌ Аутентификация не удалась. Удалите auth_token.json и попробуйте снова.")
            return
        print("✅ Аутентификация успешна!")

        # Запуск записи
        task = asyncio.create_task(record_task(ws))

        # Ожидаем Enter в отдельном потоке
        await asyncio.to_thread(input, "🎥 Нажмите Enter для остановки записи...\n")
        STOP_RECORDING = True

        await task


if __name__ == "__main__":
    asyncio.run(main())
