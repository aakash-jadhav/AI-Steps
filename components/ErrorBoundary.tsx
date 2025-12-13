import { useEffect, useState, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { ClayButton } from './ClayComponents';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorState {
    hasError: boolean;
    error: Error | null;
    errorType: 'api-quota' | 'api-key' | 'api-error' | 'network' | 'unknown';
    errorMessage: string;
}

const getErrorType = (message: string): ErrorState['errorType'] => {
    if (message.includes('quota')) {
        return 'api-quota';
    } else if (
        message.includes('API_KEY') ||
        message.includes('VITE_GEMINI_API_KEY') ||
        message.includes('apiKey')
    ) {
        return 'api-key';
    } else if (
        message.includes('api') ||
        message.includes('fetch') ||
        message.includes('request')
    ) {
        return 'api-error';
    } else if (message.includes('network') || message.includes('offline')) {
        return 'network';
    }
    return 'unknown';
};

const ErrorDisplay = ({ error, errorType, errorMessage, onReset, onReload }: {
    error: Error | null;
    errorType: ErrorState['errorType'];
    errorMessage: string;
    onReset: () => void;
    onReload: () => void;
}) => {
    const errorConfigs: Record<ErrorState['errorType'], { title: string; description: string }> = {
        'api-quota': {
            title: 'API Quota Exceeded',
            description:
                "You've exceeded the free quota for the Gemini API. Please wait a bit or upgrade your plan at https://console.cloud.google.com/",
        },
        'api-key': {
            title: 'API Key Missing or Invalid',
            description: 'Please ensure your VITE_GEMINI_API_KEY is set in the .env.local file with a valid Gemini API key.',
        },
        'api-error': {
            title: 'API Error',
            description:
                'Something went wrong while communicating with the API. Please check your internet connection and try again.',
        },
        network: {
            title: 'Network Error',
            description: 'Unable to connect to the internet. Please check your connection and try again.',
        },
        unknown: {
            title: 'Oops! Something Went Wrong',
            description:
                errorMessage ||
                'An unexpected error occurred. Try refreshing the page or going back to home.',
        },
    };

    const config = errorConfigs[errorType];

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-6 text-center">
                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="p-4 bg-rose-100 rounded-full">
                        <AlertTriangle className="w-12 h-12 text-rose-600" />
                    </div>
                </div>

                {/* Error Title & Description */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-extrabold text-slate-800">{config.title}</h1>
                    <p className="text-slate-600 text-base leading-relaxed">{config.description}</p>
                </div>

                {/* Error Details (if not unknown) */}
                {errorType !== 'unknown' && (
                    <div className="bg-white/60 backdrop-blur rounded-lg p-4 border border-slate-200 text-left">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Error Details</p>
                        <code className="text-xs text-slate-700 break-words">{error?.message || errorMessage}</code>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                    <ClayButton
                        onClick={onReset}
                        variant="primary"
                        className="w-full"
                    >
                        <Home className="w-4 h-4" />
                        Back to Home
                    </ClayButton>
                    <ClayButton
                        onClick={onReload}
                        variant="secondary"
                        className="w-full"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reload Page
                    </ClayButton>
                </div>

                {/* Helpful Links */}
                <div className="text-xs text-slate-400 space-y-2 pt-4 border-t border-slate-200">
                    <p>
                        Need help? Check the{' '}
                        <a href="/README.md" className="underline text-sim-blue hover:text-sim-green">
                            documentation
                        </a>
                    </p>
                    {errorType === 'api-key' && (
                        <p>
                            <a
                                href="https://makersuite.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline text-sim-blue hover:text-sim-green"
                            >
                                Get your Gemini API key
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
    const [errorState, setErrorState] = useState<ErrorState>({
        hasError: false,
        error: null,
        errorType: 'unknown',
        errorMessage: 'An unexpected error occurred',
    });

    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            const error = event.error || new Error(event.message);
            const errorMessage = error.message || '';
            const errorType = getErrorType(errorMessage);

            setErrorState({
                hasError: true,
                error,
                errorType,
                errorMessage,
            });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const error = new Error(event.reason?.message || String(event.reason));
            const errorMessage = error.message || '';
            const errorType = getErrorType(errorMessage);

            setErrorState({
                hasError: true,
                error,
                errorType,
                errorMessage,
            });
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    const handleReset = () => {
        setErrorState({
            hasError: false,
            error: null,
            errorType: 'unknown',
            errorMessage: 'An unexpected error occurred',
        });
        window.location.href = '/';
    };

    const handleReload = () => {
        window.location.reload();
    };

    if (errorState.hasError) {
        return (
            <ErrorDisplay
                error={errorState.error}
                errorType={errorState.errorType}
                errorMessage={errorState.errorMessage}
                onReset={handleReset}
                onReload={handleReload}
            />
        );
    }

    return children;
};

