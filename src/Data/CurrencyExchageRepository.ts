import { IExchangeRateRepository } from "../Domain";

export type CurrencyExchageJsonData = { [key: string]: number };

export class CurrencyExchageRepository implements IExchangeRateRepository {

    constructor(private data: CurrencyExchageJsonData) { }

    getExchangeRate(currencyCode: string): number {
        const key = this.converCodeToKey(currencyCode);
        let rate: number | undefined = this.data[key];
        if (!rate) {
            throw new Error("Currency not supported! Use hasCurrency() to check if currency is supported.");
        }
        return rate;
    }

    hasCurrency(currencyCode: string): boolean {
        const key = this.converCodeToKey(currencyCode);
        let rate: number | undefined = this.data[key];
        return !(rate === undefined);
    }

    private converCodeToKey(currencyCode: string): string {
        return 'USD' + currencyCode.toUpperCase();
    }
}