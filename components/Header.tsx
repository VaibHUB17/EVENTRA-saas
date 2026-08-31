import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import Logo from '../images/Logo2.png';
import SearchBar from './SearchBar';
import { LogIn, UserPlus, PlusCircle, Ticket } from 'lucide-react';

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <Link href="/" className="font-bold shrink-0 transition-transform duration-200 hover:scale-105">
            <Image
              src={Logo}
              alt="Eventra Logo"
              width={110}
              height={40}
              className="w-24 lg:w-28 h-auto object-contain"
              priority
            />
          </Link>

          {/* Mobile Auth Actions */}
          <div className="lg:hidden flex items-center gap-2">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-800 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 shadow-sm transition-all duration-200 active:scale-95">
                    <LogIn className="w-3.5 h-3.5 text-gray-600" />
                    <span>Log In</span>
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </div>

        {/* Search Bar - Centered / Flexible */}
        <div className="w-full lg:max-w-xl">
          <SearchBar />
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link href="/seller">
                <button className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-semibold active:scale-95">
                  <PlusCircle className="w-4 h-4" />
                  <span>Sell Tickets</span>
                </button>
              </Link>
              <Link href="/tickets">
                <button className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-800 px-4 py-2 text-sm rounded-lg border border-gray-200 shadow-sm transition-all duration-200 font-semibold hover:border-gray-300 active:scale-95">
                  <Ticket className="w-4 h-4 text-blue-600" />
                  <span>My Tickets</span>
                </button>
              </Link>
              <div className="pl-1">
                <UserButton />
              </div>
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 text-sm rounded-lg border border-gray-200 shadow-sm transition-all duration-200 font-semibold hover:border-gray-300 active:scale-95">
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <span>Log In</span>
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-semibold transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

export default Header;