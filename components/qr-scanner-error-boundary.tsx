'use client';

import { Component, type ReactNode } from 'react';
import { toCameraErrorMessage } from '@/lib/qr-scanner-runtime';

type QrScannerErrorBoundaryProps = {
  children: ReactNode;
  onError?: (message: string) => void;
};

type QrScannerErrorBoundaryState = {
  hasError: boolean;
};

export class QrScannerErrorBoundary extends Component<
  QrScannerErrorBoundaryProps,
  QrScannerErrorBoundaryState
> {
  state: QrScannerErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): QrScannerErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(toCameraErrorMessage(error));
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
