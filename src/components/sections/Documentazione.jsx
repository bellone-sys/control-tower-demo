import { useState, useEffect } from 'react'
import './Documentazione.css'

/**
 * Documentazione — Viewer Markdown per manuale e playbook
 * Renderizza il file Markdown da /public/docs/ in una UI navigabile
 */

const DOCS = [
  {
    id: 'manuale',
    title: '📖 Manuale Utente',
    subtitle: 'Guida completa all\'utilizzo della piattaforma',
    path: '/docs/manuale.md',
    tags: ['guida', 'utente'],
  },
]

// Minimal markdown → HTML renderer (no external deps)
function renderMarkdown(md) {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Code blocks (before inline code)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="md-pre" data-lang="${lang}"><code>${code.trimEnd()}</code></pre>`)
    // Headings
    .replace(/^###### (.+)$/gm, '<h6 class="md-h6">$1</h6>')
    .replace(/^##### (.+)$/gm,  '<h5 class="md-h5">$1</h5>')
    .replace(/^#### (.+)$/gm,   '<h4 class="md-h4">$1</h4>')
    .replace(/^### (.+)$/gm,    '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm,     '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm,      '<h1 class="md-h1">$1</h1>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="md-hr" />')
    // Tables (GFM)
    .replace(/^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/gm, (_, header, body) => {
      const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('')
      const rows = body.trim().split('\n').map(row => {
        const tds = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('')
        return `<tr>${tds}</tr>`
      }).join('')
      return `<div class="md-table-wrap"><table class="md-table"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`
    })
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>')
    // Lists
    .replace(/^(\d+)\. (.+)$/gm, '<li class="md-oli">$2</li>')
    .replace(/^[-*] (.+)$/gm, '<li class="md-uli">$2</li>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="md-link" href="$2" target="_blank" rel="noopener">$1</a>')
    // Paragraphs (blank lines)
    .replace(/\n\n+/g, '</p><p class="md-p">')
    // Wrap consecutive <li> in <ul> or <ol>
    .replace(/(<li class="md-uli">[\s\S]*?<\/li>)(?!<li class="md-uli">)/g, '$1</ul>')
    .replace(/(<li class="md-uli">)/g, '<ul class="md-ul">$1')
    .replace(/(<li class="md-oli">[\s\S]*?<\/li>)(?!<li class="md-oli">)/g, '$1</ol>')
    .replace(/(<li class="md-oli">)/g, '<ol class="md-ol">$1')

  return `<p class="md-p">${html}</p>`
}

function buildToc(md) {
  const toc = []
  const lines = md.split('\n')
  lines.forEach(line => {
    const m = line.match(/^(#{1,3}) (.+)$/)
    if (m) {
      const level = m[1].length
      const text  = m[2].replace(/[*_`]/g, '')
      const id    = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      toc.push({ level, text, id })
    }
  })
  return toc
}

export default function Documentazione() {
  const [selectedDoc, setSelectedDoc] = useState(DOCS[0])
  const [content,     setContent]     = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [toc,         setToc]         = useState([])
  const [search,      setSearch]      = useState('')

  useEffect(() => {
    if (!selectedDoc) return
    setLoading(true)
    setError(null)
    fetch(selectedDoc.path)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      })
      .then(text => {
        setContent(text)
        setToc(buildToc(text))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [selectedDoc])

  // Add IDs to headings after render via useEffect
  useEffect(() => {
    if (!content) return
    document.querySelectorAll('.md-h1,.md-h2,.md-h3,.md-h4').forEach(el => {
      const id = el.textContent.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
      el.id = id
    })
  }, [content])

  const filteredToc = search
    ? toc.filter(item => item.text.toLowerCase().includes(search.toLowerCase()))
    : toc

  return (
    <div className="docs-layout" id="docs-main">
      {/* Skip link for keyboard accessibility */}
      <a href="#docs-content" className="skip-link">Vai al contenuto</a>

      {/* Sidebar with TOC */}
      <aside className="docs-sidebar" aria-label="Navigazione documenti">
        <div className="docs-sidebar-header">
          <h2 className="docs-sidebar-title">Documentazione</h2>
        </div>

        {/* Doc list */}
        <nav className="docs-nav" aria-label="Documenti disponibili">
          {DOCS.map(doc => (
            <button
              key={doc.id}
              className={`docs-nav-item${selectedDoc?.id === doc.id ? ' active' : ''}`}
              onClick={() => { setSelectedDoc(doc); setSearch('') }}
              aria-current={selectedDoc?.id === doc.id ? 'page' : undefined}
            >
              <span className="docs-nav-title">{doc.title}</span>
              <span className="docs-nav-sub">{doc.subtitle}</span>
            </button>
          ))}
        </nav>

        {/* TOC */}
        {toc.length > 0 && (
          <div className="docs-toc">
            <div className="docs-toc-header">
              <span className="docs-toc-title">Sezioni</span>
              <input
                className="docs-toc-search"
                type="search"
                placeholder="Cerca sezione…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Cerca sezione nel documento"
              />
            </div>
            <nav className="docs-toc-list" aria-label="Indice del documento">
              {filteredToc.map((item, i) => (
                <a
                  key={i}
                  href={`#${item.id}`}
                  className={`docs-toc-item docs-toc-h${item.level}`}
                  onClick={e => {
                    e.preventDefault()
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {item.text}
                </a>
              ))}
              {filteredToc.length === 0 && search && (
                <p className="docs-toc-empty">Nessuna sezione trovata</p>
              )}
            </nav>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main id="docs-content" className="docs-content" aria-label="Contenuto documento" tabIndex={-1}>
        {loading && (
          <div className="docs-loading" role="status" aria-live="polite">
            <div className="docs-spinner" aria-hidden="true" />
            <span>Caricamento documento…</span>
          </div>
        )}

        {error && (
          <div className="docs-error" role="alert">
            <strong>Errore nel caricamento:</strong> {error}
          </div>
        )}

        {!loading && !error && content && (
          <article
            className="docs-article"
            aria-label={selectedDoc?.title}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        )}
      </main>
    </div>
  )
}
