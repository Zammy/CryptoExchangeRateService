import { IDataSource, IPersistentDataSource } from "../DataSources";
import { IExchangeRateRepository, IRepository } from "../UseCases";
import { CacheDataSource } from "../DataSources/CacheDataSource";

//D is data type 
//T is data source api
//S is data source cache
export abstract class Repository<D, T extends IDataSource<D>, S extends IPersistentDataSource<D>>
    implements IExchangeRateRepository, IRepository {

    protected data: D;

    constructor(private readonly apiDataSource: T, private readonly persistenceDataSource?: S, private readonly cacheDataSource?: CacheDataSource<D>) { }

    async load(noCache?: boolean) {
        if (this.cacheDataSource && !noCache) {
            let dataOrNull = await this.cacheDataSource.load();
            if (dataOrNull) {
                this.data = dataOrNull;
                return;
            }
        }
        await this.loadFromApi();
    }

    private async loadFromApi() {
        this.data = await this.apiDataSource.load();
        if (this.persistenceDataSource) {
            await this.persistenceDataSource.persist(this.data);
        }
    }

    abstract getExchangeRate(currencyCode: string): number | null;
}