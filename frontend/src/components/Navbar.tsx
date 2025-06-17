    // frontend/src/components/Navbar.tsx
    import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Link, useLocation } from 'react-router-dom';

    const Navbar: React.FC = () => {
      const [isMenuOpen, setIsMenuOpen] = useState(false);
      const { address, isConnected, isConnecting } = useAccount();
      const { connectors, connect } = useConnect();
      const { disconnect } = useDisconnect();
      const location = useLocation();

      const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Create Meme', href: '/create-meme' },
        { name: 'Explore Memes', href: '/explore-memes' },
        { name: 'Mystery Boxes', href: '/mystery-coins' },
        { name: 'Coin Exchange', href: '/coin-exchange' },
        { name: 'Pearl Wallet', href: '/pearl-wallet' },
      ];

      const isActive = (path: string) => {
        return location.pathname === path;
      };

      const handleConnect = () => {
        // Use the first available connector (usually injected/MetaMask)
        const connector = connectors[0];
        if (connector) {
          connect({ connector });
        }
      };

      const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
      };

      return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo and brand */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">Pixel.Pearl</span>
                </Link>
              </div>

              {/* Desktop navigation */}
              <div className="hidden lg:flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-gray-700 hover:text-purple-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Wallet connection */}
              <div className="flex items-center space-x-4">
                {!isConnected ? (
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {formatAddress(address!)}
                    </div>
                    <button
                      onClick={() => disconnect()}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                )}

                            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-purple-600 hover:bg-gray-100 transition-colors"
              title="Toggle menu"
            >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-purple-600 bg-purple-50'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      );
    };

    export default Navbar;
    