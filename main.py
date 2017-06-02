import json
import os

path = 'data'


def main():
    # problems.onemax.main()
    update_info()


def update_info():
    json_files = [pos_json for pos_json in os.listdir(path) if (pos_json.endswith('.json') and
                                                                not pos_json.startswith('info'))]
    info_data = list()
    for filename in json_files:
        with open(os.path.join(path, filename)) as json_file:
            # do something with your json; I'll just print
            json_data = json.load(json_file)
            new_data = json_data['extra']
            new_data['filename'] = filename
            info_data.append(new_data)

    with open(os.path.join(path, 'info.json'), 'w') as outfile:
        json.dump(info_data, outfile)
    print 'File info.json updated'
    return


if __name__ == "__main__":
    main()
