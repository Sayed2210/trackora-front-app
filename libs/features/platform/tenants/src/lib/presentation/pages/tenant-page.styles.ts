export const TENANT_PAGE_STYLES = `
  .tenant-page { display: grid; gap: 1.1rem; }
  .tenant-actions, .pagination, .tabs { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center; }
  .tenant-actions { justify-content: flex-end; }
  .tabs { margin-block-end: 0.25rem; }
  .tabs a, .button, button { padding-block: 0.65rem; padding-inline: 0.9rem; color: var(--trackora-primary); background: var(--trackora-bg); border: 1px solid var(--trackora-border); border-radius: 0.75rem; cursor: pointer; font-weight: 800; text-decoration: none; }
  .button--primary, button.primary { color: var(--trackora-primary-contrast); background: var(--trackora-primary); border-color: var(--trackora-primary); }
  button.danger { color: var(--trackora-danger); }
  button:disabled { cursor: not-allowed; opacity: 0.58; }
  .table { inline-size: 100%; border-collapse: collapse; min-inline-size: 52rem; }
  th, td { padding: 0.85rem; border-block-end: 1px solid var(--trackora-border); text-align: start; vertical-align: top; }
  th { color: var(--trackora-primary); background: var(--trackora-surface); font-size: 0.82rem; }
  td { color: var(--trackora-text); }
  .muted, small { color: var(--trackora-text-secondary); }
  .filters { display: contents; }
  input, select { min-inline-size: 10rem; padding: 0.72rem; color: var(--trackora-text); background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.75rem; }
  form.card-form { display: grid; gap: 1rem; max-inline-size: 46rem; }
  .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.85rem; }
  label { display: grid; gap: 0.35rem; color: var(--trackora-primary); font-weight: 800; }
  .error-text { color: var(--trackora-danger); }
  .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 0.75rem; }
  .summary-item { padding: 0.85rem; background: var(--trackora-surface); border: 1px solid var(--trackora-border); border-radius: 0.9rem; }
  .summary-item span { display: block; color: var(--trackora-text-secondary); font-size: 0.82rem; }
  .summary-item strong { color: var(--trackora-primary); }
  @media (max-width: 760px) { .form-grid { grid-template-columns: 1fr; } .tenant-actions { justify-content: flex-start; } }
`;
