import { appConfig } from "@/config/app";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPage,
});

function PrivacyPage() {
	const effectiveDate = new Date("2025-09-02").toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-6 py-16 max-w-5xl">
				<header className="mb-12 pb-8 border-b">
					<div className="mb-6">
						<Link
							to="/"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							← Return to {appConfig.name}
						</Link>
					</div>
					<h1 className="text-4xl font-semibold tracking-tight mb-3">
						Privacy Policy
					</h1>
					<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
						<span>Effective Date: {effectiveDate}</span>
						<span className="hidden sm:inline">•</span>
						<span>Version 1.2</span>
					</div>
				</header>

				<div className="prose prose-gray dark:prose-invert max-w-none">
					<section className="mb-10">
						<p className="text-lg leading-relaxed mb-8">
							{appConfig.company} ("{appConfig.name}," "we," "us," or "our") is
							committed to protecting your privacy. This Privacy Policy explains
							how we collect, use, disclose, and safeguard your information when
							you use our website and services (collectively, the "Service").
							Please read this privacy policy carefully. If you do not agree
							with the terms of this privacy policy, please do not access the
							Service.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							1. Information We Collect
						</h2>

						<h3 className="text-lg font-medium mb-3">
							1.1 Personal Information You Provide
						</h3>
						<p className="mb-4 text-muted-foreground">
							We collect personal information that you voluntarily provide when
							registering for an account or using our Service, including but not
							limited to:
						</p>
						<ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
							<li>Name, email address, and password</li>
							<li>
								Professional information (job title, company, skills,
								experience)
							</li>
							<li>Resume and portfolio materials</li>
							<li>Communication preferences</li>
							<li>
								Payment information (processed securely through third-party
								providers)
							</li>
						</ul>

						<h3 className="text-lg font-medium mb-3">
							1.2 Information Collected Automatically
						</h3>
						<p className="mb-4 text-muted-foreground">
							When you access our Service, we automatically collect certain
							information about your device and usage patterns:
						</p>
						<ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
							<li>IP address and geolocation data</li>
							<li>Browser type and operating system</li>
							<li>Device identifiers</li>
							<li>Pages viewed and features used</li>
							<li>Time spent on pages</li>
							<li>Referring URLs</li>
						</ul>

						<h3 className="text-lg font-medium mb-3">
							1.3 Information from Third Parties
						</h3>
						<p className="mb-4 text-muted-foreground">
							We may receive information about you from third parties, such as:
						</p>
						<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
							<li>
								Social media platforms (when you sign in using social
								authentication)
							</li>
							<li>Employment verification services</li>
							<li>Background check providers (with your consent)</li>
							<li>Other users who refer you to our Service</li>
						</ul>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							2. How We Use Your Information
						</h2>
						<p className="mb-4 text-muted-foreground">
							We use the collected information for various purposes, including:
						</p>
						<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
							<li>To provide, maintain, and improve our Service</li>
							<li>To match you with relevant job opportunities</li>
							<li>
								To facilitate communication between job seekers and employers
							</li>
							<li>To process transactions and send related information</li>
							<li>
								To send administrative information, updates, and security alerts
							</li>
							<li>To respond to your inquiries and provide customer support</li>
							<li>To conduct research and analysis to improve our Service</li>
							<li>
								To detect, prevent, and address technical issues and fraudulent
								activity
							</li>
							<li>
								To comply with legal obligations and enforce our terms of
								service
							</li>
						</ul>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							3. How We Share Your Information
						</h2>
						<p className="mb-4 text-muted-foreground">
							We may share your information in the following circumstances:
						</p>

						<h3 className="text-lg font-medium mb-3">3.1 With Your Consent</h3>
						<p className="mb-4 text-muted-foreground">
							We share your information with employers and recruiters when you
							apply for positions or make your profile searchable.
						</p>

						<h3 className="text-lg font-medium mb-3">3.2 Service Providers</h3>
						<p className="mb-4 text-muted-foreground">
							We share information with third-party vendors who perform services
							on our behalf, including:
						</p>
						<ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
							<li>Cloud hosting and data storage providers</li>
							<li>Payment processors</li>
							<li>Email delivery services</li>
							<li>Analytics providers</li>
							<li>Customer support tools</li>
						</ul>

						<h3 className="text-lg font-medium mb-3">3.3 Legal Requirements</h3>
						<p className="mb-4 text-muted-foreground">
							We may disclose your information if required to do so by law or in
							response to valid requests by public authorities.
						</p>

						<h3 className="text-lg font-medium mb-3">3.4 Business Transfers</h3>
						<p className="text-muted-foreground">
							In the event of a merger, acquisition, or sale of assets, your
							information may be transferred to the acquiring entity.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">4. Data Security</h2>
						<p className="mb-4 text-muted-foreground">
							We implement appropriate technical and organizational security
							measures to protect your personal information against unauthorized
							access, alteration, disclosure, or destruction. These measures
							include:
						</p>
						<ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
							<li>Encryption of data in transit and at rest</li>
							<li>Regular security assessments and audits</li>
							<li>Access controls and authentication mechanisms</li>
							<li>Employee training on data protection</li>
							<li>Incident response procedures</li>
						</ul>
						<p className="text-muted-foreground">
							However, no method of transmission over the Internet or electronic
							storage is 100% secure, and we cannot guarantee absolute security.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							5. Your Rights and Choices
						</h2>
						<p className="mb-4 text-muted-foreground">
							You have the following rights regarding your personal information:
						</p>
						<ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
							<li>
								<strong>Access:</strong> Request a copy of your personal
								information
							</li>
							<li>
								<strong>Correction:</strong> Request correction of inaccurate
								information
							</li>
							<li>
								<strong>Deletion:</strong> Request deletion of your personal
								information
							</li>
							<li>
								<strong>Portability:</strong> Request transfer of your
								information to another service
							</li>
							<li>
								<strong>Opt-out:</strong> Unsubscribe from marketing
								communications
							</li>
							<li>
								<strong>Restriction:</strong> Request limitation on how we use
								your information
							</li>
						</ul>
						<p className="text-muted-foreground">
							To exercise these rights, please contact us at
							support@example.com. We will respond to your request within 30
							days.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							6. Cookies and Tracking Technologies
						</h2>
						<p className="mb-4 text-muted-foreground">
							We use cookies and similar tracking technologies to track activity
							on our Service and store certain information. You can instruct
							your browser to refuse all cookies or to indicate when a cookie is
							being sent. However, if you do not accept cookies, you may not be
							able to use some portions of our Service.
						</p>
						<p className="mb-4 text-muted-foreground">
							Types of cookies we use:
						</p>
						<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
							<li>
								<strong>Essential cookies:</strong> Required for the Service to
								function properly
							</li>
							<li>
								<strong>Analytics cookies:</strong> Help us understand how users
								interact with our Service
							</li>
							<li>
								<strong>Preference cookies:</strong> Remember your settings and
								preferences
							</li>
							<li>
								<strong>Marketing cookies:</strong> Used to deliver relevant
								advertisements
							</li>
						</ul>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							7. International Data Transfers
						</h2>
						<p className="text-muted-foreground">
							Your information may be transferred to and maintained on servers
							located outside of your jurisdiction. By using our Service, you
							consent to the transfer of your information to the United States
							and other countries where we operate.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">8. Data Retention</h2>
						<p className="text-muted-foreground">
							We retain your personal information for as long as necessary to
							provide our Service and fulfill the purposes described in this
							Privacy Policy. We may retain certain information for longer
							periods as required by law or for legitimate business purposes.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							9. Children's Privacy
						</h2>
						<p className="text-muted-foreground">
							Our Service is not directed to individuals under the age of 16. We
							do not knowingly collect personal information from children under
							16. If you become aware that a child has provided us with personal
							information, please contact us immediately.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							10. California Privacy Rights
						</h2>
						<p className="mb-4 text-muted-foreground">
							If you are a California resident, you have additional rights under
							the California Consumer Privacy Act (CCPA), including:
						</p>
						<ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
							<li>
								The right to know what personal information we collect, use, and
								share
							</li>
							<li>The right to delete your personal information</li>
							<li>
								The right to opt-out of the sale of personal information (we do
								not sell personal information)
							</li>
							<li>
								The right to non-discrimination for exercising your privacy
								rights
							</li>
						</ul>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							11. Updates to This Privacy Policy
						</h2>
						<p className="text-muted-foreground">
							We may update this Privacy Policy from time to time. The updated
							version will be indicated by an updated "Effective Date" and the
							updated version will be effective as soon as it is accessible. We
							encourage you to review this Privacy Policy frequently to stay
							informed about our information practices.
						</p>
					</section>

					<section className="border-t pt-10">
						<h2 className="text-2xl font-semibold mb-5">
							12. Contact Information
						</h2>
						<p className="mb-4 text-muted-foreground">
							If you have questions or concerns about this Privacy Policy or our
							privacy practices, please contact us at:
						</p>
						<div className="bg-muted/30 rounded-lg p-6">
							<p className="font-semibold mb-2">{appConfig.company}</p>
							<p className="text-muted-foreground">
								Email: support@example.com
							</p>
						</div>
					</section>
				</div>

				<footer className="mt-16 pt-8 border-t text-sm text-muted-foreground">
					<p>
						© {new Date().getFullYear()} {appConfig.company} All rights
						reserved.
					</p>
					<div className="flex gap-4 mt-2">
						<Link to="/tos" className="hover:text-foreground transition-colors">
							Terms of Service
						</Link>
						<Link to="/privacy" className="font-medium text-foreground">
							Privacy Policy
						</Link>
					</div>
				</footer>
			</div>
		</div>
	);
}
