import { UseCases, IExchangeRateRepository } from "../Domain";

describe("Domain tests", () => {
  const ethCode = 'eth';
  const usdCode = 'usd';
  const bgnCode = 'bgn';
  let cryptoDataSource: IExchangeRateRepository;
  let fiatDataSource: IExchangeRateRepository;

  beforeEach(() => {
    cryptoDataSource = (new class MockData implements IExchangeRateRepository {
      getExchangeRate(currencyCode: string): number {
        if (currencyCode === ethCode)
          return 40;
        if (currencyCode === usdCode)
          return 1000;
        return 0;
      }
      hasCurrency(currencyCode: string): boolean {
        return currencyCode === ethCode || currencyCode === usdCode;
      }
    });
    fiatDataSource = (new class MockData implements IExchangeRateRepository {
      getExchangeRate(currencyCode: string): number {
        if (currencyCode === bgnCode)
          return 2;
        return 0;
      }
      hasCurrency(currencyCode: string): boolean {
        return currencyCode === bgnCode;
      }
    });
  });

  test("UseCases.CalculateCryptoExchangeRate is exchanging correctly with crypto source only", () => {
    expect(UseCases.CalculateCryptoExchangeRate(cryptoDataSource, fiatDataSource, ethCode, usdCode)).toBe(25);
  });

  test("UseCases.CalculateCryptoExchangeRate is exchanging correctly with fiat source", () => {
    expect(UseCases.CalculateCryptoExchangeRate(cryptoDataSource, fiatDataSource, ethCode, bgnCode)).toBe(50);
  });

  test("UseCases.CalculateCryptoExchangeRate is return 0 if no code in fiat data source", () => {
    expect(UseCases.CalculateCryptoExchangeRate(cryptoDataSource, fiatDataSource, ethCode, 'xxx')).toBe(0);
  })

  test("UseCases.CalculateCryptoExchangeRate is return 0 if no code in crypto data source", () => {
    expect(UseCases.CalculateCryptoExchangeRate(cryptoDataSource, fiatDataSource, 'xxx', bgnCode)).toBe(0);
  })
});