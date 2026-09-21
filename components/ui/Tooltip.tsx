import React, { useId, useState } from 'react';
import { cn } from '@/lib/utils';

export const Tooltip: React.FC<{
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom';
  className?: string;
}> = ({ content, children, side = 'top', className }) => {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      {React.cloneElement(children, { 'aria-describedby': open ? id : undefined })}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 z-50 w-max max-w-60 -translate-x-1/2 rounded-md bg-surface-inverse px-2 py-1 text-caption text-fg-inverse shadow-elevation-2 animate-fade-in',
            side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            className
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
};
