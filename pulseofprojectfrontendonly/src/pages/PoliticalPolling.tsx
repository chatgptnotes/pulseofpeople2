import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, TrendingUp, Users, BarChart3, Vote, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PoliticalPolling() {
  const [voteCount, setVoteCount] = useState(3);
  const [isComplete, setIsComplete] = useState(false);
  const [isBumped, setIsBumped] = useState(false);
  const countRef = useRef<HTMLParagraphElement>(null);

  const handleVote = () => {
    if (!isComplete) {
      // Bump the count
      setVoteCount(prev => prev + 1);
      setIsBumped(true);
      
      // Reset bump animation after it completes
      setTimeout(() => setIsBumped(false), 300);
    }
    
    setIsComplete(!isComplete);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/legacy"
                className="flex items-center space-x-2 text-white hover:text-red-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-white">Political Polling Center</h1>
            </div>
            <div className="text-white/70 text-sm">
              Live Voter Sentiment & Opinion Tracking
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Voting Widget */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Cast Your Voice in Real-Time
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Experience our live polling system that captures and analyzes voter sentiment in real-time. 
            This widget demonstrates how we track political opinion shifts as they happen.
          </p>

          {/* Voting Widget */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-12 max-w-md mx-auto mb-8">
            <h3 className="text-2xl font-semibold text-white mb-6">
              Infrastructure Development Policy
            </h3>
            <p className="text-gray-300 mb-8">
              "Should the government prioritize highway expansion over public transit?"
            </p>

            <form className="myform" onSubmit={(e) => e.preventDefault()}>
              <p 
                ref={countRef}
                className={`vote-count ${isBumped ? 'bumped' : ''}`}
                style={{
                  width: '40px',
                  height: '35px',
                  textAlign: 'center',
                  color: '#881d12',
                  font: '20px/1.5 georgia',
                  marginBottom: '10px',
                  animation: isBumped ? 'bump 0.3s' : 'none'
                }}
              >
                {voteCount}
              </p>
              
              <button
                className={`vote-btn ${isComplete ? 'complete' : ''}`}
                onClick={handleVote}
                style={{
                  appearance: 'none',
                  borderRadius: '3px',
                  border: '0',
                  background: isComplete ? '#c1c0bb' : '#fff',
                  padding: isComplete ? '15px' : '15px 12px 15px 40px',
                  font: 'bold 9px/1.2 arial',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: isComplete ? '#fff' : '#881d12',
                  boxShadow: '0 1px 1px rgba(0,0,0,.2)',
                  outline: 'none',
                  position: 'relative',
                  transition: 'all .3s ease-out',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                <span 
                  className="icon"
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '10px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '10px',
                    display: 'inline-block',
                    background: '#881d12 url(https://jamesmuspratt.com/codepen/img/checkmark.svg) no-repeat 2px 1px',
                    backgroundSize: '16px auto',
                    transition: 'all .3s ease-out',
                    opacity: isComplete ? 0 : 1,
                    transform: isComplete ? 'scale(0)' : 'scale(1)'
                  }}
                ></span>
                <span className="text">
                  {isComplete ? "Thanks for Voting" : "Vote on This Policy!"}
                </span>
              </button>
            </form>

            <div className="mt-6 text-sm text-gray-400">
              Join {voteCount} others who have voted on this policy
            </div>
          </div>

          {/* Additional Context */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-6 border border-green-400/30">
              <Vote className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-xl font-bold text-green-400 mb-2">Live Polling</div>
              <div className="text-green-100 text-sm">Real-time opinion capture across demographics</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-6 border border-blue-400/30">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-xl font-bold text-blue-400 mb-2">Targeted Insights</div>
              <div className="text-blue-100 text-sm">Segmented analysis by region and voter profile</div>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-6 border border-purple-400/30">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-xl font-bold text-purple-400 mb-2">Instant Results</div>
              <div className="text-purple-100 text-sm">Immediate sentiment analysis and reporting</div>
            </div>
          </div>
        </div>

        {/* Polling Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Poll Results */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Current Poll Results
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Support Highway Expansion</span>
                  <span className="text-white">62%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Support Public Transit</span>
                  <span className="text-white">38%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: '38%' }}></div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <div className="text-sm text-gray-300">Total Votes Cast</div>
              <div className="text-2xl font-bold text-white">{voteCount.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Updated in real-time</div>
            </div>
          </div>

          {/* Demographic Breakdown */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Demographic Breakdown
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Urban Voters</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-white text-sm">45%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Suburban Voters</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <span className="text-white text-sm">68%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Rural Voters</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '74%' }}></div>
                  </div>
                  <span className="text-white text-sm">74%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Trending Political Topics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Infrastructure Funding</span>
                <span className="text-green-400 text-sm">↑ 23%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Transportation Policy</span>
                <span className="text-green-400 text-sm">↑ 18%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Urban Planning</span>
                <span className="text-red-400 text-sm">↓ 8%</span>
              </div>
            </div>
          </div>

          {/* Real-time Activity */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Live Activity Feed</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-gray-400">2s ago:</span>
                <span className="text-white ml-2">Voter from Mumbai cast ballot</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">5s ago:</span>
                <span className="text-white ml-2">Policy sentiment shifted +2%</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">12s ago:</span>
                <span className="text-white ml-2">New voter demographic identified</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-400">18s ago:</span>
                <span className="text-white ml-2">Regional trend updated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Styles for animations */}
      <style>{`
        @keyframes bump {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
        
        .vote-count.bumped {
          animation: bump 0.3s;
        }
      `}</style>
    </div>
  );
}

