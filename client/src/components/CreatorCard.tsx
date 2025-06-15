import React, { useState } from 'react';
import { Heart, Send, User, TrendingUp } from 'lucide-react';
import { Creator, WalletState } from '../types';
import TipModal from './TipModal';

interface CreatorCardProps {
  creator: Creator;
  walletState: WalletState;
  onTipSent: () => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, walletState, onTipSent }) => {
  const [showTipModal, setShowTipModal] = useState(false);

  const formatTips = (tips: string): string => {
    const num = parseFloat(tips);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  const handleTipClick = () => {
    if (!walletState.isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    setShowTipModal(true);
  };

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-16 h-16 rounded-full bg-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name}`;
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {creator.name}
              </h3>
              <User className="w-4 h-4 text-gray-400" />
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {creator.description}
            </p>

            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  {formatTips(creator.totalTips)} SHM
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">
                  {creator.tipCount} tips
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Wallet Address:</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                {creator.address}
              </code>
            </div>

            <button
              onClick={handleTipClick}
              disabled={!walletState.isConnected}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Tip</span>
            </button>
          </div>
        </div>
      </div>

      {showTipModal && (
        <TipModal
          creator={creator}
          walletState={walletState}
          onClose={() => setShowTipModal(false)}
          onTipSent={() => {
            setShowTipModal(false);
            onTipSent();
          }}
        />
      )}
    </>
  );
};

export default CreatorCard; 