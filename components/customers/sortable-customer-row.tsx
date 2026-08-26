"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { TableCell, TableRow } from "@/components/ui/table";

interface SortableCustomerRowProps {
  id: string;
  dragDisabled: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function SortableCustomerRow({
  id,
  dragDisabled,
  onClick,
  children,
}: SortableCustomerRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: dragDisabled });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 1 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="cursor-pointer" onClick={onClick}>
      <TableCell className="w-8" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Drag to reorder"
          disabled={dragDisabled}
          className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      {children}
    </TableRow>
  );
}
