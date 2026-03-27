"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  "aria-invalid"?: boolean;
  disabled?: boolean;
  className?: string;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function DateInput({
  value,
  onChange,
  id,
  "aria-invalid": ariaInvalid,
  disabled,
  className,
}: DateInputProps) {
  return (
    <div className="flex gap-2 items-center">
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm",
          "text-foreground shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[color-scheme:dark]",
          className
        )}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => onChange(today())}
        className="shrink-0 h-9 px-3 text-xs"
        tabIndex={-1}
      >
        Bugün
      </Button>
    </div>
  );
}
