import { Config } from "../Config";
import { ExchangeController } from "../Controllers/ExchangeController";

// const sleep = (milliseconds: number) => {
//     return new Promise(resolve => setTimeout(resolve, milliseconds))
// }

describe('ExchangeController', () => {

    jest.useFakeTimers();

    let mock_app: any;
    let mock_coinGeckoRepo: any;
    let mock_currencyLayerRepo: any;

    let exchangeController: ExchangeController;

    beforeEach(() => {
        mock_app = {};
        mock_coinGeckoRepo = {};
        mock_currencyLayerRepo = {};
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('should setup route /exchange on init', async () => {
        const config = new Config({
            port: 3000,
            syncInterval: 0,

        });
        let mock_appGet = jest.fn();
        mock_app['get'] = mock_appGet;
        let mock_cryptoRepoLoad = jest.fn();
        mock_coinGeckoRepo['load'] = mock_cryptoRepoLoad;
        let mock_currencyLayerRepoLoad = jest.fn();
        mock_currencyLayerRepo['load'] = mock_currencyLayerRepoLoad;
        exchangeController = new ExchangeController(config, mock_app, mock_coinGeckoRepo, mock_currencyLayerRepo);

        await exchangeController.init();

        expect(mock_appGet).toHaveBeenCalledWith('/exchange', expect.any(Function));
    });

    it('should sync services on init', async () => {
        const config = new Config({
            port: 3000,
            syncInterval: 99,

        });
        let mock_appGet = jest.fn();
        mock_app['get'] = mock_appGet;
        let mock_cryptoRepoLoad = jest.fn(() => Promise.resolve());
        mock_coinGeckoRepo['load'] = mock_cryptoRepoLoad;
        let mock_currencyLayerRepoLoad = jest.fn(() => Promise.resolve());
        mock_currencyLayerRepo['load'] = mock_currencyLayerRepoLoad;
        exchangeController = new ExchangeController(config, mock_app, mock_coinGeckoRepo, mock_currencyLayerRepo);

        await exchangeController.init();

        expect(mock_cryptoRepoLoad).toHaveBeenCalled();
        expect(mock_currencyLayerRepoLoad).toHaveBeenCalled();
    });

    it('should return exchange rate with correct input params', async () => {
        const usdCode = 'usd';
        const btcCode = 'btc';
        const config = new Config({
            syncInterval: 0,
        });
        mock_coinGeckoRepo['load'] = jest.fn(() => Promise.resolve());
        mock_coinGeckoRepo['getExchangeRate'] = jest.fn((currencyCode) => {
            if (currencyCode == usdCode) {
                return 1000;
            } else if (currencyCode == btcCode) {
                return 1;
            }
            return 0;
        });;
        mock_currencyLayerRepo['load'] = jest.fn(() => Promise.resolve());
        mock_app['get'] = jest.fn();
        exchangeController = new ExchangeController(config, mock_app, mock_coinGeckoRepo, mock_currencyLayerRepo);
        await exchangeController.init();
        let request = {
            query: {
                crypto: btcCode,
                fiat: usdCode
            }
        };
        let response = { send: jest.fn() };
        let routeFunc = mock_app['get'].mock.calls[0][1];

        await routeFunc(request, response);

        expect(response.send).toHaveBeenCalledWith({
            'success': true, 'crypto': btcCode, 'fiat': usdCode, 'exchangeRate': 1000, 'lastUpdate': expect.any(Date)
        });
    });

    it('should return 400 code when crypto code is not supported', async () => {
        const usdCode = 'usd';
        const btcCode = 'btc';
        const config = new Config({
            syncInterval: 0,
        });
        mock_coinGeckoRepo['load'] = jest.fn(() => Promise.resolve());
        mock_coinGeckoRepo['getExchangeRate'] = jest.fn((currencyCode) => {
            if (currencyCode == usdCode) {
                return 1000;
            } else if (currencyCode == btcCode) {
                return 1;
            }
            return 0;
        });;
        mock_currencyLayerRepo['load'] = jest.fn(() => Promise.resolve());
        mock_app['get'] = jest.fn();
        exchangeController = new ExchangeController(config, mock_app, mock_coinGeckoRepo, mock_currencyLayerRepo);
        await exchangeController.init();
        let request = {
            query: {
                crypto: 'not existing crypto code',
                fiat: usdCode
            }
        };
        let response = {
            send: jest.fn(),
            status: jest.fn()
        };
        let routeFunc = mock_app['get'].mock.calls[0][1];

        await routeFunc(request, response);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.send).toHaveBeenCalledWith({
            'success': false, 'error': expect.any(String)
        });
    });

    it('should return 400 code when fiat code is not supported', async () => {
        const usdCode = 'usd';
        const btcCode = 'btc';
        const config = new Config({
            syncInterval: 0,
        });
        mock_coinGeckoRepo['load'] = jest.fn(() => Promise.resolve());
        mock_coinGeckoRepo['getExchangeRate'] = jest.fn((currencyCode) => {
            if (currencyCode == usdCode) {
                return 1000;
            } else if (currencyCode == btcCode) {
                return 1;
            }
            return 0;
        });;
        mock_currencyLayerRepo['load'] = jest.fn(() => Promise.resolve());
        mock_currencyLayerRepo['getExchangeRate'] = jest.fn(() => {
            return 0;
        });
        mock_app['get'] = jest.fn();
        exchangeController = new ExchangeController(config, mock_app, mock_coinGeckoRepo, mock_currencyLayerRepo);
        await exchangeController.init();
        let request = {
            query: {
                crypto: btcCode,
                fiat: 'non existant fiat code'
            }
        };
        let response = {
            send: jest.fn(),
            status: jest.fn()
        };
        let routeFunc = mock_app['get'].mock.calls[0][1];

        await routeFunc(request, response);

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.send).toHaveBeenCalledWith({
            'success': false, 'error': expect.any(String)
        });
    });

    it('should periodically sync with services', async () => {
        const config = new Config({
            syncInterval: 40,
        });
        mock_coinGeckoRepo['load'] = jest.fn(() => Promise.resolve());
        mock_currencyLayerRepo['load'] = jest.fn(() => Promise.resolve());
        mock_app['get'] = jest.fn();
        exchangeController = new ExchangeController(config, mock_app, mock_coinGeckoRepo, mock_currencyLayerRepo);

        await exchangeController.init();

        expect(mock_coinGeckoRepo['load']).toHaveBeenCalledTimes(1);
        expect(mock_currencyLayerRepo['load']).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(40);

        expect(mock_coinGeckoRepo['load']).toHaveBeenCalledTimes(2);
        expect(mock_currencyLayerRepo['load']).toHaveBeenCalledTimes(2);
    }, 100);

    it('should cancel delayed sync if forced latest on api call', async () => {
        const config = new Config({
            syncInterval: 50,
        });
        mock_coinGeckoRepo['load'] = jest.fn(() => Promise.resolve());
        mock_currencyLayerRepo['load'] = jest.fn(() => Promise.resolve());
        mock_coinGeckoRepo['getExchangeRate'] = jest.fn(() => 0);
        mock_currencyLayerRepo['getExchangeRate'] = jest.fn(() => 0);
        mock_app['get'] = jest.fn();
        exchangeController = new ExchangeController(config, mock_app, mock_coinGeckoRepo, mock_currencyLayerRepo);
        await exchangeController.init();
        let request = {
            query: {
                crypto: 'btc',
                fiat: 'usd',
                forceLatest: "true"
            }
        };
        let response = {
            send: jest.fn(),
            status: jest.fn()
        };
        let routeFunc = mock_app['get'].mock.calls[0][1];

        jest.advanceTimersByTime(45);

        await routeFunc(request, response);
        jest.advanceTimersByTime(10);

        expect(mock_coinGeckoRepo['load']).toHaveBeenCalledTimes(2);
        expect(mock_currencyLayerRepo['load']).toHaveBeenCalledTimes(2);
    }, 100);

    it('should not cancel delayed sync after api call', async () => {
        const config = new Config({
            syncInterval: 50,
        });
        mock_coinGeckoRepo['load'] = jest.fn(() => Promise.resolve());
        mock_currencyLayerRepo['load'] = jest.fn(() => Promise.resolve());
        mock_coinGeckoRepo['getExchangeRate'] = jest.fn(() => 0);
        mock_currencyLayerRepo['getExchangeRate'] = jest.fn(() => 0);
        mock_app['get'] = jest.fn();
        exchangeController = new ExchangeController(config, mock_app, mock_coinGeckoRepo, mock_currencyLayerRepo);
        await exchangeController.init();
        let request = {
            query: {
                crypto: 'btc',
                fiat: 'usd',
            }
        };
        let response = {
            send: jest.fn(),
            status: jest.fn()
        };
        let routeFunc = mock_app['get'].mock.calls[0][1];

        jest.advanceTimersByTime(45);

        await routeFunc(request, response);
        jest.advanceTimersByTime(10);

        expect(mock_coinGeckoRepo['load']).toHaveBeenCalledTimes(2);
        expect(mock_currencyLayerRepo['load']).toHaveBeenCalledTimes(2);
    }, 100);

    it('should force sync repositories on force sync', async () => {
        const config = new Config({
            syncInterval: 50,
        });
        mock_coinGeckoRepo['load'] = jest.fn(() => Promise.resolve());
        mock_currencyLayerRepo['load'] = jest.fn(() => Promise.resolve());
        mock_coinGeckoRepo['getExchangeRate'] = jest.fn(() => 0);
        mock_currencyLayerRepo['getExchangeRate'] = jest.fn(() => 0);
        mock_app['get'] = jest.fn();
        exchangeController = new ExchangeController(config, mock_app, mock_coinGeckoRepo, mock_currencyLayerRepo);
        await exchangeController.init();
        let request = {
            query: {
                crypto: 'btc',
                fiat: 'usd',
                forceLatest: 'true'
            }
        };
        let response = {
            send: jest.fn(),
            status: jest.fn()
        };
        let routeFunc = mock_app['get'].mock.calls[0][1];

        await routeFunc(request, response);

        expect(mock_coinGeckoRepo['load']).toHaveBeenCalledTimes(2);
        expect(mock_currencyLayerRepo['load']).toHaveBeenCalledTimes(2);
    });

    it('should not sync on a normal call', async () => {
        const config = new Config({
            syncInterval: 50,
        });
        mock_coinGeckoRepo['load'] = jest.fn(() => Promise.resolve());
        mock_currencyLayerRepo['load'] = jest.fn(() => Promise.resolve());
        mock_coinGeckoRepo['getExchangeRate'] = jest.fn(() => 0);
        mock_currencyLayerRepo['getExchangeRate'] = jest.fn(() => 0);
        mock_app['get'] = jest.fn();
        exchangeController = new ExchangeController(config, mock_app, mock_coinGeckoRepo, mock_currencyLayerRepo);
        await exchangeController.init();
        let request = {
            query: {
                crypto: 'btc',
                fiat: 'usd',
            }
        };
        let response = {
            send: jest.fn(),
            status: jest.fn()
        };
        let routeFunc = mock_app['get'].mock.calls[0][1];

        await routeFunc(request, response);

        expect(mock_coinGeckoRepo['load']).toHaveBeenCalledTimes(1);
        expect(mock_currencyLayerRepo['load']).toHaveBeenCalledTimes(1);
    });
});