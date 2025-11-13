import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  Clock,
  TrendingUp,
  Users,
  MapPin,
  BarChart3,
  MessageSquare,
  BookOpen,
  Target,
  AlertTriangle,
  Star,
  Zap,
  ArrowRight,
  X,
  History,
  Globe,
  Phone,
  FileText,
  Calendar,
  Tag
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'sentiment' | 'ward_data' | 'manifesto' | 'feedback' | 'pulse' | 'agent_insight' | 'trend' | 'demographic';
  title: string;
  summary: string;
  relevanceScore: number;
  metadata: {
    location?: string;
    category?: string;
    timestamp?: Date;
    source?: string;
    sentiment?: number;
    priority?: string;
  };
  quickActions?: string[];
  rawData?: any;
}

export default function MagicSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Mock comprehensive database of analyzed information
  const mockDatabase: SearchResult[] = [
    // Sentiment Analysis Results
    {
      id: '1',
      type: 'sentiment',
      title: 'Youth Employment Sentiment in Kochi',
      summary: 'Analysis shows 67% negative sentiment regarding job opportunities among 18-25 age group. Key concerns: IT sector stagnation, startup ecosystem gaps.',
      relevanceScore: 0.95,
      metadata: {
        location: 'Kochi',
        category: 'Employment',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        sentiment: 0.33,
        source: 'Social Media Analysis'
      },
      quickActions: ['View Details', 'Export Report', 'Create Alert'],
      rawData: { totalMentions: 1456, positivePercent: 23, negativePercent: 67, neutralPercent: 10 }
    },
    
    // Ward-level Data
    {
      id: '2',
      type: 'ward_data',
      title: 'Thiruvananthapuram Central Ward Healthcare Feedback',
      summary: 'High satisfaction (82%) with new primary health center services. Reduced waiting times from 3 hours to 45 minutes. 234 survey responses.',
      relevanceScore: 0.88,
      metadata: {
        location: 'Thiruvananthapuram Central',
        category: 'Healthcare',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        sentiment: 0.82,
        source: 'Ward Survey'
      },
      quickActions: ['View Ward Map', 'Compare with Other Wards', 'Generate Report']
    },

    // Manifesto Analysis
    {
      id: '3',
      type: 'manifesto',
      title: 'LDF Employment Promise vs Voter Expectations',
      summary: 'LDF promises 20 lakh IT jobs but voter priority is manufacturing (78% vs 45% alignment). Gap analysis suggests need for balanced approach.',
      relevanceScore: 0.91,
      metadata: {
        category: 'Employment',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        source: 'Manifesto Analysis'
      },
      quickActions: ['View Full Analysis', 'Compare Parties', 'Export Insights']
    },

    // Feedback Data
    {
      id: '4',
      type: 'feedback',
      title: 'Road Infrastructure Complaints - Kozhikode',
      summary: 'Spike in complaints about monsoon road conditions. 89 complaints in last week. AI categorized: 67% drainage, 33% pothole-related.',
      relevanceScore: 0.79,
      metadata: {
        location: 'Kozhikode',
        category: 'Infrastructure',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        priority: 'high',
        source: 'Citizen Feedback'
      },
      quickActions: ['View Complaints', 'Assign Team', 'Create Action Plan']
    },

    // Pulse Data
    {
      id: '5',
      type: 'pulse',
      title: 'Real-time Pulse: Tamil Nadu Education Sentiment',
      summary: 'Current pulse shows 74% positive sentiment on digital education initiatives. Trending topics: smart classrooms, teacher training, rural connectivity.',
      relevanceScore: 0.86,
      metadata: {
        category: 'Education',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        sentiment: 0.74,
        source: 'Live Pulse Monitoring'
      },
      quickActions: ['Live Dashboard', 'Set Alerts', 'Share Insights']
    },

    // Agent Insights
    {
      id: '6',
      type: 'agent_insight',
      title: 'AI Agent Analysis: Senior Citizens Healthcare Preferences',
      summary: 'Agent specializing in 50+ demographic identifies preference for traditional medicine integration (89%) alongside modern healthcare.',
      relevanceScore: 0.83,
      metadata: {
        category: 'Healthcare',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        source: 'AI Agent Network'
      },
      quickActions: ['Agent Details', 'Similar Insights', 'Policy Recommendations']
    },

    // Trend Analysis
    {
      id: '7',
      type: 'trend',
      title: 'Trending: Digital Payment Adoption in Rural Tamil Nadu',
      summary: 'Unexpected 45% increase in digital payment discussions in rural areas. Correlation with employment schemes and agriculture subsidies.',
      relevanceScore: 0.77,
      metadata: {
        category: 'Digital Infrastructure',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        source: 'Trend Analysis'
      },
      quickActions: ['Trend Details', 'Forecast', 'Related Topics']
    },

    // Demographic Insights
    {
      id: '8',
      type: 'demographic',
      title: 'Women Voters (25-40): Economic Priorities Analysis',
      summary: 'Primary concerns: childcare support (91%), flexible work options (87%), skill development programs (83%). High political engagement.',
      relevanceScore: 0.89,
      metadata: {
        category: 'Women Issues',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        source: 'Demographic Analysis'
      },
      quickActions: ['Demographic Deep Dive', 'Policy Mapping', 'Campaign Insights']
    }
  ];

  const suggestions = [
    'employment sentiment Kochi',
    'healthcare satisfaction Thiruvananthapuram',
    'infrastructure complaints',
    'manifesto analysis LDF UDF',
    'youth voting preferences',
    'digital education feedback',
    'rural development sentiment',
    'women safety concerns',
    'agriculture policy impact',
    'startup ecosystem Tamil Nadu'
  ];

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsSearching(true);
      // Simulate API call delay
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery);
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedFilter]);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const queryLower = query.toLowerCase();
    const words = queryLower.split(' ');

    let results = mockDatabase.map(item => {
      let score = 0;
      
      // Title relevance (highest weight)
      if (item.title.toLowerCase().includes(queryLower)) score += 100;
      words.forEach(word => {
        if (item.title.toLowerCase().includes(word)) score += 50;
      });

      // Summary relevance
      if (item.summary.toLowerCase().includes(queryLower)) score += 75;
      words.forEach(word => {
        if (item.summary.toLowerCase().includes(word)) score += 25;
      });

      // Metadata relevance
      Object.values(item.metadata).forEach(value => {
        if (typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
          score += 30;
        }
      });

      // Type and category matching
      if (item.type.includes(queryLower)) score += 40;
      if (item.metadata.category?.toLowerCase().includes(queryLower)) score += 60;
      if (item.metadata.location?.toLowerCase().includes(queryLower)) score += 60;

      return { ...item, relevanceScore: score };
    });

    // Filter by type if selected
    if (selectedFilter !== 'all') {
      results = results.filter(item => item.type === selectedFilter);
    }

    // Sort by relevance and filter out low scores
    results = results
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8); // Limit results

    setSearchResults(results);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchQuery(query);
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
        return updated;
      });
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'sentiment': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'ward_data': return <MapPin className="h-5 w-5 text-green-600" />;
      case 'manifesto': return <BookOpen className="h-5 w-5 text-purple-600" />;
      case 'feedback': return <MessageSquare className="h-5 w-5 text-orange-600" />;
      case 'pulse': return <Zap className="h-5 w-5 text-red-600" />;
      case 'agent_insight': return <Sparkles className="h-5 w-5 text-indigo-600" />;
      case 'trend': return <BarChart3 className="h-5 w-5 text-yellow-600" />;
      case 'demographic': return <Users className="h-5 w-5 text-pink-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'text-gray-500';
    if (sentiment >= 0.7) return 'text-green-600';
    if (sentiment >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentEmoji = (sentiment?: number) => {
    if (!sentiment) return '';
    if (sentiment >= 0.7) return '😊';
    if (sentiment >= 0.4) return '😐';
    return '😞';
  };

  return (
    <div className="relative">
      {/* Search Bar */}
      <div className={`relative transition-all duration-300 ${isOpen ? 'z-50' : 'z-10'}`}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setIsOpen(true);
              setShowSuggestions(true);
            }}
            placeholder="🔍 Magic search across all data: 'youth employment Kochi', 'healthcare sentiment', 'manifesto analysis'..."
            className="w-full pl-10 pr-12 py-3 border-2 border-purple-200 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 shadow-lg text-lg"
          />
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            {isSearching && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            )}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsOpen(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <Search className="h-5 w-5 text-purple-500" />
          </div>
        </div>

        {/* Filter Tabs */}
        {isOpen && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Data', icon: Globe },
                { key: 'sentiment', label: 'Sentiment', icon: TrendingUp },
                { key: 'ward_data', label: 'Ward Data', icon: MapPin },
                { key: 'manifesto', label: 'Manifesto', icon: BookOpen },
                { key: 'feedback', label: 'Feedback', icon: MessageSquare },
                { key: 'pulse', label: 'Live Pulse', icon: Zap },
                { key: 'agent_insight', label: 'AI Agents', icon: Sparkles }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedFilter(key)}
                  className={`flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedFilter === key
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-30" onClick={() => setIsOpen(false)}>
          <div 
            className="absolute top-32 left-4 right-4 max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            ref={resultsRef}
          >
            {/* Suggestions */}
            {showSuggestions && !searchQuery && (
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">💡 Try searching for:</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 6).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleSearch(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!searchQuery && recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <History className="h-4 w-4 mr-1" />
                  Recent Searches:
                </h4>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="block w-full text-left px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Clock className="h-3 w-3 inline mr-2" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    <div className="text-sm text-gray-600 px-2 py-1 mb-2">
                      Found {searchResults.length} results for "{searchQuery}"
                    </div>
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-3 hover:bg-gray-50 rounded-lg border border-gray-100 mb-2 cursor-pointer transition-colors"
                        onClick={() => {
                          // Handle result click - navigate to detailed view
                          console.log('Navigate to:', result);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getResultIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {result.title}
                              </h3>
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                {getTypeLabel(result.type)}
                              </span>
                              {result.metadata.sentiment && (
                                <span className={`text-xs ${getSentimentColor(result.metadata.sentiment)}`}>
                                  {getSentimentEmoji(result.metadata.sentiment)} {Math.round(result.metadata.sentiment * 100)}%
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{result.summary}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                {result.metadata.location && (
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {result.metadata.location}
                                  </div>
                                )}
                                {result.metadata.category && (
                                  <div className="flex items-center">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {result.metadata.category}
                                  </div>
                                )}
                                {result.metadata.timestamp && (
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {result.metadata.timestamp.toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                {result.quickActions?.slice(0, 2).map((action, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Handle quick action
                                      console.log('Quick action:', action, result.id);
                                    }}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
                                  >
                                    {action}
                                  </button>
                                ))}
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    <p className="text-sm text-gray-400 mt-1">Try different keywords or filters</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div>
                  🔍 Search across sentiment, ward data, manifestos, feedback, pulse data & AI insights
                </div>
                <div className="flex items-center space-x-4">
                  <span>Press ESC to close</span>
                  <span>↑↓ Navigate</span>
                  <span>⏎ Open</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}