function SortTh({ field, sortKey, sortDir, onSort, children, style }) {
  const active = sortKey === field
  return (
    <th
      className={`sortable${active ? ' sort-active' : ''}`}
      onClick={() => onSort(field)}
      style={style}
    >
      {children}
      {active && <span className="sort-arrow">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
    </th>
  )
}

export default SortTh
