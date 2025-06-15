    // frontend/src/App.tsx
    import React from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import { WagmiProvider, createConfig, http } from 'wagmi';
    import { ConnectKitProvider, getDefaultConfig } from 'connectkit';

    import Navbar from './components/Navbar';
    import CreateMeme from './components/CreateMeme';
    import ExploreMemes from './components/ExploreMemes';
    import PearlWallet from './components/PearlWallet';
    import CoinContent from './components/CoinContent';
    import ExploreMysteryCoins from './components/ExploreMysteryCoins';

    import { zoraSepolia } from './utils/zora-config';

    const config = getDefaultConfig({
      // Your dApps chains
      chains: [zoraSepolia],
      transports: {
        [zoraSepolia.id]: http(zoraSepolia.rpcUrls.default.http[0]),
      },

      // Required API Keys
      walletConnectProjectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',

      // Required App Info
      appName: "Artifact.fun",
      appDescription: "Decentralized Meme Contest Platform",
      appUrl: "https://artifact.fun",
      appIcon: "https://artifact.fun/logo.png",
    });

    function App() {
      return (
        <WagmiProvider config={config}>
          <ConnectKitProvider>
            <Router>
              <Navbar />
              <div className="container">
                <Routes>
                  <Route path="/create-meme" element={<CreateMeme />} />
                  <Route path="/explore-memes" element={<ExploreMemes />} />
                  <Route path="/pearl-wallet" element={<PearlWallet />} />
                  <Route path="/coin-content" element={<CoinContent />} />
                  <Route path="/explore-mystery-coins" element={<ExploreMysteryCoins />} />
                  <Route path="/" element={<ExploreMemes />} />
                </Routes>
              </div>
            </Router>
          </ConnectKitProvider>
        </WagmiProvider>
      );
    }

    export default App;
    