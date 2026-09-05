import { Component, ErrorInfo, ReactNode } from "react";

import { api } from "../api";
import ErrorPage from "../pages/ErrorPage";
import { LOG_LEVEL } from "../constants";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  retryCount: number;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
    retryCount: 0,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    api.log(LOG_LEVEL.Error, `${error.message} \n ${errorInfo.componentStack}`);
  }

  handleRetry = () => {
    // clear the error, and increase retryCount if it's first time
    // otherwise, reload the app

    if (this.state.retryCount >= 1) {
      window.location.reload();
      return;
    }

    this.setState((prev) => ({ error: null, retryCount: prev.retryCount + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorPage
          error={this.state.error.message || "An unexpected error occurred."}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
