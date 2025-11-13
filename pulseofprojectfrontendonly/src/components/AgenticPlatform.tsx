import React, { useState, useEffect } from 'react';
import {
  Bot,
  Users,
  Brain,
  Target,
  TrendingUp,
  MessageSquare,
  Activity,
  Settings,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  User,
  Globe,
  Heart,
  Briefcase,
  GraduationCap,
  Shield,
  Factory,
  Home,
  Baby,
  Coins
} from 'lucide-react';
import { MobileCard, ResponsiveGrid, MobileButton, MobileTabs } from './MobileResponsive';

interface VoterSegmentAgent {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  targetDemographic: string;
  active: boolean;
  performanceMetrics: {
    engagementRate: number;
    sentimentScore: number;
    responseRate: number;
    dataQuality: number;
  };
  recentInsights: string[];
  keyTopics: string[];
  status: 'active' | 'paused' | 'learning' | 'optimizing';
}

const voterSegmentAgents: VoterSegmentAgent[] = [
  // Age-based segments
  { id: 'gen-z', name: 'Gen Z Voice', category: 'Age Groups', description: 'Engaging 18-25 year old voters through social media and digital platforms', icon: Users, targetDemographic: '18-25 years', active: true, performanceMetrics: { engagementRate: 85, sentimentScore: 72, responseRate: 68, dataQuality: 89 }, recentInsights: ['High concern for climate action', 'Prefer digital engagement', 'Value transparency in politics'], keyTopics: ['Climate Change', 'Digital Rights', 'Education'], status: 'active' },
  { id: 'millennial', name: 'Millennial Monitor', category: 'Age Groups', description: 'Tracking 26-41 year old voter priorities and concerns', icon: User, targetDemographic: '26-41 years', active: true, performanceMetrics: { engagementRate: 78, sentimentScore: 65, responseRate: 73, dataQuality: 85 }, recentInsights: ['Focus on economic stability', 'Work-life balance issues', 'Housing affordability concerns'], keyTopics: ['Economy', 'Housing', 'Healthcare'], status: 'active' },
  { id: 'gen-x', name: 'Gen X Guardian', category: 'Age Groups', description: 'Understanding 42-57 year old voter motivations', icon: Shield, targetDemographic: '42-57 years', active: true, performanceMetrics: { engagementRate: 71, sentimentScore: 68, responseRate: 76, dataQuality: 88 }, recentInsights: ['Concerned about children\'s future', 'Retirement planning anxiety', 'Traditional values important'], keyTopics: ['Education', 'Security', 'Economy'], status: 'active' },
  { id: 'baby-boomer', name: 'Boomer Bridge', category: 'Age Groups', description: 'Connecting with 58+ year old experienced voters', icon: Heart, targetDemographic: '58+ years', active: true, performanceMetrics: { engagementRate: 65, sentimentScore: 74, responseRate: 82, dataQuality: 91 }, recentInsights: ['Healthcare is top priority', 'Value experience over change', 'Prefer traditional communication'], keyTopics: ['Healthcare', 'Pensions', 'Security'], status: 'active' },

  // Economic segments
  { id: 'working-class', name: 'Worker\'s Voice', category: 'Economic', description: 'Representing blue-collar and working-class concerns', icon: Factory, targetDemographic: 'Working Class', active: true, performanceMetrics: { engagementRate: 82, sentimentScore: 61, responseRate: 79, dataQuality: 86 }, recentInsights: ['Job security concerns', 'Union support important', 'Infrastructure investment needed'], keyTopics: ['Employment', 'Unions', 'Infrastructure'], status: 'active' },
  { id: 'middle-class', name: 'Middle Ground', category: 'Economic', description: 'Middle-class aspirations and challenges', icon: Home, targetDemographic: 'Middle Class', active: true, performanceMetrics: { engagementRate: 75, sentimentScore: 69, responseRate: 74, dataQuality: 87 }, recentInsights: ['Tax burden concerns', 'Quality education access', 'Healthcare costs rising'], keyTopics: ['Taxation', 'Education', 'Healthcare'], status: 'active' },
  { id: 'entrepreneurs', name: 'Business Builder', category: 'Economic', description: 'Small business owners and entrepreneurs', icon: Briefcase, targetDemographic: 'Business Owners', active: true, performanceMetrics: { engagementRate: 73, sentimentScore: 66, responseRate: 71, dataQuality: 84 }, recentInsights: ['Regulatory burden heavy', 'Credit access issues', 'Digital transformation needed'], keyTopics: ['Regulations', 'Finance', 'Technology'], status: 'active' },
  { id: 'investors', name: 'Market Mind', category: 'Economic', description: 'High-income investors and professionals', icon: Coins, targetDemographic: 'High Income', active: true, performanceMetrics: { engagementRate: 69, sentimentScore: 71, responseRate: 68, dataQuality: 89 }, recentInsights: ['Market stability concerns', 'Policy predictability valued', 'Global competitiveness'], keyTopics: ['Markets', 'Policy', 'Economy'], status: 'active' },

  // Geographic segments
  { id: 'urban-voters', name: 'City Pulse', category: 'Geographic', description: 'Urban area voters and city dwellers', icon: Globe, targetDemographic: 'Urban Areas', active: true, performanceMetrics: { engagementRate: 80, sentimentScore: 67, responseRate: 72, dataQuality: 88 }, recentInsights: ['Public transport priority', 'Air quality concerns', 'Smart city initiatives'], keyTopics: ['Transport', 'Environment', 'Technology'], status: 'active' },
  { id: 'rural-voters', name: 'Rural Roots', category: 'Geographic', description: 'Rural and agricultural community concerns', icon: Heart, targetDemographic: 'Rural Areas', active: true, performanceMetrics: { engagementRate: 77, sentimentScore: 70, responseRate: 81, dataQuality: 85 }, recentInsights: ['Agricultural support needed', 'Infrastructure gaps', 'Traditional values important'], keyTopics: ['Agriculture', 'Infrastructure', 'Values'], status: 'active' },

  // Educational segments
  { id: 'college-educated', name: 'Scholar\'s Scope', category: 'Education', description: 'College-educated professional voters', icon: GraduationCap, targetDemographic: 'College Educated', active: true, performanceMetrics: { engagementRate: 76, sentimentScore: 68, responseRate: 70, dataQuality: 90 }, recentInsights: ['Evidence-based policy support', 'Climate action important', 'Innovation investment'], keyTopics: ['Science', 'Climate', 'Innovation'], status: 'active' },
  { id: 'skilled-workers', name: 'Skill Force', category: 'Education', description: 'Skilled trades and technical workers', icon: Settings, targetDemographic: 'Skilled Workers', active: true, performanceMetrics: { engagementRate: 79, sentimentScore: 65, responseRate: 78, dataQuality: 86 }, recentInsights: ['Skills training programs', 'Trade recognition', 'Apprenticeship support'], keyTopics: ['Training', 'Skills', 'Recognition'], status: 'active' }
];

