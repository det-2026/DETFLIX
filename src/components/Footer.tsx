import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { settings, setIsAdminOpen, setSelectedCategory } = useApp();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Footer Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white font-black px-2 py-0.5 rounded text-lg tracking-tighter">
                DET
              </div>
              <span className="text-xl font-extrabold text-white">FLIX</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Your ultimate movie and drama series destination. Enjoy HD trailers, direct Telegram download links, and VIP exclusive drama series.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Categories</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => setSelectedCategory('movie')} className="hover:text-white">Movies</button></li>
              <li><button onClick={() => setSelectedCategory('drama')} className="hover:text-white">Drama Series</button></li>
              <li><button onClick={() => setSelectedCategory('web-series')} className="hover:text-white">Web Series</button></li>
              <li><button onClick={() => setSelectedCategory('anime')} className="hover:text-white">Anime</button></li>
            </ul>
          </div>

          {/* Quick Features */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Features</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => setIsAdminOpen(true)} className="hover:text-white">Admin Movie Manager</button></li>
              <li><a href={settings.telegramChannelUrl} target="_blank" rel="noreferrer" className="hover:text-sky-400">Telegram Channel</a></li>
            </ul>
          </div>

          {/* Legal / Notice */}
          <div className="space-y-2 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Disclaimer</h4>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              DETFLIX does not host files on its servers. All trailers and media details are linked through public media services and official Telegram channels.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
          <span>© {new Date().getFullYear()} DETFLIX. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built for Movies & Drama lovers
          </span>
        </div>

      </div>
    </footer>
  );
};
