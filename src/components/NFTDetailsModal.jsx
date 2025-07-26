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

  const shareToTwitter = () => {
    const text = `Check out my NFT "${nft.name}" minted on the Sui blockchain! 🚀✨`;
    const url = `https://sui-nft-miner.vercel.app`;
    const hashtags = 'SuiNFT,NFT,Blockchain,Web3,DigitalArt';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const text = `🚀 Just minted my NFT "${nft.name}" on the Sui blockchain! 

${nft.description || 'Check out this amazing digital asset!'}

Built using a universal NFT minting platform. The future of digital ownership is here! 

#SuiNFT #NFT #Blockchain #Web3 #DigitalArt #Crypto

Explore the platform: https://sui-nft-miner.vercel.app`;
    
    const linkedInUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const handleGenericShare = async () => {
    const shareData = {
      title: `NFT: ${nft.name}`,
      text: `Check out my NFT "${nft.name}" minted on the Sui blockchain!`,
      url: 'https://sui-nft-miner.vercel.app'
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `Check out my NFT "${nft.name}" minted on the Sui blockchain! 🚀✨\n\n${nft.description || ''}\n\nExplore more at: https://sui-nft-miner.vercel.app`;
      try {
        await navigator.clipboard.writeText(shareText);
        setCopySuccess('share');
        setTimeout(() => setCopySuccess(''), 2000);
      } catch (err) {
        console.error('Failed to copy share text:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-gray-800/80 hover:bg-gray-700 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all hover-lift text-sm sm:text-base"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8">
          {/* Image Section */}
          <div className="space-y-3 sm:space-y-4">
            <div className="aspect-square bg-gray-800/50 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-600">
              {!imageLoaded && (
                <div className="w-full h-full flex items-center justify-center animate-pulse">
                  <div className="text-4xl sm:text-6xl text-gray-600">🖼️</div>
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
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => window.open(nft.img_url, '_blank')}
                className="flex-1 px-3 sm:px-4 py-2 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors text-xs sm:text-sm font-medium"
              >
                🔗 View Original
              </button>
              <button
                onClick={() => copyToClipboard(nft.img_url, 'image')}
                className="flex-1 px-3 sm:px-4 py-2 bg-purple-600/20 border border-purple-600 text-purple-400 rounded-xl hover:bg-purple-600/30 transition-colors text-xs sm:text-sm font-medium"
              >
                {copySuccess === 'image' ? '✓ Copied!' : '📋 Copy URL'}
              </button>
            </div>

            {/* Social Sharing */}
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-gray-400 text-center font-medium">
                ✨ Showcase Your NFT
              </p>
              <div className="flex gap-2 sm:gap-3">
                {/* Twitter/X Share */}
                <button
                  onClick={shareToTwitter}
                  className="flex-1 px-3 sm:px-4 py-2 bg-white/10 border border-sky-500 text-sky-300 rounded-xl hover:bg-white/20 hover:border-sky-400 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                  title="Share on X (Twitter)"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>Twitter</span>
                </button>

                {/* LinkedIn Share */}
                <button
                  onClick={shareToLinkedIn}
                  className="flex-1 px-3 sm:px-4 py-2 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-xl hover:bg-blue-600/30 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                  title="Share on LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>LinkedIn</span>
                </button>

                {/* Generic Share */}
                <button
                  onClick={handleGenericShare}
                  className="flex-1 px-3 sm:px-4 py-2 bg-green-600/20 border border-green-600 text-green-400 rounded-xl hover:bg-green-600/30 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center gap-2"
                  title="Share or Copy"
                >
                  {copySuccess === 'share' ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                      </svg>
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4 sm:space-y-6">
            {/* Title & Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 animate-slide-up">
                {nft.name}
              </h1>
              <p className="text-gray-300 leading-relaxed animate-slide-up stagger-1 text-sm sm:text-base">
                {nft.description || 'No description provided'}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="space-y-3 sm:space-y-4 animate-slide-up stagger-2">
              <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-2">
                NFT Details
              </h3>
              
              {/* Token ID */}
              <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-600">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider">Token ID</label>
                  <p className="text-white font-mono text-xs sm:text-sm mt-1">{truncateAddress(nft.id)}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(nft.id, 'id')}
                  className="px-2 sm:px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-xs"
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
