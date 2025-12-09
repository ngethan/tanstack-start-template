import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ProgressBarProps {
	isLoading?: boolean;
	className?: string;
}

export function ProgressBar({
	isLoading = false,
	className,
}: ProgressBarProps) {
	const [progress, setProgress] = useState(0);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (isLoading) {
			setVisible(true);
			setProgress(0);

			// Start animation
			const timer1 = setTimeout(() => setProgress(20), 100);
			const timer2 = setTimeout(() => setProgress(50), 300);
			const timer3 = setTimeout(() => setProgress(80), 600);
			const timer4 = setTimeout(() => setProgress(90), 900);

			return () => {
				clearTimeout(timer1);
				clearTimeout(timer2);
				clearTimeout(timer3);
				clearTimeout(timer4);
			};
		}
		// Complete the animation
		setProgress(100);
		const hideTimer = setTimeout(() => {
			setVisible(false);
			setProgress(0);
		}, 300);

		return () => clearTimeout(hideTimer);
	}, [isLoading]);

	if (!visible && progress === 0) return null;

	return (
		<div
			className={cn(
				"fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent",
				className,
			)}
		>
			<div
				className="h-full bg-primary transition-all duration-300 ease-out"
				style={{
					width: `${progress}%`,
					opacity: progress === 100 ? 0 : 1,
				}}
			/>
		</div>
	);
}
