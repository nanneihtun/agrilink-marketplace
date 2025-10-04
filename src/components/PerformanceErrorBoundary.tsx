import React, { Component, ReactNode } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorCount: number;
  lastError?: Date;
}

export class PerformanceErrorBoundary extends Component<Props, State> {
  private renderCount = 0;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      lastError: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error('PerformanceErrorBoundary caught an error:', error, errorInfo);
    
    // Check for setState during render errors
    if (error.message.includes('Cannot update a component') || 
        error.message.includes('setState') ||
        errorInfo.componentStack?.includes('setState')) {
      console.error('🚨 setState during render detected!', {
        error: error.message,
        componentStack: errorInfo.componentStack
      });
    }
    
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));
  }

  componentDidUpdate() {
    this.renderCount++;
    
    // Detect excessive renders
    if (this.renderCount > 100) {
      console.error('🚨 Excessive renders detected in error boundary child components');
      this.setState({
        hasError: true,
        error: new Error(`Excessive renders detected (${this.renderCount})`),
        lastError: new Date()
      });
    }
  }

  handleRetry = () => {
    this.renderCount = 0;
    this.setState({
      hasError: false,
      error: undefined
    });
  };

  handleReset = () => {
    // Clear localStorage and reload
    if (window.confirm('This will clear all app data and reload the page. Continue?')) {
      try {
        // Clear app-specific localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('agriconnect-myanmar')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear session storage
        sessionStorage.clear();
        
        // Reload page
        window.location.reload();
      } catch (error) {
        console.error('Failed to reset app data:', error);
        window.location.reload();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-destructive rounded-lg flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive-foreground" />
              </div>
              <CardTitle className="text-xl">Performance Issue Detected</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>The application encountered a performance issue:</p>
                <code className="block bg-muted p-2 rounded text-xs">
                  {this.state.error?.message || 'Unknown error'}
                </code>
                {this.state.errorCount > 1 && (
                  <p className="text-primary">
                    This error has occurred {this.state.errorCount} times.
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} variant="default" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                {this.state.errorCount > 2 && (
                  <Button onClick={this.handleReset} variant="destructive" className="w-full">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Reset App Data
                  </Button>
                )}
                
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="w-full"
                >
                  Refresh Page
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Render count: {this.renderCount}</p>
                <p>Error count: {this.state.errorCount}</p>
                {this.state.lastError && (
                  <p>Last error: {this.state.lastError.toLocaleTimeString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}