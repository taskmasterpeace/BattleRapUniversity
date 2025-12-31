/**
 * Spend Skill Points API
 *
 * POST /api/battler/spend-skill-points
 *
 * Allows players to spend skill points earned from leveling up to boost attributes.
 * Each skill point = +0.1 to an attribute (max 10 points per attribute = +1.0).
 *
 * Request Body:
 * {
 *   "attributeName": "lyricism" | "wordplay" | "creativity" | "stage_presence" | "crowd_control" | "delivery" | "resilience",
 *   "pointsToSpend": 1 (only 1 point at a time)
 * }
 *
 * Returns:
 * {
 *   "success": true,
 *   "newAttributeValue": 7.3,
 *   "skillPointsRemaining": 4,
 *   "totalSpentOnAttribute": 3
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/server';
import {
  validateSkillPointSpend,
  calculateSkillPointBoost,
} from '@/lib/game/xpLevels';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { attributeName, pointsToSpend } = body;

    if (!attributeName || pointsToSpend !== 1) {
      return NextResponse.json(
        { error: 'Must spend exactly 1 skill point at a time' },
        { status: 400 }
      );
    }

    // 3. Load player's battler
    const { data: battler } = await supabase
      .from('battlers')
      .select('id, skill_points_available, skill_points_spent')
      .eq('user_id', user.id)
      .eq('is_ai', false)
      .single();

    if (!battler) {
      return NextResponse.json({ error: 'Battler not found' }, { status: 404 });
    }

    // 4. Validate skill point spend
    const currentSpent = battler.skill_points_spent || {};
    const validation = validateSkillPointSpend(
      attributeName,
      currentSpent,
      battler.skill_points_available
    );

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 5. Load current attributes
    const { data: attributes } = await supabase
      .from('battler_attributes')
      .select('*')
      .eq('battler_id', battler.id)
      .single();

    if (!attributes) {
      return NextResponse.json({ error: 'Attributes not found' }, { status: 404 });
    }

    // 6. Calculate new attribute value
    const attributeMapping: Record<string, { category: string; key: string }> = {
      lyricism: { category: 'writing', key: 'lyricism' },
      wordplay: { category: 'writing', key: 'wordplay' },
      creativity: { category: 'writing', key: 'creativity' },
      stage_presence: { category: 'performance', key: 'stage_presence' },
      crowd_control: { category: 'performance', key: 'crowd_control' },
      delivery: { category: 'performance', key: 'delivery' },
      resilience: { category: 'resilience', key: 'resilience' },
    };

    const mapping = attributeMapping[attributeName];
    if (!mapping) {
      return NextResponse.json({ error: 'Invalid attribute name' }, { status: 400 });
    }

    // Get current attribute value (handle resilience as top-level vs nested)
    let currentValue: number;
    if (mapping.category === 'resilience') {
      currentValue = attributes.resilience;
    } else {
      currentValue = attributes[mapping.category][mapping.key];
    }

    // Calculate boost (0.1 per skill point)
    const newSpentOnAttribute = (currentSpent[attributeName] || 0) + 1;
    const totalBoost = calculateSkillPointBoost(newSpentOnAttribute);
    const baseValue = currentValue - calculateSkillPointBoost(currentSpent[attributeName] || 0);
    const newAttributeValue = Math.min(10.0, baseValue + totalBoost);

    // 7. Update database (skill points and attributes)
    const newSkillPointsSpent = {
      ...currentSpent,
      [attributeName]: newSpentOnAttribute,
    };

    const newSkillPointsAvailable = battler.skill_points_available - 1;

    // Update battler skill points
    await supabase
      .from('battlers')
      .update({
        skill_points_available: newSkillPointsAvailable,
        skill_points_spent: newSkillPointsSpent,
      })
      .eq('id', battler.id);

    // Update attribute value
    let attributeUpdate: any = {
      updated_at: new Date().toISOString(),
    };

    if (mapping.category === 'resilience') {
      attributeUpdate.resilience = newAttributeValue;
    } else {
      // Update nested attribute (writing/performance)
      const categoryData = { ...attributes[mapping.category] };
      categoryData[mapping.key] = newAttributeValue;
      attributeUpdate[mapping.category] = categoryData;
    }

    await supabase
      .from('battler_attributes')
      .update(attributeUpdate)
      .eq('battler_id', battler.id);

    // 8. Return success
    return NextResponse.json({
      success: true,
      newAttributeValue,
      skillPointsRemaining: newSkillPointsAvailable,
      totalSpentOnAttribute: newSpentOnAttribute,
      attributeName,
    });
  } catch (error: any) {
    console.error('Error spending skill points:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to spend skill points' },
      { status: 500 }
    );
  }
}
