type env = Js.Dict.t(string);

[@bs.module "../docker-server"] external getEnv : string => Js.Promise.t(env) = "";

[@bs.module "../docker-server"]
external getDocker : env => {. "listServices": [@bs.meth] (unit => Js.Promise.t(Js.Json.t))} =
  "";

let command = "deploy [stacks...]";

let desc = {|Deploys the specified stacks.
   If no stacks are specified, then just creates merged compose files.
   |};

let builder = Js.Obj.empty();

type argv = {. "stacks": array(string), "file": string, "update": Js.boolean, "swarm": string};

let handler = (argv: argv) : Js.Promise.t(string) => {
  let stepper =
    Log.step(2 + (argv##update === Js.true_ ? 1 : 0) + (Array.length(argv##stacks) > 0 ? 3 : 0));
  let nextStep = ref(0);
  let logStep = (msg) => {
    nextStep := nextStep^ + 1;
    stepper(nextStep^, msg)
  };
  let config = Config.load(Node.Path.resolve([|argv##file|]));
  logStep("Scanning swarm and configuring ports");
  getEnv(argv##swarm)
  |> Js.Promise.then_(
       (env) => {
         let docker = getDocker(env);
         docker##listServices()
         |> Js.Promise.then_(
              (existing) => {
                [%bs.raw
                  {|
                  console.log (JSON.stringify(existing))
                |}
                ];
                let configured =
                  List.concat(List.map((stack: Config.stack) => stack.services, config.stacks));
                let servicesWithPorts =
                  Services.findWithports(existing) |> Ports.assign(configured);
                let portOverrides = ComposeFile.createPortOverlays(servicesWithPorts);
                let (stacks, portOverrideFiles) =
                  List.split(
                    ComposeFile.write(
                      ComposeFile.writeFn,
                      List.map(((a, b)) => (a, Js.Promise.resolve(b)), portOverrides),
                      "ports"
                    )
                  );
                /* if (argv##update === Js.true_) {
                     logStep("Updating load balancer");
                     let loadBalancerConfig = createLBConfig(servicesWithPorts, argv##domain);
                     writeLBConfig(loadBalancerConfig);
                     reloadLB()
                   } else { */
                Js.Promise.all(Array.of_list(portOverrideFiles))
                /* } */
                |> Js.Promise.then_(
                     (portOverrideFiles) => {
                       logStep("Merging compose files");
                       let filenamesByStack = Config.filenamesByStack(config);
                       let allFilenamesByStack =
                         Util.concatAssocListValues(
                           filenamesByStack,
                           List.map(
                             ((s, f)) => (s, [f]),
                             List.combine(stacks, Array.to_list(portOverrideFiles))
                           )
                         );
                       let unresolved =
                         ComposeFile.merge(
                           ComposeFile.execFn,
                           "local",
                           allFilenamesByStack,
                           false
                         );
                       ComposeFile.write(ComposeFile.writeFn, unresolved, "unresolved");
                       /* if (Array.length(argv##stacks) > 0) { */
                       /* let validations = validate(argv##stacks, config);
                          if (validations##messages##length > 0) {
                            Log.err(String.concat(", ", Array.to_list(validations##messages)))
                          } else { */
                       logStep("Pulling images");
                       let promises =
                         List.map(
                           (stack, _) =>
                             ComposeFile.execFn(
                               argv##swarm,
                               "docker-compose",
                               ["-f", {j|$stack-unresolved.yml|j}, "pull"]
                             ),
                           /* Array.to_list(validations.stacks) */
                           stacks
                         );
                       Util.promisesInSeries("", promises)
                       |> Js.Promise.then_(
                            (x) => {
                              logStep("Resolving images");
                              let resolved =
                                ComposeFile.merge(
                                  ComposeFile.execFn,
                                  argv##swarm,
                                  allFilenamesByStack,
                                  true
                                );
                              ComposeFile.write(ComposeFile.writeFn, resolved, "resolved");
                              logStep("NOT Deploying");
                              Js.Promise.resolve(x)
                              /* deploy(ComposeFile.execFn, argv##swarm, validations##stacks) */
                            }
                          )
                     }
                   )
                /* } */
                /* } */
              }
            )
       }
     )
};
