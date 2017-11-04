type assocList = list((string, list(string)));

let concatAssocListValues = (a: assocList, b: assocList) =>
  List.map2((a, b) => (fst(a), List.concat([snd(a), snd(b)])), a, b);

type thunk('a) = 'a => Js.Promise.t('a);

let promisesInSeries = (initial: 'a, promises: list(thunk('a))) : Js.Promise.t('a) =>
  List.fold_left(
    (a, b, x) => a(x) |> Js.Promise.then_(b),
    (a) => Js.Promise.resolve(a),
    promises,
    initial
  );
