import requests
import json
import pathlib
from urllib.parse import urlparse

def download_dependencies():
    target_path = pathlib.Path('dependencies')

    with open('dependencies.json') as dependencies_file:
        dependencies: list[str] = json.load(dependencies_file)

    for url in dependencies:
        path = urlparse(url).path[1:]
        filepath = pathlib.Path(path)
        target_filepath = target_path.joinpath(filepath)
        target_filepath.parent.mkdir(parents=True, exist_ok=True)
        response = requests.get(url, allow_redirects=True)
        response.raise_for_status()

        print(response.status_code, target_filepath)

        if response.status_code != 200 or response.content == b'File not found':
            continue

        with open(target_filepath, 'wb') as file:
            file.write(response.content)




if __name__ == '__main__':
    download_dependencies()