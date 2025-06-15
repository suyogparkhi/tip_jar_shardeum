const express = require('express');
const cors = require('cors');
const { Web3 } = require('web3');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Shardeum RPC endpoint
const SHARDEUM_RPC = 'https://api-testnet.shardeum.org';
const web3 = new Web3(SHARDEUM_RPC);

// In-memory storage for demo (in production, use a proper database)
let creators = [
  {
    id: '1',
    name: 'Tushar Pamnani',
    address: '<ADDRESS_HERE>',
    description: 'Digital artist creating amazing NFT collections',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    totalTips: '0',
    tipCount: 0
  },
  {
    id: '2',
    name: 'Bob Developer',
    address: '0x26d6a3805cbae5d5a510443a15129bec456cacff',
    description: 'Full-stack developer building on Shardeum',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    totalTips: '0',
    tipCount: 0
  }
];

let transactions = [];

// Helper function to make RPC calls to Shardeum
async function shardeumRPC(method, params = []) {
  try {
    const response = await axios.post(SHARDEUM_RPC, {
      jsonrpc: '2.0',
      method: method,
      params: params,
      id: 1
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data.result;
  } catch (error) {
    console.error('RPC Error:', error.message);
    throw error;
  }
}

// Routes

// Get network info
app.get('/api/network', async (req, res) => {
  try {
    const chainId = await shardeumRPC('eth_chainId');
    const blockNumber = await shardeumRPC('eth_blockNumber');
    const gasPrice = await shardeumRPC('eth_gasPrice');
    
    res.json({
      chainId,
      blockNumber: parseInt(blockNumber, 16),
      gasPrice: parseInt(gasPrice, 16)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch network info' });
  }
});

// Get account balance
app.get('/api/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await shardeumRPC('eth_getBalance', [address, 'latest']);
    const balanceInSHM = web3.utils.fromWei(balance, 'ether');
    
    res.json({
      address,
      balance: balanceInSHM,
      balanceWei: balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Get transaction count (nonce)
app.get('/api/nonce/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const nonce = await shardeumRPC('eth_getTransactionCount', [address, 'latest']);
    
    res.json({
      address,
      nonce: parseInt(nonce, 16)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch nonce' });
  }
});

// Get transaction by hash
app.get('/api/transaction/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    const transaction = await shardeumRPC('eth_getTransactionByHash', [hash]);
    const receipt = await shardeumRPC('eth_getTransactionReceipt', [hash]);
    
    res.json({
      transaction,
      receipt
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Get all creators
app.get('/api/creators', (req, res) => {
  res.json(creators);
});

// Get creator by ID
app.get('/api/creators/:id', (req, res) => {
  const creator = creators.find(c => c.id === req.params.id);
  if (!creator) {
    return res.status(404).json({ error: 'Creator not found' });
  }
  res.json(creator);
});

// Add new creator
app.post('/api/creators', (req, res) => {
  const { name, address, description } = req.body;
  
  if (!name || !address || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newCreator = {
    id: Date.now().toString(),
    name,
    address: address.toLowerCase(),
    description,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    totalTips: '0',
    tipCount: 0
  };
  
  creators.push(newCreator);
  res.status(201).json(newCreator);
});

// Record a tip transaction
app.post('/api/tips', (req, res) => {
  const { fromAddress, toAddress, amount, txHash, creatorId } = req.body;
  
  if (!fromAddress || !toAddress || !amount || !txHash) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const transaction = {
    id: Date.now().toString(),
    fromAddress: fromAddress.toLowerCase(),
    toAddress: toAddress.toLowerCase(),
    amount,
    txHash,
    creatorId,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  transactions.push(transaction);
  
  // Update creator stats
  if (creatorId) {
    const creator = creators.find(c => c.id === creatorId);
    if (creator) {
      creator.totalTips = (parseFloat(creator.totalTips) + parseFloat(amount)).toString();
      creator.tipCount += 1;
    }
  }
  
  res.status(201).json(transaction);
});

// Get transaction history for an address
app.get('/api/history/:address', (req, res) => {
  const { address } = req.params;
  const userTransactions = transactions.filter(
    tx => tx.fromAddress === address.toLowerCase() || tx.toAddress === address.toLowerCase()
  );
  
  res.json(userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

// Estimate gas for a transaction
app.post('/api/estimate-gas', async (req, res) => {
  try {
    const { from, to, value } = req.body;
    
    const gasEstimate = await shardeumRPC('eth_estimateGas', [{
      from,
      to,
      value: web3.utils.toHex(web3.utils.toWei(value, 'ether'))
    }]);
    
    res.json({
      gasEstimate: parseInt(gasEstimate, 16)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to estimate gas' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to Shardeum network: ${SHARDEUM_RPC}`);
}); 