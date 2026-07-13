export function toCamel(row) {
  if (!row) return row;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = v;
  }
  return out;
}

export function toCamelRows(rows) {
  return rows.map(toCamel);
}

export function camelToSnake(key) {
  return key.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
}
