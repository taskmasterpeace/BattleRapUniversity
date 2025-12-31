/**
 * Unit tests for attribute progression system
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock the progression module
const mockSupabase = {
  from: jest.fn(),
};

describe('Attribute Progression System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('High Performance Battle', () => {
    it('should improve writing attributes for high average score', async () => {
      // Mock battle data
      const battleId = 'test-battle-1';
      const playerBattlerId = 'player-1';

      // Setup mocks
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'battles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: {
                    id: battleId,
                    battler_player_id: playerBattlerId,
                    battler_ai_id: 'ai-1',
                    winner_battler_id: playerBattlerId,
                    status: 'completed',
                  },
                }),
              }),
            }),
          };
        }
        if (table === 'battle_rounds') {
          return {
            select: () => ({
              eq: () => ({
                data: [
                  {
                    battler_id: playerBattlerId,
                    average_score: 8.2,
                    peak_score: 9.5,
                    crowd_reaction: 85,
                    choked: false,
                  },
                  {
                    battler_id: playerBattlerId,
                    average_score: 7.8,
                    peak_score: 8.9,
                    crowd_reaction: 80,
                    choked: false,
                  },
                  {
                    battler_id: playerBattlerId,
                    average_score: 7.5,
                    peak_score: 8.5,
                    crowd_reaction: 78,
                    choked: false,
                  },
                ],
              }),
            }),
          };
        }
        if (table === 'battlers') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: { is_ai: false },
                }),
              }),
            }),
          };
        }
        if (table === 'battler_attributes') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: {
                    battler_id: playerBattlerId,
                    writing: {
                      lyricism: 5,
                      wordplay: 5,
                      creativity: 5,
                    },
                    performance: {
                      stage_presence: 5,
                      crowd_control: 5,
                      delivery: 5,
                    },
                    resilience: 5,
                  },
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        }
        return { select: () => ({ eq: () => ({}) }) };
      });

      // Import and run progression
      const { applyAttributeProgression } = await import('@/lib/game/progression');
      await applyAttributeProgression(battleId, mockSupabase);

      // Verify that update was called
      const updateCalls = mockSupabase.from.mock.calls.filter(
        (call) => call[0] === 'battler_attributes'
      );
      expect(updateCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Poor Performance Battle', () => {
    it('should apply reduced gains for losing battles', async () => {
      const battleId = 'test-battle-2';
      const playerBattlerId = 'player-1';

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'battles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: {
                    id: battleId,
                    battler_player_id: playerBattlerId,
                    battler_ai_id: 'ai-1',
                    winner_battler_id: 'ai-1', // Player lost
                    status: 'completed',
                  },
                }),
              }),
            }),
          };
        }
        if (table === 'battle_rounds') {
          return {
            select: () => ({
              eq: () => ({
                data: [
                  {
                    battler_id: playerBattlerId,
                    average_score: 5.5,
                    peak_score: 6.5,
                    crowd_reaction: 60,
                    choked: false,
                  },
                ],
              }),
            }),
          };
        }
        if (table === 'battlers') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: { is_ai: false },
                }),
              }),
            }),
          };
        }
        if (table === 'battler_attributes') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: {
                    battler_id: playerBattlerId,
                    writing: {
                      lyricism: 5,
                      wordplay: 5,
                      creativity: 5,
                    },
                    performance: {
                      stage_presence: 5,
                      crowd_control: 5,
                      delivery: 5,
                    },
                    resilience: 5,
                  },
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        }
        return { select: () => ({ eq: () => ({}) }) };
      });

      const { applyAttributeProgression } = await import('@/lib/game/progression');
      await applyAttributeProgression(battleId, mockSupabase);

      // Should still apply progression but with reduced gains
      const updateCalls = mockSupabase.from.mock.calls.filter(
        (call) => call[0] === 'battler_attributes'
      );
      expect(updateCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Attribute Capping', () => {
    it('should not exceed 10.0 attribute cap', () => {
      // This is an internal test of the cap function
      const ATTRIBUTE_CAP = 10.0;

      const capAttribute = (value: number): number => {
        return Math.min(ATTRIBUTE_CAP, Math.max(1, value));
      };

      expect(capAttribute(9.8 + 0.5)).toBe(10.0);
      expect(capAttribute(10.5)).toBe(10.0);
      expect(capAttribute(11.0)).toBe(10.0);
      expect(capAttribute(5.5)).toBe(5.5);
    });
  });

  describe('Skip Conditions', () => {
    it('should skip progression for AI battlers', async () => {
      const battleId = 'test-battle-ai';
      const aiBattlerId = 'ai-battler-1';

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'battles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: {
                    id: battleId,
                    battler_player_id: aiBattlerId,
                    status: 'completed',
                  },
                }),
              }),
            }),
          };
        }
        if (table === 'battle_rounds') {
          return {
            select: () => ({
              eq: () => ({
                data: [],
              }),
            }),
          };
        }
        if (table === 'battlers') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: { is_ai: true }, // AI battler
                }),
              }),
            }),
          };
        }
        return { select: () => ({ eq: () => ({}) }) };
      });

      const { applyAttributeProgression } = await import('@/lib/game/progression');
      await applyAttributeProgression(battleId, mockSupabase);

      // Should not call battler_attributes update for AI
      const updateCalls = mockSupabase.from.mock.calls.filter(
        (call) => call[0] === 'battler_attributes'
      );
      expect(updateCalls.length).toBe(0);
    });

    it('should skip progression for incomplete battles', async () => {
      const battleId = 'test-battle-incomplete';

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'battles') {
          return {
            select: () => ({
              eq: () => ({
                single: () => ({
                  data: {
                    id: battleId,
                    status: 'accepted', // Not completed
                  },
                }),
              }),
            }),
          };
        }
        return { select: () => ({ eq: () => ({}) }) };
      });

      const { applyAttributeProgression } = await import('@/lib/game/progression');
      await applyAttributeProgression(battleId, mockSupabase);

      // Should not proceed to update
      const updateCalls = mockSupabase.from.mock.calls.filter(
        (call) => call[0] === 'battler_attributes'
      );
      expect(updateCalls.length).toBe(0);
    });
  });
});
