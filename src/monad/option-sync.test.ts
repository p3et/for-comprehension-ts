import {isNone, isSome, none, Option, some} from "./option"
import {For} from "../for/sync"

test('should concat strings', () => {
  const option: Option<string> =
    For._("a", some("foo"))
       ._("b", () => some("bar"))
       ._("c", some("baz"))
       .yield(({a, b, c}) => a + b + c)

  if (isSome(option)) expect(option.value).toBe("foobarbaz")
  else fail()
})

test('should be none and skip subsequent code', async () => {
  let executed: boolean = false

  const option: Option<string> =
    For._("a", some("foo"))
       ._("b", () => none())
       ._("c", () => {
         executed = true
         return some("baz")
       })
       .yield(({a, b}) => a + b)

  if (isNone(option)) expect(executed).toBe(false)
  else fail()
})

test('should allow for intermediate combinations', () => {
  const option: Option<string[]> =
    For._("a", some("foo"))
       ._("b", ({a}) => some([a, "bar"]))
       ._("c", some("baz"))
       .yield(({b, c}) => b.concat(c))

  if (isSome(option)) expect(option.value).toEqual(["foo", "bar", "baz"])
  else fail()
})