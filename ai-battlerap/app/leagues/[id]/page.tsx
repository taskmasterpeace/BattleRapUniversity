import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LeagueDetailRedirect({ params }: Props) {
  const { id } = await params;
  // For now the canonical league detail surface is the throne system page.
  redirect(`/leagues/${id}/thrones`);
}
