import { filter, head, map, pipe, pluck, replace } from 'ramda';

export const findWithPublishedPorts = pipe(
  map(s => {
    const stack = s.Spec.Labels['com.docker.stack.namespace'];
    const name = replace(new RegExp(`^${stack}_`), '', s.Spec.Name);
    const ports = s.Endpoint.Ports && pluck('PublishedPort', s.Endpoint.Ports);
    const port = head(ports || []);
    return { name, stack, port };
  }),
  filter(s => s.port),
);
