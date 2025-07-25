import { useState } from 'react';
import { useCurrentAccount, useConnectWallet, useDisconnectWallet, useWallets } from '@mysten/dapp-kit';

const ConnectWallet = () => {
  const account = useCurrentAccount();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();
  const [showWallets, setShowWallets] = useState(false);

  const handleConnect = (wallet) => {
    connect(
      { wallet },
      {
        onSuccess: () => setShowWallets(false),
      }
    );
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (account) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-white text-sm font-medium">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-[9999]">
      <button
        onClick={() => setShowWallets(!showWallets)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl border-0 animate-scale-in hover-glow"
      >
        Connect Wallet
      </button>

      {showWallets && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={() => setShowWallets(false)}
          />
          
          {/* Wallet Modal */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-[9999] p-4 wallet-dropdown animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
              <button
                onClick={() => setShowWallets(false)}
                className="text-gray-400 hover:text-white transition-colors hover:rotate-90 transform duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              {wallets.map((wallet, index) => (
                <button
                  key={wallet.name}
                  onClick={() => handleConnect(wallet)}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-lg transition-all duration-200 text-left group animate-slide-in-left hover-lift"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {wallet.icon && (
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="w-8 h-8 rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-white font-medium group-hover:text-blue-300">
                      {wallet.name}
                    </div>
                    {wallet.version && (
                      <div className="text-xs text-gray-400">
                        Version {wallet.version}
                      </div>
                    )}
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
              
              {wallets.length === 0 && (
                <div className="text-center py-8 animate-fade-in">
                  <div className="text-gray-400 mb-2">No wallets detected</div>
                  <div className="text-sm text-gray-500">
                    Please install a Sui wallet extension
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700 animate-fade-in">
              <div className="text-xs text-gray-500 text-center">
                New to Sui? <a href="https://suiwallet.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Get a wallet</a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ConnectWallet;