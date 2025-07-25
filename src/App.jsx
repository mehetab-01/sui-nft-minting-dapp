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
  const [preview, setPreview] = useState(null);
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

  // Update page title based on app state
  useEffect(() => {
    if (account && nfts.length > 0) {
      document.title = `Sui NFT Studio - ${nfts.length} NFT${nfts.length !== 1 ? 's' : ''} Minted`;
    } else if (account) {
      document.title = 'Sui NFT Studio - Wallet Connected';
    } else {
      document.title = 'Sui NFT Studio - Universal NFT Minting Platform';
    }
  }, [account, nfts.length]);

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

  // Preview NFT
  const previewNFT = () => {
    if (!name || !description || !imgUrl) {
      setError('Please fill in all fields to preview');
      return;
    }
    if (!imgUrl.startsWith('http')) {
      setError('Please provide a valid image URL (starting with http)');
      return;
    }
    setPreview({ name, description, img_url: imgUrl });
    setError('');
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 animate-slide-in-left">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover-glow animate-pulse-custom p-2">
                <img 
                  src="/favicon.ico.ico" 
                  alt="Sui NFT Studio" 
                  className="w-full h-full object-contain filter brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Sui NFT Studio
                </h1>
                <p className="text-gray-400 text-sm">Professional NFT Creation Platform</p>
              </div>
            </div>
            <div className="animate-slide-in-right">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-20 max-w-7xl mx-auto px-6 py-8 animate-fade-in">
        {account && (
          <div className="mb-8 bg-gray-900/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm animate-slide-up hover-lift">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-custom"></div>
                <div>
                  <p className="text-white font-medium">Wallet Connected</p>
                  <p className="text-gray-400 text-sm font-mono">
                    {account.address.slice(0, 8)}...{account.address.slice(-6)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {mintCapId ? (
                  <div>
                    <p className="text-green-400 text-sm font-medium">✓ Admin Cap Found</p>
                    <p className="text-gray-500 text-xs font-mono">{mintCapId.slice(0, 8)}...{mintCapId.slice(-6)}</p>
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
        <div className="mb-8 bg-gray-900/60 border border-gray-700 rounded-3xl p-8 backdrop-blur-lg shadow-2xl animate-fade-in hover-lift">
          <div className="mb-6 animate-slide-down">
            <h3 className="text-2xl font-bold text-white mb-3">Contract Configuration</h3>
            <p className="text-gray-400">Configure the smart contract details for minting</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 animate-slide-in-left stagger-1">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Package ID</label>
              <div className="relative">
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="Enter package ID (0x...)"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover-lift"
                />
                <button 
                  onClick={() => navigator.clipboard.writeText(contractAddress)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                  title="Copy to clipboard"
                >
                  📋
                </button>
              </div>
            </div>
            
            <div className="space-y-3 animate-slide-in-right stagger-2">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Module Name</label>
              <input
                type="text"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Enter module name"
                className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover-lift"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
            <div className="space-y-3 animate-slide-in-left stagger-3">
              <label className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Function Name</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  placeholder="Enter function name"
                  className="flex-1 bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover-lift"
                />
                <button
                  onClick={() => setFunctionName('mint_loyalty')}
                  className="px-3 py-2 bg-yellow-600/20 border border-yellow-600 text-yellow-400 text-xs rounded-lg hover:bg-yellow-600/30 transition-colors"
                >
                  mint_loyalty
                </button>
                <button
                  onClick={() => setFunctionName('mint')}
                  className="px-3 py-2 bg-green-600/20 border border-green-600 text-green-400 text-xs rounded-lg hover:bg-green-600/30 transition-colors"
                >
                  mint
                </button>
                <button
                  onClick={() => setFunctionName('mint_nft')}
                  className="px-3 py-2 bg-blue-600/20 border border-blue-600 text-blue-400 text-xs rounded-lg hover:bg-blue-600/30 transition-colors"
                >
                  mint_nft
                </button>
                <button
                  onClick={() => setFunctionName('create_nft')}
                  className="px-3 py-2 bg-purple-600/20 border border-purple-600 text-purple-400 text-xs rounded-lg hover:bg-purple-600/30 transition-colors"
                >
                  create_nft
                </button>
              </div>
              <p className="text-xs text-gray-500">Common function names. Try 'mint' if 'mint_nft' doesn't work.</p>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse-custom"></div>
              <span className="text-orange-400 font-semibold">Sui Testnet</span>
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

        <div className="grid grid-cols-12 gap-8">
          {/* Main form */}
          <div className="col-span-12 lg:col-span-8 animate-slide-in-left stagger-1">
            <MintNFTForm
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              imgUrl={imgUrl}
              setImgUrl={setImgUrl}
              mintNFT={mintNFT}
              previewNFT={previewNFT}
              loading={loading}
              error={error}
              success={success}
            />
          </div>

          {/* Preview panel */}
          <div className="col-span-12 lg:col-span-4 animate-slide-in-right stagger-2">
            {preview && <NFTPreview preview={preview} />}
          </div>
        </div>

        {/* NFT Gallery - Always visible */}
        <div className="mt-12 animate-slide-up stagger-3">
          <NFTGallery nfts={nfts} loading={loading} account={account} onRefresh={fetchNfts} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Powered by <span className="text-white font-medium">Sui Network</span>
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