'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className={`font-extrabold text-2xl tracking-tight ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
          Solscribe
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className={`text-sm font-medium hover:opacity-70 transition-opacity ${isScrolled ? 'text-slate-600' : 'text-slate-300'}`}>Features</Link>
          <Link href="#vault" className={`text-sm font-medium hover:opacity-70 transition-opacity ${isScrolled ? 'text-slate-600' : 'text-slate-300'}`}>The Vault</Link>
          <Link href="#pricing" className={`text-sm font-medium hover:opacity-70 transition-opacity ${isScrolled ? 'text-slate-600' : 'text-slate-300'}`}>Pricing</Link>
          <Link href="/explore" className={`text-sm font-medium hover:opacity-70 transition-opacity ${isScrolled ? 'text-slate-600' : 'text-slate-300'}`}>For Creators</Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Link 
            href="/login" 
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              isScrolled ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'
            }`}
          >
            Sign in
          </Link>
          <Link 
            href="/login" 
            className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full shadow-md transition-colors"
          >
            Start writing
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className={isScrolled ? 'text-slate-900' : 'text-white'} />
          ) : (
            <Menu className={isScrolled ? 'text-slate-900' : 'text-white'} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl py-4 px-6 flex flex-col space-y-4">
          <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 font-medium py-2">Features</Link>
          <Link href="#vault" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 font-medium py-2">The Vault</Link>
          <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 font-medium py-2">Pricing</Link>
          <Link href="/explore" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 font-medium py-2">For Creators</Link>
          <hr className="border-slate-100" />
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-slate-800 font-medium py-2">Sign in</Link>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="bg-indigo-600 text-white font-medium py-3 rounded-xl text-center">Start writing</Link>
        </div>
      )}
    </nav>
  );
}
