import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Step {
	id: string;
	title: string;
	description?: string;
}

interface StepperProps {
	steps: Step[];
	currentStep: number;
	className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
	return (
		<nav aria-label="Progress" className={cn("w-full", className)}>
			<ol className="flex items-center justify-between">
				{steps.map((step, index) => {
					const stepNumber = index + 1;
					const isComplete = stepNumber < currentStep;
					const isCurrent = stepNumber === currentStep;
					const isUpcoming = stepNumber > currentStep;

					return (
						<li
							key={step.id}
							className={cn(
								"flex flex-1 items-center",
								index !== steps.length - 1 &&
									"after:mx-2 after:h-0.5 after:flex-1 after:bg-white/10",
								isComplete && "after:bg-emerald-400/50",
							)}
						>
							<div className="flex flex-col items-center gap-2">
								<div
									className={cn(
										"flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
										isComplete &&
											"border-emerald-400 bg-emerald-400/10 text-emerald-400",
										isCurrent &&
											"border-blue-400 bg-blue-400/10 text-blue-400 ring-4 ring-blue-400/20",
										isUpcoming && "border-white/20 bg-white/5 text-slate-400",
									)}
								>
									{isComplete ? (
										<Check className="h-5 w-5" />
									) : (
										<span>{stepNumber}</span>
									)}
								</div>
								<div className="hidden text-center sm:block">
									<div
										className={cn(
											"text-xs font-medium",
											isCurrent && "text-white",
											isComplete && "text-emerald-400",
											isUpcoming && "text-slate-500",
										)}
									>
										{step.title}
									</div>
								</div>
							</div>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
