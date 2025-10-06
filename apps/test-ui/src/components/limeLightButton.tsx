// components/StartNowButton.tsx
import { ArrowRight } from "lucide-react";

export default function StartNowButton() {
  return (
    <button
      className="flex items-center gap-2 rounded-full bg-gradient-to-b from-yellow-300 to-lime-400 px-8 py-3 text-black font-medium shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-200"
    >
      Start Now
      <ArrowRight size={18} className="mt-[1px]" />
    </button>
  );
}
