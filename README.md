# SHM Tip Jar - Creator Support Platform on Shardeum

A full-stack web application that allows users to send SHM tokens as tips to their favorite creators on the Shardeum blockchain network.

## Features

- 🔗 **Wallet Integration**: Connect with MetaMask wallet
- 💰 **Balance Display**: View your SHM balance in real-time
- 🎯 **Quick Tipping**: Send tips to creators with predefined amounts
- 📊 **Transaction History**: Track all your sent and received tips
- 👥 **Creator Management**: Add and discover creators on the platform
- 🌐 **Shardeum Network**: Built specifically for Shardeum blockchain
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Web3.js** for blockchain interactions
- **Lucide React** for icons
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **Web3.js** for Shardeum RPC calls
- **CORS** enabled for cross-origin requests
- **RESTful API** design

### Blockchain
- **Shardeum Network** (Betanet)
- **MetaMask** wallet integration
- **SHM Token** for transactions

## Project Structure

```
shm-tip-jar/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # Web3 and API services
│   │   ├── types/          # TypeScript definitions
│   │   └── App.tsx         # Main application
│   ├── public/
│   └── package.json
├── server/                 # Express backend
│   ├── index.js           # Main server file
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shm-tip-jar
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Manual Setup (Alternative)

If the automated setup doesn't work, you can set up each part manually:

1. **Backend Setup**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Frontend Setup** (in a new terminal)
   ```bash
   cd client
   npm install
   npm start
   ```

## Configuration

### Environment Variables

Create a `.env` file in the server directory (optional):

```env
PORT=5000
SHARDEUM_RPC=https://api.shardeum.org
NODE_ENV=development
```

### MetaMask Setup

1. Install MetaMask browser extension
2. Add Shardeum Testnet to your networks:
   - **Network Name**: Shardeum Testnet
   - **RPC URL**: https://api-testnet.shardeum.org
   - **Chain ID**: 8083
   - **Currency Symbol**: SHM
   - **Block Explorer**: https://explorer-testnet.shardeum.org/

3. Get test SHM tokens from the [Shardeum Faucet](https://faucet-testnet.shardeum.org/)

## API Endpoints

### Network APIs
- `GET /api/network` - Get network information
- `GET /api/balance/:address` - Get account balance
- `GET /api/nonce/:address` - Get transaction count
- `POST /api/estimate-gas` - Estimate gas for transaction

### Creator APIs
- `GET /api/creators` - Get all creators
- `GET /api/creators/:id` - Get creator by ID
- `POST /api/creators` - Add new creator

### Transaction APIs
- `POST /api/tips` - Record a tip transaction
- `GET /api/history/:address` - Get transaction history
- `GET /api/transactions` - Get all transactions
- `GET /api/transaction/:hash` - Get transaction details

## Usage

1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask
2. **Switch Network**: If prompted, switch to Shardeum Testnet
3. **Browse Creators**: View available creators on the platform
4. **Send Tips**: Click "Send Tip" on any creator card
5. **View History**: Check your transaction history in the sidebar
6. **Add Creators**: Use "Add Creator" to add new creators

## Shardeum Integration

This application uses the official Shardeum JSON-RPC API endpoints:

- **Chain ID**: 8083 (0x1f93 in hex)
- **RPC Endpoint**: https://api-testnet.shardeum.org
- **Explorer**: https://explorer-testnet.shardeum.org/
- **Faucet**: https://faucet-testnet.shardeum.org/

### Supported RPC Methods

- `eth_chainId` - Get chain ID
- `eth_blockNumber` - Get latest block number
- `eth_gasPrice` - Get current gas price
- `eth_getBalance` - Get account balance
- `eth_getTransactionCount` - Get nonce
- `eth_estimateGas` - Estimate gas
- `eth_sendTransaction` - Send transaction
- `eth_getTransactionByHash` - Get transaction details
- `eth_getTransactionReceipt` - Get transaction receipt

## Development

### Adding New Features

1. **Frontend Components**: Add new React components in `client/src/components/`
2. **API Endpoints**: Add new routes in `server/index.js`
3. **Types**: Update TypeScript types in `client/src/types/index.ts`
4. **Services**: Extend services in `client/src/services/`

### Testing

- Frontend: `cd client && npm test`
- Backend: `cd server && npm test` (tests not implemented yet)

## Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `cd client && npm run build`
2. Deploy the `build` folder to your hosting service
3. Set environment variable: `REACT_APP_API_URL=your-backend-url`

### Backend (Heroku/Railway)
1. Deploy the `server` directory
2. Set environment variables as needed
3. Ensure CORS is configured for your frontend domain

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the [Shardeum Documentation](https://docs.shardeum.org/)
- Join the [Shardeum Discord](https://discord.gg/shardeum)

## Acknowledgments

- Built on [Shardeum](https://shardeum.org/) - The world's first linearly scalable blockchain
- Uses [MetaMask](https://metamask.io/) for wallet integration
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/) 