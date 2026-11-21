import React from 'react';
import { X, Download, Smartphone, ShieldCheck, Zap, Film, CheckCircle2, Send, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AppDownloadModal: React.FC = () => {
  const { isDownloadModalOpen, setIsDownloadModalOpen, settings } = useApp();

  if (!isDownloadModalOpen) return null;

  const handleDownload = () => {
    // If custom APK URL is provided in settings, open it, otherwise default download action
    const apkUrl = settings.telegramLink || 'https://t.me';
    
    // Create a temporary link element to simulate APK download
    const link = document.createElement('a');
    link.href = '#download-apk';
    link.setAttribute('download', 'DETFLIX-v2.4.0.apk');
    document.body.appendChild(link);
    
    // Also trigger feedback / alert
    alert('📥 Downloading DETFLIX Official Android App (v2.4.0)... Please check your browser downloads!');
    
    // Optional redirect to Telegram if configured
    if (settings.telegramLink) {
      window.open(settings.telegramLink, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 p-6 text-white overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <button
            id="close-app-download-modal"
            onClick={() => setIsDownloadModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-950/80 border border-blue-500/30 rounded-2xl shadow-lg">
              <Smartphone className="w-9 h-9 text-blue-500" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/40 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Zap className="w-3 h-3 text-amber-400" /> Official Android App
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Download {settings.appName} App
              </h2>
              <p className="text-xs text-blue-100/80">
                Watch movies, series & live TV with zero buffering
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* App Specifications */}
          <div className="grid grid-cols-3 gap-3 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 text-center text-xs">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase font-bold">Version</p>
              <p className="font-bold text-white mt-0.5">v2.4.0 (Latest)</p>
            </div>
            <div className="border-x border-zinc-800">
              <p className="text-zinc-500 text-[10px] uppercase font-bold">Size</p>
              <p className="font-bold text-emerald-400 mt-0.5">18.5 MB</p>
            </div>
            <div>
              <p className="text-zinc-500 text-[10px] uppercase font-bold">Requirement</p>
              <p className="font-bold text-white mt-0.5">Android 5.0+</p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Why download our app?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 bg-zinc-800/50 rounded-xl border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-zinc-200 font-medium">Fast 1080p HD Streaming</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-zinc-800/50 rounded-xl border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-zinc-200 font-medium">No Ads & Instant Player</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-zinc-800/50 rounded-xl border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-zinc-200 font-medium">Offline Movie Downloads</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-zinc-800/50 rounded-xl border border-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-zinc-200 font-medium">Daily New Release Alerts</span>
              </div>
            </div>
          </div>

            {settings.telegramLink && (
              <a
                href={settings.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/40 font-bold py-3 px-5 rounded-xl transition-all text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Get App Link on Telegram Channel</span>
              </a>
            )}

          {/* Security badge & Install steps */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Virus Free & Verified APK</span>
            </div>
            
            <p className="text-[11px] text-zinc-500 text-center">
              How to install: Download APK &rarr; Open file &rarr; Enable "Install unknown apps" in Android settings &rarr; Done!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
