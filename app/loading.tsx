import Image from "next/image";
import Logo from "../images/Logo2.png";
import Spinner from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Loading Card */}
      <div className="relative z-10 flex flex-col items-center bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl border border-gray-100 shadow-xl shadow-blue-500/5 max-w-sm w-full text-center space-y-6">
        {/* Animated Brand Logo */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-20 blur group-hover:opacity-40 animate-pulse transition duration-1000" />
          <div className="relative bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <Image
              src={Logo}
              alt="Eventra Logo"
              width={100}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Enhanced Spinner */}
        <div className="py-2">
          <Spinner size="lg" />
        </div>

        {/* Text & Shimmer Bar */}
        <div className="space-y-2 w-full">
          <h3 className="font-semibold text-gray-900 text-base">
            Loading Eventra
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Fetching real-time queue states & upcoming events...
          </p>

          {/* Animated Shimmer Line */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full animate-[shimmer_1.8s_infinite] -translate-x-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
