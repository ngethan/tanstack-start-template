import { Button } from "@/components/ui/button";
import { UserAccountDropdown } from "@/components/user-account-dropdown";
import { appConfig } from "@/config/app";
import { authClient } from "@/lib/auth/client";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Code, Database, Lock, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
	component: HomePage,
});

function HomePage() {
	const { data: session } = authClient.useSession();

	return (
		<main className="relative min-h-screen text-gray-100 antialiased bg-background">
			<Header authenticated={!!session} />

			{/* Hero Section */}
			<section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 pt-20 md:px-10">
				<div className="mx-auto max-w-4xl text-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
						Build Your Next App
						<span className="block text-primary">with {appConfig.name}</span>
					</h1>
					<p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
						A production-ready template with authentication, organizations,
						tRPC, and everything you need to ship fast.
					</p>
					<div className="mt-10 flex items-center justify-center gap-4">
						{session ? (
							<Button asChild size="lg">
								<Link to="/dashboard">Go to Dashboard</Link>
							</Button>
						) : (
							<>
								<Button asChild size="lg">
									<Link to="/signup">Get Started</Link>
								</Button>
								<Button asChild variant="outline" size="lg">
									<Link to="/login">Sign In</Link>
								</Button>
							</>
						)}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-24 px-6 md:px-10">
				<div className="mx-auto max-w-6xl">
					<h2 className="text-center text-3xl font-bold mb-4">
						Everything You Need
					</h2>
					<p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
						Built with modern tools and best practices, so you can focus on
						building your product.
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<FeatureCard
							icon={<Lock className="h-6 w-6" />}
							title="Authentication"
							description="Email, OAuth, and 2FA with Better Auth. Organizations and teams included."
						/>
						<FeatureCard
							icon={<Zap className="h-6 w-6" />}
							title="tRPC API"
							description="End-to-end type safety with tRPC. No API schemas to maintain."
						/>
						<FeatureCard
							icon={<Database className="h-6 w-6" />}
							title="Database Ready"
							description="PostgreSQL with Drizzle ORM. Type-safe database queries."
						/>
						<FeatureCard
							icon={<Code className="h-6 w-6" />}
							title="TanStack Router"
							description="File-based routing with full type safety and SSR support."
						/>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 px-6 md:px-10 bg-muted">
				<div className="mx-auto max-w-4xl text-center">
					<h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
					<p className="text-muted-foreground mb-8">
						Clone the template and start building your next project today.
					</p>
					<div className="flex items-center justify-center gap-4">
						<Button asChild size="lg">
							<Link to="/signup" className="flex items-center gap-2">
								Start Building <ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			<Footer />
		</main>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="rounded-lg border bg-card p-6 shadow-sm">
			<div className="mb-4 text-primary">{icon}</div>
			<h3 className="font-semibold mb-2">{title}</h3>
			<p className="text-sm text-muted-foreground">{description}</p>
		</div>
	);
}

function Header({ authenticated }: { authenticated: boolean }) {
	return (
		<header className="fixed inset-x-0 top-0 z-20 border-b bg-background/80 backdrop-blur-md">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
				<div className="flex items-center gap-2">
					<img src="/logo.svg" alt="Logo" className="h-7 w-7" />
					<span className="select-none text-sm font-bold tracking-wide">
						{appConfig.name}
					</span>
				</div>

				<nav className="flex items-center gap-3 text-sm">
					{authenticated ? (
						<>
							<Button asChild size="sm">
								<Link to="/dashboard">Dashboard</Link>
							</Button>
							<UserAccountDropdown minimized={true} />
						</>
					) : (
						<>
							<Button asChild variant="ghost" size="sm">
								<Link to="/login">Log in</Link>
							</Button>
							<Button asChild size="sm">
								<Link to="/signup">Sign up</Link>
							</Button>
						</>
					)}
				</nav>
			</div>
		</header>
	);
}

function Footer() {
	return (
		<footer className="border-t px-6 py-10 md:px-10">
			<div className="mx-auto max-w-6xl">
				<div className="flex items-center gap-2 mb-4">
					<img src="/logo.svg" alt="Logo" className="h-7 w-7" />
					<strong className="text-sm">{appConfig.name}</strong>
				</div>
				<p className="text-muted-foreground text-sm mb-4">
					A production-ready starter template for building modern web
					applications.
				</p>
				<div className="flex flex-wrap gap-4 text-sm">
					<Link
						className="text-muted-foreground hover:text-foreground transition-colors"
						to="/privacy"
					>
						Privacy
					</Link>
					<Link
						className="text-muted-foreground hover:text-foreground transition-colors"
						to="/tos"
					>
						Terms
					</Link>
				</div>
			</div>
		</footer>
	);
}
