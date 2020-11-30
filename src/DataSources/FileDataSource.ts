import * as fsPromises from 'fs/promises';
import * as path from 'path';

export default class FileDataSource {

    constructor(private fileName: string) { }

    loadCahce(): Promise<string> {
        return fsPromises.readFile(this.fileName, { encoding: "utf-8" });
    }

    async persistCache(data: string): Promise<void> {
        const folderPath = path.dirname(this.fileName);
        await fsPromises.mkdir(folderPath, { recursive: true });
        return fsPromises.writeFile(this.fileName, data, { flag: 'w' })
            .catch((e: Error) => { console.error(e) });
    }
}