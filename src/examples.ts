import {failure, isSuccess, Result, success} from "./result";
import {AsyncFor, For} from "./for";

(() => {
  const result: Result<number, string> =
      success<number, string>(42)
      .flatMap(dividend => success<number, string>(2)
               .flatMap(divisor => divisor > 0 ? success(divisor)
                                               : failure("Divisor must be > 0!"))
               .map(divisorVerified => dividend / divisorVerified)
      )

  console.log(isSuccess(result) ? result.value : result.error)
})();

(() => {
  const result: Result<number, string> =
      For._("dividend", () => success(42))
         ._("divisor", () => success(2))
         ._("divisorVerified", ({divisor}) => divisor > 0 ? success(divisor)
                                                          : failure("Divisor must be > 0!"))
         .yield(({dividend, divisorVerified}) => dividend / divisorVerified)

  console.log(isSuccess(result) ? result.value : result.error)
})();

(async () => {
  const result: Result<number, string> =
      await AsyncFor._("dividend", () => Promise.resolve(success(42)))
                    ._("divisor", () => success(2))
                    ._("divisorVerified", ({divisor}) => divisor > 0 ? success(divisor)
                                                                     : failure("Divisor must be > 0!"))
                    .yield(({dividend, divisorVerified}) => dividend / divisorVerified)

  console.log(isSuccess(result) ? result.value : result.error)
})();
