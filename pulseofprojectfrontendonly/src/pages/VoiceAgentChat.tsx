/**
 * Voice Agent Chat Page
 * Embeds the ElevenLabs Conversational AI widget for direct user interaction
 */

import React, { useEffect } from 'react';
import { Mic, Phone, MessageSquare } from 'lucide-react';

export default function VoiceAgentChat() {
  useEffect(() => {
    // Load ElevenLabs ConvAI widget script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-yellow-500 rounded-xl shadow-lg">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Voice Agent Chat</h1>
              <p className="text-gray-600 mt-1">
                Talk directly with our AI-powered voice assistant
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mic className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Voice Enabled</h3>
                  <p className="text-sm text-gray-600">Natural voice conversations</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Tamil Support</h3>
                  <p className="text-sm text-gray-600">தமிழில் பேசலாம்</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">24/7 Available</h3>
                  <p className="text-sm text-gray-600">Always ready to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-yellow-500 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Mic className="w-5 h-5" />
              AI Voice Assistant
            </h2>
            <p className="text-white/90 text-sm mt-1">
              Click the microphone to start a conversation
            </p>
          </div>

          <div className="p-8">
            {/* Instructions */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click the microphone button below to start speaking</li>
                <li>• You can speak in English or Tamil (தமிழ்)</li>
                <li>• The AI will respond with voice and text</li>
                <li>• Ask about voter sentiment, TVK party, or political topics</li>
              </ul>
            </div>

            {/* ElevenLabs Widget Embed */}
            <div className="flex justify-center items-center min-h-[400px]">
              <elevenlabs-convai
                agent-id={import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_2501k9rprn1de53rm33gjv0hx84e'}
              />
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">What you can ask:</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Voter sentiment information</li>
                    <li>• Political party opinions</li>
                    <li>• TVK party details</li>
                    <li>• General political queries</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Real-time voice recognition</li>
                    <li>• Natural language processing</li>
                    <li>• Multilingual support (Tamil + English)</li>
                    <li>• Context-aware responses</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Powered by ElevenLabs Conversational AI • Agent ID: {import.meta.env.VITE_ELEVENLABS_AGENT_ID?.slice(0, 20)}...
          </p>
        </div>
      </div>
    </div>
  );
}
