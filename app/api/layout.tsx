// Force all API routes to use Node.js runtime for Prisma compatibility
export const runtime = 'nodejs';

export default function ApiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
