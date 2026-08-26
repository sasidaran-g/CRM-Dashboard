"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CustomerForm } from "@/components/customers/customer-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteCustomer, useUpdateCustomer } from "@/hooks/use-customer-mutations";
import type { CustomerFormValues } from "@/lib/customer-schema";
import type { Customer } from "@/lib/types";

type Mode = "view" | "edit" | "delete";

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomerDetailsDialog({
  customer,
  open,
  onOpenChange,
}: CustomerDetailsDialogProps) {
  const [mode, setMode] = useState<Mode>("view");
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  useEffect(() => {
    if (open) setMode("view");
  }, [open, customer?.id]);

  if (!customer) return null;

  function handleUpdate(values: CustomerFormValues) {
    updateCustomer.mutate(
      { id: customer!.id, values },
      {
        onSuccess: () => {
          toast.success(`Updated ${values.name}`);
          setMode("view");
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Failed to update customer");
        },
      }
    );
  }

  function handleDelete() {
    deleteCustomer.mutate(customer!.id, {
      onSuccess: () => {
        toast.success(`Deleted ${customer!.name}`);
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to delete customer");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {mode === "delete" ? (
          <>
            <DialogHeader>
              <DialogTitle>Delete {customer.name}?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will permanently remove this customer and their notes. This action
              cannot be undone.
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMode("view")}
                disabled={deleteCustomer.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteCustomer.isPending}
              >
                {deleteCustomer.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </>
        ) : mode === "edit" ? (
          <>
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm
              submitLabel="Save Changes"
              isSubmitting={updateCustomer.isPending}
              onCancel={() => setMode("view")}
              onSubmit={handleUpdate}
              defaultValues={{
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                company: customer.company,
                status: customer.status,
                lastContactDate: customer.lastContactDate.slice(0, 10),
                notes: customer.notes,
              }}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 pr-6">
                <DialogTitle>{customer.name}</DialogTitle>
                <Badge variant={customer.status === "Active" ? "default" : "secondary"}>
                  {customer.status}
                </Badge>
              </div>
            </DialogHeader>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <dt className="text-muted-foreground">Company</dt>
                <dd>{customer.company || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{customer.phone}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Last Contact</dt>
                <dd>{formatDate(customer.lastContactDate)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="mb-1 text-muted-foreground">Notes</dt>
                <dd className="whitespace-pre-wrap rounded-md border bg-muted/30 p-2 text-sm">
                  {customer.notes || "No notes yet."}
                </dd>
              </div>
            </dl>

            <DialogFooter>
              <Button variant="destructive" onClick={() => setMode("delete")}>
                Delete
              </Button>
              <Button onClick={() => setMode("edit")}>Edit Customer</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
