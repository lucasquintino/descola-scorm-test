const toCamel = s =>
  s.replace(/([-_][a-z])/gi, $1 =>
    $1
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );

const isArray = a => Array.isArray(a);

const isObject = o => o === Object(o) && !isArray(o) && typeof o !== 'function';

const snakeToCamel = o => {
  if (isObject(o)) {
    const n = {};

    Object.keys(o).forEach(k => {
      n[toCamel(k)] = snakeToCamel(o[k]);
    });

    return n;
  }
  if (isArray(o)) {
    return o.map(i => snakeToCamel(i));
  }
  return o;
};

export default snakeToCamel;
