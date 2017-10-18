type service = {
  name: string,
  stack: string,
  publishedPort: int
};

module Decode = {
  let service json => {
    let raw =
      Json.Decode.{
        stack: json |> field "Spec" (field "Labels" (field "com.docker.stack.namespace" string)),
        name: json |> field "Spec" (field "Name" string),
        publishedPort:
          switch (
            json |> field "Endpoint" (optional (field "Ports" (list (field "PublishedPort" int))))
          ) {
          | None => 0
          | Some l => List.hd l
          }
      };
    {...raw, name: Js.String.replaceByRe (Js.Re.fromString ("^" ^ raw.stack ^ "_")) "" raw.name}
  };
  let services = Json.Decode.list service;
};

let findWithPublishedPorts str :list service =>
  str |> Js.Json.parseExn |> Decode.services |> List.filter (fun s => s.publishedPort !== 0);
