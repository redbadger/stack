external safeLoad : string => Js.Json.t = "" [@@bs.module "js-yaml"];

type service = {
  name: string,
  health: option string,
  aliases: option (list string)
};

type stack = {
  name: string,
  files: list string,
  services: list service
};

type config = {stacks: list stack};

module Decode = {
  let service json =>
    Json.Decode.{
      name: json |> field "name" string,
      health: json |> optional (field "health" string),
      aliases: json |> optional (field "aliases" (list string))
    };
  let stack json =>
    Json.Decode.{
      name: json |> field "name" string,
      files: json |> field "compose-files" (list string),
      services: json |> field "services" (list service)
    };
  let config json => Json.Decode.{stacks: json |> field "stacks" (list stack)};
};

let load filename => safeLoad (Node.Fs.readFileSync filename `utf8) |> Decode.config;
