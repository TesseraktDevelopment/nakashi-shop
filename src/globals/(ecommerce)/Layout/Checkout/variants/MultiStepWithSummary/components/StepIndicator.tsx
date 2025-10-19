"use client";

import { CheckIcon } from "@heroicons/react/20/solid";
import { useTranslations } from "next-intl";

import type { CheckoutStep } from "./MultiStepCheckoutForm";

type StepIndicatorProps = {
	steps: { key: CheckoutStep; titleKey: string; number: number }[];
	currentStep: CheckoutStep;
	completedSteps: CheckoutStep[];
	onStepClick: (step: CheckoutStep) => void;
};

export const StepIndicator = ({
	steps,
	currentStep,
	completedSteps,
	onStepClick,
}: StepIndicatorProps) => {
	const t = useTranslations("CheckoutSteps");

	return (
		<nav aria-label="Progress" className="mb-8">
			<ol className="flex items-center">
				{steps.map((step, stepIdx) => {
					const isCompleted = completedSteps?.includes(step.key);
					const isCurrent = currentStep === step.key;
					const isClickable = isCompleted || isCurrent;

					return (
						<li
							key={step.key}
							className={`relative ${
								stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
							}`}
						>
							{stepIdx !== steps.length - 1 && (
								<div
									aria-hidden="true"
									className="absolute inset-0 flex items-center"
								>
									<div
										className={`h-0.5 w-full ${
											isCompleted ? "bg-main-600" : "bg-gray-200"
										}`}
									/>
								</div>
							)}

							<button
								type="button"
								className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
									isCompleted
										? "bg-main-600 hover:bg-main-900"
										: isCurrent
											? "border-2 border-main-600 bg-white"
											: "border-2 border-gray-300 bg-white hover:border-gray-400"
								} ${isClickable ? "cursor-pointer" : ""}`}
								onClick={() => isClickable && onStepClick(step.key)}
							>
								{isCompleted ? (
									<CheckIcon
										className="h-5 w-5 text-white"
										aria-hidden="true"
									/>
								) : (
									<span
										className={`h-2.5 w-2.5 rounded-full ${
											isCurrent ? "bg-main-600" : "bg-transparent"
										}`}
									/>
								)}
							</button>

							<div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
								<span
									className={`text-xs font-medium uppercase tracking-wide ${
										isCompleted || isCurrent ? "text-main-600" : "text-gray-500"
									}`}
								>
									{t(step.titleKey)}
								</span>
							</div>
						</li>
					);
				})}
			</ol>
		</nav>
	);
};
