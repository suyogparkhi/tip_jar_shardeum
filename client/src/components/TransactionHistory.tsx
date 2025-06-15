import React, { useState, useEffect } from 'react';
import { Clock, ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { Transaction, WalletState } from '../types';
import apiService from '../services/apiService';
import web3Service from '../services/web3Service';

interface TransactionHistoryProps {
  walletState: WalletState;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ walletState }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletState.isConnected && walletState.address) {
      fetchTransactions();
    }
  }, [walletState.address, walletState.isConnected]);

  const fetchTransactions = async () => {
    if (!walletState.address) return;

    setIsLoading(true);
    setError(null);

    try {
      const history = await apiService.getTransactionHistory(walletState.address);
      setTransactions(history);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAmount = (amount: string): string => {
    const num = parseFloat(amount);
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  const getTransactionType = (tx: Transaction): 'sent' | 'received' => {
    return tx.fromAddress.toLowerCase() === walletState.address?.toLowerCase() ? 'sent' : 'received';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const openInExplorer = (txHash: string) => {
    window.open(`https://explorer-testnet.shardeum.org/transaction/${txHash}`, '_blank');
  };

  if (!walletState.isConnected) {
    return (
      <div className="card text-center">
        <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
        <p className="text-gray-600">Connect your wallet to view transaction history</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Transaction History</h3>
        <button
          onClick={fetchTransactions}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 mx-auto text-gray-400 animate-spin mb-2" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No transactions found</p>
          <p className="text-sm text-gray-500 mt-1">
            Your tip history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const type = getTransactionType(tx);
            const isOutgoing = type === 'sent';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isOutgoing ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {isOutgoing ? (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium">
                        {isOutgoing ? 'Tip Sent' : 'Tip Received'}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      {isOutgoing ? 'To: ' : 'From: '}
                      {web3Service.formatAddress(isOutgoing ? tx.toAddress : tx.fromAddress)}
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      {formatDate(tx.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-semibold ${isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
                    {isOutgoing ? '-' : '+'}{formatAmount(tx.amount)} SHM
                  </p>
                  
                  <button
                    onClick={() => openInExplorer(tx.txHash)}
                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory; 