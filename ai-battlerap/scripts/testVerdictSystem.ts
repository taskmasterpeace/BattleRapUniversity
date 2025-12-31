#!/usr/bin/env tsx
/**
 * Quick test to validate verdict system is working
 */

import { createClient } from '@supabase/supabase-js';
import { simulateBattle } from '../lib/game/simulation';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testVerdictSystem() {
  console.log('🧪 Testing Verdict System\n');

  // Find or create a locked battle
  let { data: battle } = await supabase
    .from('battles')
    .select('*')
    .eq('status', 'locked')
    .limit(1)
    .single();

  if (!battle) {
    console.log('No locked battles found. Checking for accepted battles...');
    const { data: acceptedBattle } = await supabase
      .from('battles')
      .select('*')
      .eq('status', 'accepted')
      .limit(1)
      .single();

    if (acceptedBattle) {
      // Lock it
      await supabase
        .from('battles')
        .update({ status: 'locked', lock_prep_at: new Date().toISOString() })
        .eq('id', acceptedBattle.id);
      battle = { ...acceptedBattle, status: 'locked' };
      console.log('Locked battle:', battle.id);
    } else {
      console.log('❌ No battles available to test. Please create a battle first.');
      process.exit(1);
    }
  }

  console.log('Simulating battle:', battle.id);
  console.log('---');

  // Simulate the battle
  await simulateBattle(battle.id, supabase);

  console.log('---');

  // Check the verdict was saved
  const { data: completedBattle, error } = await supabase
    .from('battles')
    .select('id, status, verdict, decision_type, winner_battler_id')
    .eq('id', battle.id)
    .single();

  if (error) {
    console.error('❌ Error fetching battle:', error);
    process.exit(1);
  }

  console.log('\n✅ Battle completed successfully!');
  console.log('Battle ID:', completedBattle.id);
  console.log('Status:', completedBattle.status);
  console.log('Verdict:', completedBattle.verdict);
  console.log('Decision Type:', completedBattle.decision_type);
  console.log('Winner ID:', completedBattle.winner_battler_id);

  if (!completedBattle.verdict || !completedBattle.decision_type) {
    console.error('\n❌ FAILED: Verdict or decision_type was not saved!');
    process.exit(1);
  }

  console.log('\n✅ PASSED: Verdict system is working correctly!');
}

testVerdictSystem().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
