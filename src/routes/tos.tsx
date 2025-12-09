import { appConfig } from "@/config/app";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tos")({
	component: TermsOfServicePage,
});

function TermsOfServicePage() {
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
						Terms of Service
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
							These Terms of Service ("Terms") govern your use of the{" "}
							{appConfig.name} platform and services (the "Service") operated by{" "}
							{appConfig.company} ("{appConfig.name}," "we," "us," or "our"). By
							accessing or using our Service, you agree to be bound by these
							Terms. If you disagree with any part of these Terms, then you may
							not access the Service.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">1. Definitions</h2>
						<p className="mb-4 text-muted-foreground">
							For the purposes of these Terms:
						</p>
						<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
							<li>
								<strong>"Account"</strong> means a unique account created for
								you to access our Service
							</li>
							<li>
								<strong>"Company"</strong> refers to {appConfig.company}
							</li>
							<li>
								<strong>"Content"</strong> refers to content such as text,
								images, or other information that can be posted, uploaded,
								linked to or otherwise made available via the Service
							</li>
							<li>
								<strong>"Service"</strong> refers to the website, application,
								and all related services provided by {appConfig.name}
							</li>
							<li>
								<strong>"User"</strong> refers to the individual accessing or
								using the Service
							</li>
						</ul>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">2. Account Terms</h2>

						<h3 className="text-lg font-medium mb-3">2.1 Account Creation</h3>
						<p className="mb-4 text-muted-foreground">
							When you create an account with us, you must provide information
							that is accurate, complete, and current at all times. You are
							responsible for safeguarding the password and for all activities
							that occur under your account.
						</p>

						<h3 className="text-lg font-medium mb-3">
							2.2 Account Requirements
						</h3>
						<p className="mb-4 text-muted-foreground">
							To create an account, you must:
						</p>
						<ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
							<li>Be at least 16 years of age</li>
							<li>Provide a valid email address</li>
							<li>
								Not have been previously suspended or removed from the Service
							</li>
							<li>
								Not create an account for anyone other than yourself without
								permission
							</li>
							<li>
								Not use a username that is offensive, vulgar, or infringes on
								someone's intellectual property
							</li>
						</ul>

						<h3 className="text-lg font-medium mb-3">
							2.3 Account Responsibilities
						</h3>
						<p className="text-muted-foreground">You agree to:</p>
						<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
							<li>
								Notify us immediately of any unauthorized use of your account
							</li>
							<li>Not share your account credentials with any third party</li>
							<li>
								Accept all responsibility for activity that occurs under your
								account
							</li>
							<li>Maintain the security and confidentiality of your account</li>
						</ul>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">3. Acceptable Use</h2>
						<p className="mb-4 text-muted-foreground">
							You may use our Service only for lawful purposes and in accordance
							with these Terms. You agree not to use the Service:
						</p>
						<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
							<li>
								In any way that violates any applicable federal, state, local,
								or international law or regulation
							</li>
							<li>
								To transmit any material that is defamatory, offensive, or
								otherwise objectionable
							</li>
							<li>
								To impersonate or attempt to impersonate the Company, another
								user, or any other person or entity
							</li>
							<li>
								To engage in any conduct that restricts or inhibits anyone's use
								or enjoyment of the Service
							</li>
							<li>
								To introduce any viruses, trojan horses, worms, logic bombs, or
								other malicious material
							</li>
							<li>
								To attempt to gain unauthorized access to any portion of the
								Service or any other systems
							</li>
							<li>
								To collect or track personal information of other users without
								their consent
							</li>
							<li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
							<li>For any obscene or immoral purpose</li>
							<li>
								To interfere with or circumvent the security features of the
								Service
							</li>
						</ul>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">4. User Content</h2>

						<h3 className="text-lg font-medium mb-3">4.1 Your Content</h3>
						<p className="mb-4 text-muted-foreground">
							Our Service allows you to post, link, store, share and otherwise
							make available certain information, text, graphics, or other
							material ("Content"). You are responsible for the Content that you
							post to the Service, including its legality, reliability, and
							appropriateness.
						</p>

						<h3 className="text-lg font-medium mb-3">4.2 Content Rights</h3>
						<p className="mb-4 text-muted-foreground">
							By posting Content to the Service, you grant us the right and
							license to use, modify, publicly perform, publicly display,
							reproduce, and distribute such Content on and through the Service.
							You retain any and all of your rights to any Content you submit,
							post or display on or through the Service and you are responsible
							for protecting those rights.
						</p>

						<h3 className="text-lg font-medium mb-3">
							4.3 Content Representations
						</h3>
						<p className="mb-4 text-muted-foreground">
							You represent and warrant that:
						</p>
						<ul className="list-disc pl-6 space-y-2 mb-6 text-muted-foreground">
							<li>The Content is yours or you have the right to use it</li>
							<li>
								Your use of the Content does not infringe upon the rights of any
								other person or entity
							</li>
							<li>The Content will not cause injury to any person or entity</li>
							<li>
								The Content does not contain any viruses or other harmful code
							</li>
						</ul>

						<h3 className="text-lg font-medium mb-3">4.4 Content Monitoring</h3>
						<p className="text-muted-foreground">
							We have the right but not the obligation to monitor and edit or
							remove any Content. We take no responsibility and assume no
							liability for any Content posted by you or any third party.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">5. Privacy Policy</h2>
						<p className="text-muted-foreground">
							Your use of our Service is also governed by our Privacy Policy.
							Please review our Privacy Policy, which also governs your visit to
							our Service and informs you of our data collection practices.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							6. Intellectual Property Rights
						</h2>

						<h3 className="text-lg font-medium mb-3">6.1 Service Content</h3>
						<p className="mb-4 text-muted-foreground">
							The Service and its original content (excluding Content provided
							by users), features, and functionality are and will remain the
							exclusive property of {appConfig.name} and its licensors. The
							Service is protected by copyright, trademark, and other laws of
							both the United States and foreign countries. Our trademarks and
							trade dress may not be used in connection with any product or
							service without our prior written consent.
						</p>

						<h3 className="text-lg font-medium mb-3">6.2 Feedback</h3>
						<p className="text-muted-foreground">
							If you provide us with any feedback or suggestions regarding the
							Service ("Feedback"), you hereby assign to us all rights in such
							Feedback and agree that we shall have the right to use and
							implement such Feedback in any manner we choose without any
							obligation to you.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">7. Termination</h2>

						<h3 className="text-lg font-medium mb-3">7.1 Termination by You</h3>
						<p className="mb-4 text-muted-foreground">
							You may terminate your account at any time by contacting us at
							support@example.com. Upon termination, your right to use the
							Service will immediately cease.
						</p>

						<h3 className="text-lg font-medium mb-3">7.2 Termination by Us</h3>
						<p className="mb-4 text-muted-foreground">
							We may terminate or suspend your account and bar access to the
							Service immediately, without prior notice or liability, for any
							reason whatsoever, including without limitation if you breach the
							Terms.
						</p>

						<h3 className="text-lg font-medium mb-3">
							7.3 Effect of Termination
						</h3>
						<p className="text-muted-foreground">
							Upon termination, your right to use the Service will cease
							immediately. All provisions of the Terms which by their nature
							should survive termination shall survive termination, including
							ownership provisions, warranty disclaimers, indemnity, and
							limitations of liability.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							8. Disclaimers and Limitations
						</h2>

						<h3 className="text-lg font-medium mb-3">
							8.1 Disclaimer of Warranties
						</h3>
						<p className="mb-4 text-muted-foreground font-medium">
							THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS
							WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
							NEITHER THE COMPANY NOR ANY PERSON ASSOCIATED WITH THE COMPANY
							MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE
							COMPLETENESS, SECURITY, RELIABILITY, QUALITY, ACCURACY, OR
							AVAILABILITY OF THE SERVICE.
						</p>

						<h3 className="text-lg font-medium mb-3">
							8.2 Limitation of Liability
						</h3>
						<p className="mb-4 text-muted-foreground font-medium">
							IN NO EVENT SHALL THE COMPANY, ITS DIRECTORS, EMPLOYEES, PARTNERS,
							AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT,
							INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
							WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
							INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
						</p>

						<h3 className="text-lg font-medium mb-3">
							8.3 Limitation of Damages
						</h3>
						<p className="text-muted-foreground">
							In no event shall our total liability to you for all damages,
							losses, and causes of action exceed the amount paid by you, if
							any, for accessing or using the Service during the twelve (12)
							months preceding the claim.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">9. Indemnification</h2>
						<p className="text-muted-foreground">
							You agree to defend, indemnify, and hold harmless the Company and
							its licensees, licensors, employees, contractors, agents, officers
							and directors, from and against any and all claims, damages,
							obligations, losses, liabilities, costs or debt, and expenses
							(including but not limited to attorney's fees), resulting from or
							arising out of: (a) your use and access of the Service; (b) your
							violation of any term of these Terms; (c) your violation of any
							third party right, including without limitation any copyright,
							property, or privacy right; or (d) any claim that your Content
							caused damage to a third party.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							10. Governing Law and Dispute Resolution
						</h2>

						<h3 className="text-lg font-medium mb-3">10.1 Governing Law</h3>
						<p className="mb-4 text-muted-foreground">
							These Terms shall be governed and construed in accordance with the
							laws of Delaware, United States, without regard to its conflict of
							law provisions. Our failure to enforce any right or provision of
							these Terms will not be considered a waiver of those rights.
						</p>

						<h3 className="text-lg font-medium mb-3">10.2 Arbitration</h3>
						<p className="mb-4 text-muted-foreground">
							Any dispute arising from these Terms shall be resolved through
							binding arbitration in accordance with the Commercial Arbitration
							Rules of the American Arbitration Association. The arbitration
							shall be conducted in Delaware, and judgment on the arbitration
							award may be entered into any court having jurisdiction thereof.
						</p>

						<h3 className="text-lg font-medium mb-3">
							10.3 Class Action Waiver
						</h3>
						<p className="text-muted-foreground">
							You agree that any dispute resolution proceedings will be
							conducted only on an individual basis and not in a class,
							consolidated, or representative action.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							11. General Provisions
						</h2>

						<h3 className="text-lg font-medium mb-3">11.1 Entire Agreement</h3>
						<p className="mb-4 text-muted-foreground">
							These Terms constitute the entire agreement between us regarding
							our Service, and supersede and replace any prior agreements we
							might have had between us regarding the Service.
						</p>

						<h3 className="text-lg font-medium mb-3">11.2 Changes to Terms</h3>
						<p className="mb-4 text-muted-foreground">
							We reserve the right, at our sole discretion, to modify or replace
							these Terms at any time. If a revision is material, we will
							provide at least 30 days' notice prior to any new terms taking
							effect.
						</p>

						<h3 className="text-lg font-medium mb-3">11.3 Severability</h3>
						<p className="mb-4 text-muted-foreground">
							If any provision of these Terms is held to be invalid or
							unenforceable by a court, the remaining provisions of these Terms
							will remain in effect.
						</p>

						<h3 className="text-lg font-medium mb-3">11.4 Waiver</h3>
						<p className="mb-4 text-muted-foreground">
							No waiver of any term of these Terms shall be deemed a further or
							continuing waiver of such term or any other term, and our failure
							to assert any right or provision under these Terms shall not
							constitute a waiver of such right or provision.
						</p>

						<h3 className="text-lg font-medium mb-3">11.5 Assignment</h3>
						<p className="text-muted-foreground">
							You may not assign or transfer these Terms, by operation of law or
							otherwise, without our prior written consent. Any attempt by you
							to assign or transfer these Terms without such consent will be
							null and void. We may freely assign or transfer these Terms
							without restriction.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							12. Electronic Communications
						</h2>
						<p className="text-muted-foreground">
							By using the Service, you consent to receiving electronic
							communications from us. These electronic communications may
							include notices about your account and information concerning or
							related to the Service. You agree that any notices, agreements,
							disclosures, or other communications that we send to you
							electronically will satisfy any legal communication requirements,
							including that such communications be in writing.
						</p>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-semibold mb-5">
							13. Export Compliance
						</h2>
						<p className="text-muted-foreground">
							You may not use, export, or re-export the Service or any portion
							thereof in violation of U.S. export laws and regulations. By using
							the Service, you represent that you are not located in a country
							subject to a U.S. Government embargo or designated as a "terrorist
							supporting" country, and you are not listed on any U.S. Government
							list of prohibited or restricted parties.
						</p>
					</section>

					<section className="border-t pt-10">
						<h2 className="text-2xl font-semibold mb-5">
							14. Contact Information
						</h2>
						<p className="mb-4 text-muted-foreground">
							If you have any questions about these Terms of Service, please
							contact us at:
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
						<Link to="/tos" className="font-medium text-foreground">
							Terms of Service
						</Link>
						<Link
							to="/privacy"
							className="hover:text-foreground transition-colors"
						>
							Privacy Policy
						</Link>
					</div>
				</footer>
			</div>
		</div>
	);
}
