"use client";

import Link from "next/link";
import { useToast } from "./Toast";

/**
 * Renders a real link when the destination exists in this rebuild, and a
 * button with explicit feedback when it does not. An href="#" looks like
 * navigation and does nothing, which is the thing this exists to avoid.
 */
export function SmartLink({
  label,
  href,
  className = "",
  children,
  external,
}: {
  label: string;
  href?: string;
  className?: string;
  children?: React.ReactNode;
  external?: boolean;
}) {
  const { toast } = useToast();
  const content = children ?? label;

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toast(`${label} is not part of this rebuild`, "info")}
      className={className}
    >
      {content}
    </button>
  );
}
