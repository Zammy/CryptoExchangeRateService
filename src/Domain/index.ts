export interface IExchangeRateRepository {
    getExchangeRate(currencyCode: string): number;
    hasCurrency(currencyCode: string): boolean;
}

const usdCode = 'usd';
export class UseCases {

    static CalculateCryptoExchangeRate(cryptoRepo: IExchangeRateRepository, fiatRepo: IExchangeRateRepository, cryptoCode: string, fiatCode: string): number {
        if (cryptoRepo.hasCurrency(cryptoCode)) {
            if (cryptoRepo.hasCurrency(fiatCode)) {
                return cryptoRepo.getExchangeRate(fiatCode) / cryptoRepo.getExchangeRate(cryptoCode);
            }
            if (fiatRepo.hasCurrency(fiatCode)) {
                return fiatRepo.getExchangeRate(fiatCode) * cryptoRepo.getExchangeRate(usdCode)
                    / cryptoRepo.getExchangeRate(cryptoCode);
            }
        }
        return 0;
    }
}