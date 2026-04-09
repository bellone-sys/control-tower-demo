import { useMemo } from 'react'

/**
 * Componente paginazione centralizzato e coerente
 * @param {number} page - Pagina attuale (1-based)
 * @param {number} total - Numero totale di pagine
 * @param {function} onPage - Callback per cambio pagina
 * @param {number} pageSize - Elementi per pagina
 * @param {number} total_items - Numero totale di elementi
 */
export default function Pagination({ page, total, onPage, pageSize, total_items }) {
  if (total <= 1) return null

  const pages = useMemo(() => {
    const result = []
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= page - 2 && i <= page + 2)) {
        result.push(i)
      } else if (result[result.length - 1] !== '…') {
        result.push('…')
      }
    }
    return result
  }, [page, total])

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total_items)

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPage(1)}
        disabled={page === 1}
        title="Prima pagina"
        aria-label="Vai alla prima pagina"
      >
        «
      </button>

      <button
        className="page-btn"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        title="Pagina precedente"
        aria-label="Vai alla pagina precedente"
      >
        ‹
      </button>

      <div className="page-numbers">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="page-ellipsis" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`page-btn${p === page ? ' active' : ''}`}
              onClick={() => onPage(p)}
              aria-label={`Vai alla pagina ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        className="page-btn"
        onClick={() => onPage(page + 1)}
        disabled={page === total}
        title="Pagina successiva"
        aria-label="Vai alla pagina successiva"
      >
        ›
      </button>

      <button
        className="page-btn"
        onClick={() => onPage(total)}
        disabled={page === total}
        title="Ultima pagina"
        aria-label="Vai all'ultima pagina"
      >
        »
      </button>

      <span className="page-info" aria-live="polite">
        {startItem}–{endItem} di {total_items}
      </span>
    </div>
  )
}
