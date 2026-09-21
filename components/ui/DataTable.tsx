import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, focusRing } from '@/lib/utils';
import { TableSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor?: (row: T) => string | number;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  hidden?: boolean;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  getRowId: (row: T) => string;
  loading?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  selectedRowId?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  caption?: string;
  className?: string;
  /** Changing this resets the table to page 1 — pass the active filters. */
  resetKey?: string;
}

type Sort = { id: string; dir: 'asc' | 'desc' } | null;

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function pageWindow(page: number, pages: number): (number | '…')[] {
  if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = Array.from(set).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (['…', p] as const) : [p]));
}

const Pagination: React.FC<PaginationProps> = ({ page, pageSize, total, onPageChange, className }) => {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn = cn(
    'inline-flex size-8 items-center justify-center rounded-md text-bodyMd tabular transition-colors duration-fast',
    focusRing
  );

  return (
    <nav aria-label="Pagination" className={cn('flex flex-wrap items-center justify-between gap-2', className)}>
      <p className="text-caption text-fg-tertiary" aria-live="polite">
        Showing <span className="tabular">{from}</span> to <span className="tabular">{to}</span> of{' '}
        <span className="tabular">{total}</span> items
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(btn, 'text-fg-secondary hover:bg-surface-subtle disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent')}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        {pageWindow(page, pages).map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-fg-disabled" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
              onClick={() => onPageChange(p)}
              className={cn(
                btn,
                p === page ? 'bg-surface-muted font-medium text-fg-primary' : 'text-fg-secondary hover:bg-surface-subtle'
              )}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className={cn(btn, 'text-fg-secondary hover:bg-surface-subtle disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent')}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export function DataTable<T>({
  columns,
  data,
  getRowId,
  loading = false,
  pageSize = 5,
  onRowClick,
  selectedRowId,
  emptyTitle = 'No results',
  emptyDescription = 'Try adjusting your filters or search.',
  caption,
  className,
  resetKey,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<Sort>(null);
  const [page, setPage] = useState(1);
  const visible = columns.filter((c) => !c.hidden);

  useEffect(() => setPage(1), [resetKey, pageSize]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.id === sort?.id);
    if (!sort || !col?.accessor) return data;
    const get = col.accessor;
    return [...data].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [data, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const rows = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (id: string) =>
    setSort((s) => (s?.id !== id ? { id, dir: 'desc' } : s.dir === 'desc' ? { id, dir: 'asc' } : null));

  const align = (a?: ColumnDef<T>['align']) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');

  if (loading) return <TableSkeleton rows={pageSize} columns={visible.length} />;

  return (
    <div className={cn('flex min-h-0 flex-col gap-3', className)}>
      <div className="min-h-0 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse text-left">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="sticky top-0 z-10 bg-surface-default">
            <tr className="border-b border-line-subtle">
              {visible.map((col) => {
                const dir = sort?.id === col.id ? sort.dir : null;
                const Icon = dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ArrowUpDown;
                return (
                  <th
                    key={col.id}
                    scope="col"
                    style={{ width: col.width }}
                    aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : col.sortable ? 'none' : undefined}
                    className={cn('whitespace-nowrap px-3 py-2 text-caption font-medium text-fg-tertiary', align(col.align))}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.id)}
                        className={cn(
                          'group inline-flex items-center gap-1 rounded-sm hover:text-fg-primary',
                          col.align === 'right' && 'flex-row-reverse',
                          dir && 'text-fg-primary',
                          focusRing
                        )}
                      >
                        {col.header}
                        <Icon
                          className={cn('size-3', dir ? 'text-fg-link' : 'opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60')}
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = getRowId(row);
              const selected = id === selectedRowId;
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-selected={onRowClick ? selected : undefined}
                  className={cn(
                    'border-b border-line-subtle transition-colors duration-fast last:border-b-0',
                    onRowClick && 'cursor-pointer hover:bg-surface-subtle focus-visible:bg-surface-subtle focus-visible:outline-none',
                    selected && 'bg-surface-selected hover:bg-surface-selected'
                  )}
                >
                  {visible.map((col) => (
                    <td
                      key={col.id}
                      className={cn('h-10 whitespace-nowrap px-3 text-bodyMd text-fg-primary tabular', align(col.align))}
                    >
                      {col.cell ? col.cell(row) : col.accessor ? col.accessor(row) : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <EmptyState compact title={emptyTitle} description={emptyDescription} />}
      </div>
      {sorted.length > pageSize && <Pagination page={current} pageSize={pageSize} total={sorted.length} onPageChange={setPage} />}
    </div>
  );
}
