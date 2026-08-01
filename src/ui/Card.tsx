import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  padded?: boolean;
}

export function Card({
  title,
  description,
  action,
  padded = true,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <section className={cn("surface-card", padded && "p-6", className)} {...props}>
      {(title || description || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title ? <h3 className="text-lg font-semibold tracking-tight">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm text-subtle">{description}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
