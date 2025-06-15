import React, { useState } from 'react';
import { X, Send, Loader, AlertCircle } from 'lucide-react';
import { Creator, WalletState } from '../types';
import web3Service from '../services/web3Service';
import apiService from '../services/apiService';

interface TipModalProps {
  creator: Creator;
  walletState: WalletState;
  onClose: () => void;
  onTipSent: () => void;
}

const TipModal: React.FC<TipModalProps> = ({ creator, walletState, onClose, onTipSent }) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const predefinedAmounts = ['0.1', '0.5', '1', '5'];

  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
  };

  const validateForm = (): boolean => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (parseFloat(amount) > parseFloat(walletState.balance)) {
      setError('Insufficient balance');
      return false;
    }

    if (!web3Service.isValidAddress(creator.address)) {
      setError('Invalid creator address');
      return false;
    }

    return true;
  };

  const handleSendTip = async () => {
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Send the tip transaction
      const txHash = await web3Service.sendTip(creator.address, amount);
      setTxHash(txHash);

      // Record the tip in the backend
      await apiService.recordTip({
        fromAddress: walletState.address!,
        toAddress: creator.address,
        amount,
        txHash,
        creatorId: creator.id,
      });

      // Success - call the callback
      onTipSent();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Send Tip</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Creator Info */}
          <div className="flex items-center space-x-3 mb-6">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold">{creator.name}</h3>
              <p className="text-sm text-gray-600">
                {web3Service.formatAddress(creator.address)}
              </p>
            </div>
          </div>

          {/* Balance Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Your Balance:</span>
              <span className="font-semibold">
                {formatBalance(walletState.balance)} SHM
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tip Amount (SHM)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              min="0"
              step="0.001"
              className="input-field"
              disabled={isLoading}
            />
            
            {/* Predefined Amounts */}
            <div className="flex space-x-2 mt-3">
              {predefinedAmounts.map((preAmount) => (
                <button
                  key={preAmount}
                  onClick={() => handleAmountSelect(preAmount)}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {preAmount} SHM
                </button>
              ))}
            </div>

            {/* MetaMask Warning */}
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ <strong>MetaMask Display Issue:</strong> MetaMask may show an incorrect amount in the transaction popup. 
                  The actual amount being sent is <strong>{amount} SHM</strong> as shown here.
                </p>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Leave a message for the creator..."
              rows={3}
              className="input-field resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Success Display */}
          {txHash && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm mb-2">
                Tip sent successfully! 🎉
              </p>
              <p className="text-xs text-gray-600">
                Transaction Hash: {web3Service.formatAddress(txHash)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary flex-1 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSendTip}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Tip</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipModal; 