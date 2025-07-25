import { useState } from 'react';
import NFTDetailsModal from './NFTDetailsModal';

const NFTGallery = ({ nfts, loading, account, onRefresh }) => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (nft) => {
    setSelectedNFT(nft);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNFT(null);
  };

  return (
    <>
      <div className="bg-gray-900/60 border border-gray-700 rounded-3xl p-8 backdrop-blur-lg shadow-2xl animate-fade-in">
    <div className="flex items-center justify-between mb-8 animate-slide-down">
      <div>
        <h2 className="text-3xl font-bold text-white mb-3">Your Collection</h2>
        <p className="text-gray-400">NFTs you've minted on Sui Network</p>
      </div>
      <div className="flex items-center space-x-3">
        {account && (
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        )}
        {!loading && nfts.length > 0 && (
          <div className="bg-blue-900/50 border border-blue-700 rounded-xl px-4 py-2 animate-scale-in">
            <span className="text-blue-300 font-semibold">{nfts.length} NFT{nfts.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>

    {/* Wallet not connected */}
    {!account && (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-6xl mb-6 animate-float">🔗</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-3">Connect Your Wallet</h3>
        <p className="text-gray-500">Connect your wallet to view and manage your NFT collection</p>
      </div>
    )}

    {/* Wallet connected but loading */}
    {account && loading && (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse-custom">
        <div className="w-12 h-12 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading your NFTs...</p>
      </div>
    )}

    {/* Wallet connected but no NFTs */}
    {account && !loading && nfts.length === 0 && (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-6xl mb-6 animate-float">🎨</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-3">No NFTs yet</h3>
        <p className="text-gray-500">Create your first NFT to get started</p>
      </div>
    )}

    {/* Wallet connected and has NFTs */}
    {account && !loading && nfts.length > 0 && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {nfts.map((nft, index) => (
          <div 
            key={nft.id} 
            className="bg-gray-800/50 border border-gray-600 rounded-2xl overflow-hidden hover:border-blue-500 hover-lift transition-all duration-300 group animate-scale-in cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => openModal(nft)}
          >
            <div className="aspect-square bg-gray-700/50 overflow-hidden animate-shimmer">
              <img
                src={nft.img_url}
                alt={nft.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full flex-col items-center justify-center text-gray-500 animate-pulse-custom">
                <div className="text-4xl mb-3">🖼️</div>
                <span className="text-sm">Image unavailable</span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-blue-400 transition-colors animate-slide-up stagger-1">
                {nft.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2 animate-slide-up stagger-2">
                {nft.description}
              </p>
              
              <div className="flex items-center justify-between animate-slide-up stagger-3">
                <span className="text-xs text-gray-400 font-mono bg-gray-700/50 px-3 py-1 rounded-lg border border-gray-600">
                  #{nft.id.slice(-6)}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-custom"></div>
                  <span className="text-xs text-green-400 font-semibold">Minted</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* NFT Details Modal */}
  <NFTDetailsModal 
    nft={selectedNFT}
    isOpen={isModalOpen}
    onClose={closeModal}
  />
</>
);
};

export default NFTGallery;