import asyncio
import sys

import websockets
import json
import os
import random

FPS = 10
URL_HOST = "localhost"
DEFAULT_PORT = 8001
RECORD_INTERVAL = 0.033
TOKEN_FILE_TEMPLATE = "./data/token_%s.json"
RECORD_FOLDER = "./data/record"
TOKEN_FILE = None
CURRENT_BACKGROUND = None
PLUGIN_DEVELOPER_TEMPLATE = "RichMan_%s"
PLUGIN_NAME_TEMPLATE = "RandomMover_%s"
PLUGIN_DEVELOPER = None
PLUGIN_NAME = None


async def vtube_play_record_while_true(host: str, port: int, play_interval: float):
    uri = f"ws://{host}:{port}"
    token_file = f""
    async with websockets.connect(uri) as ws:
        # --- Получаем токен ---
        if not os.path.exists(TOKEN_FILE):
            await ws.send(json.dumps({
                "apiName": "VTubeStudioPublicAPI",
                "apiVersion": "1.0",
                "requestID": "token1",
                "messageType": "AuthenticationTokenRequest",
                "data": {
                    "pluginName": PLUGIN_NAME,
                    "pluginDeveloper": PLUGIN_DEVELOPER
                }
            }))
            response = json.loads(await ws.recv())
            token = response["data"]["authenticationToken"]
            with open(TOKEN_FILE, "w") as f:
                json.dump({"token": token}, f)
            print("✅ Токен получен:", token)
            print("➡️ Подтвердите доступ в окне VTube Studio!")
            return

        # --- Авторизация ---
        token = json.load(open(TOKEN_FILE))["token"]
        await ws.send(json.dumps({
            "apiName": "VTubeStudioPublicAPI",
            "apiVersion": "1.0",
            "requestID": "auth1",
            "messageType": "AuthenticationRequest",
            "data": {
                "pluginName": PLUGIN_NAME,
                "pluginDeveloper": PLUGIN_DEVELOPER,
                "authenticationToken": token
            }
        }))
        auth_resp = json.loads(await ws.recv())
        if not auth_resp.get("data", {}).get("authenticated", False):
            print("❌ Аутентификация не удалась:", auth_resp)
            return
        print("✅ Аутентификация успешна!")

        while True:
            # --- Выбираем случайный файл ---
            files = [f for f in os.listdir(RECORD_FOLDER) if f.endswith(".json")]
            if not files:
                print("❌ Нет файлов для воспроизведения.")
                return
            file_path = os.path.join(RECORD_FOLDER, random.choice(files))
            abs_path = os.path.abspath(file_path)
            print(f"🎬 Воспроизводим файл: {abs_path}")

            with open(file_path, "r", encoding="utf-8") as f:
                frames = json.load(f)

            # --- Воспроизведение ---
            print(f"▶️ Воспроизведение {len(frames)} кадров с интервалом {play_interval:.4f} с...")
            for idx, frame in enumerate(frames):
                parameter_values = [
                    {"id": p["name"], "value": p["value"]}
                    for p in frame["values"]
                ]
                move_request = {
                    "apiName": "VTubeStudioPublicAPI",
                    "apiVersion": "1.0",
                    "requestID": f"move{random.randint(1, 9999)}",
                    "messageType": "InjectParameterDataRequest",
                    "data": {
                        "faceFound": True,
                        "mode": "set",
                        "parameterValues": parameter_values
                    }
                }
                await ws.send(json.dumps(move_request))
                if idx == len(frames) - 1:
                    print(f"---break")
                    break
                await asyncio.sleep(play_interval)
            print("✅ Воспроизведение завершено.")


async def vtube_play_record(host: str, port: int, play_interval: float):
    global TOKEN_FILE
    global PLUGIN_NAME
    global PLUGIN_DEVELOPER
    TOKEN_FILE = TOKEN_FILE_TEMPLATE % str(port)
    PLUGIN_NAME = PLUGIN_NAME_TEMPLATE % str(port)
    PLUGIN_DEVELOPER = PLUGIN_DEVELOPER_TEMPLATE % str(port)

    while True:
        try:
            print("-------- Запуск")
            await vtube_play_record_while_true(host=host, port=port, play_interval=play_interval)
            print("-------- Итерация окончена")
        except OSError as e:
            print(f"error: {e.__class__.__name__}: {e}")
            exit(-1)
        except Exception as e:
            print(f"reconnect: {e.__class__.__name__}: {e}")
            if not os.path.exists(TOKEN_FILE):
                break


async def main():
    host = URL_HOST

    try:
        sys.argv[1]
        port = int(sys.argv[1])
    except Exception:
        print(f"Ошибка при извлечении порта: {sys.argv[1]}")
        return

    fps = FPS
    interval = 1.0 / fps
    await vtube_play_record(host=host, port=port, play_interval=interval)


if __name__ == "__main__":
    asyncio.run(main())
