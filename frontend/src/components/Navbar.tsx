    // frontend/src/components/Navbar.tsx
    import React from 'react';
    import { ConnectKitButton } from 'connectkit';
    import './Navbar.css';

    const Navbar: React.FC = () => {
      return (
        <nav className="navbar">
          <div className="navbar-brand">
            <a href="/">Artifact.fun</a>
          </div>
          <div className="navbar-links">
            <a href="/create-meme">Create Meme</a>
            <a href="/explore-memes">Explore Memes</a>
            <a href="/pearl-wallet">Pearl Wallet</a>
            <a href="/coin-content">Coin Content</a> {/* For creators to coin content */}
            <a href="/explore-mystery-coins">Explore Mystery Coins</a> {/* For users to buy coined content */}
          </div>
          <div className="navbar-wallet">
            <ConnectKitButton />
          </div>
        </nav>
      );
    };

    export default Navbar;
    