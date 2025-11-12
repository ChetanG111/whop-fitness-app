import { Button } from "@whop/react/components";
import { headers } from "next/headers";
import Link from "next/link";
import { whopsdk } from "@/lib/whop-sdk";

export default function Page({ params }: { params: { companyId: string } }) {
	// Removed rendering of user lists, access data, and private details.
	return (
		<main style={{ padding: 24 }}>
			<h1>Dashboard</h1>
			<p>Private member and access details have been removed from this view.</p>
		</main>
	);
}

function JsonViewer({ data }: { data: any }) {
	return (
		<pre className="text-2 border border-gray-a4 rounded-lg p-4 bg-gray-a2 max-h-72 overflow-y-auto">
			<code className="text-gray-10">{JSON.stringify(data, null, 2)}</code>
		</pre>
	);
}
