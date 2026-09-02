import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { concepts } from "../../data/concepts.ts";
import { useDocumentMeta } from "../../hooks/useDocumentMeta.ts";
import "./ConceptLibrary.css";

export default function ConceptLibrary() {
  useDocumentMeta("CURIO AI Concept Library", "Explore AI and machine learning definitions, examples, misconceptions and related concepts.");
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [selectedId, setSelectedId] = useState(concepts[0].id);
  const categories = ["All", ...Array.from(new Set(concepts.map((concept) => concept.category)))];
  const [category, setCategory] = useState("All");
  const filtered = useMemo(() => concepts.filter((concept) => (category === "All" || concept.category === category) && `${concept.term} ${concept.definition} ${concept.related.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())), [category, query]);
  const selected = concepts.find((concept) => concept.id === selectedId) ?? filtered[0] ?? concepts[0];
  const updateQuery = (value: string) => { setQuery(value); if (value.trim()) setParams({ q: value }); else setParams({}); };

  return <main className="concept-page">
    <header className="concept-header"><Link to="/academy" className="concept-brand"><img src="/curio-symbol.png" alt="CURIO" />CURIO</Link><nav><Link to="/academy">Academy</Link><Link className="is-active" to="/concepts">Concepts</Link><Link to="/code-lab">Code Lab</Link><Link to="/login">Sign in</Link></nav></header>
    <section className="concept-hero"><span>CURIO CONCEPT LIBRARY</span><h1>Definitions are the start. Connections create understanding.</h1><p>Search the vocabulary behind AI and ML, then read the simple explanation, technical definition, example, misconception and related concepts together.</p><input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Search AI, ML, data, deep learning and LLM concepts" aria-label="Search concepts" /></section>
    <div className="concept-category-row">{categories.map((item) => <button key={item} type="button" className={category === item ? "is-selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <section className="concept-workspace"><aside><div className="concept-count"><span>{filtered.length}</span> matching concepts</div>{filtered.map((concept) => <button key={concept.id} type="button" className={selected.id === concept.id ? "is-selected" : ""} onClick={() => setSelectedId(concept.id)}><span>{concept.category}</span><strong>{concept.term}</strong><small>{concept.simple}</small></button>)}</aside><article><span className="concept-category">{selected.category}</span><h2>{selected.term}</h2><section className="concept-simple"><strong>IN SIMPLE WORDS</strong><p>{selected.simple}</p></section><section><strong>TECHNICAL DEFINITION</strong><p>{selected.definition}</p></section><section><strong>EXAMPLE</strong><p>{selected.example}</p></section><section className="concept-misconception"><strong>COMMON MISCONCEPTION</strong><p>{selected.misconception}</p></section><section className="concept-related"><strong>RELATED CONCEPTS</strong><div>{selected.related.map((item) => <button key={item} type="button" onClick={() => { const match = concepts.find((concept) => concept.term.toLowerCase() === item.toLowerCase()); if (match) setSelectedId(match.id); else updateQuery(item); }}>{item}</button>)}</div></section></article></section>
  </main>;
}
