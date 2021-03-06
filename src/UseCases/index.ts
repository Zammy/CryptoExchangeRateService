export interface IExchangeRateRepository {
    getExchangeRate(currencyCode: string): number | null;
}
export interface IRepository {
    load(forceLatest?: boolean): Promise<void>;
}

const usdCode = 'usd';
export class UseCases {

    static HasCurrencyCodeInRepository(repo: IExchangeRateRepository, code: string): boolean {
        return (repo.getExchangeRate(code)) ? true : false;
    }

    static CalculateCryptoExchangeRate(cryptoRepo: IExchangeRateRepository, fiatRepo: IExchangeRateRepository, cryptoCode: string, fiatCode: string): number {
        const cryptoRate = cryptoRepo.getExchangeRate(cryptoCode);
        if (cryptoRate) {
            const fiatRate = cryptoRepo.getExchangeRate(fiatCode);
            if (fiatRate) {
                return fiatRate / cryptoRate;
            }
            const dollarRate = cryptoRepo.getExchangeRate(usdCode);
            const toDollarFiatRate = fiatRepo.getExchangeRate(fiatCode);
            if (dollarRate && toDollarFiatRate) {
                return toDollarFiatRate * dollarRate / cryptoRate;
            }
        }
        return 0;
    }

    static async SynchronizeServicesWithLatest(cryptoRepo: IRepository, fiatRepo: IRepository, forceLatest?: boolean): Promise<void> {
        await Promise.all([cryptoRepo.load(forceLatest), fiatRepo.load(forceLatest)]);
    }
}