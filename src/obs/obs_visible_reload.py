import time
import sys
import obsws_python as obs

HOST = "127.0.0.1"
PASSWORD = ""


def main():
    try:
        port = int(sys.argv[1])
        interval_sec = int(sys.argv[2])
    except:
        print("При извлечении таймаута произошла ошибка")
        return

    print(f"Запуск на порт {port} с интервалом {interval_sec} сек")

    client = obs.ReqClient(host=HOST, port=port, password=PASSWORD)

    while True:
        try:
            # текущая сцена
            scene = client.get_current_program_scene().current_program_scene_name

            # все элементы сцены
            items = client.get_scene_item_list(scene).scene_items
            item_ids = [item["sceneItemId"] for item in items]
            names = [item["sourceName"] for item in items]

            print(f"Scene: {scene}, Items: {len(items)}")
            print("Reloading all sources at once:", names)

            # выключаем все источники сразу
            for item_id in item_ids:
                client.set_scene_item_enabled(scene, item_id, False)

            time.sleep(1)

            # включаем все источники сразу
            for item_id in item_ids:
                client.set_scene_item_enabled(scene, item_id, True)

            print("Refresh done\n")

        except Exception as e:
            print("Error:", e)

        time.sleep(interval_sec)


if __name__ == "__main__":
    main()
