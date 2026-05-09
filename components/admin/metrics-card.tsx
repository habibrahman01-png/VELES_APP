import { Card } from "@/components/ui/card";

interface MetricsCardProps {
  label: string;
  value: string;
  hint: string;
}

export function MetricsCard({ label, value, hint }: MetricsCardProps) {
  return (
    <Card className="space-y-3 p-6">
      <p className="text-caption uppercase tracking-[0.2em] text-mutedGray">{label}</p>
      <p className="text-card">{value}</p>
      <p className="text-body text-bodyGray">{hint}</p>
    </Card>
  );
}
