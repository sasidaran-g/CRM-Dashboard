"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  GripVertical,
  ListFilter,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";
import { CustomerDetailsDialog } from "@/components/customers/customer-details-dialog";
import { FiltersPanel } from "@/components/customers/filters-panel";
import { SortableCustomerRow } from "@/components/customers/sortable-customer-row";
import { useCustomers, type SortDir, type SortField } from "@/hooks/use-customers";
import { useReorderCustomers } from "@/hooks/use-reorder-customers";
import { EMPTY_FILTERS, countActiveFilters } from "@/lib/filters";
import type { Customer, CustomerFilters } from "@/lib/types";

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "name", label: "Name" },
  { field: "email", label: "Email" },
  { field: "company", label: "Company" },
  { field: "status", label: "Status" },
  { field: "lastContactDate", label: "Last Contact" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomerTable() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<CustomerFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // debounce search input so we don't refetch on every keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const queryParams = { search, sortBy, sortDir, page, pageSize, filters };
  const { data, isLoading, isError, isFetching } = useCustomers(queryParams);
  const reorderCustomers = useReorderCustomers(queryParams);

  const activeFilterCount = countActiveFilters(filters);
  const isCustomOrder = sortBy === "order";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function toggleSort(field: SortField) {
    if (field === sortBy) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !data) return;

    const oldIndex = data.data.findIndex((c) => c.id === active.id);
    const newIndex = data.data.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(data.data, oldIndex, newIndex);
    reorderCustomers.mutate(reordered.map((c) => c.id));
  }

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search customers..."
              className="pl-8"
            />
          </div>
          <Button variant="outline" onClick={() => setFiltersOpen(true)}>
            <ListFilter />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={isCustomOrder ? "secondary" : "outline"}
            onClick={() => {
              setSortBy("order");
              setSortDir("asc");
              setPage(1);
            }}
          >
            <GripVertical />
            Reorder
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus />
            Add Customer
          </Button>
        </div>
      </div>

      <FiltersPanel
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} />

      <CustomerDetailsDialog
        customer={selectedCustomer}
        open={selectedCustomer !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedCustomer(null);
        }}
      />

      {isCustomOrder && (
        <p className="text-xs text-muted-foreground">
          Custom order mode — drag rows by the grip handle to reorder. Click any column
          header to leave custom order.
        </p>
      )}

      <div className="rounded-lg border">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={data?.data.map((c) => c.id) ?? []}
            strategy={verticalListSortingStrategy}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  {COLUMNS.map((column) => (
                    <TableHead key={column.field}>
                      <button
                        type="button"
                        onClick={() => toggleSort(column.field)}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        {column.label}
                        {sortBy === column.field ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : (
                            <ArrowDown className="size-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
                        )}
                      </button>
                    </TableHead>
                  ))}
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-destructive">
                      Failed to load customers.
                    </TableCell>
                  </TableRow>
                ) : data && data.data.length > 0 ? (
                  data.data.map((customer) => (
                    <SortableCustomerRow
                      key={customer.id}
                      id={customer.id}
                      dragDisabled={!isCustomOrder}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                      <TableCell>{customer.company}</TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "Active" ? "default" : "secondary"}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(customer.lastContactDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                    </SortableCustomerRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {total === 0
              ? "No entries"
              : `Showing ${rangeStart} to ${rangeEnd} of ${total} entries`}
            {isFetching && !isLoading ? " (updating...)" : ""}
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger size="sm" className="w-fit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
