import { redirect } from 'next/navigation';

// Legacy links return to the workspace, which resolves its available channel.
export default async function SearchPage({
  params,
}: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await params;

  redirect(
    `/${encodeURIComponent(locale)}/workspaces/${encodeURIComponent(workspaceId)}`
  );
}
