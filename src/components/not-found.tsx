import { Link } from "@tanstack/react-router";

export function NotFound() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="text-center space-y-4">
				<h1 className="text-6xl font-bold text-foreground">404</h1>
				<h2 className="text-2xl font-semibold text-foreground">
					Page Not Found
				</h2>
				<p className="text-muted-foreground max-w-md mx-auto">
					The page you're looking for doesn't exist or has been moved.
				</p>
				<div className="pt-4">
					<Link
						to="/"
						className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
					>
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}
