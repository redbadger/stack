external safeLoad : string => Js.t {.. stacks : array string} = "" [@@bs.module "js-yaml"];

external getComposeFiles : array string => Js.Dict.t (array string) = "" [@@bs.module "../config"];

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
  let stackConfigPath = Node.Path.resolve [|argv##file|];
  let stackConfig = safeLoad (Node.Fs.readFileSync stackConfigPath `utf8);
  let filenamesByStack: Js.Dict.t (array string) = getComposeFiles stackConfig##stacks;
  let promises =
    Array.map
      (
        fun stack => {
          let files = Js.Dict.get filenamesByStack stack;
          switch files {
          | None => (
              fun _ => {
                Log.err {j|Stack $stack was not found in stacks yaml file|j};
                Js.Promise.resolve ()
              }
            )
          | Some x =>
            let args =
              List.concat (List.map (fun f => ["-f", Node.Path.resolve [|f|]]) (Array.to_list x));
            (
              fun _ => {
                logStep {j|Building $stack|j};
                execFn "local" "docker-compose" (Array.of_list (args @ ["build"])) Js.true_
              }
            )
          }
        }
      )
      argv##stacks;
  Js.Promise.(Array.fold_left (fun a b _ => a () |> then_ b) (fun _ => resolve ()) promises) ()
};
