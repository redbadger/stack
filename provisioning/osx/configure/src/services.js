import R from 'ramda';

export const findWithPublishedPorts = R.pipe(
  R.map(s => {
    const stack = s.Spec.Labels['com.docker.stack.namespace'];
    const name = R.replace(new RegExp(`^${stack}_`), '', s.Spec.Name);
    const ports = s.Endpoint.Ports && R.pluck('PublishedPort', s.Endpoint.Ports);
    const port = R.head(ports || []);
    return { name, stack, port };
  }),
  R.filter(s => s.port),
);
