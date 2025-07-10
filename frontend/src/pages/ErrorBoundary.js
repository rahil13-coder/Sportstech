import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Error aane par fallback UI dikhane ke liye state update karte hain
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Error ko console ya kisi logging service me bhej sakte hain
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <h3 style={{ color: "red" }}>
          Kuch galat ho gaya. Fantasy widget load nahi ho paaya.
        </h3>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
