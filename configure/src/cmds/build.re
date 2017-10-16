external execFn : string => string => array string => Js.boolean => Js.Promise.t unit =
  "" [@@bs.module "../compose-file"];

let command = "build <stacks...>";

let desc = {|Builds and tags Docker images, described in the compose files for the specified stacks.
(Replaces ${tag} with current commit sha if no env variable named tag is set)
|};

let builder = Js.Obj.empty ();

type argv = Js.t {. stacks : array string, file : string};

let handler (argv: argv) :Js.Promise.t unit => {
  let stepper = Log.step (Array.length argv##stacks);
  let nextStep = ref 0;
  let logStep msg => {
    nextStep := !nextStep + 1;
    stepper !nextStep msg
  };
  let config = Config.load (Node.Path.resolve [|argv##file|]);
  let promises =
    Array.map
      (
        fun stackName =>
          switch (List.find (fun (s: Config.stack) => s.name === stackName) config.stacks) {
          | stack =>
            let args =
              List.concat (List.map (fun f => ["-f", Node.Path.resolve [|f|]]) stack.files);
            (
              fun _ => {
                logStep {j|Building $stackName|j};
                execFn "local" "docker-compose" (Array.of_list (args @ ["build"])) Js.true_
              }
            )
          | exception Not_found =>
            Log.err {j|Stack $stackName was not found in stacks yaml file|j};
            (fun _ => Js.Promise.resolve ())
          }
      )
      argv##stacks;
  Js.Promise.(Array.fold_left (fun a b _ => a () |> then_ b) (fun _ => resolve ()) promises) ()
};
