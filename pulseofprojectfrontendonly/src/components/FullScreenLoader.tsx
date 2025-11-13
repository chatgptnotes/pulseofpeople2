/**
 * FullScreenLoader Component
 * Professional loading screen shown during app initialization
 * Used to ensure authentication is verified before showing any content
 */

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-white rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Loading Application
          </h2>
          <p className="text-blue-200 text-sm">
            Verifying your session...
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Brand */}
        <div className="mt-12 text-blue-300 text-xs">
          Pulse of People
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse" style={{ animationDelay: '500ms' }}></div>
      <div className="absolute top-1/2 right-20 w-16 h-16 bg-indigo-500/10 rounded-full animate-pulse" style={{ animationDelay: '1000ms' }}></div>
    </div>
  );
}
