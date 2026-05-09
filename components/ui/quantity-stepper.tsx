import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 10 }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-chipGray">
      <button className="p-3" onClick={() => onChange(Math.max(min, value - 1))} type="button">
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-12 text-center text-body">{value}</span>
      <button className="p-3" onClick={() => onChange(Math.min(max, value + 1))} type="button">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
