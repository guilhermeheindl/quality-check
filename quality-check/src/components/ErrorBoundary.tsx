'use client';
import { Component, type ReactNode } from 'react';

interface State { error: Error | null }

export class ErrorBoundary extends Component<{ children: ReactNode; label?: string }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
          Erro ao renderizar {this.props.label ?? 'slide'}.
        </div>
      );
    }
    return this.props.children;
  }
}
