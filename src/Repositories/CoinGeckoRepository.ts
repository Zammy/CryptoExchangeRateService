import { CoinGeckoCacheDataSource, CoinGeckoDataSource, CoinGeckoJsonData } from "../DataSources";
import { Repository } from "./Repository";

export class CoinGeckoRepository extends Repository<CoinGeckoJsonData, CoinGeckoDataSource, CoinGeckoCacheDataSource> {
    getExchangeRate(currencyCode: string): number | null {
        const rateInfo = this.data.rates[currencyCode];
        if (rateInfo) {
            return rateInfo.value;
        }
        return null;
    }
}