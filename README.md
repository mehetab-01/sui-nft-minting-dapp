# 🚀 Sui NFT Studio - Universal NFT Minting Platform

A modern, feature-rich React dApp for minting and managing NFTs on the Sui blockchain with **configurable smart contract support**.

## 🌐 **Live Demo**

**🔗 [Try it now: https://sui-nft-minter.vercel.app](https://sui-nft-minter.vercel.app)**

Experience the universal Sui NFT minting platform live! Connect your wallet, configure your contract, and start minting NFTs on Sui testnet.

## ✨ Features

### 🎨 **Universal Contract Support**
- **Configurable Package ID** - Input any Sui NFT contract address
- **Dynamic Module Names** - Support for any module structure
- **Function Name Detection** - Auto-detect or manually set mint function names
- **Real-time Contract Validation** - Instant feedback on contract compatibility

### 🔗 **Smart Wallet Integration**
- **Multi-wallet Support** - Connect with any Sui wallet
- **Auto Mint Capability Detection** - Automatically finds admin/mint capabilities
- **Public Minting Support** - Works with contracts that don't require special permissions
- **Real-time Status Updates** - Live connection and capability status

### 🎭 **Modern UI/UX**
- **Dark Theme Design** - Sleek, professional interface
- **Comprehensive Animations** - Smooth transitions and micro-interactions
- **Responsive Layout** - Perfect on desktop, tablet, and mobile
- **Real-time Preview** - See your NFT before minting
- **Live Gallery** - Dynamic collection display

### 🛠 **Developer Features**
- **Debug Console Logging** - Comprehensive transaction and object debugging
- **Error Handling** - Detailed error messages and troubleshooting
- **Hot Reload Development** - Fast development with Vite
- **TypeScript Ready** - Full type safety support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- A Sui wallet (Sui Wallet, Ethos, etc.)
- Your deployed Sui NFT contract details

### Installation

```bash
# Clone the repository
git clone https://github.com/mehetab-01/sui-nft-minting-dapp.git
cd sui-nft-minting-dapp

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration

1. **Open the app** at `http://localhost:5173`
2. **Connect your wallet** using the connect button
3. **Configure your contract**:
   - Enter your **Package ID** (0x...)
   - Set your **Module Name** (e.g., "loyalty_card", "nft_minter")
   - Choose your **Function Name** (e.g., "mint", "mint_nft", "mint_loyalty")

### Contract Compatibility

This dApp works with contracts that have minting functions with these signatures:

```move
// Public minting (no capability required)
public fun mint(customer_id: address, image_url: String, ctx: &mut TxContext)

// Admin capability minting
public fun mint_nft(cap: &MintCap, name: String, description: String, image_url: String, recipient: address, ctx: &mut TxContext)
```

## 🎯 Supported Contract Types

- ✅ **Loyalty Card Contracts** - Customer loyalty NFTs
- ✅ **Standard NFT Collections** - Traditional NFT minting
- ✅ **Art Collections** - Artist portfolio NFTs  
- ✅ **Membership Cards** - Access token NFTs
- ✅ **Certificate Systems** - Achievement/credential NFTs
- ✅ **Custom Implementations** - Any compatible Move contract

## 📱 Usage

### 1. **Connect Wallet**
- Click "Connect Wallet" in the header
- Choose your preferred Sui wallet
- Approve the connection

### 2. **Configure Contract**
- Enter your deployed contract's Package ID
- Set the module name from your Move contract
- Select or enter the minting function name

### 3. **Mint NFTs**
- Fill in the NFT details (name, description, image URL)
- Preview your NFT before minting
- Click "Mint NFT" to create on-chain

### 4. **View Collection**
- Your minted NFTs appear in the gallery automatically
- Click refresh to update the collection
- View NFT details and transaction history

## 🛠 Development

### Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS with custom animations
- **Blockchain**: Sui TypeScript SDK + dApp Kit
- **State Management**: React hooks + TanStack Query

### Key Files
- `src/App.jsx` - Main application logic and contract integration
- `src/components/` - Reusable UI components
- `src/index.css` - Custom animations and styling
- `package.json` - Dependencies and scripts

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🚀 Deployment

### 🌐 **Live Production Deployment**

**🔗 Live App**: https://sui-nft-minter.vercel.app

This app is automatically deployed on Vercel with:
- ✅ **Production-ready** build optimization
- ✅ **Auto-deployment** from GitHub main branch
- ✅ **CDN distribution** for global performance
- ✅ **HTTPS** secure connection
- ✅ **Mobile responsive** on all devices

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel** ⭐ (Currently used): Connect GitHub repo for auto-deployment
- **Netlify**: Drag & drop the `dist` folder
- **GitHub Pages**: Use GitHub Actions for CI/CD
- **IPFS**: Decentralized hosting option

## 🔧 Reconfiguration Notes

This version includes major improvements over the original:

### ⚡ **Enhanced Features**
- **Universal contract support** instead of hardcoded addresses
- **Dynamic function detection** with common name suggestions
- **Improved error handling** with detailed debugging
- **Modern UI design** with comprehensive animations
- **Better wallet integration** with capability detection

### 🔄 **Migration from v1**
- Replace hardcoded contract addresses with configurable inputs
- Update from basic NFT structure to flexible object type detection
- Enhanced from simple minting to universal contract compatibility
- Upgraded UI from basic styling to modern design system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Sui Foundation** - For the amazing blockchain platform
- **Mysten Labs** - For the excellent developer tools
- **React Team** - For the robust frontend framework
- **TailwindCSS** - For the utility-first CSS framework

---

**Built with ❤️ for the Sui ecosystem** 🌊