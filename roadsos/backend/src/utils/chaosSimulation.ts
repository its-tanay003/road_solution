export class ChaosSimulation {
  private static IS_ENABLED = process.env.NODE_ENV === 'development';
  private static FAIL_MODES = {
    DATABASE_DELAY: false,
    API_OUTAGE: false,
    SOCKET_FLOOD: false,
  };

  static async injectFailure(mode: keyof typeof ChaosSimulation.FAIL_MODES) {
    if (!this.IS_ENABLED || !this.FAIL_MODES[mode]) return;

    console.warn(`[CHAOS] Injecting failure mode: ${mode}`);

    switch (mode) {
      case 'DATABASE_DELAY':
        // Simulate high latency (5-10s)
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 5000));
        break;
      case 'API_OUTAGE':
        // Force an error
        throw new Error('SIMULATED_SYSTEM_OUTAGE');
      case 'SOCKET_FLOOD':
        // In reality, this would be complex to simulate here, but we can log it
        console.warn('[CHAOS] Simulating socket traffic spike...');
        break;
    }
  }

  static toggleMode(mode: keyof typeof ChaosSimulation.FAIL_MODES, active: boolean) {
    this.FAIL_MODES[mode] = active;
    console.log(`[CHAOS] ${mode} is now ${active ? 'ACTIVE' : 'INACTIVE'}`);
  }
}
