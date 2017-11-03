open Jest;

open Expect;

describe(
  "util",
  () => {
    test(
      "concatAssocListValues",
      () => {
        let a = [("a", ["a.yml", "a1.yml"]), ("b", ["b.yml"])];
        let b = [("a", ["a2.yml"]), ("b", ["b1.yml"])];
        let expected = [("a", ["a.yml", "a1.yml", "a2.yml"]), ("b", ["b.yml", "b1.yml"])];
        let actual = Util.concatAssocListValues(a, b);
        expect(actual) |> toEqual(expected)
      }
    );
    testPromise(
      "promisesInSeries",
      () => {
        let promises = [(a) => Js.Promise.resolve(a ++ "b"), (b) => Js.Promise.resolve(b ++ "c")];
        let expected = "abc";
        Util.promisesInSeries("a", promises)
        |> Js.Promise.then_((actual) => Js.Promise.resolve(expect(actual) |> toBe(expected)))
      }
    )
  }
);
