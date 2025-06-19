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
        { name: 'Dashboard', href: '/' },
        { name: 'Create', href: '/create-meme' },
        { name: 'Discover', href: '/explore-memes' },
        { name: 'Mystery Box', href: '/mystery-coins' },
        { name: 'Exchange', href: '/coin-exchange' },
        { name: 'Wallet', href: '/pearl-wallet' },
      ];

      const isActive = (path: string) => {
        return location.pathname === path;
      };

      const handleConnect = () => {
        const connector = connectors[0];
        if (connector) {
          connect({ connector });
        }
      };

      const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
      };

      return (
        <nav className="sticky top-0 z-50" style={{ background: 'var(--primary-bg)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="glass-effect rounded-2xl mx-4 my-4 px-8 py-4 border border-white/10">
              <div className="flex justify-between items-center">
                {/* Logo and brand */}
                <div className="flex items-center">
                  <Link to="/" className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden"
                         style={{ background: 'var(--gradient-primary)' }}>
                      <span className="text-black font-bold text-xl font-['Space_Grotesk']">C</span>
                      <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'var(--shadow-glow)' }}></div>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-2xl font-bold text-gradient font-['Space_Grotesk']">Creso</span>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Web3 Dashboard</div>
                    </div>
                  </Link>
                </div>

                {/* Desktop navigation */}
                <div className="hidden lg:flex items-center space-x-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 font-['Inter'] ${
                        isActive(item.href)
                          ? 'text-black font-semibold'
                          : 'hover:bg-white/5'
                      }`}
                      style={{
                        background: isActive(item.href) ? 'var(--gradient-primary)' : 'transparent',
                        color: isActive(item.href) ? 'var(--primary-bg)' : 'var(--text-secondary)',
                        boxShadow: isActive(item.href) ? 'var(--shadow-glow)' : 'none'
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Right side - Wallet and Menu */}
                <div className="flex items-center space-x-4">
                  {!isConnected ? (
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="btn-primary px-6 py-2.5 text-sm font-medium font-['Inter'] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="glass-effect px-4 py-2.5 rounded-xl border border-white/20">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--neon-green)' }}></div>
                          <span className="text-sm font-medium font-['Inter']" style={{ color: 'var(--text-primary)' }}>
                            {formatAddress(address!)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => disconnect()}
                        className="btn-ghost px-4 py-2.5 text-sm font-medium font-['Inter']"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden p-2.5 rounded-xl glass-effect border border-white/10 transition-all duration-300"
                    style={{ color: 'var(--text-secondary)' }}
                    title="Toggle menu"
                  >
                    <svg
                      className="h-5 w-5"
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
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden">
              <div className="glass-effect rounded-2xl mx-4 mb-4 border border-white/10 overflow-hidden">
                <div className="px-6 py-4 space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 font-['Inter'] ${
                        isActive(item.href)
                          ? 'text-black font-semibold'
                          : 'hover:bg-white/5'
                      }`}
                      style={{
                        background: isActive(item.href) ? 'var(--gradient-primary)' : 'transparent',
                        color: isActive(item.href) ? 'var(--primary-bg)' : 'var(--text-secondary)',
                        boxShadow: isActive(item.href) ? 'var(--shadow-glow)' : 'none'
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>
      );
    };

    export default Navbar;
    