export default function AgenticPlatform() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [agents, setAgents] = useState<VoterSegmentAgent[]>(voterSegmentAgents);
  const [globalMetrics, setGlobalMetrics] = useState({
    totalEngaged: 0,
    averageSentiment: 0,
    activeAgents: 0,
    dataPointsCollected: 0
  });

  useEffect(() => {
    // Calculate global metrics
    const activeAgents = agents.filter(a => a.active);
    const totalEngaged = activeAgents.reduce((sum, agent) => sum + agent.performanceMetrics.engagementRate, 0);
    const averageSentiment = activeAgents.reduce((sum, agent) => sum + agent.performanceMetrics.sentimentScore, 0) / activeAgents.length;
    
    setGlobalMetrics({
      totalEngaged: Math.round(totalEngaged),
      averageSentiment: Math.round(averageSentiment),
      activeAgents: activeAgents.length,
      dataPointsCollected: Math.round(totalEngaged * 45.7) // Simulated data points
    });
  }, [agents]);

  const filteredAgents = selectedCategory === 'all' 
    ? agents 
    : agents.filter(agent => agent.category === selectedCategory);

  const categories = ['all', ...new Set(agents.map(agent => agent.category))];

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, active: !agent.active } : agent
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'learning': return 'bg-blue-100 text-blue-800';
      case 'optimizing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'agents', label: 'AI Agents', icon: Bot },
    { key: 'insights', label: 'Insights', icon: Brain },
    { key: 'performance', label: 'Performance', icon: TrendingUp }
  ];

  return (
    <div className="container-mobile py-6">
      <div className="space-responsive">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900">
                50-Agent Agentic Platform
              </h1>
              <p className="text-responsive-sm text-gray-600">
                AI-powered voter segment analysis for Tamil Nadu 2026
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <MobileTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-responsive">
            {/* Global Metrics */}
            <ResponsiveGrid cols={{ sm: 2, lg: 4 }}>
              <MobileCard padding="default" className="text-center">
                <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {globalMetrics.activeAgents}
                </div>
                <div className="text-responsive-sm text-gray-600">Active Agents</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {globalMetrics.totalEngaged.toLocaleString()}
                </div>
                <div className="text-responsive-sm text-gray-600">Total Engagement</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {globalMetrics.averageSentiment}%
                </div>
                <div className="text-responsive-sm text-gray-600">Avg Sentiment</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Target className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {globalMetrics.dataPointsCollected.toLocaleString()}
                </div>
                <div className="text-responsive-sm text-gray-600">Data Points</div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Quick Categories Overview */}
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                Agent Categories
              </h3>
              <ResponsiveGrid cols={{ sm: 2, md: 3, lg: 4 }}>
                {categories.slice(1).map(category => {
                  const categoryAgents = agents.filter(a => a.category === category);
                  const activeCount = categoryAgents.filter(a => a.active).length;
                  
                  return (
                    <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-responsive-base font-medium text-gray-900">
                        {category}
                      </div>
                      <div className="text-responsive-sm text-gray-600">
                        {activeCount}/{categoryAgents.length} active
                      </div>
                    </div>
                  );
                })}
              </ResponsiveGrid>
            </MobileCard>
          </div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <div className="space-responsive">
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Settings className="w-5 h-5 text-gray-600" />
                <span className="text-responsive-sm font-medium text-gray-700">Filter by Category:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <MobileButton
                    key={category}
                    variant={selectedCategory === category ? 'primary' : 'outline'}
                    size="small"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </MobileButton>
                ))}
              </div>
            </div>

            {/* Agents Grid */}
            <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
              {filteredAgents.map(agent => (
                <MobileCard key={agent.id} padding="default" className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${agent.active ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <agent.icon className={`w-5 h-5 ${agent.active ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h4 className="text-responsive-sm font-semibold text-gray-900">
                          {agent.name}
                        </h4>
                        <p className="text-xs text-gray-600">{agent.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                      <button
                        onClick={() => toggleAgent(agent.id)}
                        className={`p-1 rounded ${agent.active ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                      >
                        {agent.active ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-responsive-xs text-gray-700 mb-4">
                    {agent.description}
                  </p>

                  <div className="text-xs text-gray-600 mb-4">
                    <strong>Target:</strong> {agent.targetDemographic}
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Engagement</span>
                      <span className="text-xs font-medium">{agent.performanceMetrics.engagementRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${agent.performanceMetrics.engagementRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Topics */}
                  <div className="flex flex-wrap gap-1">
                    {agent.keyTopics.slice(0, 3).map(topic => (
                      <span key={topic} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </MobileCard>
              ))}
            </ResponsiveGrid>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <div className="flex items-center space-x-2 mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  Latest AI Insights
                </h3>
              </div>
              
              <ResponsiveGrid cols={{ sm: 1, lg: 2 }}>
                {filteredAgents.slice(0, 6).map(agent => (
                  <div key={agent.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <agent.icon className="w-4 h-4 text-blue-600" />
                      <span className="text-responsive-sm font-medium text-gray-900">
                        {agent.name}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {agent.recentInsights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-responsive-xs text-gray-700">
                            {insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ResponsiveGrid>
            </MobileCard>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  Agent Performance Metrics
                </h3>
              </div>
              
              <div className="space-y-4">
                {filteredAgents.map(agent => (
                  <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <agent.icon className="w-4 h-4 text-blue-600" />
                        <span className="text-responsive-sm font-medium text-gray-900">
                          {agent.name}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${agent.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {agent.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <ResponsiveGrid cols={{ sm: 2, lg: 4 }} gap="small">
                      <div className="text-center">
                        <div className="text-responsive-base font-bold text-blue-600">
                          {agent.performanceMetrics.engagementRate}%
                        </div>
                        <div className="text-xs text-gray-600">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-responsive-base font-bold text-green-600">
                          {agent.performanceMetrics.sentimentScore}%
                        </div>
                        <div className="text-xs text-gray-600">Sentiment</div>
                      </div>
                      <div className="text-center">
                        <div className="text-responsive-base font-bold text-purple-600">
                          {agent.performanceMetrics.responseRate}%
                        </div>
                        <div className="text-xs text-gray-600">Response</div>
                      </div>
                      <div className="text-center">
                        <div className="text-responsive-base font-bold text-orange-600">
                          {agent.performanceMetrics.dataQuality}%
                        </div>
                        <div className="text-xs text-gray-600">Quality</div>
                      </div>
                    </ResponsiveGrid>
                  </div>
                ))}
              </div>
            </MobileCard>
          </div>
        )}

        {/* Control Panel */}
        <MobileCard padding="default" className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-responsive-sm font-semibold text-gray-900">Platform Control</h4>
              <p className="text-responsive-xs text-gray-600">Manage all AI agents for optimal voter insights</p>
            </div>
            <div className="flex space-x-2">
              <MobileButton variant="outline" size="small">
                <RefreshCw className="w-4 h-4 mr-1" />
                Sync All
              </MobileButton>
              <MobileButton variant="primary" size="small">
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </MobileButton>
            </div>
          </div>
        </MobileCard>
      </div>
    </div>
  );
}