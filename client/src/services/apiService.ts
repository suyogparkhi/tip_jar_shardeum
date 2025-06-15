import axios from 'axios';
import { Creator, Transaction, NetworkInfo, GasEstimate } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

class ApiService {
  // Network related APIs
  async getNetworkInfo(): Promise<NetworkInfo> {
    const response = await api.get('/network');
    return response.data;
  }

  async getBalance(address: string): Promise<{ address: string; balance: string; balanceWei: string }> {
    const response = await api.get(`/balance/${address}`);
    return response.data;
  }

  async getNonce(address: string): Promise<{ address: string; nonce: number }> {
    const response = await api.get(`/nonce/${address}`);
    return response.data;
  }

  async getTransactionByHash(hash: string): Promise<any> {
    const response = await api.get(`/transaction/${hash}`);
    return response.data;
  }

  async estimateGas(from: string, to: string, value: string): Promise<GasEstimate> {
    const response = await api.post('/estimate-gas', { from, to, value });
    return response.data;
  }

  // Creator related APIs
  async getCreators(): Promise<Creator[]> {
    const response = await api.get('/creators');
    return response.data;
  }

  async getCreatorById(id: string): Promise<Creator> {
    const response = await api.get(`/creators/${id}`);
    return response.data;
  }

  async createCreator(creator: Omit<Creator, 'id' | 'avatar' | 'totalTips' | 'tipCount'>): Promise<Creator> {
    const response = await api.post('/creators', creator);
    return response.data;
  }

  // Transaction related APIs
  async recordTip(tipData: {
    fromAddress: string;
    toAddress: string;
    amount: string;
    txHash: string;
    creatorId?: string;
  }): Promise<Transaction> {
    const response = await api.post('/tips', tipData);
    return response.data;
  }

  async getTransactionHistory(address: string): Promise<Transaction[]> {
    const response = await api.get(`/history/${address}`);
    return response.data;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const response = await api.get('/transactions');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get('/health');
    return response.data;
  }
}

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.statusText;
      throw new Error(`API Error: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network Error: Unable to connect to server');
    } else {
      // Something else happened
      throw new Error(`Request Error: ${error.message}`);
    }
  }
);

export default new ApiService(); 