type service = Config.service;

let findNext (services: list service) => {
  let usedPorts = List.fold_left (fun ports (s: service) => [s.port, ...ports]) [] services;
  let break = ref false;
  let i = ref 8000;
  while (not !break) {
    if (
      List.exists
        (
          fun a =>
            switch a {
            | None => false
            | Some p => p === !i
            }
        )
        usedPorts
    ) {
      i := !i + 1
    } else {
      break := true
    }
  };
  !i
};

let assign (desiredServices: list service) (existingServices: list service) =>
  List.fold_left
    (
      fun acc (svc: service) => {
        let port =
          switch (
            List.find
              (fun (s: service) => s.stack === svc.stack && s.name === svc.name) existingServices
          ) {
          | existing => existing.port
          | exception Not_found => Some (findNext (existingServices @ acc))
          };
        [{...svc, port}, ...acc]
      }
    )
    []
    desiredServices;
