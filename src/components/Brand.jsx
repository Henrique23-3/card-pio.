export default function Brand({ compact = false }) {
  return <span className={`brand-lockup${compact ? ' compact' : ''}`}>
    <svg className="chef-mark" viewBox="0 0 64 72" fill="none" aria-hidden="true"><path d="M15 40C1 38 1 20 14 17 15 3 34 1 40 12 53 8 64 22 56 32L51 38 54 58 21 66 15 40Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="m18 47 34-9M24 53l3 11m10-14 3 11" stroke="currentColor" strokeWidth="3"/></svg>
    <span>Brasil de<strong>Muitos Sabores</strong></span>
  </span>
}
