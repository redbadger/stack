type service = Config.service;

let findNext = (services: list(service)) => {
  let usedPorts = List.fold_left((ports, s: service) => [s.port, ...ports], [], services);
  let break = ref(false);
  let i = ref(8000);
  while (! break^) {
    if (List.exists(
          (a) =>
            switch a {
            | None => false
            | Some(p) => p === i^
            },
          usedPorts
        )) {
      i := i^ + 1
    } else {
      break := true
    }
  };
  i^
};

let assign = (desiredServices: list(service), existingServices: list(service)) =>
  List.fold_left(
    (acc, svc: service) => {
      let port =
        switch (
          List.find((s: service) => s.stack === svc.stack && s.name === svc.name, existingServices)
        ) {
        | existing => existing.port
        | exception Not_found => Some(findNext(existingServices @ acc))
        };
      [{...svc, port}, ...acc]
    },
    [],
    desiredServices
  );
