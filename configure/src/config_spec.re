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
    );
    describe(
      "parse and validate stack names",
      () => {
        test(
          "when both valid",
          () => {
            let stacks = ["app", "services"];
            let expected: Config.validation = {stacks: ["app", "services"], messages: []};
            let actual = Config.validate(stacks, config);
            expect(actual) |> toEqual(expected)
          }
        );
        test(
          "when one valid and one invalid",
          () => {
            let stacks = ["app", "service1"];
            let expected: Config.validation = {
              stacks: ["app"],
              messages: [{|The stack called "service1" is not declared in the configuration|}]
            };
            let actual = Config.validate(stacks, config);
            expect(actual) |> toEqual(expected)
          }
        );
        test(
          "when neither valid",
          () => {
            let stacks = ["app1", "service1"];
            let expected: Config.validation = {
              stacks: [],
              messages: [
                {|The stack called "app1" is not declared in the configuration|},
                {|The stack called "service1" is not declared in the configuration|}
              ]
            };
            let actual = Config.validate(stacks, config);
            expect(actual) |> toEqual(expected)
          }
        )
      }
    )
  }
);
