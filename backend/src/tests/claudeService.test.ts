import { describe, it, expect, vi } from 'vitest';
import { evaluateTriage } from '../services/claudeService';

describe('evaluateTriage', () => {
  it('should evaluate "blood" as CRITICAL severity', async () => {
    // Override env variable to trigger mock path
    process.env.ANTHROPIC_API_KEY = 'mock_key';
    
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
    process.env.ANTHROPIC_API_KEY = 'mock_key';
    
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
    process.env.ANTHROPIC_API_KEY = 'mock_key';
    
    const result = await evaluateTriage({
      description: 'help',
      medicalProfile: {},
      hasImage: false
    });

    expect(result.confidenceScore).toBe(0.5);
  });
});
