import { IPersistentDataSource } from ".";
import FileDataSource from "./FileDataSource";

export class CacheDataSource<T> implements IPersistentDataSource<T> {
    private readonly fileDataSource: FileDataSource;

    constructor(cacheFileName: string) {
        this.fileDataSource = new FileDataSource(cacheFileName);
    }

    async persist(data: T): Promise<void> {
        return this.fileDataSource.persistCache(JSON.stringify(data));
    }

    async load(): Promise<T | null> {
        return new Promise((resolve) => {
            return this.fileDataSource.loadCahce()
                .then(cacheData => {
                    const data = JSON.parse(cacheData) as T;
                    resolve(data);
                })
                .catch(() => {
                    resolve(null);
                })
                .finally();
        })
    }
}