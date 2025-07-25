import { useState } from 'react';
import { useWallets, useConnectWallet } from '@mysten/dapp-kit';

const WalletConnectionModal = ({ isOpen, onClose }) => {
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const [connecting, setConnecting] = useState(null);

  const handleConnect = async (wallet) => {
    try {
      setConnecting(wallet.name);
      connect(
        { wallet },
        {
          onSuccess: () => {
            onClose();
            setConnecting(null);
          },
          onError: (error) => {
            console.error('Failed to connect wallet:', error);
            alert('Failed to connect wallet. Please try again.');
            setConnecting(null);
          },
        }
      );
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
      setConnecting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          {wallets.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              <p>No Sui wallets detected.</p>
              <p className="text-sm mt-2">Please install a Sui wallet like Sui Wallet or Suiet.</p>
            </div>
          ) : (
            wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => handleConnect(wallet)}
                disabled={connecting === wallet.name}
                className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {wallet.icon && (
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className="w-8 h-8 rounded"
                  />
                )}
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">{wallet.name}</div>
                  <div className="text-sm text-gray-500">
                    {connecting === wallet.name ? 'Connecting...' : 'Connect to your wallet'}
                  </div>
                </div>
                {connecting === wallet.name && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
              </button>
            ))
          )}
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>By connecting a wallet, you agree to the Terms of Service.</p>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionModal;
