import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, iconOnly = false }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setVisible(!visible);
        }}
        className="text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center focus:outline-none"
        aria-label="Açıklama bilgisi"
      >
        <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-400" />
      </button>

      {visible && (
        <span
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900/95 border border-slate-700 text-xs text-slate-300 rounded-lg shadow-xl backdrop-blur pointer-events-none font-normal leading-relaxed text-left animate-in fade-in zoom-in-95 duration-150"
          role="tooltip"
        >
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95" />
        </span>
      )}
    </span>
  );
};
