/**
 * Tournament History Page
 * Shows player's tournament participation, results, and achievements
 */

import { Metadata } from 'next';
import TournamentHistoryClient from './TournamentHistoryClient';

export const metadata: Metadata = {
  title: 'Tournament History | Battle Rap University',
  description: 'View your tournament history and achievements',
};

export default function TournamentHistoryPage() {
  return <TournamentHistoryClient />;
}
