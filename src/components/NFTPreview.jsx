const NFTPreview = ({ preview }) => (
  <div className="bg-gray-900/60 border border-gray-700 rounded-3xl p-8 backdrop-blur-lg shadow-2xl animate-fade-in hover-lift sticky top-8 z-10">
    <div className="mb-6 animate-slide-down">
      <h3 className="text-2xl font-bold text-white mb-2">Preview</h3>
      <p className="text-gray-400">Live preview of your NFT</p>
    </div>
    
    <div className="space-y-6">
      {/* NFT Card */}
      <div className="bg-gray-800/50 border border-gray-600 rounded-2xl p-6 animate-scale-in hover-lift">
        <div className="aspect-square w-full mb-6 bg-gray-700/50 rounded-xl overflow-hidden flex items-center justify-center animate-shimmer">
          <img
            src={preview.img_url}
            alt="NFT Preview"
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden flex-col items-center justify-center text-gray-500 text-center animate-pulse-custom">
            <div className="text-4xl mb-3">🖼️</div>
            <p className="text-sm">Image preview</p>
          </div>
        </div>
        
        <div className="space-y-3 animate-slide-up stagger-1">
          <h4 className="text-xl font-bold text-white truncate">
            {preview.name || 'Untitled NFT'}
          </h4>
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
            {preview.description || 'No description'}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-4 animate-slide-up stagger-2">
        <h5 className="text-sm font-semibold text-gray-300 uppercase tracking-wider animate-slide-in-left">
          Metadata
        </h5>
        <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-6 space-y-4 text-sm animate-slide-in-right hover-lift">
          <div className="flex justify-between items-center animate-fade-in stagger-1">
            <span className="text-gray-400">Name:</span>
            <span className="text-white font-semibold">{preview.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center animate-fade-in stagger-2">
            <span className="text-gray-400">Blockchain:</span>
            <span className="text-blue-400 font-semibold">Sui Network</span>
          </div>
          <div className="flex justify-between items-center animate-fade-in stagger-3">
            <span className="text-gray-400">Standard:</span>
            <span className="text-purple-400 font-semibold">NFT</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-3 bg-green-900/30 border border-green-700 rounded-xl p-4 animate-slide-up stagger-3 hover-glow">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-custom"></div>
        <span className="text-green-300 font-semibold">Ready to mint</span>
      </div>
    </div>
  </div>
);

export default NFTPreview;