'use client';

import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';

export interface AccordionItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

export const Accordion: React.FC<{ items: AccordionItem[]; defaultOpenId?: string; className?: string }> = ({ items, defaultOpenId, className }) => {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className={cn('divide-y divide-line-subtle rounded-lg border border-line-default bg-surface-default', className)}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`${baseId}-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className={cn('flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-h4 text-fg-primary transition-colors hover:bg-surface-subtle', focusRing)}
              >
                {item.question}
                <ChevronDown className={cn('size-5 shrink-0 text-fg-tertiary transition-transform duration-base', open && 'rotate-180')} aria-hidden="true" />
              </button>
            </h3>
            {open && (
              <div id={`${baseId}-${item.id}`} className="px-5 pb-5 text-bodyLg text-fg-secondary animate-slide-up">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
