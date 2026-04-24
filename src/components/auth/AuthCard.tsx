import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export const AuthCard = ({ title, subtitle, footer, children }: AuthCardProps) => (
  <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 mb-6 px-4 py-2 rounded-full border border-border/60 shadow-sm bg-white/80 backdrop-blur-sm"
        >
          <img
            src="https://api.oqyrman.app/minio/oqyrman/static/logo_circle.png"
            alt="Oqyrman"
            className="h-9 w-9 ring-1 ring-border/40 rounded-full"
          />
          <span className="text-xl font-bold text-primary">Oqyrman</span>
        </Link>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle mt-2">{subtitle}</p>}
      </div>

      <div className="rounded-2xl p-6 md:p-8 shadow-lg bg-white border border-border">
        {children}
      </div>

      {footer && (
        <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
      )}
    </div>
  </div>
);

export const LabelInputContainer = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col space-y-2">{children}</div>
);
