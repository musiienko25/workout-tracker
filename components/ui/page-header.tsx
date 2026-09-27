import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  backHref,
  backLabel = "Back",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex h-11 items-center rounded-lg px-2 text-sm font-medium text-emerald-700 active:bg-emerald-50 dark:text-emerald-400 dark:active:bg-emerald-950"
          >
            {backLabel}
          </Link>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-xs text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
