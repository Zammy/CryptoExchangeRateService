import { CurrencyLayerCacheDataSource, CurrencyLayerDataSource, CurrencyLayerJsonData } from "../DataSources";
import { Repository } from "./Repository";

export class CurrencyLayerRepository extends Repository<CurrencyLayerJsonData, CurrencyLayerDataSource, CurrencyLayerCacheDataSource> {
    getExchangeRate(currencyCode: string): number | null {
        const key = this.converCodeToKey(currencyCode);
        let rate = this.data[key];
        return rate ? rate : null;
    }

    private converCodeToKey(currencyCode: string): string {
        return 'USD' + currencyCode.toUpperCase();
    }
}
