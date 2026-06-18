// All templates use single-column, simple semantic markup (h1/h2/div), no tables,
// no images, no multi-column layouts -> ATS parsers can read them reliably.

export const templates = [
  { id: "classic", name: "Classic", description: "Serif, traditional layout" },
  { id: "modern", name: "Modern", description: "Sans-serif with accent color" },
  { id: "minimal", name: "Minimal", description: "Clean, lots of whitespace" },
  { id: "compact", name: "Compact", description: "Dense, fits more on one page" },
];

// Tailwind classes used for the live on-screen preview
export const previewStyles = {
  classic: {
    font: "font-serif",
    h1: "text-2xl font-bold tracking-tight text-stone-900",
    h2: "text-xs uppercase tracking-widest border-b border-stone-900 pb-1 mt-5 text-stone-700",
    contact: "text-xs text-stone-500 mb-2",
    body: "text-sm leading-relaxed whitespace-pre-wrap mt-1 text-stone-800",
  },
  modern: {
    font: "font-sans",
    h1: "text-3xl font-bold text-slate-900",
    h2: "text-xs uppercase tracking-widest text-blue-600 border-b-2 border-blue-600 inline-block pb-1 mt-5",
    contact: "text-xs text-slate-500 mb-3",
    body: "text-sm leading-relaxed whitespace-pre-wrap mt-1 text-slate-800",
  },
  minimal: {
    font: "font-sans",
    h1: "text-2xl font-light tracking-wide text-neutral-900",
    h2: "text-[11px] uppercase tracking-[0.2em] text-neutral-400 mt-6 mb-1",
    contact: "text-xs text-neutral-400 mb-4",
    body: "text-sm leading-relaxed whitespace-pre-wrap mt-1 text-neutral-700",
  },
  compact: {
    font: "font-sans text-[13px]",
    h1: "text-xl font-bold text-gray-900",
    h2: "text-[11px] uppercase tracking-wide text-gray-600 border-b border-gray-300 pb-0.5 mt-3",
    contact: "text-[11px] text-gray-500 mb-1",
    body: "text-[12px] leading-snug whitespace-pre-wrap mt-0.5 text-gray-800",
  },
};

// Inline CSS injected into the print/PDF window for each template
export const templateStyles = {
  classic: `
    body { font-family: Georgia, 'Times New Roman', serif; padding: 40px; color: #1a1a1a; }
    h1 { font-size: 28px; margin-bottom: 4px; letter-spacing: 0.02em; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.12em; border-bottom: 1px solid #1a1a1a; padding-bottom: 4px; margin-top: 20px; color: #333; }
    div { font-size: 14px; line-height: 1.6; }
    .contact { font-size: 12px; color: #555; margin-bottom: 10px; }
    .section { white-space: pre-wrap; margin-top: 8px; }
  `,
  modern: `
    body { font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; }
    h1 { font-size: 30px; font-weight: 700; margin-bottom: 2px; color: #0f172a; }
    h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #2563eb; margin-top: 22px; border-bottom: 2px solid #2563eb; padding-bottom: 4px; display: inline-block; }
    div { font-size: 13.5px; line-height: 1.6; }
    .contact { font-size: 12px; color: #6b7280; margin-bottom: 12px; }
    .section { white-space: pre-wrap; margin-top: 8px; }
  `,
  minimal: `
    body { font-family: Helvetica, Arial, sans-serif; padding: 48px; color: #262626; }
    h1 { font-size: 26px; font-weight: 300; letter-spacing: 0.05em; margin-bottom: 2px; }
    h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: #a3a3a3; margin-top: 26px; margin-bottom: 4px; font-weight: 600; }
    div { font-size: 13px; line-height: 1.7; }
    .contact { font-size: 11px; color: #a3a3a3; margin-bottom: 16px; }
    .section { white-space: pre-wrap; margin-top: 4px; }
  `,
  compact: `
    body { font-family: 'Arial Narrow', Arial, sans-serif; padding: 28px; color: #111; }
    h1 { font-size: 22px; margin-bottom: 2px; }
    h2 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #444; margin-top: 12px; margin-bottom: 2px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
    div { font-size: 12px; line-height: 1.4; }
    .contact { font-size: 11px; color: #555; margin-bottom: 6px; }
    .section { white-space: pre-wrap; margin-top: 4px; }
  `,
};
