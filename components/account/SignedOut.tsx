import Link from "next/link";

/** No auth wall: account pages explain themselves instead of redirecting. */
export function SignedOut({ page }: { page: string }) {
  return (
    <div className="mx-auto max-w-md py-24 text-center">
      <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-white">Sign in to see your {page}</h1>
      <p className="mt-2 text-sm text-hf-muted">
        Everything else in Higgsfield works signed out. Your {page} needs an account.
      </p>
      <Link
        href="/login"
        className="press mt-6 inline-flex min-h-11 items-center rounded-full bg-hf-accent px-6 text-sm font-semibold text-black hover:bg-hf-accent-hover"
      >
        Log in
      </Link>
    </div>
  );
}
