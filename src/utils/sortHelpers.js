// Type-aware comparator used to sort lists of plain objects (novels, etc.)
// by a given field. Falling back to string comparison for numeric fields
// (as `a[sortBy] > b[sortBy]` on numbers coerced through `|| ''` used to
// do) breaks silently once a field can hold something other than a
// string — e.g. `10 > 9` is true, but `'10' > '9'` is false lexically.
export const compareByField = (a, b, field, order = 'desc') => {
  const aVal = a?.[field];
  const bVal = b?.[field];

  let cmp;
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    cmp = aVal - bVal;
  } else {
    cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''));
  }

  return order === 'desc' ? -cmp : cmp;
};

export const sortByField = (items, field = 'updatedAt', order = 'desc') =>
  [...items].sort((a, b) => compareByField(a, b, field, order));

export default sortByField;
