import { IExchangeRateRepository } from "../Domain";

type MoneyType = 'crypto' | 'fiat';
interface RateInfo {
    "name": string,
    "unit": string,
    "value": number,
    "type": MoneyType
}
export type CoinGeckoJsonData = { 'rates': { [key: string]: RateInfo } };

export class CoinGeckoRepository implements IExchangeRateRepository {

    constructor(private data: CoinGeckoJsonData) { }

    getData(): CoinGeckoJsonData {
        return this.data;
    }

    getExchangeRate(currencyCode: string): number {
        let rateInfo = this.data.rates[currencyCode];
        if (!rateInfo) {
            throw new Error("Currency not supported! Use hasCurrency() to check if currency is supported.");
        }
        return this.data.rates[currencyCode].value;
    }

    hasCurrency(currencyCode: string): boolean {
        let rateInfo: RateInfo | undefined = this.data.rates[currencyCode];
        return !(rateInfo === undefined);
    }
}