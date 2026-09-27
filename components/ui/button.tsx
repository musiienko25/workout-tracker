import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const variants = {
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800",
  secondary:
    "border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800",
} as const;

const sizes = {
  md: "h-12 text-base",
  lg: "h-14 text-lg",
} as const;

const base =
  "inline-flex items-center justify-center rounded-xl px-4 font-semibold disabled:opacity-50";

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type={type}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
