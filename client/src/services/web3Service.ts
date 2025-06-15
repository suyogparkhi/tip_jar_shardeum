import { ethers } from 'ethers';
import { WalletState } from '../types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

class ShardeumAPI {
  private rpcUrl: string;
  private provider: ethers.BrowserProvider | null;
  private signer: ethers.Signer | null;
  private readonly SHARDEUM_CHAIN_ID = '0x1f93'; // 8083 in hex

  constructor() {
    this.rpcUrl = 'https://api-testnet.shardeum.org';
    this.provider = null;
    this.signer = null;
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    return typeof window.ethereum !== 'undefined';
  }

  // Connect to MetaMask wallet
  async connectWallet(): Promise<WalletState> {
    if (!this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      // Initialize provider and signer for transactions
      if (!this.provider) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }
      
      // Initialize signer for transactions
      if (!this.signer) {
        this.signer = await this.provider.getSigner();
      }

      // Get balance (already formatted in ether)
      const balance = await this.getBalance(address);

      return {
        isConnected: true,
        address,
        balance,
        chainId,
      };
    } catch (error: any) {
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  // Switch to Shardeum network
  async switchToShardeum(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.SHARDEUM_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: this.SHARDEUM_CHAIN_ID,
                chainName: 'Shardeum Testnet',
                nativeCurrency: {
                  name: 'Shardeum',
                  symbol: 'SHM',
                  decimals: 18,
                },
                rpcUrls: [this.rpcUrl],
                blockExplorerUrls: ['https://explorer-testnet.shardeum.org'],
                iconUrls: ['https://shardeum.org/favicon.ico'],
              },
            ],
          });
        } catch (addError: any) {
          throw new Error(`Failed to add Shardeum network: ${addError.message}`);
        }
      } else {
        throw new Error(`Failed to switch to Shardeum network: ${switchError.message}`);
      }
    }
  }

  // Listen for account changes
  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  // Listen for chain changes
  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }

  // Remove event listeners
  removeAllListeners(): void {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }

  // Format address for display
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Validate Ethereum address
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  // Verify network configuration
  async verifyNetwork(): Promise<boolean> {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === this.SHARDEUM_CHAIN_ID;
    } catch {
      return false;
    }
  }

  // Check if wallet is properly connected
  async isWalletConnected(): Promise<boolean> {
    try {
      if (!window.ethereum) return false;
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    } catch {
      return false;
    }
  }

  // Send SHM tip (alias for sendTransaction to maintain compatibility)
  async sendTip(toAddress: string, amount: string): Promise<string> {
    return this.sendTransaction(toAddress, amount);
  }

  // Initialize connection to Shardeum network
  async initialize() {
    try {
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        // Request accounts if not already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length === 0) {
          await this.provider.send("eth_requestAccounts", []);
        }
        this.signer = await this.provider.getSigner();
        return true;
      } else {
        throw new Error('MetaMask or compatible wallet not found');
      }
    } catch (error) {
      console.error('Failed to initialize Shardeum connection:', error);
      throw error;
    }
  }

  // Get current chain ID
  async getChainId() {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_chainId',
          id: 1,
          jsonrpc: '2.0'
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error getting chain ID:', error);
      throw error;
    }
  }

  // Get current gas price
  async getGasPrice() {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_gasPrice',
          id: 1,
          jsonrpc: '2.0'
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error getting gas price:', error);
      throw error;
    }
  }

  // Get account balance (returns wei as string) - mimics original Web3 behavior
  async getBalance(address: string): Promise<string> {
    try {
      // Always use MetaMask provider to get balance from currently connected network
      if (!this.provider && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }
      
      if (this.provider) {
        const balance = await this.provider.getBalance(address);
        return ethers.formatEther(balance); // Return formatted balance like original
      }
      
      throw new Error('No provider available');
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  // Get balance specifically from Shardeum testnet RPC
  async getShardeumBalance(address: string): Promise<string> {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
          jsonrpc: '2.0'
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error getting Shardeum balance:', error);
      throw error;
    }
  }

  // Get transaction count (nonce)
  async getTransactionCount(address: string) {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_getTransactionCount',
          params: [address, 'latest'],
          id: 1,
          jsonrpc: '2.0'
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error getting transaction count:', error);
      throw error;
    }
  }

  // Estimate gas for transaction
  async estimateGas(transactionObject: any) {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_estimateGas',
          params: [transactionObject, 'latest'],
          id: 1,
          jsonrpc: '2.0'
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }

  // Send SHM transaction
  async sendTransaction(to: string, amount: string, gasLimit: number | null = null) {
    try {
      // Ensure provider and signer are initialized
      if (!this.provider && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      }
      
      if (!this.signer && this.provider) {
        this.signer = await this.provider.getSigner();
      }
      
      if (!this.signer) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      // Verify we're on the correct network
      const isCorrectNetwork = await this.verifyNetwork();
      if (!isCorrectNetwork) {
        throw new Error('Please switch to Shardeum Testnet before sending transactions');
      }

      const fromAddress = await this.signer.getAddress();
      const value = ethers.parseEther(amount.toString());
      
      // Get current gas price
      const gasPrice = await this.getGasPrice();
      
      const transactionObject: any = {
        from: fromAddress,
        to: to,
        value: '0x' + value.toString(16),
        gasPrice: gasPrice
      };

      // Estimate gas if not provided
      let finalGasLimit: string;
      if (!gasLimit) {
        const estimatedGas = await this.estimateGas(transactionObject);
        finalGasLimit = estimatedGas;
      } else {
        finalGasLimit = '0x' + gasLimit.toString(16);
      }

      // Send transaction using MetaMask
      const txResponse = await this.signer.sendTransaction({
        to: to,
        value: value,
        gasPrice: gasPrice,
        gasLimit: finalGasLimit
      });

      return txResponse.hash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash: string) {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
          id: 1,
          jsonrpc: '2.0'
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  // Get transaction by hash
  async getTransactionByHash(txHash: string) {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_getTransactionByHash',
          params: [txHash],
          id: 1,
          jsonrpc: '2.0'
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  // Get current block number
  async getBlockNumber() {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'eth_blockNumber',
          id: 1,
          jsonrpc: '2.0'
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error getting block number:', error);
      throw error;
    }
  }

  // Get network account information (Shardeum specific)
  async getNetworkAccount() {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'shardeum_getNetworkAccount',
          params: [],
          id: 1,
          jsonrpc: '2.0'
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error getting network account:', error);
      throw error;
    }
  }

  // Get node list (Shardeum specific)
  async getNodeList(page = 1, limit = 100) {
    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'shardeum_getNodeList',
          params: [{ page, limit }],
          id: 1,
          jsonrpc: '2.0'
        })
      });
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error getting node list:', error);
      throw error;
    }
  }

  // Format SHM amount from wei
  formatSHM(weiAmount: string) {
    return ethers.formatEther(weiAmount);
  }

  // Parse SHM amount to wei
  parseSHM(shmAmount: string) {
    return ethers.parseEther(shmAmount.toString());
  }

  // Get current wallet address
  async getCurrentAddress() {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.getAddress();
  }

  // Debug method to check network and balance info
  async getDebugInfo(address: string) {
    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isCorrectNetwork = currentChainId === this.SHARDEUM_CHAIN_ID;
      
      let metamaskBalance = '0';
      let shardeumBalance = '0';
      
      try {
        if (this.provider) {
          const balance = await this.provider.getBalance(address);
          metamaskBalance = ethers.formatEther(balance);
        }
      } catch (e) {
        console.warn('Could not get MetaMask balance:', e);
      }
      
      try {
        const balance = await this.getShardeumBalance(address);
        shardeumBalance = ethers.formatEther(balance);
      } catch (e) {
        console.warn('Could not get Shardeum balance:', e);
      }

      return {
        address,
        currentChainId,
        expectedChainId: this.SHARDEUM_CHAIN_ID,
        isCorrectNetwork,
        metamaskBalance,
        shardeumBalance,
        rpcUrl: this.rpcUrl
      };
    } catch (error) {
      console.error('Error getting debug info:', error);
      throw error;
    }
  }
}

export default new ShardeumAPI(); 