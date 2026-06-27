interface CeloBadgeProps {
  variant?: "connected" | "network" | "powered" | "built";
}

export function CeloBadge({ variant = "network" }: CeloBadgeProps) {
  void variant;
  return null;
}
