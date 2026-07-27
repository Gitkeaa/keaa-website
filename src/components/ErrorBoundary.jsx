import { Component } from 'react';
import Button from './ui/Button';

/**
 * App-wide error boundary: catches render-time errors from the whole tree and shows a
 * recoverable fallback with a Back to Home link instead of a blank white screen.
 *
 * Wraps every route (admin and public) in AppShell in App.jsx. Edit the fallback markup in
 * render() below to change what a crashed page looks like.
 */
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
            <h1 className="font-display text-2xl font-bold text-text">Something went wrong</h1>
            <p className="body-copy mx-auto text-center mt-2">Please refresh the page or return home.</p>
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
