import * as React from "react";
import { cn } from "@/lib/utils";

// Field - Ana kapsayıcı bileşen
interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  "data-invalid"?: boolean;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, "data-invalid": dataInvalid, ...props }, ref) => (
    <div
      ref={ref}
      data-invalid={dataInvalid}
      className={cn("space-y-2", className)}
      {...props}
    />
  )
);
Field.displayName = "Field";

// FieldLabel - Alan etiketi
const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 [div[data-invalid=true]_&]:text-destructive",
      className
    )}
    {...props}
  />
));
FieldLabel.displayName = "FieldLabel";

// FieldDescription - Alan açıklaması
const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FieldDescription.displayName = "FieldDescription";

// FieldError - Hata mesajı
interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  errors?: (
    | {
        message?: string;
      }
    | undefined
  )[];
}

const FieldError = React.forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, errors, children, ...props }, ref) => {
    const errorMessage =
      errors?.find((e) => e?.message)?.message ?? (children as string);

    if (!errorMessage) return null;

    return (
      <p
        ref={ref}
        role="alert"
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
      >
        {errorMessage}
      </p>
    );
  }
);
FieldError.displayName = "FieldError";

// FieldGroup - Alan grubu
const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex gap-2", className)} {...props} />
));
FieldGroup.displayName = "FieldGroup";

// FieldSet - Form alanları seti
const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(({ className, ...props }, ref) => (
  <fieldset
    ref={ref}
    className={cn("space-y-4 border-0 p-0 m-0", className)}
    {...props}
  />
));
FieldSet.displayName = "FieldSet";

// FieldLegend - FieldSet başlığı
const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.HTMLAttributes<HTMLLegendElement>
>(({ className, ...props }, ref) => (
  <legend
    ref={ref}
    className={cn("text-base font-semibold leading-none", className)}
    {...props}
  />
));
FieldLegend.displayName = "FieldLegend";

// FieldContent - Alan içeriği
const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-1", className)} {...props} />
));
FieldContent.displayName = "FieldContent";

// FieldTitle - Alan başlığı
const FieldTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn("text-sm font-semibold leading-none", className)}
    {...props}
  />
));
FieldTitle.displayName = "FieldTitle";

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldContent,
  FieldTitle,
};
