import { Component, ErrorInfo, ReactNode } from "react";

import { api } from "../api";
import ErrorPage from "../pages/ErrorPage";
import { LOG_LEVEL } from "../constants";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    api.log(LOG_LEVEL.Error, `${error.message} \n ${errorInfo.componentStack}`);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorPage
          error={this.state.error.message || "An unexpected error occured."}
          onRetry={() => this.setState({ error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
