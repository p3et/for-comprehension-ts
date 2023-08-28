import {failure, isSuccess, Result, success} from "./monad/result";
import {For} from "./for/init";

(() => {
    const result =
        success<number, string>(42)
            .flatMap(dividend => success<number, string>(2)
                .flatMap(divisor => divisor > 0 ? success(divisor)
                    : failure<number, string>("Divisor must be > 0!"))
                .map(divisorVerified => dividend / divisorVerified)
            )

    console.log(isSuccess(result) ? result.value : result.error)
})();

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

declare function serviceA(): Promise<Result<number, string>>
declare function serviceB(a: number): Promise<Result<number, string>>
declare function serviceC(b: number): Promise<Result<number, string>>


const promise = For
    .result<string>()
    .async("a", () => serviceA())
    .fmp("b", ["a"], ({a}) => serviceB(a))
    .fmp("c", ["a"], ({a}) => serviceC(a))
    .yield(({b, c}) => b + c)
