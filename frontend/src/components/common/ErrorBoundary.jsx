import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiChevronDown } from 'react-icons/fi';
import { resetDemoState, isDemoMode } from '../../api/demo/demoAdapter';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error capturado en render:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    resetDemoState();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const demo = isDemoMode();
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 text-neutral-100">
          <div className="max-w-lg w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-950/60 text-rose-400 flex items-center justify-center border border-rose-800/80 shadow-lg shadow-rose-950/40">
              <FiAlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Algo salió mal en esta sección
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                {demo
                  ? 'Si estás navegando en el Modo Demo con datos antiguos de una versión previa, podés restablecer el estado inicial para resolver incompatibilidades de almacenamiento.'
                  : 'Ocurrió un error inesperado al procesar la vista. Intentá recargar la página o volver a la portada.'}
              </p>
            </div>

            {/* Error Message */}
            {this.state.error && (
              <div className="text-left bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-3 text-xs font-mono text-rose-300 select-all overflow-x-auto">
                <div className="font-semibold text-rose-400 mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2 text-[10px] text-neutral-400">
                    <summary className="cursor-pointer hover:text-neutral-200 select-none">
                      Ver detalle de componentes
                    </summary>
                    <pre className="mt-1 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {demo && (
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Restablecer Demo</span>
                </button>
              )}

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <FiRefreshCw className="w-4 h-4" />
                <span>Recargar</span>
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="w-full sm:w-auto px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <FiHome className="w-4 h-4" />
                <span>Ir al Inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
