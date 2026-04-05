import { IconMoodEmpty } from "@tabler/icons-react";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = ({
  icon: Icon = IconMoodEmpty,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-5">
      <Icon size={28} className="text-muted-foreground/50" stroke={1.5} />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1.5">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
    )}
    {action}
  </div>
);
