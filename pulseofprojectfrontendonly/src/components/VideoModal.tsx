import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
  title?: string;
}

export default function VideoModal({ isOpen, onClose, videoSrc, title = "Demo Video" }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current && videoReady) {
      // Auto-play when modal opens and video is ready
      const video = videoRef.current;
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video started playing');
          })
          .catch((error) => {
            console.error('Autoplay failed:', error);
            // If autoplay fails, we'll show the play button
          });
      }
    }
  }, [isOpen, videoReady]);

  const handleVideoClick = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.requestFullscreen();
      } catch (error) {
        console.error('Fullscreen failed:', error);
      }
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFullscreenToggle = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(console.error);
      } else {
        document.exitFullscreen().catch(console.error);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="relative bg-black rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleFullscreenToggle}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              title="Toggle Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Video Container */}
        <div className="relative aspect-video bg-black">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full object-contain cursor-pointer"
              onClick={handleVideoClick}
              onLoadedData={() => setVideoReady(true)}
              onCanPlay={() => setVideoReady(true)}
              onError={(e) => {
                console.error('Video failed to load:', e);
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/M6J1K-aeWJg?autoplay=1&loop=1&playlist=M6J1K-aeWJg&controls=1&enablejsapi=1&start=0&rel=0&modestbranding=1"
                title="Demo Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="cursor-pointer"
                onClick={handleVideoClick}
              ></iframe>
            </div>
          )}
          
</div>
      </div>
    </div>
  );
}