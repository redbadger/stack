const fp = require('lodash/fp');

exports.flatten = c => {
  return fp.flatMap(
    d =>
      fp.flatMap(
        st =>
          fp.map(
            s => ({
              domain: d.name,
              stack: st.name,
              name: s.name,
              aliases: s.aliases || [],
            }),
            st.services,
          ),
        d.stacks,
      ),
    c.domains,
  );
};
