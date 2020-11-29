import { CoinGeckoRepository } from '../Repositories';

describe('Respoitory ', () => {
    let mock_cache: any;// CacheDataSource<CoinGeckoJsonData>;
    let mock_cachePersist: any;// jest.Mock<(data: CoinGeckoJsonData) => Promise<void>>;
    let mock_cacheLoad: any;//jest.Mock<() => Promise<CoinGeckoJsonData>>;


    let mock_apiLoad: any;// jest.Mock<() => Promise<CoinGeckoJsonData>>;
    let mock_apiDataSource: any;// IDataSource<CoinGeckoJsonData>;
    let repo: CoinGeckoRepository;


    beforeEach(() => {
        mock_cachePersist = jest.fn();
        mock_cacheLoad = jest.fn();
        mock_cache = {};
        mock_cache['persist'] = mock_cachePersist as any;
        mock_cache['load'] = mock_cacheLoad as any;

        mock_apiLoad = jest.fn();
        mock_apiDataSource = {};
        mock_apiDataSource['load'] = mock_apiLoad as any;
    });


    afterEach(() => {
        // apiMock
    });

    it("should use live API on load when no cache source", async () => {
        repo = new CoinGeckoRepository(mock_apiDataSource, mock_cache);

        await repo.load();

        expect(mock_apiLoad).toHaveBeenCalled();
    });

    it("should use live API when cashe data not loaded because of missing cache file ", async () => {
        repo = new CoinGeckoRepository(mock_apiDataSource, mock_cache, mock_cache);

        await repo.load();

        expect(mock_apiLoad).toHaveBeenCalled();
        expect(mock_cacheLoad).toHaveBeenCalled();
    });

    it("should use cache data when available ", async () => {
        let mock_cache_Load = jest.fn(() => { return Promise.resolve("{}"); });
        mock_cache['load'] = mock_cache_Load as any;
        repo = new CoinGeckoRepository(mock_apiDataSource, mock_cache, mock_cache);

        await repo.load();

        expect(mock_apiLoad).not.toHaveBeenCalled();
        expect(mock_cache_Load).toHaveBeenCalled();
    });


    it("should NOT use cache data when forced  ", async () => {
        repo = new CoinGeckoRepository(mock_apiDataSource, mock_cache, mock_cache);

        await repo.load(true);

        expect(mock_apiLoad).toHaveBeenCalled();
        expect(mock_cacheLoad).not.toHaveBeenCalled();
    });


    it("should persist to cache if available", async () => {
        repo = new CoinGeckoRepository(mock_apiDataSource, mock_cache);

        await repo.load();

        expect(mock_cachePersist).toHaveBeenCalled();
    });
});