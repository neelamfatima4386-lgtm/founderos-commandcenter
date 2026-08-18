import { useState, useMemo, type ReactNode } from "react";
import { ArrowUpDown, ChevronDown, ChevronUp, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
};

export type FilterDef = {
  key: string;
  placeholder: string;
  options: { value: string; label: string }[];
  match: (row: unknown, value: string) => boolean;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKeys,
  filters = [],
  onRowClick,
  emptyState,
  rowClassName,
}: {
  data: T[];
  columns: Column<T>[];
  searchKeys: (row: T) => string;
  filters?: FilterDef[];
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  rowClassName?: (row: T) => string;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let result = data;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) => searchKeys(row).toLowerCase().includes(q));
    }

    for (const [key, value] of Object.entries(activeFilters)) {
      if (value && value !== "all") {
        const filter = filters.find((f) => f.key === key);
        if (filter) result = result.filter((row) => filter.match(row, value));
      }
    }

    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col?.sortValue) {
        result = [...result].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data, search, activeFilters, sortKey, sortDir, columns, filters, searchKeys]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (data.length === 0 && !search) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {filters.map((f) => (
          <Select
            key={f.key}
            value={activeFilters[f.key] ?? "all"}
            onValueChange={(v) => setActiveFilters((p) => ({ ...p, [f.key]: v }))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={f.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {f.placeholder.toLowerCase()}</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {(search || Object.values(activeFilters).some((v) => v && v !== "all")) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setActiveFilters({});
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border/60 md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60 bg-muted/20">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2.5 text-left text-xs font-medium text-muted-foreground",
                    col.sortValue && "cursor-pointer select-none hover:text-foreground",
                    col.className,
                  )}
                  onClick={() => col.sortValue && toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortValue && sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
                    )}
                    {col.sortValue && sortKey !== col.key && <ArrowUpDown className="size-3 opacity-30" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results found.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-border/40 transition-colors last:border-0",
                    onRowClick && "cursor-pointer hover:bg-muted/20",
                    rowClassName?.(row),
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-3 py-2.5 text-sm", col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No results found.</p>
        ) : (
          filtered.map((row) => (
            <div
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "rounded-xl border border-border/60 p-3",
                onRowClick && "cursor-pointer active:bg-muted/20",
              )}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-start justify-between gap-2 py-0.5">
                  <span className="text-xs text-muted-foreground">{col.header}</span>
                  <span className="min-w-0 flex-1 text-right text-sm">{col.render(row)}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
