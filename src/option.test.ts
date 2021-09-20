import {isNone, isSome, none, some} from "./option"
import {For} from "./for"

test('should concat strings', async done =>
  For._("a", () => some("foo"))
     ._("b", () => some("bar"))
     ._("c", () => some("baz"))
     .yield(({a, b, c}) => a + b + c)
     .then(option => {
       if (isSome(option)) expect(option.value).toBe("foobarbaz")
       else fail()
     })
     .then(() => done())
)

let executed = false
test('should be none and skip subsequent code', async done =>
  For._("a", () => some("foo"))
     ._("b", () => none())
     ._("b", () => {
       executed = true
       return some("baz")
     })
     .yield(({a, b}) => a + b)
     .then(option => {
       if (isNone(option)) expect(executed).toBe(false)
       else fail()
     })     .then(() => done())
)

test('should allow for intermediate combinations', async done =>
  For._("a", () => some("foo"))
     ._("b", ({a}) => some([a, "bar"]))
     ._("c", () => some("baz"))
     .yield(({b, c}) => b.concat(c))
     .then(option => {
       if (isSome(option)) expect(option.value).toEqual(["foo", "bar", "baz"])
       else fail()
     })
     .then(() => done())
)