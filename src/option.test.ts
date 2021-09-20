import {isNone, isSome, none, some} from "./option"
import {For} from "./for"
import {isSuccess} from "./result"

test('should be some in explicit syntax', async done =>
    For.init("a", some(3))
       .flatMap("b", () => some(["foo", "bar"]))
       .map("c", ({a, b}) => b.length + a)
       .flatMap("d", async ({b}) => some(b[1]))
       .map("e", async ({a, c}) => a * c)
       .yield(({d, e}) => `${d} ${e}`)
       .then(option => {
           if (isSome(option)) expect(option.value).toBe("bar 15")
           else fail()
       })
       .then(() => done())
)

test('should be some in slim syntax', async done =>
    For._("a", some(3)) // initializer
       ._("b", () => some(["foo", "bar"])) // sync flatMap
       ._("c", ({a, b}) => b.length + a) // sync map
       ._("d", async ({b}) => some(b[1])) // async flatMap
       ._("e", async ({a, c}) => a * c) // async map
       .yield(({d, e}) => `${d} ${e}`) // execute and map
       .then(option => {
           if (isSome(option)) expect(option.value).toBe("bar 15")
           else fail()
       })
       .then(() => done())
)

test('should be none in explicit syntax', async done =>
    For.init("a", some(1))
       .flatMap("b", () => none<never>())
       .map("c", async () => 3)
       .flatMap("d", async ({a, c}) => some([c, a]))
        // @ts-ignore
       .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .then(option => expect(isNone(option)).toBe(true))
       .then(() => done())
)

test('should be none in slim syntax', async done =>
    For._("a", some(1))
       ._("b", () => none<never>())
       ._("c", async () => 3)
       ._("d", async ({a, c}) => some([c, a]))
        // @ts-ignore
       .yield(({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .then(option => expect(isNone(option)).toBe(true))
       .then(() => done())
)
