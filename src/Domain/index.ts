export interface IExchangeRateDataSources {
    getExchangeRate(currencyCode: string): number;
    hasCurrency(currencyCode: string): boolean;
}

const usdCode = 'usd';
export class UseCases {

    static CalculateCryptoExchangeRate(cryptoSource: IExchangeRateDataSources, fiatSource: IExchangeRateDataSources, cryptoCode: string, fiatCode: string): number {
        if (cryptoSource.hasCurrency(cryptoCode)) {
            if (cryptoSource.hasCurrency(fiatCode)) {
                return cryptoSource.getExchangeRate(fiatCode) / cryptoSource.getExchangeRate(cryptoCode);
            }
            if (fiatSource.hasCurrency(fiatCode)) {
                return fiatSource.getExchangeRate(fiatCode) * cryptoSource.getExchangeRate(usdCode)
                    / cryptoSource.getExchangeRate(cryptoCode);
            }
        }
        return 0;
    }
}