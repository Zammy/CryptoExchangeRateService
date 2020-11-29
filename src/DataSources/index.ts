import { CacheDataSource } from "./CacheDataSource";

export type CurrencyLayerJsonData = { [key: string]: number };

type MoneyType = 'crypto' | 'fiat';
interface RateInfo {
    "name": string,
    "unit": string,
    "value": number,
    "type": MoneyType
}
export type CoinGeckoJsonData = { 'rates': { [key: string]: RateInfo } };

export interface IDataSource<T> {
    load(): Promise<T>;
}

export interface IPersistentDataSource<T> {
    persist(data: T): Promise<void>;
}

export class CoinGeckoCacheDataSource extends CacheDataSource<CoinGeckoJsonData> { }
export class CurrencyLayerCacheDataSource extends CacheDataSource<CurrencyLayerJsonData> { }

export { CoinGeckoDataSource } from "./CoinGeckoDataSource";
export { CurrencyLayerDataSource } from "./CurrencyLayerDataSource";