"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WaiverText } from "@/components/shared/WaiverText";

export function WaiverModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg font-semibold text-white">Liability Waiver</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto pr-1 text-sm text-zinc-300">
          <WaiverText />
        </div>
        <Button className="mt-4 w-full shrink-0" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
