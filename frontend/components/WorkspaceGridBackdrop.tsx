"use client";

import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { cn } from "@/lib/utils";

type WorkspaceGridBackdropProps = {
  className?: string;
};

/**
 * Hero-style grid that fades out smoothly (single-face / soft mask) instead of a hard clip.
 */
export function WorkspaceGridBackdrop({ className }: WorkspaceGridBackdropProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 min-h-[320px] max-h-[min(52vh,520px)] overflow-hidden",
        className
      )}
    >
      {/* Mask fades grid smoothly toward page background — no sharp horizontal cutoff */}
      <div
        className={cn(
          "absolute inset-0",
          "[-webkit-mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.75)_22%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.08)_78%,rgba(0,0,0,0)_100%)]",
          "mask-[linear-gradient(to_bottom,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.75)_22%,rgba(0,0,0,0.35)_55%,rgba(0,0,0,0.08)_78%,rgba(0,0,0,0)_100%)]"
        )}
      >
        <InteractiveGridPattern
          className="absolute inset-0 h-full w-full opacity-[0.28] mix-blend-screen"
          width={56}
          height={56}
          squares={[38, 32]}
          squaresClassName="hover:fill-indigo-500/25 transition-colors duration-500"
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-5%,rgba(92,85,249,0.14),transparent_58%)]" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#030303]/25 to-[#030303]" />
    </div>
  );
}
