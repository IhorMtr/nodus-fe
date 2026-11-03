import { redirect } from 'next/navigation';

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
