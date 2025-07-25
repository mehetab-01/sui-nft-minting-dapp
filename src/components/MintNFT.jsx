const MintNFTForm = ({ name, setName, description, setDescription, imgUrl, setImgUrl, mintNFT, previewNFT, loading, error, success }) => (
  <div className="bg-gray-900/60 border border-gray-700 rounded-3xl p-8 backdrop-blur-lg shadow-2xl animate-fade-in hover-lift">
    <div className="mb-8 animate-slide-down">
      <h2 className="text-3xl font-bold text-white mb-2">Create NFT</h2>
      <p className="text-gray-400">Mint your unique digital collectible on Sui</p>
    </div>
    
    <div className="space-y-6">
      {/* NFT Name */}
      <div className="group animate-slide-up stagger-1">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          NFT Name
        </label>
        <input
          type="text"
          placeholder="Enter NFT name"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="group animate-slide-up stagger-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          placeholder="Describe your NFT"
          rows={4}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500 resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Image URL */}
      <div className="group animate-slide-up stagger-3">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Image URL
        </label>
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500"
          value={imgUrl}
          onChange={(e) => setImgUrl(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1 animate-fade-in">
          Direct link to your image (JPEG, PNG, GIF)
        </p>
      </div>
    </div>

    {/* Error and Success Messages */}
    {error && (
      <div className="mt-6 bg-red-900/20 border border-red-700 rounded-xl p-4 animate-slide-in-left">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    )}
    
    {success && (
      <div className="mt-6 bg-green-900/20 border border-green-700 rounded-xl p-4 animate-slide-in-left">
        <p className="text-green-400 text-sm">{success}</p>
      </div>
    )}

    {/* Action Buttons */}
    <div className="flex space-x-4 mt-8 animate-slide-up stagger-4">
      <button
        className={`flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover-glow ${
          loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105'
        }`}
        onClick={mintNFT}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Minting...</span>
          </div>
        ) : (
          'Mint NFT'
        )}
      </button>
      
      <button
        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 hover-glow transform hover:scale-105"
        onClick={previewNFT}
      >
        Preview
      </button>
    </div>
  </div>
);

export default MintNFTForm;