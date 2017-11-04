let command = "build <stacks...>";

let desc = {|Builds and tags Docker images, described in the compose files for the specified stacks.
(Replaces ${tag} with current commit sha if no env variable named tag is set)
|};

let builder = Js.Obj.empty();

type argv = {. "stacks": array(string), "file": string};

let handler = (argv: argv) : Js.Promise.t(string) => {
  let stacks = Array.to_list(argv##stacks);
  let stepper = Log.step(List.length(stacks));
  let nextStep = ref(0);
  let logStep = (msg) => {
    nextStep := nextStep^ + 1;
    stepper(nextStep^, msg)
  };
  let config = Config.load(Node.Path.resolve([|argv##file|]));
  let promises =
    List.map(
      (stackName) =>
        switch (List.find((s: Config.stack) => s.name === stackName, config.stacks)) {
        | stack =>
          let args = List.concat(List.map((f) => ["-f", Node.Path.resolve([|f|])], stack.files));
          (
            (_) => {
              logStep({j|Building $stackName|j});
              ComposeFile.execFn("local", "docker-compose", args @ ["build"])
            }
          )
        | exception Not_found =>
          Log.err({j|Stack $stackName was not found in stacks yaml file|j});
          ((_) => Js.Promise.resolve(""))
        },
      stacks
    );
  Util.promisesInSeries("", promises)
};
