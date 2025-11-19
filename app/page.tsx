import { Button } from "@whop/react/components";
import Link from "next/link";

export default function Page() {
	return (
		<div className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg-app)] min-h-screen">
			<div className="max-w-2xl mx-auto rounded-3xl bg-[var(--bg-surface)] p-4 border border-[var(--border-subtle)]">
				<div className="text-center mt-8 mb-12">
					<h1 className="text-8 font-bold text-[var(--text-primary)] mb-4">
						Welcome to Your Whop App
					</h1>
					<p className="text-4 text-[var(--text-secondary)]">
						Learn how to build your application on our docs
					</p>
				</div>

				<div className="justify-center flex w-full">
					<Link
						href="https://docs.whop.com/apps"
						className="w-full"
						target="_blank"
					>
						<Button variant="classic" className="w-full !bg-[var(--accent-primary)] !text-[var(--accent-on-primary)]" size="4">
							Developer Docs
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
