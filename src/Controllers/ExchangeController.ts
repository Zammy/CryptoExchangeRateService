import { Config } from "../Config";
import { Application } from "express";
import { IExchangeRateRepository, IRepository, UseCases } from "../UseCases";


export class ExchangeController {
    private syncDate: Date;
    private syncIntervalId?: NodeJS.Timeout;

    getSyncDate(): Date {
        return this.syncDate;
    }

    constructor(private readonly config: Config,
        private readonly app: Application,
        private readonly coinGeckoRepo: IRepository | IExchangeRateRepository,
        private readonly currencyLayerRepo: IRepository | IExchangeRateRepository) {
    }

    async init(): Promise<void> {
        await this.sync();
        this.setupRoute();
    }

    listen(): void {
        this.app.listen(this.config.port, () => {
            console.log("ExchangeController:: Server is listening");
        });
    }

    private syncWithTimeout(interval: number) {
        let syncInterval = this.syncIntervalId;
        this.syncIntervalId = setTimeout(() => {
            console.log("ExchangeController:: Sync with timeout!");
            this.sync();
        }, interval);

        if (syncInterval) {
            clearTimeout(syncInterval);
        }
    }

    private async sync(forceLatests?: boolean) {
        if (this.config.syncInterval > 0) {
            this.syncWithTimeout(this.config.syncInterval);
        }
        await UseCases.SynchronizeServicesWithLatest(this.coinGeckoRepo as IRepository, this.currencyLayerRepo as IRepository, forceLatests);
        this.syncDate = new Date();
        console.log("ExchangeController:: Both repositories were synced forceLatests:" + forceLatests);
    }

    private setupRoute() {
        this.app.get('/exchange', async (req, res) => {
            const query = req.query;
            const crypto = (query["crypto"] as string).toLocaleLowerCase();
            const fiat = (query["fiat"] as string).toLocaleLowerCase();
            let forceLatest: boolean = false;
            if (query["forceLatest"]) {
                forceLatest = (query["forceLatest"] as string).toLowerCase() == "true" ? true : false;
            }

            if (forceLatest) {
                console.log("ExchangeController/exchange::  Forced latest");
                await this.sync(true);
            }

            if (!UseCases.HasCurrencyCodeInRepository(this.coinGeckoRepo as IExchangeRateRepository, crypto)) {
                res.status(400);
                res.send({
                    'success': false,
                    error: `Crypto currency ${crypto} is not supported.`
                });
            } else if (!UseCases.HasCurrencyCodeInRepository(this.coinGeckoRepo as IExchangeRateRepository, fiat)
                && !UseCases.HasCurrencyCodeInRepository(this.currencyLayerRepo as IExchangeRateRepository, fiat)) {
                res.status(400);
                res.send({
                    'success': false,
                    error: `Fiat currency ${fiat} is not supported.`
                });
            } else {
                let exchangeRate = UseCases.CalculateCryptoExchangeRate(
                    this.coinGeckoRepo as IExchangeRateRepository,
                    this.currencyLayerRepo as IExchangeRateRepository,
                    crypto,
                    fiat
                );

                const lastUpdate = this.syncDate;
                res.send({
                    'success': true, 'crypto': crypto, 'fiat': fiat, 'exchangeRate': exchangeRate, 'lastUpdate': lastUpdate
                });
            }
        });
    }
}