import {failure, isSuccess, Result, success} from "./monad/result";
import {For} from "./for/common";

(() => {
    const result = For
        .result<string>()
        .sync("dividend", () => success(42))
        .fm("divisor", () => success(2))
        .fm("divisorVerified", ({divisor}) =>
            divisor > 0
                ? success(divisor)
                : failure<number, string>("Divisor must be > 0!"))
        .yield(({dividend, divisorVerified}) => dividend / divisorVerified)

    console.log(isSuccess(result) ? result.value : result.error)
})();

(async () => {
    const result = await For
        .result<string>()
        .async("dividend", async () => success(42))
        .fm("divisor", () => success(2))
        .fm("divisorVerified", ({divisor}) =>
            divisor > 0
                ? success(divisor)
                : failure<number, string>("Divisor must be > 0!"))
        .yield(({dividend, divisorVerified}) => dividend / divisorVerified)

    console.log(isSuccess(result) ? result.value : result.error)
})();
