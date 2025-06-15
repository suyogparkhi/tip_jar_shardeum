export interface Creator {
  id: string;
  name: string;
  address: string;
  description: string;
  avatar: string;
  totalTips: string;
  tipCount: number;
}

export interface Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  txHash: string;
  creatorId?: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface NetworkInfo {
  chainId: string;
  blockNumber: number;
  gasPrice: number;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: string | null;
}

export interface TipFormData {
  amount: string;
  message?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface GasEstimate {
  gasEstimate: number;
}

export interface TransactionReceipt {
  blockHash: string;
  blockNumber: string;
  contractAddress: string | null;
  cumulativeGasUsed: string;
  effectiveGasPrice: string;
  from: string;
  gasUsed: string;
  logs: any[];
  logsBloom: string;
  status: string;
  to: string;
  transactionHash: string;
  transactionIndex: string;
  type: string;
} 