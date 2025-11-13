import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Heart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  FileText,
  Lightbulb,
  ArrowRight,
  Filter,
  Search,
  Download,
  Share2
} from 'lucide-react';

interface ManifestoPoint {
  id: string;
  party: string;
  category: string;
  promise: string;
  priority: 'high' | 'medium' | 'low';
  timeline: string;
  budget?: string;
}

interface VoterExpectation {
  id: string;
  category: string;
  issue: string;
  priority: number;
  sentiment: number;
  voterDemographic: string;
  region: string;
  responseCount: number;
}

interface MatchResult {
  manifestoPoint: ManifestoPoint;
  expectations: VoterExpectation[];
  alignmentScore: number;
  gaps: string[];
  opportunities: string[];
}

export default function ManifestoMatch() {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'analysis' | 'insights'>('overview');
  const [selectedParty, setSelectedParty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock manifesto data for major Tamil Nadu parties
  const [manifestoPoints] = useState<ManifestoPoint[]>([
    {
      id: '1',
      party: 'Left Democratic Front (LDF)',
      category: 'Employment',
      promise: 'Create 20 lakh new jobs in IT and renewable energy sectors',
      priority: 'high',
      timeline: '5 years',
      budget: '₹15,000 crores'
    },
    {
      id: '2',
      party: 'Left Democratic Front (LDF)',
      category: 'Healthcare',
      promise: 'Establish 100 new primary health centers in rural areas',
      priority: 'high',
      timeline: '3 years',
      budget: '₹5,000 crores'
    },
    {
      id: '3',
      party: 'United Democratic Front (UDF)',
      category: 'Employment',
      promise: 'Launch startup incubation centers in all districts',
      priority: 'high',
      timeline: '2 years',
      budget: '₹2,000 crores'
    },
    {
      id: '4',
      party: 'United Democratic Front (UDF)',
      category: 'Infrastructure',
      promise: 'Complete SilverLine project connecting major cities',
      priority: 'medium',
      timeline: '8 years',
      budget: '₹1,20,000 crores'
    },
    {
      id: '5',
      party: 'Bharatiya Janata Party (BJP)',
      category: 'Employment',
      promise: 'Establish manufacturing hubs with 10 lakh job opportunities',
      priority: 'high',
      timeline: '4 years',
      budget: '₹25,000 crores'
    },
    {
      id: '6',
      party: 'Left Democratic Front (LDF)',
      category: 'Education',
      promise: 'Digitalize all government schools with smart classrooms',
      priority: 'medium',
      timeline: '3 years',
      budget: '₹8,000 crores'
    }
  ]);

  // Mock voter expectations based on survey data
  const [voterExpectations] = useState<VoterExpectation[]>([
    {
      id: '1',
      category: 'Employment',
      issue: 'Youth unemployment in urban areas',
      priority: 0.9,
      sentiment: 0.3,
      voterDemographic: 'Youth (18-30)',
      region: 'Kochi',
      responseCount: 1456
    },
    {
      id: '2',
      category: 'Healthcare',
      issue: 'Long waiting times in government hospitals',
      priority: 0.85,
      sentiment: 0.4,
      voterDemographic: 'Senior citizens (50+)',
      region: 'Thiruvananthapuram',
      responseCount: 987
    },
    {
      id: '3',
      category: 'Infrastructure',
      issue: 'Poor road conditions during monsoon',
      priority: 0.8,
      sentiment: 0.25,
      voterDemographic: 'Middle-aged (30-50)',
      region: 'Kozhikode',
      responseCount: 1234
    },
    {
      id: '4',
      category: 'Education',
      issue: 'Lack of digital infrastructure in schools',
      priority: 0.75,
      sentiment: 0.5,
      voterDemographic: 'Parents (25-45)',
      region: 'Kollam',
      responseCount: 876
    },
    {
      id: '5',
      category: 'Employment',
      issue: 'Limited startup ecosystem outside major cities',
      priority: 0.7,
      sentiment: 0.4,
      voterDemographic: 'Entrepreneurs (25-40)',
      region: 'Thrissur',
      responseCount: 543
    }
  ]);

  const calculateManifestoAlignment = (): MatchResult[] => {
    const results: MatchResult[] = [];

    manifestoPoints.forEach(manifesto => {
      const relatedExpectations = voterExpectations.filter(
        exp => exp.category === manifesto.category
      );

      if (relatedExpectations.length > 0) {
        const avgSentiment = relatedExpectations.reduce((sum, exp) => sum + exp.sentiment, 0) / relatedExpectations.length;
        const avgPriority = relatedExpectations.reduce((sum, exp) => sum + exp.priority, 0) / relatedExpectations.length;
        
        // Calculate alignment score (0-1)
        const alignmentScore = (avgSentiment * 0.4) + (avgPriority * 0.6);

        // Identify gaps and opportunities
        const gaps: string[] = [];
        const opportunities: string[] = [];

        relatedExpectations.forEach(exp => {
          if (exp.sentiment < 0.5) {
            gaps.push(`Low satisfaction in ${exp.issue} (${exp.region})`);
          }
          if (exp.priority > 0.8 && exp.sentiment < 0.6) {
            opportunities.push(`High priority issue: ${exp.issue} in ${exp.region}`);
          }
        });

        results.push({
          manifestoPoint: manifesto,
          expectations: relatedExpectations,
          alignmentScore,
          gaps,
          opportunities
        });
      }
    });

    return results.sort((a, b) => b.alignmentScore - a.alignmentScore);
  };

  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);

  useEffect(() => {
    setMatchResults(calculateManifestoAlignment());
  }, []);

  const getAlignmentColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-blue-600 bg-blue-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAlignmentLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Moderate Match';
    return 'Poor Match';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Target className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredResults = matchResults.filter(result => {
    if (selectedParty !== 'all' && result.manifestoPoint.party !== selectedParty) return false;
    if (selectedCategory !== 'all' && result.manifestoPoint.category !== selectedCategory) return false;
    if (searchTerm && !result.manifestoPoint.promise.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const overallAlignment = matchResults.reduce((sum, result) => sum + result.alignmentScore, 0) / matchResults.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-purple-600" />
            Manifesto Match Analysis
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Compare party manifestos with actual voter expectations and priorities
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm">
            <Download className="mr-1 h-4 w-4" />
            Export Report
          </button>
          <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm">
            <Share2 className="mr-1 h-4 w-4" />
            Share Analysis
          </button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {Math.round(overallAlignment * 100)}%
              </div>
              <div className="text-sm text-purple-700">Overall Alignment</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-900">{manifestoPoints.length}</div>
              <div className="text-sm text-green-700">Manifesto Points</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {voterExpectations.reduce((sum, exp) => sum + exp.responseCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Voter Responses</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-orange-900">
                {matchResults.filter(r => r.alignmentScore >= 0.6).length}
              </div>
              <div className="text-sm text-orange-700">Good Matches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'detailed', label: 'Detailed Match', icon: FileText },
              { key: 'analysis', label: 'Gap Analysis', icon: Target },
              { key: 'insights', label: 'AI Insights', icon: Lightbulb }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-1 h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={selectedParty} 
            onChange={(e) => setSelectedParty(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Parties</option>
            <option value="Left Democratic Front (LDF)">LDF</option>
            <option value="United Democratic Front (UDF)">UDF</option>
            <option value="Bharatiya Janata Party (BJP)">BJP</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-gray-500" />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="Employment">Employment</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Education">Education</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search manifesto promises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm w-64"
          />
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredResults.length} manifesto points matched with voter expectations
          </div>
          {filteredResults.map((result) => (
            <div key={result.manifestoPoint.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      {result.manifestoPoint.party}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-700">
                      {result.manifestoPoint.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getPriorityIcon(result.manifestoPoint.priority)}
                      <span className="text-xs capitalize">{result.manifestoPoint.priority}</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {result.manifestoPoint.promise}
                  </h4>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>Timeline: {result.manifestoPoint.timeline}</span>
                    {result.manifestoPoint.budget && (
                      <span>Budget: {result.manifestoPoint.budget}</span>
                    )}
                    <span>Voter responses: {result.expectations.reduce((sum, exp) => sum + exp.responseCount, 0)}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAlignmentColor(result.alignmentScore)}`}>
                    {Math.round(result.alignmentScore * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {getAlignmentLabel(result.alignmentScore)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Match Tab */}
      {activeTab === 'detailed' && (
        <div className="space-y-6">
          {filteredResults.map((result) => (
            <div key={result.manifestoPoint.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {result.manifestoPoint.party}
                    </h4>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700">{result.manifestoPoint.category}</span>
                  </div>
                  <p className="text-gray-800 mb-3">{result.manifestoPoint.promise}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg text-lg font-bold ${getAlignmentColor(result.alignmentScore)}`}>
                  {Math.round(result.alignmentScore * 100)}%
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Related Voter Expectations</h5>
                  <div className="space-y-3">
                    {result.expectations.map((exp) => (
                      <div key={exp.id} className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">{exp.issue}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                              Priority: {Math.round(exp.priority * 100)}%
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(exp.sentiment)}`}>
                              {Math.round(exp.sentiment * 100)}% satisfaction
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {exp.voterDemographic} • {exp.region} • {exp.responseCount} responses
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {result.opportunities.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mr-1" />
                        Opportunities
                      </h5>
                      <ul className="space-y-2">
                        {result.opportunities.map((opportunity, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <ArrowRight className="h-3 w-3 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {result.gaps.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                        Gaps to Address
                      </h5>
                      <ul className="space-y-2">
                        {result.gaps.map((gap, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <XCircle className="h-3 w-3 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gap Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Major Gaps Identified
              </h4>
              <div className="space-y-3">
                {matchResults
                  .filter(r => r.alignmentScore < 0.5)
                  .map((result) => (
                    <div key={result.manifestoPoint.id} className="bg-white p-3 rounded border border-red-200">
                      <div className="font-medium text-gray-900 mb-1">
                        {result.manifestoPoint.category} - {result.manifestoPoint.party}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {result.manifestoPoint.promise.substring(0, 100)}...
                      </div>
                      <div className="text-xs text-red-700">
                        Alignment: {Math.round(result.alignmentScore * 100)}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Strong Alignments
              </h4>
              <div className="space-y-3">
                {matchResults
                  .filter(r => r.alignmentScore >= 0.7)
                  .map((result) => (
                    <div key={result.manifestoPoint.id} className="bg-white p-3 rounded border border-green-200">
                      <div className="font-medium text-gray-900 mb-1">
                        {result.manifestoPoint.category} - {result.manifestoPoint.party}
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        {result.manifestoPoint.promise.substring(0, 100)}...
                      </div>
                      <div className="text-xs text-green-700">
                        Alignment: {Math.round(result.alignmentScore * 100)}%
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Category-wise Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['Employment', 'Healthcare', 'Infrastructure', 'Education'].map(category => {
                const categoryResults = matchResults.filter(r => r.manifestoPoint.category === category);
                const avgAlignment = categoryResults.reduce((sum, r) => sum + r.alignmentScore, 0) / categoryResults.length;
                
                return (
                  <div key={category} className="text-center p-4 bg-white rounded border border-gray-200">
                    <div className="text-lg font-bold text-gray-900">
                      {Math.round(avgAlignment * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">{category}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {categoryResults.length} manifesto points
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-purple-600" />
              AI-Powered Strategic Insights
            </h4>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Employment Focus Opportunity</h5>
                    <p className="text-sm text-gray-600">
                      All major parties have employment-focused promises, but voter satisfaction is low (30-40%). 
                      This presents a significant opportunity for parties to differentiate through implementation details and timelines.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <Target className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Regional Customization Needed</h5>
                    <p className="text-sm text-gray-600">
                      Voter expectations vary significantly by region. Kochi focuses on IT jobs, while Kozhikode prioritizes 
                      infrastructure. Parties should customize their campaign messaging accordingly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Healthcare Sweet Spot</h5>
                    <p className="text-sm text-gray-600">
                      LDF's healthcare promises show the highest alignment with voter expectations (85%). 
                      This could be a key differentiator in the campaign.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Infrastructure Challenge</h5>
                    <p className="text-sm text-gray-600">
                      UDF's SilverLine project shows low alignment (25% satisfaction) despite being a major promise. 
                      Consider addressing concerns about cost, environmental impact, and displacement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-900">67%</div>
              <div className="text-sm text-blue-700">Promises match voter priorities</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-900">23%</div>
              <div className="text-sm text-green-700">Exceeds voter expectations</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-900">10%</div>
              <div className="text-sm text-red-700">Major alignment gaps</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for sentiment color (reuse from other components)
function getSentimentColor(sentiment: number) {
  if (sentiment >= 0.7) return 'text-green-600 bg-green-100';
  if (sentiment >= 0.5) return 'text-blue-600 bg-blue-100';
  if (sentiment >= 0.3) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
}