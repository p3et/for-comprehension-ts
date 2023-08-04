import {failure, isFailure, isSuccess, Result, success} from "./result"
import {For} from "../for/sync";

test('should concat strings', () => {
  const result: Result<string, string> =
    For._("a", () => success("foo"))
       ._("b", () => success("bar"))
       ._("c", () => success("baz"))
       .yield(({a, b, c}) => a + b + c)

  if (isSuccess(result)) expect(result.value).toBe("foobarbaz")
  else fail()
})

test('should be failure and skip subsequent code', async () => {
  let executed: boolean = false

  const result: Result<string, string> =
    For._("a", () => success("foo"))
       ._("b", () => failure("Oops!"))
       ._("c", () => {
         executed = true
         return success("baz")
       })
       .yield(({a, b}) => a + b)

  if (isFailure(result)) expect(executed).toBe(false)
  else fail()
})

test('should allow for intermediate combinations', () => {
  const result: Result<string[], string> =
    For._("a", () => success("foo"))
       ._("b", ({a}) => success([a, "bar"]))
       ._("c", () => success("baz"))
       .yield(({b, c}) => b.concat(c))

  if (isSuccess(result)) expect(result.value).toEqual(["foo", "bar", "baz"])
  else fail()
})