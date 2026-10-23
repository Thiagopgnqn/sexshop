import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import Button from '../ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error capturado en la vista:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-[65vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-canvas text-content"
        >
          <div className="max-w-md w-full bg-surface border border-brand-border/25 rounded-lg p-8 shadow-lifted">
            <div className="w-12 h-12 rounded-full bg-surface-elevated border border-brand-border/30 flex items-center justify-center mx-auto mb-4 text-mauve">
              <FiAlertTriangle size={22} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-mauve font-medium">
              Aviso del Sistema
            </span>
            <h2 className="font-display text-xl uppercase tracking-widest text-content mt-1 mb-2">
              Ocurrió un inconveniente al cargar esta sección
            </h2>
            <p className="text-xs text-content-secondary leading-relaxed mb-6">
              No pudimos mostrar esta vista en este momento. Podés intentar recargar la sección o volver al inicio de la tienda.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-content-muted bg-canvas/80 border border-brand-border/20 rounded px-3 py-2 mb-6 break-words">
                {this.state.error.message}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={this.handleReset}
                className="w-full sm:w-auto"
              >
                <FiRefreshCw className="mr-2 text-xs" />
                <span>Reintentar</span>
              </Button>
              <Link to="/" onClick={this.handleReset} className="w-full sm:w-auto">
                <Button type="button" variant="outline" size="md" className="w-full">
                  <FiHome className="mr-2 text-xs" />
                  <span>Ir al Inicio</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
