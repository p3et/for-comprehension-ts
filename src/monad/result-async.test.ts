import {failure, isFailure, isSuccess, Result, success} from "./result"
import {AsyncFor} from "../for/async";

test('should concat sync and async strings', async () => {
  const result: Result<string, string> = await
    AsyncFor._("a", () => Promise.resolve(success("foo")))
            ._("b", () => success("bar"))
            ._("c", () => success("baz"))
            .yield(({a, b, c}) => a + b + c)

  if (isSuccess(result)) expect(result.value).toBe("foobarbaz")
  else fail()
})

test('should be failure and skip subsequent code', async () => {
  let executed: boolean = false

  const result: Result<string, string> = await
    AsyncFor._("a", () => Promise.resolve(success("foo")))
            ._("b", () => failure("Oops!"))
            ._("c", () => {
              executed = true
              return success("baz")
            })
            .yield(({a, b}) => a + b)

  if (isFailure(result)) {
    expect(executed).toBe(false)
    expect(result.error).toBe("Oops!")
  } else fail()
})

test('should allow for intermediate combinations', async () => {
  const result: Result<string[], string> = await
    AsyncFor._("a", () => Promise.resolve(success("foo")))
            ._("b", ({a}) => success([a, "bar"]))
            ._("c", () => success("baz"))
            .yield(({b, c}) => b.concat(c))

  if (isSuccess(result)) expect(result.value).toEqual(["foo", "bar", "baz"])
  else fail()
})