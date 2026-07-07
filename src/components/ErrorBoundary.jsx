import { Component } from 'react';
import Button from './ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('KEAA website error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center bg-surface px-6 text-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-800">Something went wrong</h1>
            <p className="mt-2 text-ink/60">Please refresh the page or return home.</p>
            <Button to="/" className="mt-6">
              Back to Home
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
