import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    katex?: {
      renderToString: (tex: string, options?: any) => string;
    };
  }
}

interface MathFormulaProps {
  tex: string;
  displayMode?: boolean;
  className?: string;
}

export default function MathFormula({ tex, displayMode = false, className = '' }: MathFormulaProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (window.katex) {
      try {
        const html = window.katex.renderToString(tex, {
          displayMode,
          throwOnError: false,
        });
        containerRef.current.innerHTML = html;
        return;
      } catch (err) {
        console.warn('KaTeX render error:', err);
      }
    }

    // Fallback if KaTeX script hasn't loaded yet
    containerRef.current.textContent = tex;
  }, [tex, displayMode]);

  return (
    <span
      ref={containerRef}
      className={`inline-math font-mono text-indigo-300 ${displayMode ? 'block my-2 text-center' : 'inline'} ${className}`}
    >
      {tex}
    </span>
  );
}
