import {isPresent, None, Some} from "./option";
import {For} from "./for";

test('should be some 7', async done =>
    For._("a", Some.of(1))
       .map("b", () => Promise.resolve("two"))
       .flatMap("c", () => Some.of(3))
       .flatMap("d", ({a, c}) => Promise.resolve(Some.of([c, a])))
       .map("sum", ({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .yield(({sum}) => sum)
       .then(option => {
           expect(isPresent(option)).toBeTruthy();
           expect(option.unwrap()).toBe(7);
       })
       .then(() => done())
)

test('should be none', async done =>
    For._("a", Some.of(1))
       .map("b", () => Promise.resolve("two"))
       .flatMap("c", () => None.of<number>())
       .flatMap("d", ({a, c}) => Promise.resolve(Some.of([c, a])))
       .map("sum", ({a, b, c, d}) => (a + b.length + c) * d.sort()[0])
       .yield(({sum}) => sum)
       .then(option => expect(isPresent(option)).toBeFalsy())
       .then(() => done())
)
