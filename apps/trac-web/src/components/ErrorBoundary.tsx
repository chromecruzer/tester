import React from "react";
export type ErrorState = {
  hasError: boolean
}
export default class ErrorBoundary extends React.Component {
  override state: ErrorState = { hasError: false };
  private children: React.ReactNode;
  constructor(props) {
    super(props);
    this.children = props.children;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  override componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return <span>Error occurred here</span>;
    }

    return this.children;
  }
}
