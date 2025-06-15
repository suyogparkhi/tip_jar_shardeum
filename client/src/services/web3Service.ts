import Web3 from 'web3';
import { WalletState, NetworkInfo } from '../types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

class Web3Service {
  private web3: Web3 | null = null;
  private readonly SHARDEUM_CHAIN_ID = '0x1f93'; // 8083 in hex
  private readonly SHARDEUM_RPC = 'https://api-testnet.shardeum.org';

  constructor() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
    }
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

      // Get balance
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

  // Get account balance
  async getBalance(address: string): Promise<string> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      const balanceWei = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balanceWei, 'ether');
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
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
                rpcUrls: [this.SHARDEUM_RPC],
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

  // Verify network configuration
  async verifyNetwork(): Promise<boolean> {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === this.SHARDEUM_CHAIN_ID;
    } catch {
      return false;
    }
  }

  // Send SHM tip
  async sendTip(toAddress: string, amount: string): Promise<string> {
    if (!this.web3 || !window.ethereum) {
      throw new Error('Web3 not initialized');
    }

    // Verify we're on the correct network
    const isCorrectNetwork = await this.verifyNetwork();
    if (!isCorrectNetwork) {
      throw new Error('Please switch to Shardeum Testnet before sending tips');
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length === 0) {
        throw new Error('No connected accounts');
      }

      const fromAddress = accounts[0];
      
      // Validate amount
      const numAmount = parseFloat(amount);
      if (!/^\d*\.?\d+$/.test(amount)) {
        throw new Error('Invalid tip amount');
      }
      

      // Convert to Wei with validation
      const amountWei = this.web3.utils.toWei(amount, 'ether');
      
      // Double-check the conversion
      const backToEther = this.web3.utils.fromWei(amountWei, 'ether');
      if (parseFloat(backToEther) !== numAmount) {
        throw new Error('Amount conversion error. Please try again.');
      }

      console.log('Sending tip:', {
        from: fromAddress,
        to: toAddress,
        amount: amount + ' SHM',
        amountWei: amountWei + ' Wei',
        verification: backToEther + ' SHM (converted back)'
      });

      // Check balance before sending
      const balance = await this.getBalance(fromAddress);
      if (parseFloat(balance) < numAmount) {
        throw new Error(`Insufficient balance. You have ${balance} SHM but trying to send ${amount} SHM`);
      }

      // Estimate gas
      const gasEstimate = await this.web3.eth.estimateGas({
        from: fromAddress,
        to: toAddress,
        value: amountWei,
      });

      // Get current gas price
      const gasPrice = await this.web3.eth.getGasPrice();

      // Send transaction with proper formatting
      const transactionParams = {
        from: fromAddress,
        to: toAddress,
        value: amountWei,
        gas: this.web3.utils.toHex(gasEstimate),
        gasPrice: this.web3.utils.toHex(gasPrice),
      };

      console.log('Transaction params:', {
        ...transactionParams,
        valueInSHM: amount + ' SHM',
        valueInWei: amountWei + ' Wei'
      });

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParams],
      });

      console.log('Transaction sent:', txHash);
      return txHash;
    } catch (error: any) {
      console.error('Send tip error:', error);
      throw new Error(`Failed to send tip: ${error.message}`);
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash: string) {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      return await this.web3.eth.getTransactionReceipt(txHash);
    } catch (error: any) {
      throw new Error(`Failed to get transaction receipt: ${error.message}`);
    }
  }

  // Get current network info
  async getNetworkInfo(): Promise<NetworkInfo> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      const chainId = await this.web3.eth.getChainId();
      const blockNumber = await this.web3.eth.getBlockNumber();
      const gasPrice = await this.web3.eth.getGasPrice();

      return {
        chainId: `0x${chainId.toString(16)}`,
        blockNumber: Number(blockNumber),
        gasPrice: Number(gasPrice),
      };
    } catch (error: any) {
      throw new Error(`Failed to get network info: ${error.message}`);
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
    if (!this.web3) return false;
    return this.web3.utils.isAddress(address);
  }
}

export default new Web3Service(); 