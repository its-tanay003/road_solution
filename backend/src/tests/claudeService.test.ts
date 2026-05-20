import { describe, it, expect, vi } from 'vitest';
import { evaluateTriage } from '../services/claudeService';
import { claudeChat } from '../lib/claude';

// Mock the Claude module
vi.mock('../lib/claude', () => ({
  anthropic: {},
  claudeChat: vi.fn(),
  claudeStream: vi.fn(),
}));

describe('evaluateTriage', () => {
  it('should evaluate "blood" as CRITICAL severity', async () => {
    vi.mocked(claudeChat).mockResolvedValue(JSON.stringify({
      severity: 'CRITICAL',
      injuryType: 'Trauma/Bleeding',
      recommendedActions: ['Apply pressure to wound', 'Keep victim warm'],
      requiredServices: ['ambulance', 'police'],
      confidenceScore: 0.95
    }));
    
    const result = await evaluateTriage({
      description: 'The victim is unconscious and there is a lot of blood.',
      medicalProfile: {},
      hasImage: false
    });

    expect(result.severity).toBe('CRITICAL');
    expect(result.requiredServices).toContain('ambulance');
    expect(result.requiredServices).toContain('police');
  });

  it('should evaluate "scratch" as LOW severity', async () => {
    vi.mocked(claudeChat).mockResolvedValue(JSON.stringify({
      severity: 'LOW',
      injuryType: 'Minor scratch',
      recommendedActions: ['No immediate action required'],
      requiredServices: [],
      confidenceScore: 0.95
    }));
    
    const result = await evaluateTriage({
      description: 'It is just a minor scratch on the bumper.',
      medicalProfile: {},
      hasImage: false
    });

    expect(result.severity).toBe('LOW');
    expect(result.requiredServices.length).toBe(0);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.9);
  });

  it('should lower confidence if description is too short and no image', async () => {
    vi.mocked(claudeChat).mockResolvedValue(JSON.stringify({
      severity: 'MODERATE',
      injuryType: 'Unspecified emergency',
      recommendedActions: ['Wait for professional help'],
      requiredServices: ['ambulance'],
      confidenceScore: 0.5
    }));
    
    const result = await evaluateTriage({
      description: 'help',
      medicalProfile: {},
      hasImage: false
    });

    expect(result.confidenceScore).toBe(0.5);
  });
});
