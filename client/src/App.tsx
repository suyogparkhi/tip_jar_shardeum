import React, { useState, useEffect } from 'react';
import { Heart, Users, Plus } from 'lucide-react';
import WalletConnect from './components/WalletConnect';
import CreatorCard from './components/CreatorCard';
import TransactionHistory from './components/TransactionHistory';
import NetworkStatus from './components/NetworkStatus';
import { Creator, WalletState } from './types';
import apiService from './services/apiService';

function App() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: '0',
    chainId: null,
  });
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddCreator, setShowAddCreator] = useState(false);

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const creatorsData = await apiService.getCreators();
      setCreators(creatorsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletStateChange = (newWalletState: WalletState) => {
    setWalletState(newWalletState);
  };

  const handleTipSent = () => {
    // Refresh creators data to update tip counts
    fetchCreators();
  };

  const AddCreatorForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      address: '',
      description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        await apiService.createCreator(formData);
        setFormData({ name: '', address: '', description: '' });
        setShowAddCreator(false);
        fetchCreators();
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Creator</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  placeholder="0x..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddCreator(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Creator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-shardeum-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SHM Tip Jar</h1>
                <p className="text-sm text-gray-600">Support creators on Shardeum</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddCreator(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Creator</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Wallet & History */}
          <div className="lg:col-span-1 space-y-6">
            <NetworkStatus />
            <WalletConnect onWalletStateChange={handleWalletStateChange} />
            <TransactionHistory walletState={walletState} />
          </div>

          {/* Right Column - Creators */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Creators</h2>
              </div>
              <p className="text-gray-600">
                {creators.length} creator{creators.length !== 1 ? 's' : ''} available
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchCreators}
                  className="text-red-800 hover:text-red-900 text-sm font-medium underline mt-2"
                >
                  Try Again
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded mb-3"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : creators.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Creators Yet</h3>
                <p className="text-gray-600 mb-4">
                  Be the first to add a creator to the platform!
                </p>
                <button
                  onClick={() => setShowAddCreator(true)}
                  className="btn-primary"
                >
                  Add First Creator
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    walletState={walletState}
                    onTipSent={handleTipSent}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Creator Modal */}
      {showAddCreator && <AddCreatorForm />}

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              Built on{' '}
              <a
                href="https://shardeum.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-shardeum-600 hover:text-shardeum-700 font-medium"
              >
                Shardeum
              </a>{' '}
              - The world's first linearly scalable blockchain
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
