import {failure, isSuccess, Result, success} from "./monad/result";
import {For} from "./for/sync";
import {AsyncFor} from "./for/async";

(() => {
    const result: Result<number, string> =
        For._("dividend", () => success(42))
            ._("divisor", () => success(2))
            ._("divisorVerified", ({divisor}) =>
                divisor > 0
                    ? success(divisor)
                    : failure<number, string>("Divisor must be > 0!"))
            .yield(({dividend, divisorVerified}) => dividend / divisorVerified)

    console.log(isSuccess(result) ? result.value : result.error)
})();

(async () => {
    const result: Result<number, string> =
        await AsyncFor._("dividend", () => Promise.resolve(success(42)))
            ._("divisor", () => success(2))
            ._("divisorVerified", ({divisor}) =>
                divisor > 0
                    ? success(divisor)
                    : failure<number, string>("Divisor must be > 0!"))
            .yield(({dividend, divisorVerified}) => dividend / divisorVerified)

    console.log(isSuccess(result) ? result.value : result.error)
})();
