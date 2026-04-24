import { Component, type ReactNode, type ErrorInfo } from "react";
import { Link } from "react-router-dom";
import { IconRefresh, IconAlertTriangle } from "@tabler/icons-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <IconAlertTriangle size={32} className="text-red-500" stroke={1.5} />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Что-то пошло не так</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {this.state.error.message || "Произошла непредвиденная ошибка"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <IconRefresh size={16} />
                Перезагрузить
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ error: null })}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                На главную
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
