import React from 'react';
import { cn } from '@/lib/utils';
import { CHAINS } from '@/lib/constants';

interface ChainFilterProps {
  selectedChains: string[];
  onChainToggle: (chainId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

const ChainFilter: React.FC<ChainFilterProps> = ({
  selectedChains,
  onChainToggle,
  onSelectAll,
  onClearAll,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={onSelectAll}
        className={cn(
          'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
          selectedChains.length === CHAINS.length
            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
            : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/30'
        )}
      >
        All Chains
      </button>
      
      {CHAINS.map((chain) => (
        <button
          key={chain.id}
          onClick={() => onChainToggle(chain.id)}
          className={cn(
            'flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
            selectedChains.includes(chain.id)
              ? 'bg-white/10 border-white/30 text-white'
              : 'bg-white/5 border-white/10 text-gray-600 hover:text-gray-400 hover:border-white/20'
          )}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: chain.color }}
          />
          {chain.name}
        </button>
      ))}
      
      {selectedChains.length > 0 && selectedChains.length < CHAINS.length && (
        <button
          onClick={onClearAll}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default ChainFilter;
