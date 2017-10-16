let dirname: option string = [%bs.node __dirname];

open Jest;

let ymlFile =
  Node.Path.resolve [|
    switch dirname {
    | None => "."
    | Some x => x
    },
    "../fixtures/_stacks.yml"
  |];

describe
  "config"
  (
    fun () =>
      Expect.(
        test
          "should load the config"
          (
            fun () => {
              let expected: Config.config = {
                stacks: [
                  {
                    name: "services",
                    files: ["services.yml"],
                    services: [{name: "visualizer", health: Some "/_health", aliases: None}]
                  },
                  {
                    name: "app",
                    files: ["app.yml"],
                    services: [
                      {name: "rproxy", health: Some "/haproxy?stats", aliases: Some ["web"]}
                    ]
                  }
                ]
              };
              let actual = Config.load ymlFile;
              expect actual |> toEqual expected
            }
          )
      )
  );
