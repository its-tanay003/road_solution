import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Block {
  index: number;
  timestamp: number;
  incidentId: string;
  action: string;
  actorId: string;
  data: any;
  previousHash: string;
  hash: string;
}

interface BlockchainState {
  chain: Block[];
  isChainValid: boolean;
  
  // Actions
  addBlock: (incidentId: string, action: string, actorId: string, data: any) => Promise<void>;
  validateChain: () => Promise<boolean>;
  tamperBlock: (index: number, newData: any) => void;
  resetChain: () => void;
}

// Utility for hashing
const computeHash = async (block: Omit<Block, 'hash'>): Promise<string> => {
  const msg = `${block.index}${block.timestamp}${block.incidentId}${block.action}${block.actorId}${JSON.stringify(block.data)}${block.previousHash}`;
  const msgBuffer = new TextEncoder().encode(msg);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const useBlockchainStore = create<BlockchainState>()(
  persist(
    (set, get) => ({
      chain: [],
      isChainValid: true,

      addBlock: async (incidentId, action, actorId, data) => {
        const { chain } = get();
        const previousBlock = chain[chain.length - 1];
        const index = chain.length;
        const timestamp = Date.now();
        const previousHash = previousBlock ? previousBlock.hash : 'GENESIS_BLOCK';
        
        const newBlockBase = {
          index,
          timestamp,
          incidentId,
          action,
          actorId,
          data,
          previousHash
        };
        
        const hash = await computeHash(newBlockBase);
        const newBlock = { ...newBlockBase, hash };
        
        set((state) => ({
          chain: [...state.chain, newBlock],
          isChainValid: true // Adding a valid block usually keeps it valid unless already broken
        }));
      },

      validateChain: async () => {
        const { chain } = get();
        if (chain.length === 0) return true;

        for (let i = 0; i < chain.length; i++) {
          const currentBlock = chain[i];
          const previousHashExpected = i === 0 ? 'GENESIS_BLOCK' : chain[i - 1].hash;
          
          if (currentBlock.previousHash !== previousHashExpected) {
            set({ isChainValid: false });
            return false;
          }
          
          const actualHash = await computeHash({
            index: currentBlock.index,
            timestamp: currentBlock.timestamp,
            incidentId: currentBlock.incidentId,
            action: currentBlock.action,
            actorId: currentBlock.actorId,
            data: currentBlock.data,
            previousHash: currentBlock.previousHash
          });
          
          if (currentBlock.hash !== actualHash) {
            set({ isChainValid: false });
            return false;
          }
        }
        
        set({ isChainValid: true });
        return true;
      },

      tamperBlock: (index, newData) => {
        set((state) => ({
          chain: state.chain.map((b, i) => i === index ? { ...b, data: newData } : b),
          isChainValid: false
        }));
      },

      resetChain: () => {
        set({ chain: [], isChainValid: true });
      }
    }),
    {
      name: 'roadsos-blockchain-audit'
    }
  )
);
