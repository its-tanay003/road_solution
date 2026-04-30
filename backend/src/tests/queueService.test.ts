import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enqueueSos } from '../services/queueService';
import { pool } from '../db/connection';
import { broadcastToResponders } from '../services/socketService';

// Mock dependencies
vi.mock('../db/connection', () => ({
  pool: {
    connect: vi.fn(),
  }
}));

vi.mock('../services/socketService', () => ({
  broadcastToResponders: vi.fn(),
}));

describe('queueService', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    (pool.connect as any).mockResolvedValue(mockClient);
    vi.clearAllMocks();
  });

  it('should enqueue SOS to INTERNET, SMS, and MESH channels', async () => {
    (broadcastToResponders as any).mockReturnValue(true);

    const payload = { test: 'data' };
    await enqueueSos('sos-123', payload);

    expect(pool.connect).toHaveBeenCalled();
    expect(broadcastToResponders).toHaveBeenCalledWith('sos_alert', payload);
    
    expect(mockClient.query).toHaveBeenCalledTimes(3);
    
    // First query should be INTERNET with DELIVERED status (since mock returns true)
    expect(mockClient.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO sos_dispatch_queue'),
      ['sos-123', 'INTERNET', 'DELIVERED', payload]
    );

    // Second query should be SMS with PENDING status
    expect(mockClient.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO sos_dispatch_queue'),
      ['sos-123', 'SMS', 'PENDING', payload]
    );

    // Third query should be MESH with PENDING status
    expect(mockClient.query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('INSERT INTO sos_dispatch_queue'),
      ['sos-123', 'MESH', 'PENDING', payload]
    );

    expect(mockClient.release).toHaveBeenCalled();
  });

  it('should enqueue INTERNET as PENDING if broadcast fails', async () => {
    (broadcastToResponders as any).mockReturnValue(false);

    const payload = { test: 'data' };
    await enqueueSos('sos-456', payload);

    // First query should be INTERNET with PENDING status (since mock returns false)
    expect(mockClient.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO sos_dispatch_queue'),
      ['sos-456', 'INTERNET', 'PENDING', payload]
    );
  });
});
