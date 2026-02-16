import { useState, useEffect } from 'react';
import { useConversionStats } from '../contexts/ConversionContext';
import { TokenManager, logout, isAuthenticated } from '../services/api';
import Footer from '../components/Footer';
import QuickConverter from '../components/QuickConverter';


export default function Home() {
  const { stats, resetStats } = useConversionStats();
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const [quickFile, setQuickFile] = useState<File | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication status
    const authenticated = isAuthenticated();
    setIsUserAuthenticated(authenticated);
    
    if (authenticated) {
      // Get user from token manager if authenticated
      const userData = TokenManager.getUser();
      if (userData) {
        setUser(userData);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsUserAuthenticated(false);
  };

  const handleSignIn = () => {
    setShowLogin(true);
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    setShowLogin(false);
    setShowAuthModal(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { login } = await import('../services/api');
      await login(email, password);
      const userData = TokenManager.getUser();
      setUser(userData);
      setIsUserAuthenticated(true);
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { register } = await import('../services/api');
      await register(email, password, name);
      const userData = TokenManager.getUser();
      setUser(userData);
      setIsUserAuthenticated(true);
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFileSelect = (file: File | null) => {
    setQuickFile(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="glass backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Innovative Excel Logo */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg hover-lift relative overflow-hidden group">
                {/* Grid pattern background */}
                <div className="absolute inset-0 opacity-30">
                  <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="border border-white/40"></div>
                    ))}
                  </div>
                </div>
                {/* Transform arrow icon */}
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17V7m0 10l-3-3m3 3l3-3M15 7v10m0-10l3 3m-3-3l-3 3" />
                </svg>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 bg-clip-text text-transparent">
                  Doc<span className="hidden xs:inline">ument</span> to Excel
                </h1>
                {isUserAuthenticated && user && (
                  <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-none">Welcome, {user.name || user.email}!</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
              
              {isUserAuthenticated ? (
                <>
                  {/* Reset Stats Button (for testing) */}
                  <button
                    onClick={resetStats}
                    className="hidden sm:block px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-white/50 transition-all duration-300"
                    title="Reset Statistics"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-lg sm:rounded-xl hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSignIn}
                    className="px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-base text-gray-700 hover:text-gray-900 font-medium border border-gray-300 rounded-lg sm:rounded-xl hover:bg-white/50 transition-all duration-300 backdrop-blur-sm"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 text-white font-medium rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Section */}
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6">
            {isUserAuthenticated ? 'Choose Your Conversion Tool' : 'Convert Documents to Excel'}
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {isUserAuthenticated 
              ? 'Select a module below to start converting your documents to Excel format with cutting-edge AI technology.'
              : 'Transform your invoices and HR documents into organized Excel spreadsheets with cutting-edge AI technology.'
            }
          </p>
        </div>

        {/* Stats Cards - Only show if authenticated */}
        {isUserAuthenticated && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-8 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Conversions</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stats.totalConversions}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-success-gradient rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-8 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Files Processed</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      {stats.filesProcessed}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-warning-gradient rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-8 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Success Rate</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {stats.successRate}%
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-secondary-gradient rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Successful Conversions</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {stats.successfulConversions}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-6 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Failed Conversions</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      {stats.failedConversions}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Converter */}
        <QuickConverter 
          onFileSelect={handleQuickFileSelect}
          selectedFile={quickFile}
        />

        {/* Why Choose Us Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">Why Choose Document to Excel?</h3>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our AI-powered platform delivers the most accurate and fastest document conversion available
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 - AI Powered */}
            <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">AI-Powered OCR</h4>
              <p className="text-gray-600">Advanced AWS Textract technology extracts data with 99%+ accuracy from any document</p>
            </div>

            {/* Feature 2 - Fast Processing */}
            <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h4>
              <p className="text-gray-600">Convert documents in seconds, not minutes. Our optimized pipeline ensures rapid results</p>
            </div>

            {/* Feature 3 - Secure */}
            <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Bank-Level Security</h4>
              <p className="text-gray-600">Your files are encrypted and automatically deleted after processing. GDPR compliant</p>
            </div>

            {/* Feature 4 - Formats */}
            <div className="glass backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center hover-lift group">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">50+ Formats</h4>
              <p className="text-gray-600">Support for PDF, Word, Images, Spreadsheets, and many more file formats</p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">How It Works</h3>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Three simple steps to convert your documents to perfectly formatted Excel spreadsheets
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 rounded-full"></div>
            
            {/* Step 1 */}
            <div className="relative glass backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center hover-lift">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white">
                1
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 mt-4">
                <span className="text-5xl">📤</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Upload Document</h4>
              <p className="text-gray-600">Drag and drop or select your PDF, image, or document file. Supports up to 50MB</p>
            </div>

            {/* Step 2 */}
            <div className="relative glass backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center hover-lift">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white">
                2
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-6 mt-4">
                <span className="text-5xl">🤖</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">AI Processing</h4>
              <p className="text-gray-600">Our AI analyzes and extracts all tables, text, and data with intelligent structure detection</p>
            </div>

            {/* Step 3 */}
            <div className="relative glass backdrop-blur-md rounded-3xl border border-white/20 p-8 text-center hover-lift">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-4 border-white">
                3
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 mt-4">
                <span className="text-5xl">📊</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Download Excel</h4>
              <p className="text-gray-600">Get your perfectly formatted Excel file instantly. Ready to use with all data preserved</p>
            </div>
          </div>
        </div>

        {/* Supported Formats Showcase */}
        <div className="mb-16 glass backdrop-blur-md rounded-3xl border border-white/20 p-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Supported File Formats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {['PDF', 'DOC', 'DOCX', 'JPG', 'PNG', 'XLS', 'XLSX', 'CSV', 'TXT', 'RTF', 'HTML', 'XML', 'JSON', 'TIFF', 'BMP', 'SVG'].map((format) => (
              <div key={format} className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:scale-105 transition-transform duration-200">
                <div className="w-3 h-3 bg-green-500 rounded-full mb-2 animate-pulse"></div>
                <span className="font-bold text-green-800">{format}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-6">...and 30+ more formats supported</p>
        </div>

        {/* Help Section */}
        <div className="bg-primary-gradient rounded-3xl p-12 text-center text-white shadow-2xl">
          <h3 className="text-3xl font-bold mb-6">Need Help Getting Started?</h3>
          <p className="text-white/90 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
            Our AI-powered conversion tools make it easy to transform your documents. 
            Simply upload your file, and we'll handle the rest with cutting-edge technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:scale-105">
              View Tutorial
            </button>
            <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              Contact Support
            </button>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {showLogin ? 'Sign In' : 'Sign Up'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  showLogin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  !showLogin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={showLogin ? handleLogin : handleSignup} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              {!showLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={showLogin ? "Enter your password" : "Create a password"}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-gradient hover:opacity-90 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (showLogin ? 'Signing In...' : 'Creating Account...') : (showLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}