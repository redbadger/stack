[@bs.module "../compose-file"]
external execFn : (string, string, array(string), Js.boolean) => Js.Promise.t(unit) =
  "";

let command = "push <stacks...>";

let desc = {|Pushes Docker images, described in the compose files for the specified stacks.
|};

let builder = Js.Obj.empty();

type argv = {. "stacks": array(string), "file": string};

let handler = (argv: argv) : Js.Promise.t(unit) => {
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
              execFn("local", "docker-compose", Array.of_list(args @ ["push"]), Js.true_)
            }
          )
        | exception Not_found =>
          Log.err({j|Stack $stackName was not found in stacks yaml file|j});
          ((_) => Js.Promise.resolve())
        },
      argv##stacks
    );
  Js.Promise.(Array.fold_left((a, b, _) => a() |> then_(b), (_) => resolve(), promises))()
};
