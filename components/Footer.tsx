import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from '../images/Logo2.png';
import { Github, Ticket, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block transition-transform hover:scale-105">
              <Image
                src={Logo}
                alt="Eventra Logo"
                width={120}
                height={40}
                className="w-28 h-auto brightness-0 invert"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your seamless platform for discovering, buying, and selling event tickets with real-time waiting list queues and instant checkout.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure Transactions powered by Stripe</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Discover Events
                </Link>
              </li>
              <li>
                <Link href="/seller" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Sell Tickets
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="text-slate-400 hover:text-white transition-colors duration-200">
                  My Tickets
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tech Stack */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-indigo-400" />
              Built With
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Next.js 15 & React
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Convex Real-time DB
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Clerk Authentication
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Stripe Payments & Webhooks
              </li>
            </ul>
          </div>

          {/* Column 4: GitHub & Shipped By section */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-200" />
              Project Source
            </h4>
            <p className="text-slate-400 text-sm">
              Open source ticket platform. Check out the repository on GitHub.
            </p>
            <a
              href="https://github.com/VaibHUB17/EVENTRA-saas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-all duration-200 text-sm font-medium shadow-sm group"
            >
              <Github className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>View Repository</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </a>
          </div>
        </div>

        {/* Bottom bar with Shipped By GitHub Attribution */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Eventra Ticket Platform. All rights reserved.</p>

          <a
            href="https://github.com/VaibHUB17"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg transition-all duration-300 group"
          >
            <span className="text-xs font-bold tracking-[0.25em] text-slate-400 group-hover:text-slate-200 transition-colors uppercase font-mono">
              SHIPPED BY
            </span>
            <div className="flex items-center -space-x-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://github.com/VaibHUB17.png"
                alt="VaibHUB17"
                className="w-7 h-7 rounded-full ring-2 ring-blue-500 shadow-md object-cover transform group-hover:scale-110 transition-transform duration-200 z-10"
              />
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
