"use client";

import React from 'react';
import { Spin, Alert, Button, Result } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface ApiStatusHandlerProps {
  isLoading?: boolean;
  error?: any;
  loadingText?: string;
  errorTitle?: string;
  errorMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
  showSpinner?: boolean;
  minHeight?: string;
}

const ApiStatusHandler: React.FC<ApiStatusHandlerProps> = ({
  isLoading = false,
  error,
  loadingText = "Loading...",
  errorTitle = "Error",
  errorMessage = "Something went wrong. Please try again.",
  onRetry,
  children,
  showSpinner = true,
  minHeight = "200px"
}) => {
  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center" 
        style={{ minHeight }}
      >
        {showSpinner ? (
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-4 text-gray-500">{loadingText}</div>
          </div>
        ) : (
          <div className="text-center text-gray-500">{loadingText}</div>
        )}
      </div>
    );
  }

  if (error) {
    // Handle different types of errors
    const isNetworkError = error?.status === 'FETCH_ERROR' || error?.status === 'TIMEOUT_ERROR';
    const isServerError = error?.status >= 500;
    const isClientError = error?.status >= 400 && error?.status < 500;

    if (isNetworkError) {
      return (
        <Result
          status="warning"
          title="Connection Error"
          subTitle="Unable to connect to the server. Please check your internet connection."
          extra={
            onRetry && (
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={onRetry}
              >
                Try Again
              </Button>
            )
          }
        />
      );
    }

    if (isServerError) {
      return (
        <Result
          status="500"
          title="Server Error"
          subTitle="Something went wrong on our end. Please try again later."
          extra={
            onRetry && (
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={onRetry}
              >
                Try Again
              </Button>
            )
          }
        />
      );
    }

    if (isClientError) {
      return (
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to access this resource."
          extra={
            onRetry && (
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={onRetry}
              >
                Try Again
              </Button>
            )
          }
        />
      );
    }

    // Generic error
    return (
      <Alert
        message={errorTitle}
        description={errorMessage}
        type="error"
        showIcon
        action={
          onRetry && (
            <Button 
              size="small" 
              danger 
              icon={<ReloadOutlined />} 
              onClick={onRetry}
            >
              Retry
            </Button>
          )
        }
      />
    );
  }

  return <>{children}</>;
};

export default ApiStatusHandler; 