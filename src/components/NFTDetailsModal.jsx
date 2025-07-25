import { useState } from 'react';

const NFTDetailsModal = ({ nft, isOpen, onClose }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  if (!isOpen || !nft) return null;

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 bg-gray-800/80 hover:bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all hover-lift"
        >
          ✕
        </button>

        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-600">
              {!imageLoaded && (
                <div className="w-full h-full flex items-center justify-center animate-pulse">
                  <div className="text-6xl text-gray-600">🖼️</div>
                </div>
              )}
              <img
                src={nft.img_url}
                alt={nft.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.style.display = 'none';
                  setImageLoaded(true);
                }}
              />
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => window.open(nft.img_url, '_blank')}
                className="flex-1 px-4 py-2 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors text-sm font-medium"
              >
                🔗 View Original
              </button>
              <button
                onClick={() => copyToClipboard(nft.img_url, 'image')}
                className="flex-1 px-4 py-2 bg-purple-600/20 border border-purple-600 text-purple-400 rounded-xl hover:bg-purple-600/30 transition-colors text-sm font-medium"
              >
                {copySuccess === 'image' ? '✓ Copied!' : '📋 Copy URL'}
              </button>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title & Description */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-3 animate-slide-up">
                {nft.name}
              </h1>
              <p className="text-gray-300 leading-relaxed animate-slide-up stagger-1">
                {nft.description || 'No description provided'}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="space-y-4 animate-slide-up stagger-2">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                NFT Details
              </h3>
              
              {/* Token ID */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-600">
                <div>
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Token ID</label>
                  <p className="text-white font-mono text-sm mt-1">{truncateAddress(nft.id)}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(nft.id, 'id')}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-xs"
                >
                  {copySuccess === 'id' ? '✓' : '📋'}
                </button>
              </div>

              {/* Owner Info */}
              {nft.owner && (
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-600">
                  <div>
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Owner</label>
                    <p className="text-white font-mono text-sm mt-1">{truncateAddress(nft.owner)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(nft.owner, 'owner')}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-xs"
                  >
                    {copySuccess === 'owner' ? '✓' : '📋'}
                  </button>
                </div>
              )}

              {/* Creation Date */}
              {nft.created_at && (
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-600">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Created</label>
                  <p className="text-white text-sm mt-1">{formatDate(nft.created_at)}</p>
                </div>
              )}

              {/* Object Type */}
              {nft.type && (
                <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-600">
                  <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Type</label>
                  <p className="text-white font-mono text-sm mt-1 break-all">{nft.type}</p>
                </div>
              )}

              {/* Status */}
              <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-600">
                <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Status</label>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Minted on Sui Network</span>
                </div>
              </div>
            </div>

            {/* Explorer Link */}
            <div className="pt-4">
              <button
                onClick={() => window.open(`https://suiscan.xyz/testnet/object/${nft.id}`, '_blank')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium hover-lift"
              >
                🔍 View on Sui Explorer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetailsModal;
