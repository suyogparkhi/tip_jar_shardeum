import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import web3Service from '../services/web3Service';
import { WalletState } from '../types';

interface WalletConnectProps {
  onWalletStateChange: (walletState: WalletState) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletStateChange }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    checkConnection();
    setupEventListeners();

    return () => {
      web3Service.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    onWalletStateChange(walletState);
    checkNetwork();
  }, [walletState, onWalletStateChange]);

  const checkConnection = async () => {
    if (!web3Service.isMetaMaskInstalled()) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const address = accounts[0];
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const balance = await web3Service.getBalance(address);

        const newWalletState = {
          isConnected: true,
          address,
          balance,
          chainId,
        };

        setWalletState(newWalletState);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error checking connection:', err);
      setError(err.message);
    }
  };

  const checkNetwork = () => {
    const SHARDEUM_CHAIN_ID = '0x1f93'; // 8083 in hex
    setIsCorrectNetwork(walletState.chainId === SHARDEUM_CHAIN_ID);
  };

  const setupEventListeners = () => {
    web3Service.onAccountsChanged((accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletState({
          isConnected: false,
          address: null,
          balance: '0',
          chainId: null,
        });
      } else {
        checkConnection();
      }
    });

    web3Service.onChainChanged((chainId: string) => {
      setWalletState(prev => ({ ...prev, chainId }));
    });
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const newWalletState = await web3Service.connectWallet();
      setWalletState(newWalletState);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToShardeum = async () => {
    try {
      await web3Service.switchToShardeum();
      // Refresh connection after network switch
      setTimeout(checkConnection, 1000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  if (!web3Service.isMetaMaskInstalled()) {
    return (
      <div className="card">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">MetaMask Required</h3>
            <p className="text-sm text-gray-600">
              Please install MetaMask to use this application.
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Download MetaMask
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!walletState.isConnected) {
    return (
      <div className="card">
        <div className="text-center">
          <Wallet className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-4">
            Connect your MetaMask wallet to start sending tips
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">Wallet Connected</h3>
            <p className="text-sm text-gray-600">
              {web3Service.formatAddress(walletState.address!)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">
            {formatBalance(walletState.balance)} SHM
          </p>
          <p className="text-sm text-gray-600">Balance</p>
        </div>
      </div>

      {!isCorrectNetwork && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 text-sm">
                Please switch to Shardeum network
              </p>
            </div>
            <button
              onClick={switchToShardeum}
              className="text-yellow-800 hover:text-yellow-900 text-sm font-medium underline"
            >
              Switch Network
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 