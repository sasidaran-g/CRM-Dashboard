"use client";

import { Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMPTY_FILTERS, FILTER_TEMPLATES, countActiveFilters } from "@/lib/filters";
import { companyOptions } from "@/lib/mock-data";
import type { CustomerFilters, CustomerStatus } from "@/lib/types";
import { useSavedFilters } from "@/hooks/use-saved-filters";

const STATUS_OPTIONS: CustomerStatus[] = ["Active", "Inactive"];

interface FiltersPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CustomerFilters;
  onApply: (filters: CustomerFilters) => void;
}

export function FiltersPanel({ open, onOpenChange, filters, onApply }: FiltersPanelProps) {
  const [draft, setDraft] = useState<CustomerFilters>(filters);
  const [saveName, setSaveName] = useState("");
  const { savedFilters, saveFilter, deleteFilter } = useSavedFilters();

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  function toggleStatus(status: CustomerStatus) {
    setDraft((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  }

  function toggleCompany(company: string) {
    setDraft((prev) => ({
      ...prev,
      companies: prev.companies.includes(company)
        ? prev.companies.filter((c) => c !== company)
        : [...prev.companies, company],
    }));
  }

  function handleApply() {
    onApply(draft);
    onOpenChange(false);
  }

  function handleClearAll() {
    setDraft(EMPTY_FILTERS);
  }

  function handleSaveFilter() {
    const name = saveName.trim();
    if (!name) {
      toast.error("Give the filter a name before saving.");
      return;
    }
    saveFilter(name, draft);
    setSaveName("");
    toast.success(`Saved filter "${name}"`);
  }

  function applyTemplate(getFilters: () => CustomerFilters) {
    setDraft(getFilters());
  }

  function applySavedFilter(savedFilters_: CustomerFilters) {
    setDraft(savedFilters_);
  }

  const draftActiveCount = countActiveFilters(draft);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-0 right-0 left-auto flex h-full max-h-full w-full max-w-sm translate-x-0 translate-y-0 flex-col overflow-y-auto rounded-none rounded-l-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Filters</DialogTitle>
            {draftActiveCount > 0 && (
              <Badge variant="secondary">{draftActiveCount} active</Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto py-1">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Status</Label>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setDraft((prev) => ({ ...prev, status: [] }))}
              >
                Clear
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {STATUS_OPTIONS.map((status) => (
                <label key={status} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={draft.status.includes(status)}
                    onCheckedChange={() => toggleStatus(status)}
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2">Company</Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="w-full justify-between" />
                }
              >
                {draft.companies.length > 0
                  ? `${draft.companies.length} selected`
                  : "All companies"}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-(--anchor-width)">
                {companyOptions.map((company) => (
                  <DropdownMenuCheckboxItem
                    key={company}
                    checked={draft.companies.includes(company)}
                    onCheckedChange={() => toggleCompany(company)}
                  >
                    {company}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <Label className="mb-2">Date Range (Last Contact)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={draft.dateFrom}
                onChange={(e) => setDraft((prev) => ({ ...prev, dateFrom: e.target.value }))}
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                value={draft.dateTo}
                onChange={(e) => setDraft((prev) => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="filter-phone" className="mb-2">
              Phone Number
            </Label>
            <Input
              id="filter-phone"
              placeholder="e.g. (555) 123-4567"
              value={draft.phone}
              onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="filter-email" className="mb-2">
              Email Contains
            </Label>
            <Input
              id="filter-email"
              placeholder="e.g. @acme.com"
              value={draft.email}
              onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-2 border-t pt-4">
            <Label className="mb-1">Filter Templates</Label>
            <div className="flex flex-wrap gap-2">
              {FILTER_TEMPLATES.map((template) => (
                <Button
                  key={template.name}
                  variant="outline"
                  size="sm"
                  onClick={() => applyTemplate(template.getFilters)}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t pt-4">
            <Label className="mb-1">Save Current Filters</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Filter name..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
              <Button variant="secondary" onClick={handleSaveFilter}>
                Save
              </Button>
            </div>
          </div>

          {savedFilters.length > 0 && (
            <div className="flex flex-col gap-2 border-t pt-4">
              <Label className="mb-1">Saved Filters</Label>
              <div className="flex flex-col gap-1">
                {savedFilters.map((saved) => (
                  <div
                    key={saved.id}
                    className="flex items-center justify-between rounded-md border px-2.5 py-1.5"
                  >
                    <button
                      type="button"
                      className="text-sm hover:underline"
                      onClick={() => applySavedFilter(saved.filters)}
                    >
                      {saved.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => deleteFilter(saved.id)}
                    >
                      <Trash2Icon />
                      <span className="sr-only">Delete {saved.name}</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t pt-4">
          <Button variant="outline" className="flex-1" onClick={handleClearAll}>
            Clear All Filters
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
