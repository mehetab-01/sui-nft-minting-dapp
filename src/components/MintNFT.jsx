const MintNFTForm = ({ 
  name, setName, 
  description, setDescription, 
  imgUrl, setImgUrl, 
  selectedFile, uploading, handleFileSelect, clearSelectedFile,
  mintNFT, previewNFT, 
  loading, error, success,
  gasEstimate, estimatingGas
}) => (
  <div className="bg-gray-900/60 border border-gray-700 rounded-3xl p-6 sm:p-8 backdrop-blur-lg shadow-2xl animate-fade-in hover-lift">
    <div className="mb-6 sm:mb-8 animate-slide-down">
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create NFT</h2>
      <p className="text-gray-400 text-sm sm:text-base">Mint your unique digital collectible on Sui</p>
    </div>
    
    <div className="space-y-4 sm:space-y-6">
      {/* NFT Name */}
      <div className="group animate-slide-up stagger-1">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          NFT Name
        </label>
        <input
          type="text"
          placeholder="Enter NFT name"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500 text-sm sm:text-base"
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
          rows={3}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500 resize-none text-sm sm:text-base"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Image Input */}
      <div className="group animate-slide-up stagger-3">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          NFT Image
        </label>
        
        {/* Upload Option */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`w-full flex items-center justify-center px-3 sm:px-4 py-3 sm:py-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all duration-200 cursor-pointer text-sm sm:text-base ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading to IPFS...</span>
                </div>
              ) : selectedFile ? (
                <div className="flex items-center space-x-2">
                  <span>📁</span>
                  <span>{selectedFile.name}</span>
                  <span className="text-green-400">✓</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      clearSelectedFile();
                    }}
                    className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>📤</span>
                  <span>Click to upload image or drag & drop</span>
                </div>
              )}
            </label>
          </div>
          
          <p className="text-xs text-gray-500 mt-1">
            Supports JPEG, PNG, GIF up to 10MB. Will be stored on IPFS.
          </p>
        </div>

        {/* OR Divider */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-900 px-3 text-gray-500">Or use URL</span>
          </div>
        </div>

        {/* URL Option */}
        <div>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500 text-sm sm:text-base"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1 animate-fade-in">
            Direct link to your image (JPEG, PNG, GIF)
          </p>
        </div>
      </div>
    </div>

    {/* Error and Success Messages */}
    {error && (
      <div className="mt-4 sm:mt-6 bg-red-900/20 border border-red-700 rounded-xl p-3 sm:p-4 animate-slide-in-left">
        <p className="text-red-400 text-xs sm:text-sm">{error}</p>
      </div>
    )}
    
    {success && (
      <div className="mt-4 sm:mt-6 bg-green-900/20 border border-green-700 rounded-xl p-3 sm:p-4 animate-slide-in-left">
        <p className="text-green-400 text-xs sm:text-sm">{success}</p>
      </div>
    )}

    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8 animate-slide-up stagger-4">
      <button
        className={`flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover-glow text-sm sm:text-base ${
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
        className="px-4 sm:px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 hover-glow transform hover:scale-105 text-sm sm:text-base"
        onClick={previewNFT}
      >
        Preview
      </button>
    </div>

    {/* Gas Estimation */}
    {(gasEstimate || estimatingGas) && (
      <div className="mt-4 sm:mt-6 bg-gray-800/50 border border-gray-600 rounded-xl p-4 animate-slide-in-up">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">⛽</span>
          <h3 className="text-sm font-semibold text-gray-300">Gas Estimation</h3>
          {estimatingGas && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        
        {estimatingGas ? (
          <div className="text-gray-400 text-sm">Calculating gas costs...</div>
        ) : gasEstimate?.error ? (
          <div className="space-y-2">
            <div className="text-red-400 text-sm">{gasEstimate.error}</div>
            {gasEstimate.fallback && (
              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-3 mt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-400">💡</span>
                  <span className="text-yellow-400 text-sm font-medium">Estimated Cost</span>
                </div>
                <div className="text-yellow-200 text-sm">
                  Typical NFT minting cost: <span className="font-mono">~0.001-0.005 SUI</span>
                </div>
                <div className="text-yellow-300 text-xs mt-1">
                  This is a rough estimate based on similar transactions.
                </div>
              </div>
            )}
          </div>
        ) : gasEstimate && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Cost:</span>
              <span className="text-white font-mono text-sm">~{gasEstimate.totalCost.toFixed(6)} SUI</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Computation:</span>
              <span className="text-gray-400 font-mono text-xs">{gasEstimate.computationCost.toFixed(6)} SUI</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">Storage:</span>
              <span className="text-gray-400 font-mono text-xs">{gasEstimate.storageCost.toFixed(6)} SUI</span>
            </div>
            {gasEstimate.storageRebate > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">Storage Rebate:</span>
                <span className="text-green-400 font-mono text-xs">-{gasEstimate.storageRebate.toFixed(6)} SUI</span>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                💡 This is an estimate. Actual cost may vary slightly.
              </p>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

export default MintNFTForm;