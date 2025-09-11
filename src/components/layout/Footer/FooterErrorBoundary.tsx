import React from 'react';

interface FooterErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface FooterErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class FooterErrorBoundary extends React.Component<FooterErrorBoundaryProps, FooterErrorBoundaryState> {
  constructor(props: FooterErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FooterErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Footer Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <footer className="mt-10">
          <div className="pt-8 md:pt-[50px] bg-[#F0F0F0] px-4 pb-4">
            <div className="max-w-frame mx-auto">
              <div className="text-center py-8">
                <p className="text-black/60 text-sm">
                  Footer content is temporarily unavailable. Please try refreshing the page.
                </p>
              </div>
            </div>
          </div>
        </footer>
      );
    }

    return this.props.children;
  }
}

export default FooterErrorBoundary;
