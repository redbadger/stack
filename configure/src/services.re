type service = Config.service;

module Decode = {
  let service json :service => {
    let raw: service =
      Json.Decode.{
        stack: json |> field "Spec" (field "Labels" (field "com.docker.stack.namespace" string)),
        name: json |> field "Spec" (field "Name" string),
        aliases: [],
        health: None,
        port:
          switch (json |> field "Endpoint" (optional (field "Ports" (list (field "port" int))))) {
          | None => None
          | Some l => Some (List.hd l)
          }
      };
    {...raw, name: Js.String.replaceByRe (Js.Re.fromString ("^" ^ raw.stack ^ "_")) "" raw.name}
  };
  let services = Json.Decode.list service;
};

let findWithports str :list service =>
  str |> Js.Json.parseExn |> Decode.services |>
  List.filter (
    fun (s: service) =>
      switch s.port {
      | None => false
      | Some _ => true
      }
  );
