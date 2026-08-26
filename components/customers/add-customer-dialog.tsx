"use client";

import { toast } from "sonner";

import { CustomerForm } from "@/components/customers/customer-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateCustomer } from "@/hooks/use-customer-mutations";
import type { CustomerFormValues } from "@/lib/customer-schema";

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCustomerDialog({ open, onOpenChange }: AddCustomerDialogProps) {
  const createCustomer = useCreateCustomer();

  function handleSubmit(values: CustomerFormValues) {
    createCustomer.mutate(values, {
      onSuccess: () => {
        toast.success(`Added ${values.name}`);
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : "Failed to add customer");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>
        <CustomerForm
          submitLabel="Add Customer"
          isSubmitting={createCustomer.isPending}
          onCancel={() => onOpenChange(false)}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
