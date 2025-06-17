    // frontend/src/App.tsx
   
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import configuration
import { config } from './utils/web3-config';

// Import components
import Navbar from './components/Navbar';
import CreateMeme from './components/CreateMeme';
import ExploreMemes from './components/ExploreMemes';
import ExploreMysteryCoins from './components/ExploreMysteryCoins';
import CoinContent from './components/CoinContent';
import PearlWallet from './components/PearlWallet';
import MysteriousBox from './components/MysteriousBox';

// Create a query client
const queryClient = new QueryClient();

// Home component
const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-6">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Pixel.Pearl</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
                          The Web3 Meme Trendsetter Platform. Discover, create, and trade digital pixels as NFTs and pearls. 
            Transform viral memes into valuable digital assets!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Create Memes</h3>
              <p className="text-gray-600 mb-4">Design and upload your own memes, register them with Story Protocol for IP protection</p>
              <a href="/create-meme" className="text-purple-600 font-semibold hover:text-purple-700">
                Start Creating →
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🗳️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Vote & Explore</h3>
              <p className="text-gray-600 mb-4">Discover trending memes and vote for your favorites in community contests</p>
              <a href="/explore-memes" className="text-purple-600 font-semibold hover:text-purple-700">
                Explore Now →
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Mystery Boxes</h3>
              <p className="text-gray-600 mb-4">Create and trade mystery boxes containing hidden digital treasures</p>
              <a href="/mystery-coins" className="text-purple-600 font-semibold hover:text-purple-700">
                Discover Boxes →
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">🪙</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Trade Coins</h3>
              <p className="text-gray-600 mb-4">Convert your content to CoinV4 tokens and trade them on the marketplace</p>
              <a href="/coin-exchange" className="text-purple-600 font-semibold hover:text-purple-700">
                Trade Coins →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Powered by Web3 Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on cutting-edge blockchain protocols to ensure true ownership, fair rewards, and decentralized governance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⛓️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Zora Protocol</h3>
              <p className="text-gray-600">Create and trade NFTs and CoinV4 tokens with Zora's powerful infrastructure</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Story Protocol</h3>
              <p className="text-gray-600">Protect your intellectual property with on-chain IP registration and licensing</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">IPFS & Pinata</h3>
              <p className="text-gray-600">Decentralized storage ensures your content is permanently accessible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-lg opacity-90">Memes Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-lg opacity-90">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">250+</div>
              <div className="text-lg opacity-90">Mystery Boxes</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-lg opacity-90">Coins Minted</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Creating?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the community of digital artists and meme creators building the future of content ownership
          </p>
          <div className="space-x-4">
            <a 
              href="/create-meme" 
              className="inline-block bg-purple-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors"
            >
              Create Your First Meme
            </a>
            <a 
              href="/pearl-wallet" 
              className="inline-block bg-transparent border-2 border-white text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              Get PEARL Tokens
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create-meme" element={<CreateMeme />} />
                <Route path="/explore-memes" element={<ExploreMemes />} />
                <Route path="/mystery-coins" element={<ExploreMysteryCoins />} />
                <Route path="/coin-exchange" element={<CoinContent />} />
                <Route path="/pearl-wallet" element={<PearlWallet />} />
                <Route path="/mystery-box" element={<MysteriousBox />} />
                {/* Catch all route - redirect to home */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            
            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Pixel.Pearl</h3>
                    <p className="text-gray-300">
                      The Web3 Meme Trendsetter Platform transforming digital culture into valuable assets.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Platform</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li><a href="/create-meme" className="hover:text-white">Create Memes</a></li>
                      <li><a href="/explore-memes" className="hover:text-white">Explore</a></li>
                      <li><a href="/mystery-coins" className="hover:text-white">Mystery Boxes</a></li>
                      <li><a href="/coin-exchange" className="hover:text-white">Trade Coins</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Tools</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li><a href="/pearl-wallet" className="hover:text-white">Pearl Wallet</a></li>
                      <li><a href="#" className="hover:text-white">Documentation</a></li>
                      <li><a href="#" className="hover:text-white">API</a></li>
                      <li><a href="#" className="hover:text-white">Support</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Community</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li><a href="#" className="hover:text-white">Discord</a></li>
                      <li><a href="#" className="hover:text-white">Twitter</a></li>
                      <li><a href="#" className="hover:text-white">GitHub</a></li>
                      <li><a href="#" className="hover:text-white">Blog</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                  <p>&copy; 2024 Pixel.Pearl. Built with ❤️ for the Web3 community.</p>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
    