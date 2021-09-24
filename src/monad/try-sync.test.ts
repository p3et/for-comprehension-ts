import {error, isError, isOk, Try, ok} from "./try"
import {For} from "../for/sync"

test('should concat strings', () => {
  const _try: Try<string> =
    For._("a", ok("foo"))
       ._("b", () => ok("bar"))
       ._("c", () => ok("baz"))
       .yield(({a, b, c}) => a + b + c)

  if (isOk(_try)) expect(_try.value).toBe("foobarbaz")
  else fail()
})

test('should be error and skip subsequent code', async () => {
  let executed: boolean = false

  const _try: Try<string> =
    For._("a", ok("foo"))
       ._("b", () => error("Oops!"))
       ._("c", () => {
         executed = true
         return ok("baz")
       })
       .yield(({a, b}) => a + b)

  if (isError(_try)) expect(executed).toBe(false)
  else fail()
})

test('should allow for intermediate combinations', () => {
  const _try: Try<string[]> =
    For._("a", ok("foo"))
       ._("b", ({a}) => ok([a, "bar"]))
       ._("c", () => ok("baz"))
       .yield(({b, c}) => b.concat(c))

  if (isOk(_try)) expect(_try.value).toEqual(["foo", "bar", "baz"])
  else fail()
})