"use client";

import * as Sentry from "@sentry/react";
import React, { Component, type ReactNode } from "react";

type ErrorBoundaryState = {
	hasError: boolean;
	errorMessage: string;
	eventId: string | null;
};

type ErrorBoundaryProps = {
	children: ReactNode;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = {
		hasError: false,
		errorMessage: "",
		eventId: null,
	};

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { hasError: true, errorMessage: error.message };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		Sentry.withScope((scope) => {
			scope.setExtras({ componentStack: errorInfo.componentStack });
			const eventId = Sentry.captureException(error);
			this.setState({ eventId });
		});
		console.error("Error occurred:", error, errorInfo);
	}

	render(): ReactNode {
		if (this.state.hasError) {
			return (
				<div className="flex min-h-screen items-center justify-center bg-gray-100">
					<div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
						<h2 className="mb-4 text-2xl font-bold text-red-600">
							Došlo k chybě!
						</h2>
						<p className="mb-4 text-gray-700">{this.state.errorMessage}</p>
						<p className="mb-4 text-sm text-gray-500">
							Chyba byla zaznamenána. Kód chyby:{" "}
							<span className="font-mono text-main-600">
								{this.state.eventId ?? "Není k dispozici"}
							</span>
						</p>
						<button
							onClick={() => window.location.reload()}
							className="rounded bg-main-600 px-4 py-2 text-white hover:bg-main-700 focus:outline-none focus:ring-2 focus:ring-main-500"
						>
							Zkusit znovu
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export { ErrorBoundary };
