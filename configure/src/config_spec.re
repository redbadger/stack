let dirname: option(string) = [%bs.node __dirname];

open Jest;

open Expect;

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
  () => {
    let config: Config.config = {
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
    test("should load the config", () => expect(Config.load(ymlFile)) |> toEqual(config));
    test(
      "filenamesByStack",
      () => {
        let actual = Config.filenamesByStack(config);
        let expected = [("services", ["services.yml"]), ("app", ["app.yml"])];
        expect(actual) |> toEqual(expected)
      }
    )
  }
);
