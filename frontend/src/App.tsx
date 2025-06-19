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
import NetworkChecker from './components/NetworkChecker';

// Create a query client
const queryClient = new QueryClient();

// Home component
const Home: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
      {/* Animated Background Effects */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse" 
             style={{ background: 'var(--gradient-primary)' }}></div>
        <div className="absolute bottom-40 right-10 w-64 h-64 rounded-full blur-3xl animate-pulse" 
             style={{ background: 'var(--gradient-secondary)' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
            Welcome to <span className="text-gradient">Creso</span>
          </h1>
          <p className="text-2xl mb-12 max-w-4xl mx-auto font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
            The Next-Generation Web3 Dashboard. Discover, create, and trade digital assets with cutting-edge technology.
            Transform your creative vision into valuable blockchain assets!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="card text-center hover:transform hover:scale-105 cursor-pointer">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="card-title mb-3">Create Memes</h3>
              <p className="card-subtitle mb-4">Design and upload your own memes, register them with Story Protocol for IP protection</p>
              <a href="/create-meme" className="text-gradient font-semibold hover:opacity-80 transition-opacity">
                Start Creating →
              </a>
            </div>
            
            <div className="card text-center hover:transform hover:scale-105 cursor-pointer">
              <div className="text-4xl mb-4">🗳️</div>
              <h3 className="card-title mb-3">Discover</h3>
              <p className="card-subtitle mb-4">Discover trending memes and vote for your favorites in community contests</p>
              <a href="/explore-memes" className="text-gradient font-semibold hover:opacity-80 transition-opacity">
                Explore Now →
              </a>
            </div>
            
            <div className="card text-center hover:transform hover:scale-105 cursor-pointer">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="card-title mb-3">Mystery Box</h3>
              <p className="card-subtitle mb-4">Create and trade mystery boxes containing hidden digital treasures</p>
              <a href="/mystery-coins" className="text-gradient font-semibold hover:opacity-80 transition-opacity">
                Discover Boxes →
              </a>
            </div>
            
            <div className="card text-center hover:transform hover:scale-105 cursor-pointer">
              <div className="text-4xl mb-4">🪙</div>
              <h3 className="card-title mb-3">Exchange</h3>
              <p className="card-subtitle mb-4">Convert your content to CoinV4 tokens and trade them on the marketplace</p>
              <a href="/coin-exchange" className="text-gradient font-semibold hover:opacity-80 transition-opacity">
                Trade Coins →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20" style={{ background: 'var(--secondary-bg)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
              Powered by Web3 Technology
            </h2>
            <p className="text-xl max-w-3xl mx-auto font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
              Built on cutting-edge blockchain protocols to ensure true ownership, fair rewards, and decentralized governance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" 
                   style={{ background: 'var(--gradient-primary)' }}>
                <span className="text-2xl">⛓️</span>
              </div>
              <h3 className="card-title mb-3">Zora Protocol</h3>
              <p className="card-subtitle">Create and trade NFTs and CoinV4 tokens with Zora's powerful infrastructure</p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" 
                   style={{ background: 'var(--gradient-secondary)' }}>
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="card-title mb-3">Story Protocol</h3>
              <p className="card-subtitle">Protect your intellectual property with on-chain IP registration and licensing</p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" 
                   style={{ background: 'var(--gradient-primary)' }}>
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="card-title mb-3">IPFS & Pinata</h3>
              <p className="card-subtitle">Decentralized storage ensures your content is permanently accessible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20" style={{ background: 'var(--gradient-primary)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center" style={{ color: 'var(--primary-bg)' }}>
            <div>
              <div className="text-4xl font-bold mb-2 font-['Space_Grotesk']">1000+</div>
              <div className="text-lg opacity-90 font-['Inter']">Memes Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 font-['Space_Grotesk']">500+</div>
              <div className="text-lg opacity-90 font-['Inter']">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 font-['Space_Grotesk']">250+</div>
              <div className="text-lg opacity-90 font-['Inter']">Mystery Boxes</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 font-['Space_Grotesk']">100+</div>
              <div className="text-lg opacity-90 font-['Inter']">Coins Minted</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20" style={{ background: 'var(--card-bg)' }}>
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>
            Ready to Start Creating?
          </h2>
          <p className="text-xl mb-8 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
            Join the community of digital artists and meme creators building the future of content ownership
          </p>
          <div className="space-x-4">
            <a 
              href="/create-meme" 
              className="btn-primary inline-block py-4 px-8 text-lg font-['Inter']"
            >
              Create Your First Meme
            </a>
            <a 
              href="/pearl-wallet" 
              className="btn-ghost inline-block py-4 px-8 text-lg font-['Inter']"
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
          <div className="min-h-screen" style={{ background: 'var(--primary-bg)' }}>
            <Navbar />
            <NetworkChecker />
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
            <footer className="py-12" style={{ background: 'var(--card-bg)' }}>
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gradient font-['Space_Grotesk']">Creso</h3>
                    <p style={{ color: 'var(--text-secondary)' }} className="font-['Inter']">
                      The Next-Generation Web3 Dashboard transforming digital culture into valuable assets.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>Platform</h4>
                    <ul className="space-y-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                      <li><a href="/create-meme" className="hover:text-gradient transition-colors">Create Memes</a></li>
                      <li><a href="/explore-memes" className="hover:text-gradient transition-colors">Discover</a></li>
                      <li><a href="/mystery-coins" className="hover:text-gradient transition-colors">Mystery Box</a></li>
                      <li><a href="/coin-exchange" className="hover:text-gradient transition-colors">Exchange</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>Technology</h4>
                    <ul className="space-y-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                      <li>Zora Protocol</li>
                      <li>Story Protocol</li>
                      <li>IPFS Storage</li>
                      <li>Web3 Infrastructure</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-4 font-['Space_Grotesk']" style={{ color: 'var(--text-primary)' }}>Community</h4>
                    <ul className="space-y-2 font-['Inter']" style={{ color: 'var(--text-secondary)' }}>
                      <li><a href="#" className="hover:text-gradient transition-colors">Discord</a></li>
                      <li><a href="#" className="hover:text-gradient transition-colors">Twitter</a></li>
                      <li><a href="#" className="hover:text-gradient transition-colors">GitHub</a></li>
                      <li><a href="#" className="hover:text-gradient transition-colors">Documentation</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t pt-8 mt-8 text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                  <p className="font-['Inter']">© 2024 Creso. All rights reserved. Built with ❤️ for the Web3 community.</p>
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
    