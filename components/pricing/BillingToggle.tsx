"use client";

export type Billing = "monthly" | "annual";

export function BillingToggle({
  value,
  onChange,
  discountLabel,
}: {
  value: Billing;
  onChange: (value: Billing) => void;
  discountLabel?: string;
}) {
  const annual = value === "annual";

  return (
    <div className="flex items-center gap-2.5 rounded-full border border-hf-border bg-hf-surface px-3 py-2">
      <span className={`text-sm ${annual ? "text-hf-dim" : "text-white"}`}>Monthly</span>

      <button
        type="button"
        role="switch"
        aria-checked={annual}
        aria-label="Bill annually"
        onClick={() => onChange(annual ? "monthly" : "annual")}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          annual ? "bg-hf-lime" : "bg-hf-surface-4"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white transition-[left] ${
            annual ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>

      <span className={`text-sm ${annual ? "text-white" : "text-hf-dim"}`}>Annual</span>

      {discountLabel ? (
        <span className="rounded bg-hf-pink px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {discountLabel}
        </span>
      ) : null}
    </div>
  );
}
