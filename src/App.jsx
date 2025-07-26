import { useState, useEffect } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClientProvider, WalletProvider, ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ConnectWallet from './components/ConnectWallet';
import MintNFTForm from './components/MintNFT';
import NFTPreview from './components/NFTPreview';
import NFTGallery from './components/NFTGallery';
import './App.css';

const queryClient = new QueryClient();
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

// Network configuration for dapp-kit
const networkConfig = {
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
};

const App = () => {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [nfts, setNfts] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [estimatingGas, setEstimatingGas] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const client = suiClient;
  
  // User-configurable contract settings
  const [contractAddress, setContractAddress] = useState('0xe44dfbca16d4801977939518d43d64a1c6dc032c06ecf77f2b2df8d8dfe32880');
  const [moduleName, setModuleName] = useState('loyalty_card');
  const [functionName, setFunctionName] = useState('mint_loyalty');
  
  // Dynamic mint cap - will be found automatically for connected wallet
  const [mintCapId, setMintCapId] = useState(null);
  const [mintCapError, setMintCapError] = useState('');

  // Find mint capabilities owned by the connected wallet
  const findMintCap = async () => {
    if (!account) return;
    
    try {
      const objects = await client.getOwnedObjects({
        owner: account.address,
        options: { showContent: true, showType: true },
      });
      
      // Look for mint capability objects - Your contract doesn't need AdminCap for minting
      const mintCaps = objects.data.filter((obj) => 
        obj.data?.type?.includes('AdminCap') ||
        obj.data?.type?.includes('MintCap') || 
        obj.data?.type?.includes('mint_cap') ||
        obj.data?.type?.includes(moduleName)
      );
      
      if (mintCaps.length > 0) {
        setMintCapId(mintCaps[0].data.objectId);
        setMintCapError('');
        console.log('Found admin capability:', mintCaps[0].data.objectId);
      } else {
        // For your contract, minting doesn't require AdminCap, so this is just informational
        setMintCapError('No admin capability found. Your contract allows public minting without admin rights.');
        console.log('No admin capabilities found for wallet:', account.address);
      }
    } catch (err) {
      setMintCapError('Failed to search for mint capabilities: ' + err.message);
      console.error('Error finding mint cap:', err);
    }
  };

  // Fetch NFTs for the connected wallet
  const fetchNfts = async () => {
    if (!account) return;
    setLoading(true);
    try {
      console.log('Fetching NFTs for:', account.address);
      console.log('Contract Address:', contractAddress);
      console.log('Module Name:', moduleName);
      
      const objects = await client.getOwnedObjects({
        owner: account.address,
        options: { showContent: true, showType: true },
      });
      
      console.log('All owned objects:', objects.data);
      
      // Check for both NFT and Loyalty types
      const expectedType1 = `${contractAddress}::${moduleName}::Loyalty`;
      const expectedType2 = `${contractAddress}::${moduleName}::NFT`;
      
      console.log('Looking for types:', expectedType1, 'OR', expectedType2);
      
      const loyaltyCards = objects.data.filter((obj) => {
        const objType = obj.data?.type;
        console.log('Object type found:', objType);
        return objType === expectedType1 || objType === expectedType2;
      });
      
      console.log('Filtered loyalty cards/NFTs:', loyaltyCards);
      
      const nfts = loyaltyCards.map((obj) => {
        console.log('Processing object:', obj);
        return {
          id: obj.data.objectId,
          name: obj.data.content?.fields?.name || `Loyalty Card #${obj.data.objectId.slice(-6)}`,
          description: obj.data.content?.fields?.description || `Customer: ${obj.data.content?.fields?.customer_id || 'Unknown'}`,
          img_url: obj.data.content?.fields?.img_url || obj.data.content?.fields?.image_url,
        };
      });
      
      console.log('Final processed NFTs:', nfts);
      setNfts(nfts);
      setError('');
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Failed to fetch NFTs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to IPFS
  const uploadImageToIPFS = async (file) => {
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Using Pinata API for IPFS upload (free tier)
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT || 'demo_key'}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        // Fallback to web3.storage or alternative service
        return uploadToWeb3Storage(file);
      }
      
      const result = await response.json();
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
      
      setImgUrl(ipfsUrl);
      setSuccess('Image uploaded successfully to IPFS!');
      return ipfsUrl;
    } catch (err) {
      console.error('IPFS upload error:', err);
      // Fallback to alternative service
      return uploadToWeb3Storage(file);
    } finally {
      setUploading(false);
    }
  };

  // Fallback upload to web3.storage
  const uploadToWeb3Storage = async (file) => {
    try {
      // Alternative: use a public IPFS gateway or local storage for demo
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setImgUrl(dataUrl);
        setSuccess('Image loaded successfully! (Using local preview)');
      };
      reader.readAsDataURL(file);
      return true;
    } catch (err) {
      setError('Failed to process image. Please try with an image URL.');
      return false;
    }
  };

  // Handle file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    
    // If no file (clearing), reset states
    if (!file) {
      setSelectedFile(null);
      setImgUrl('');
      setError('');
      setSuccess('');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    await uploadImageToIPFS(file);
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    setImgUrl('');
    setError('');
    setSuccess('');
    // Clear the file input
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  // Check if image URL is already minted
  const checkUrl = async () => {
    try {
      // Skip URL checking for now to avoid potential issues
      // You can implement this later with proper devInspect call
      console.log('Skipping URL check for debugging');
      return false;
    } catch (err) {
      console.error('URL check error:', err);
      return false;
    }
  };

  // Mint a new NFT
  const mintNFT = async () => {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }
    if (!imgUrl) {
      setError('Please provide an image URL');
      return;
    }
    if (!imgUrl.startsWith('http')) {
      setError('Please provide a valid image URL (starting with http)');
      return;
    }
    if (await checkUrl()) {
      setError('This image URL is already minted');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${contractAddress}::${moduleName}::${functionName}`,
        arguments: [
          tx.pure.address(account.address), // customer_id
          tx.pure.string(imgUrl), // image_url
        ],
      });
      
      // Set gas budget to help with transaction execution
      tx.setGasBudget(10000000); // 0.01 SUI
      
      console.log('Submitting transaction with mint cap:', mintCapId);
      
      signAndExecuteTransaction(
        {
          transaction: tx,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
          },
        },
        {
          onSuccess: (result) => {
            console.log('Transaction successful:', result);
            setSuccess(`NFT minted successfully! Transaction: ${result.digest}`);
            fetchNfts();
            setLoading(false);
          },
          onError: (err) => {
            console.error('Transaction failed:', err);
            // More detailed error messaging
            let errorMessage = 'Unknown error occurred';
            if (err.message) {
              errorMessage = err.message;
            } else if (err.toString) {
              errorMessage = err.toString();
            }
            setError(`Minting failed: ${errorMessage}`);
            setLoading(false);
          },
        }
      );
    } catch (err) {
      setError('Minting failed: ' + err.message);
      setLoading(false);
    }
  };

  // Estimate gas for minting transaction
  const estimateGas = async () => {
    console.log('Starting gas estimation...');
    console.log('Account:', account?.address);
    console.log('Mint Cap ID:', mintCapId);
    
    if (!account) {
      setGasEstimate({ 
        error: 'Connect your wallet first to estimate gas costs',
        fallback: true 
      });
      return null;
    }

    if (!mintCapId) {
      setGasEstimate({ 
        error: 'No mint capability found for your wallet',
        fallback: true 
      });
      return null;
    }

    try {
      setEstimatingGas(true);
      
      const transaction = new Transaction();
      const imageUrl = selectedFile ? `ipfs://sample-hash` : (imgUrl || "https://example.com/image.jpg");
      
      console.log('Building transaction with:', {
        package: contractAddress,
        module: moduleName,
        function: functionName,
        mintCapId,
        imageUrl
      });

      transaction.moveCall({
        package: contractAddress,
        module: moduleName,
        function: functionName,
        arguments: [
          transaction.object(mintCapId),
          transaction.pure.string(name || "Sample NFT"),
          transaction.pure.string(description || "Sample Description"),
          transaction.pure.string(imageUrl),
        ],
      });

      // Set sender for the transaction
      transaction.setSender(account.address);

      // Build transaction
      const builtTransaction = await transaction.build({ 
        client,
        onlyTransactionKind: false 
      });

      console.log('Built transaction, running dry run...');

      // Dry run to get gas estimation
      const dryRun = await client.dryRunTransactionBlock({
        transactionBlock: builtTransaction,
      });

      console.log('Dry run result:', dryRun);

      if (dryRun.effects.status.status === 'success') {
        const gasUsed = dryRun.effects.gasUsed;
        const computationCost = parseInt(gasUsed.computationCost) || 0;
        const storageCost = parseInt(gasUsed.storageCost) || 0;
        const storageRebate = parseInt(gasUsed.storageRebate || 0);
        
        const totalGas = computationCost + storageCost - storageRebate;
        
        // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
        const gasCostInSui = totalGas / 1000000000;
        
        console.log('Gas estimation successful:', {
          totalGas,
          gasCostInSui,
          computationCost,
          storageCost,
          storageRebate
        });

        setGasEstimate({
          totalCost: gasCostInSui,
          computationCost: computationCost / 1000000000,
          storageCost: storageCost / 1000000000,
          storageRebate: storageRebate / 1000000000
        });
      } else {
        console.error('Gas estimation failed:', dryRun.effects.status);
        const errorMsg = dryRun.effects.status.error || 'Transaction simulation failed';
        setGasEstimate({ 
          error: `Simulation failed: ${errorMsg}`,
          fallback: true 
        });
      }
    } catch (error) {
      console.error('Error estimating gas:', error);
      
      // Provide fallback estimate with better error handling
      setGasEstimate({ 
        error: 'Unable to get exact estimate. Using typical costs.',
        fallback: true
      });
    } finally {
      setEstimatingGas(false);
    }
  };

  // Preview NFT with gas estimation
  const previewNFT = async () => {
    const finalImageUrl = selectedFile ? URL.createObjectURL(selectedFile) : imgUrl;
    
    if (!name || !description || !finalImageUrl) {
      setError('Please fill in all fields to preview');
      return;
    }
    
    setPreview({ name, description, img_url: finalImageUrl });
    setError('');
    
    // Debug information
    console.log('Preview - Account:', account?.address);
    console.log('Preview - Mint Cap ID:', mintCapId);
    console.log('Preview - Contract:', contractAddress, moduleName, functionName);
    
    // Estimate gas cost
    await estimateGas();
  };

  useEffect(() => {
    if (account) {
      findMintCap();
      fetchNfts();
    } else {
      setMintCapId(null);
      setMintCapError('');
    }
  }, [account, contractAddress, moduleName, functionName]);

  return (
    <div className="min-h-screen bg-black relative">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>

      {/* Header */}
      <header className="relative z-[9990] border-b border-gray-800/50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4 animate-slide-in-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover-glow animate-pulse-custom">
                <img src="/favicon.ico" alt="Sui NFT Studio" className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">
                  Sui NFT Studio
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">Professional NFT Creation Platform</p>
              </div>
            </div>
            <div className="animate-slide-in-right">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
        {account && (
          <div className="mb-6 sm:mb-8 bg-gray-900/50 border border-gray-700 rounded-2xl p-4 sm:p-6 backdrop-blur-sm animate-slide-up hover-lift">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-custom"></div>
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">Wallet Connected</p>
                  <p className="text-gray-400 text-xs sm:text-sm font-mono">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                {mintCapId ? (
                  <div>
                    <p className="text-green-400 text-sm font-medium">✓ Admin Cap Found</p>
                    <p className="text-gray-500 text-xs font-mono">{mintCapId.slice(0, 6)}...{mintCapId.slice(-4)}</p>
                  </div>
                ) : mintCapError ? (
                  <div>
                    <p className="text-blue-400 text-sm font-medium">ℹ Public Minting</p>
                    <p className="text-gray-500 text-xs">No admin cap needed</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-yellow-400 text-sm font-medium">⟳ Searching...</p>
                  </div>
                )}
              </div>
            </div>
            {mintCapError && (
              <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700 rounded-lg">
                <p className="text-amber-300 text-sm">{mintCapError}</p>
              </div>
            )}
          </div>
        )}

        {/* Contract Configuration */}
        <div className="mb-6 sm:mb-8 bg-gray-900/60 border border-gray-700 rounded-3xl p-6 sm:p-8 backdrop-blur-lg shadow-2xl animate-fade-in hover-lift">
          <div className="mb-4 sm:mb-6 animate-slide-down">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Contract Configuration</h3>
            <p className="text-gray-400 text-sm sm:text-base">Configure the smart contract details for minting</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 animate-slide-in-left stagger-1">
              <label className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Package ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="Enter package ID (0x...)"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover-lift"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(contractAddress)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors text-sm"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
            
            <div className="space-y-3 animate-slide-in-right stagger-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Module Name</label>
              <input
                type="text"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Enter module name"
                className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover-lift"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-4 sm:mt-6">
            <div className="space-y-3 animate-slide-in-left stagger-3">
              <label className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">Function Name</label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  placeholder="Enter function name"
                  className="flex-1 bg-gray-800/50 border border-gray-600 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover-lift"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFunctionName('mint_loyalty')}
                    className="px-2 sm:px-3 py-1 sm:py-2 bg-yellow-600/20 border border-yellow-600 text-yellow-400 text-xs rounded-lg hover:bg-yellow-600/30 transition-colors"
                  >
                    mint_loyalty
                  </button>
                  <button
                    onClick={() => setFunctionName('mint')}
                    className="px-2 sm:px-3 py-1 sm:py-2 bg-green-600/20 border border-green-600 text-green-400 text-xs rounded-lg hover:bg-green-600/30 transition-colors"
                  >
                    mint
                  </button>
                  <button
                    onClick={() => setFunctionName('mint_nft')}
                    className="px-2 sm:px-3 py-1 sm:py-2 bg-blue-600/20 border border-blue-600 text-blue-400 text-xs rounded-lg hover:bg-blue-600/30 transition-colors"
                  >
                    mint_nft
                  </button>
                  <button
                    onClick={() => setFunctionName('create_nft')}
                    className="px-2 sm:px-3 py-1 sm:py-2 bg-purple-600/20 border border-purple-600 text-purple-400 text-xs rounded-lg hover:bg-purple-600/30 transition-colors"
                  >
                    create_nft
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">Common function names. Try 'mint' if 'mint_nft' doesn't work.</p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse-custom"></div>
              <span className="text-orange-400 font-semibold text-sm">Sui Testnet</span>
            </div>
            <button
              onClick={() => {
                if (account) {
                  findMintCap();
                  fetchNfts();
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main form */}
          <div className="lg:col-span-8 animate-slide-in-left stagger-1">
            <MintNFTForm
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              imgUrl={imgUrl}
              setImgUrl={setImgUrl}
              selectedFile={selectedFile}
              uploading={uploading}
              handleFileSelect={handleFileSelect}
              clearSelectedFile={clearSelectedFile}
              mintNFT={mintNFT}
              previewNFT={previewNFT}
              loading={loading}
              error={error}
              success={success}
              gasEstimate={gasEstimate}
              estimatingGas={estimatingGas}
            />
          </div>

          {/* Preview panel */}
          <div className="lg:col-span-4 animate-slide-in-right stagger-2">
            {preview && <NFTPreview preview={preview} />}
          </div>
        </div>

        {/* NFT Gallery - Always visible */}
        <div className="mt-8 sm:mt-12 animate-slide-up stagger-3">
          <NFTGallery nfts={nfts} loading={loading} account={account} onRefresh={fetchNfts} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Powered by <span className="text-white font-medium">Sui Network</span>
            </p>
            <p className="text-gray-500 text-xs">
              Created by{' '}
              <a 
                href="https://github.com/mehetab-01" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors hover:underline"
              >
                @mehetab-01
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default () => (
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
      <WalletProvider>
        <App />
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);