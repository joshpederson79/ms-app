import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page">
          <h2>Something went sideways.</h2>
          <p className="muted">Try reloading the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
