let dirname: option(string) = [%bs.node __dirname];

open Jest;

let ymlFile =
  Node.Path.resolve([|
    switch dirname {
    | None => "."
    | Some(x) => x
    },
    "../fixtures/_stacks.yml"
  |]);

describe(
  "config",
  () =>
    Expect.(
      test(
        "should load the config",
        () => {
          let expected: Config.config = {
            stacks: [
              {
                name: "services",
                files: ["services.yml"],
                services: [
                  {
                    stack: "services",
                    name: "visualizer",
                    aliases: [],
                    health: Some("/_health"),
                    port: None
                  }
                ]
              },
              {
                name: "app",
                files: ["app.yml"],
                services: [
                  {
                    stack: "app",
                    name: "rproxy",
                    aliases: ["web"],
                    health: Some("/haproxy?stats"),
                    port: None
                  }
                ]
              }
            ]
          };
          let actual = Config.load(ymlFile);
          expect(actual) |> toEqual(expected)
        }
      )
    )
);
