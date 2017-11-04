[@bs.module "js-yaml"] external safeLoad : string => Js.Json.t = "";

type service = {
  stack: string,
  name: string,
  aliases: list(string),
  health: option(string),
  port: option(int)
};

type stack = {
  name: string,
  files: list(string),
  services: list(service)
};

type config = {stacks: list(stack)};

module Decode = {
  let service = (stack, json) =>
    Json.Decode.{
      stack,
      name: json |> field("name", string),
      aliases:
        switch (json |> optional(field("aliases", list(string)))) {
        | None => []
        | Some(x) => x
        },
      health: json |> optional(field("health", string)),
      port: None
    };
  let stack = (json) => {
    let raw =
      Json.Decode.{
        name: json |> field("name", string),
        files: json |> field("compose-files", list(string)),
        services: []
      };
    {...raw, services: Json.Decode.(json |> field("services", list(service(raw.name))))}
  };
  let config = (json) => Json.Decode.{stacks: json |> field("stacks", list(stack))};
};

let load = (filename) => safeLoad(Node.Fs.readFileSync(filename, `utf8)) |> Decode.config;

let filenamesByStack = (config: config) : list((string, list(string))) =>
  List.map((stk) => (stk.name, stk.files), config.stacks);

type validation = {
  stacks: list(string),
  messages: list(string)
};

let validate = (stacks: list(string), config: config) : validation =>
  List.fold_left(
    (acc, name) =>
      switch (List.find((stack) => stack.name === name, config.stacks)) {
      | _ => {...acc, stacks: acc.stacks @ [name]}
      | exception Not_found => {
          ...acc,
          messages:
            acc.messages @ [{j|The stack called "$name" is not declared in the configuration|j}]
        }
      },
    {stacks: [], messages: []},
    stacks
  );
