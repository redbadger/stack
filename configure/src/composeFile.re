type env = Js.Dict.t(string);

type stream = Js.undefined(int);

type childProcess = {. "stdout": stream};

[@bs.val] external process_env : env = "process.env";

[@bs.module "./docker-server"] external getEnv : string => Js.Promise.t(env) = "";

[@bs.module "./docker-server"]
external exec : (env, string, array(string), Js.boolean, Js.boolean) => childProcess =
  "";

[@bs.module] external getRepoInfo : unit => Js.t({..}) = "git-repo-info";

[@bs.module] external getStream : stream => string = "get-stream";

open Config;

let join = List.fold_left((a, x) => a ++ x, "");

let group = (f, l) => {
  let rec grouping = (acc) =>
    fun
    | [] => acc
    | [hd, ...tl] => {
        let (l1, l2) = List.partition(f(hd), tl);
        grouping([[hd, ...l1], ...acc], l2)
      };
  grouping([], l)
};

let createPortOverlays = (services: list(service)) => {
  let grouped: list(list(service)) = group((s1, s2) => s1.stack === s2.stack, services);
  List.map(
    (services) => (
      List.hd(services).stack,
      List.fold_left(
        (acc: string, svc: service) =>
          acc
          ++ (
            switch svc.port {
            | None => ""
            | Some(p) =>
              "\n  " ++ (svc.name ++ (":\n    ports:\n      - " ++ (string_of_int(p) ++ ":3000")))
            }
          ),
        {|version: "3.1"

services:|},
        services
      )
    ),
    grouped
  )
};

let merge = (execFn, server, filesByStack, resolve) : list((string, Js.Promise.t(string))) =>
  List.map(
    ((stack, files)) => {
      let fileArgs = List.concat(List.map((f) => ["-f", Node.Path.resolve([|f|])], files));
      let resolveArgs = resolve ? ["--resolve-image-digests"] : [];
      (stack, execFn(server, "docker-compose", fileArgs @ resolveArgs @ ["config"]))
    },
    filesByStack
  );

let write =
    (writeFn, contentByStack: list((string, Js.Promise.t(string))), stage: string)
    : list((string, Js.Promise.t(string))) =>
  List.map(
    ((stack, promiseOfContent)) => (
      stack,
      {
        let file = Node.Path.resolve([|{j|$stack-$stage.yml|j}|]);
        promiseOfContent
        |> Js.Promise.then_(
             (content) => {
               writeFn(file, content);
               Js.Promise.resolve(file)
             }
           )
      }
    ),
    contentByStack
  );

let execFn = (server: string, cmd: string, args: list(string)) : Js.Promise.t(string) =>
  getEnv(server)
  |> Js.Promise.then_(
       (env) => {
         Js.Dict.set(
           env,
           "tag",
           switch (Js.Dict.get(process_env, "tag")) {
           | None => getRepoInfo()##abbreviatedSha
           | Some(tag) => tag
           }
         );
         let cp: childProcess = exec(env, cmd, Array.of_list(args), Js.true_, Js.true_);
         Js.Promise.resolve(getStream(cp##stdout))
       }
     );

let writeFn = (filePath, content) => {
  Log.log({j|Writing $filePath|j});
  Node.Fs.writeFileSync(~filename=filePath, ~text=content)
};
