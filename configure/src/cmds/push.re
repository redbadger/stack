let command = "push <stacks...>";

let desc = {|Pushes Docker images, described in the compose files for the specified stacks.
|};

let builder = Js.Obj.empty();

type argv = {. "stacks": array(string), "file": string};

type thunk('a) = 'a => Js.Promise.t('a);

let handler = (argv: argv) : Js.Promise.t(string) => {
  let stepper = Log.step(Array.length(argv##stacks));
  let nextStep = ref(0);
  let logStep = (msg) => {
    nextStep := nextStep^ + 1;
    stepper(nextStep^, msg)
  };
  let config = Config.load(Node.Path.resolve([|argv##file|]));
  let promises =
    Array.map(
      (stackName) =>
        switch (List.find((s: Config.stack) => s.name === stackName, config.stacks)) {
        | stack =>
          let args = List.concat(List.map((f) => ["-f", Node.Path.resolve([|f|])], stack.files));
          (
            (_) => {
              logStep({j|Pushing $stackName|j});
              ComposeFile.execFn(
                "local",
                "docker-compose",
                args @ ["push"],
                ~stdout=true,
                ~stderr=false,
                ()
              )
            }
          )
        | exception Not_found =>
          Log.err({j|Stack $stackName was not found in stacks yaml file|j});
          ((_) => Js.Promise.resolve(""))
        },
      argv##stacks
    );
  Js.Promise.(
    Array.fold_left(
      (a: thunk(string), b: thunk(string), _) => a("") |> then_(b),
      resolve,
      promises,
      ""
    )
  )
};
