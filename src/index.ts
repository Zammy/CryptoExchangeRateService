import { Config } from "./Config";
import { ExchangeController } from "./Controllers/ExchangeController";

const config = new Config();

(async function () {
    const controller = new ExchangeController(config);
    await controller.init();
    controller.listen();
}());

