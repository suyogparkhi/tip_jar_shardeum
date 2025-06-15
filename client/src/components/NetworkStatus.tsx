import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import web3Service from '../services/web3Service';

const NetworkStatus: React.FC = () => {
  const [networkInfo, setNetworkInfo] = useState<{
    chainId: string | null;
    isCorrect: boolean;
    networkName: string;
  }>({
    chainId: null,
    isCorrect: false,
    networkName: 'Unknown',
  });
  const [isLoading, setIsLoading] = useState(false);

  const EXPECTED_CHAIN_ID = '0x1f93'; // 8083 in hex
  const EXPECTED_NETWORK = 'Shardeum Testnet';

  const checkNetwork = async () => {
    setIsLoading(true);
    try {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const isCorrect = chainId === EXPECTED_CHAIN_ID;
        
        let networkName = 'Unknown Network';
        if (chainId === '0x1') networkName = 'Ethereum Mainnet';
        else if (chainId === '0x5') networkName = 'Goerli Testnet';
        else if (chainId === '0x89') networkName = 'Polygon Mainnet';
        else if (chainId === EXPECTED_CHAIN_ID) networkName = EXPECTED_NETWORK;
        else networkName = `Unknown (${chainId})`;

        setNetworkInfo({
          chainId,
          isCorrect,
          networkName,
        });
      }
    } catch (error) {
      console.error('Error checking network:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkNetwork();

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', checkNetwork);
      return () => {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      };
    }
  }, []);

  const handleSwitchNetwork = async () => {
    try {
      await web3Service.switchToShardeum();
      setTimeout(checkNetwork, 1000);
    } catch (error: any) {
      console.error('Error switching network:', error);
    }
  };

  if (!window.ethereum) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className={`p-3 rounded-lg border ${
        networkInfo.isCorrect 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {networkInfo.isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                networkInfo.isCorrect ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {networkInfo.isCorrect ? 'Correct Network' : 'Wrong Network'}
              </p>
              <p className={`text-xs ${
                networkInfo.isCorrect ? 'text-green-600' : 'text-yellow-600'
              }`}>
                Current: {networkInfo.networkName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={checkNetwork}
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Refresh network status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {!networkInfo.isCorrect && (
              <button
                onClick={handleSwitchNetwork}
                className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
              >
                Switch to Testnet
              </button>
            )}
          </div>
        </div>

        {!networkInfo.isCorrect && (
          <div className="mt-2 text-xs text-yellow-700">
            Expected: {EXPECTED_NETWORK} (Chain ID: {EXPECTED_CHAIN_ID})
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus; 