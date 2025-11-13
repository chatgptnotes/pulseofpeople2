import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Bot,
  User,
  Send,
  Mic,
  MicOff,
  Settings,
  BarChart3,
  Activity,
  Users,
  TrendingUp,
  Clock,
  Globe,
  Search,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Star,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Copy,
  Bookmark,
  Share2,
  Eye,
  Heart,
  MessageSquare,
  Phone,
  Video,
  Map,
  Calendar,
  Target,
  Award,
  Shield,
  Brain,
  Languages,
  Headphones,
  Smile,
  Image,
  Link,
  FileText,
  PieChart
} from 'lucide-react';
import { MobileCard, ResponsiveGrid, MobileButton, MobileTabs } from '../components/MobileResponsive';

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userLocation: string;
  timestamp: Date;
  duration: number;
  language: 'Tamil' | 'English' | 'Hindi' | 'Tamil';
  channel: 'web' | 'whatsapp' | 'telegram' | 'voice' | 'sms';
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  topics: string[];
  keywords: string[];
  issues: string[];
  satisfaction: number;
  demographic: {
    age?: string;
    gender?: string;
    occupation?: string;
    education?: string;
  };
  politicalLean?: 'left' | 'center' | 'right' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  resolved: boolean;
  category: 'feedback' | 'complaint' | 'suggestion' | 'inquiry' | 'political';
  aiConfidence: number;
  humanHandoff: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'bot' | 'human';
  content: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'image' | 'link';
  sentiment?: 'positive' | 'negative' | 'neutral';
  intent?: string;
  confidence?: number;
  language?: string;
  processed: boolean;
}

interface BotConfiguration {
  id: string;
  name: string;
  description: string;
  language: string[];
  active: boolean;
  channels: string[];
  personality: 'formal' | 'friendly' | 'professional' | 'casual';
  knowledgeBase: string[];
  responseTime: number;
  accuracy: number;
  satisfactionRate: number;
  totalConversations: number;
  aiModel: string;
  customPrompts: string[];
}

interface TopicAnalysis {
  id: string;
  topic: string;
  mentions: number;
  sentiment: number;
  priority: 'high' | 'medium' | 'low';
  trend: 'rising' | 'stable' | 'declining';
  relatedIssues: string[];
  suggestedActions: string[];
}

const botConfigurations: BotConfiguration[] = [
  {
    id: 'tamilnadu-assistant',
    name: 'Tamil Nadu Pulse Assistant',
    description: 'Main conversational AI for Tamil Nadu voter feedback',
    language: ['Tamil', 'English'],
    active: true,
    channels: ['web', 'whatsapp', 'telegram'],
    personality: 'friendly',
    knowledgeBase: ['Government Policies', 'Public Services', 'Electoral Process', 'Local Issues'],
    responseTime: 0.8,
    accuracy: 92,
    satisfactionRate: 87,
    totalConversations: 15680,
    aiModel: 'GPT-4',
    customPrompts: ['Welcome Message', 'Feedback Collection', 'Issue Escalation']
  },
  {
    id: 'complaint-resolver',
    name: 'Issue Resolution Bot',
    description: 'Specialized bot for handling complaints and issues',
    language: ['Tamil', 'English', 'Hindi'],
    active: true,
    channels: ['web', 'voice', 'sms'],
    personality: 'professional',
    knowledgeBase: ['Complaint Procedures', 'Government Departments', 'Resolution Processes'],
    responseTime: 1.2,
    accuracy: 89,
    satisfactionRate: 84,
    totalConversations: 8934,
    aiModel: 'GPT-4',
    customPrompts: ['Complaint Intake', 'Status Updates', 'Resolution Confirmation']
  },
  {
    id: 'survey-conductor',
    name: 'Survey & Polling Bot',
    description: 'Conducts structured surveys and polls',
    language: ['Tamil', 'English'],
    active: true,
    channels: ['web', 'whatsapp', 'telegram'],
    personality: 'formal',
    knowledgeBase: ['Survey Methodology', 'Political Topics', 'Demographic Data'],
    responseTime: 0.5,
    accuracy: 95,
    satisfactionRate: 82,
    totalConversations: 23450,
    aiModel: 'GPT-4',
    customPrompts: ['Survey Introduction', 'Question Flow', 'Thank You Message']
  },
  {
    id: 'youth-engager',
    name: 'Youth Engagement Bot',
    description: 'Specialized for engaging young voters',
    language: ['English', 'Hindi', 'Tamil'],
    active: true,
    channels: ['web', 'whatsapp', 'telegram'],
    personality: 'casual',
    knowledgeBase: ['Youth Issues', 'Digital Governance', 'Future Policies'],
    responseTime: 0.6,
    accuracy: 88,
    satisfactionRate: 91,
    totalConversations: 12340,
    aiModel: 'GPT-4',
    customPrompts: ['Youth Welcome', 'Engagement Activities', 'Future Vision']
  }
];

const mockConversations: Conversation[] = [
  {
    id: '1',
    userId: 'user_001',
    userName: 'Rahul Kumar',
    userLocation: 'Kochi',
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    duration: 420, // 7 minutes
    language: 'Tamil',
    channel: 'whatsapp',
    sentiment: 'positive',
    sentimentScore: 0.72,
    topics: ['Education Budget', 'School Infrastructure', 'Teacher Training'],
    keywords: ['schools', 'budget', 'infrastructure', 'teachers'],
    issues: ['classroom shortage', 'teacher shortage'],
    satisfaction: 85,
    demographic: {
      age: '35-44',
      gender: 'Male',
      occupation: 'Teacher',
      education: 'Graduate'
    },
    politicalLean: 'neutral',
    priority: 'medium',
    resolved: true,
    category: 'feedback',
    aiConfidence: 88,
    humanHandoff: false
  },
  {
    id: '2',
    userId: 'user_002',
    userName: 'Priya Nair',
    userLocation: 'Thiruvananthapuram',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    duration: 180, // 3 minutes
    language: 'English',
    channel: 'web',
    sentiment: 'negative',
    sentimentScore: -0.45,
    topics: ['Road Conditions', 'Public Transport', 'Traffic Management'],
    keywords: ['potholes', 'bus service', 'traffic', 'delays'],
    issues: ['road quality', 'transport frequency'],
    satisfaction: 45,
    demographic: {
      age: '25-34',
      gender: 'Female',
      occupation: 'Software Engineer',
      education: 'Post Graduate'
    },
    politicalLean: 'center',
    priority: 'high',
    resolved: false,
    category: 'complaint',
    aiConfidence: 92,
    humanHandoff: true
  },
  {
    id: '3',
    userId: 'user_003',
    userName: 'Arjun Menon',
    userLocation: 'Kozhikode',
    timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
    duration: 600, // 10 minutes
    language: 'Tamil',
    channel: 'telegram',
    sentiment: 'positive',
    sentimentScore: 0.68,
    topics: ['Healthcare Services', 'Hospital Facilities', 'Medicine Availability'],
    keywords: ['hospital', 'doctors', 'medicines', 'facilities'],
    issues: [],
    satisfaction: 88,
    demographic: {
      age: '45-54',
      gender: 'Male',
      occupation: 'Business Owner',
      education: 'Graduate'
    },
    politicalLean: 'neutral',
    priority: 'low',
    resolved: true,
    category: 'feedback',
    aiConfidence: 85,
    humanHandoff: false
  }
];

const initialMessages: Message[] = [
  {
    id: '1',
    conversationId: '1',
    sender: 'bot',
    content: 'Hello! I\'m Tamil Nadu Pulse Assistant. How can I help you share your thoughts about government services today?',
    timestamp: new Date(Date.now() - 900000),
    type: 'text',
    intent: 'greeting',
    confidence: 95,
    language: 'Tamil',
    processed: true
  },
  {
    id: '2',
    conversationId: '1',
    sender: 'user',
    content: 'I want to share feedback about the new education budget allocation. It seems very promising for our schools.',
    timestamp: new Date(Date.now() - 870000),
    type: 'text',
    sentiment: 'positive',
    language: 'Tamil',
    processed: true
  },
  {
    id: '3',
    conversationId: '1',
    sender: 'bot',
    content: 'Thank you for sharing your positive feedback! Could you tell me more about which specific aspects of the education budget you find most promising?',
    timestamp: new Date(Date.now() - 860000),
    type: 'text',
    intent: 'follow_up',
    confidence: 88,
    language: 'Tamil',
    processed: true
  }
];

const topicAnalysis: TopicAnalysis[] = [
  {
    id: '1',
    topic: 'Healthcare Services',
    mentions: 1247,
    sentiment: 0.65,
    priority: 'high',
    trend: 'rising',
    relatedIssues: ['doctor shortage', 'facility upgrades', 'medicine availability'],
    suggestedActions: ['Increase medical staff', 'Upgrade equipment', 'Improve supply chain']
  },
  {
    id: '2',
    topic: 'Education Budget',
    mentions: 892,
    sentiment: 0.78,
    priority: 'high',
    trend: 'stable',
    relatedIssues: ['infrastructure needs', 'teacher training', 'digital resources'],
    suggestedActions: ['Accelerate infrastructure projects', 'Expand training programs']
  },
  {
    id: '3',
    topic: 'Public Transport',
    mentions: 673,
    sentiment: -0.32,
    priority: 'medium',
    trend: 'declining',
    relatedIssues: ['route coverage', 'frequency', 'vehicle condition'],
    suggestedActions: ['Add new routes', 'Increase frequency', 'Vehicle maintenance']
  }
];

export default function ConversationBot() {
  const [activeTab, setActiveTab] = useState('live');
  const [selectedBot, setSelectedBot] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [analytics, setAnalytics] = useState({
    totalConversations: 60404,
    activeChats: 127,
    avgResponseTime: 0.8,
    satisfactionRate: 87,
    humanHandoffs: 8,
    resolvedToday: 1247,
    languageBreakdown: { Tamil: 45, English: 35, Hindi: 15, Telugu: 5 },
    topIssues: ['Healthcare', 'Education', 'Transport', 'Infrastructure']
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      conversationId: '1',
      sender: 'user',
      content: currentMessage,
      timestamp: new Date(),
      type: 'text',
      sentiment: 'neutral',
      language: selectedLanguage === 'all' ? 'Tamil' : selectedLanguage,
      processed: true
    };

    setMessages(prev => [...prev, newUserMessage]);
    setCurrentMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        conversationId: '1',
        sender: 'bot',
        content: 'Thanks for your message! 😊 Our team has received it and will respond shortly. Is there anything else you\'d like to share?',
        timestamp: new Date(),
        type: 'text',
        intent: 'acknowledgment',
        confidence: 95,
        language: selectedLanguage === 'all' ? 'Tamil' : selectedLanguage,
        processed: true
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'web': return Globe;
      case 'whatsapp': return MessageCircle;
      case 'telegram': return MessageSquare;
      case 'voice': return Phone;
      case 'sms': return MessageSquare;
      default: return MessageCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'complaint': return 'text-red-600 bg-red-100';
      case 'feedback': return 'text-blue-600 bg-blue-100';
      case 'suggestion': return 'text-green-600 bg-green-100';
      case 'inquiry': return 'text-purple-600 bg-purple-100';
      case 'political': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-green-600';
      case 'stable': return 'text-blue-600';
      case 'declining': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const tabs = [
    { key: 'live', label: 'Live Chat', icon: MessageCircle },
    { key: 'conversations', label: 'Conversations', icon: Users },
    { key: 'bots', label: 'Bot Config', icon: Bot },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'insights', label: 'AI Insights', icon: Brain }
  ];

  return (
    <div className="container-mobile py-6">
      <div className="space-responsive">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-blue-600 rounded-full">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-responsive-2xl font-bold text-gray-900">
                AI Conversation Bot
              </h1>
              <p className="text-responsive-sm text-gray-600">
                Intelligent dialogue system for voter engagement
              </p>
            </div>
          </div>

          {/* Real-time Status */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-responsive-sm font-medium text-gray-700">
                {analytics.activeChats} Active Conversations
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-responsive-sm text-gray-600">
                Avg Response: {analytics.avgResponseTime}s
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <MobileTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Live Chat Tab */}
        {activeTab === 'live' && (
          <div className="space-responsive">
            {/* Key Metrics */}
            <ResponsiveGrid cols={{ sm: 2, lg: 4 }}>
              <MobileCard padding="default" className="text-center">
                <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.activeChats}
                </div>
                <div className="text-responsive-sm text-gray-600">Active Chats</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.avgResponseTime}s
                </div>
                <div className="text-responsive-sm text-gray-600">Response Time</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.satisfactionRate}%
                </div>
                <div className="text-responsive-sm text-gray-600">Satisfaction</div>
              </MobileCard>
              
              <MobileCard padding="default" className="text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-responsive-xl font-bold text-gray-900">
                  {analytics.resolvedToday}
                </div>
                <div className="text-responsive-sm text-gray-600">Resolved Today</div>
              </MobileCard>
            </ResponsiveGrid>

            {/* Live Chat Interface */}
            <MobileCard padding="none" className="h-96">
              <div className="flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-responsive-sm font-semibold text-gray-900">
                          Tamil Nadu Pulse Assistant
                        </div>
                        <div className="text-xs text-green-600">Online</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <MobileButton variant="ghost" size="small">
                        <Volume2 className="w-4 h-4" />
                      </MobileButton>
                      <MobileButton variant="ghost" size="small">
                        <Settings className="w-4 h-4" />
                      </MobileButton>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${
                        message.sender === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      } rounded-lg px-4 py-2`}>
                        <div className="text-responsive-sm">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                          {message.confidence && ` • ${message.confidence}% confidence`}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Image className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Smile className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <MobileButton
                      variant={isListening ? 'primary' : 'outline'}
                      size="small"
                      onClick={() => setIsListening(!isListening)}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </MobileButton>
                    
                    <MobileButton variant="primary" size="small" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </MobileButton>
                  </div>
                </div>
              </div>
            </MobileCard>

            {/* Quick Actions */}
            <MobileCard padding="default">
              <h3 className="text-responsive-base font-semibold text-gray-900 mb-3">
                Quick Actions
              </h3>
              <ResponsiveGrid cols={{ sm: 2, md: 4 }} gap="small">
                <MobileButton variant="outline" size="small">
                  <Users className="w-4 h-4 mr-2" />
                  View Queue
                </MobileButton>
                <MobileButton variant="outline" size="small">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Training
                </MobileButton>
                <MobileButton variant="outline" size="small">
                  <Languages className="w-4 h-4 mr-2" />
                  Languages
                </MobileButton>
                <MobileButton variant="outline" size="small">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </MobileButton>
              </ResponsiveGrid>
            </MobileCard>
          </div>
        )}

        {/* Conversations Tab */}
        {activeTab === 'conversations' && (
          <div className="space-responsive">
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <MobileButton
                  variant="outline"
                  size="small"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                </MobileButton>
              </div>

              {showFilters && (
                <MobileCard padding="default" className="bg-gray-50">
                  <ResponsiveGrid cols={{ sm: 1, md: 4 }} gap="small">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Channel</label>
                      <select
                        value={selectedChannel}
                        onChange={(e) => setSelectedChannel(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Channels</option>
                        <option value="web">Web</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="telegram">Telegram</option>
                        <option value="voice">Voice</option>
                        <option value="sms">SMS</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Language</label>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Languages</option>
                        <option value="Tamil">Tamil</option>
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Tamil">Tamil</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Bot</label>
                      <select
                        value={selectedBot}
                        onChange={(e) => setSelectedBot(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">All Bots</option>
                        {botConfigurations.map(bot => (
                          <option key={bot.id} value={bot.id}>{bot.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                      <select className="w-full p-2 border border-gray-300 rounded text-sm">
                        <option value="all">All Status</option>
                        <option value="resolved">Resolved</option>
                        <option value="pending">Pending</option>
                        <option value="escalated">Escalated</option>
                      </select>
                    </div>
                  </ResponsiveGrid>
                </MobileCard>
              )}
            </div>

            {/* Conversations List */}
            <div className="space-y-4">
              {mockConversations.map(conversation => {
                const ChannelIcon = getChannelIcon(conversation.channel);
                
                return (
                  <MobileCard key={conversation.id} padding="default">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-responsive-sm font-semibold text-gray-900">
                              {conversation.userName}
                            </h4>
                            <ChannelIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">{conversation.channel}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                            <span>{conversation.userLocation}</span>
                            <span>•</span>
                            <span>{conversation.language}</span>
                            <span>•</span>
                            <span>{Math.floor(conversation.duration / 60)}m conversation</span>
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded ${getSentimentColor(conversation.sentiment)}`}>
                              {conversation.sentiment} ({(conversation.sentimentScore * 100).toFixed(0)}%)
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(conversation.category)}`}>
                              {conversation.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(conversation.priority)}`}>
                              {conversation.priority} priority
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {conversation.topics.slice(0, 3).map(topic => (
                              <span key={topic} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                {topic}
                              </span>
                            ))}
                          </div>
                          
                          {conversation.issues.length > 0 && (
                            <div className="text-xs text-gray-600 mb-2">
                              <strong>Issues:</strong> {conversation.issues.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-2">
                          {new Date(conversation.timestamp).toLocaleTimeString()}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div className="text-center p-1 bg-gray-50 rounded">
                            <div className="font-medium text-gray-900">{conversation.satisfaction}%</div>
                            <div className="text-gray-600">Satisfaction</div>
                          </div>
                          <div className="text-center p-1 bg-gray-50 rounded">
                            <div className="font-medium text-gray-900">{conversation.aiConfidence}%</div>
                            <div className="text-gray-600">AI Score</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-2">
                          {conversation.resolved ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          )}
                          {conversation.humanHandoff && (
                            <User className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          AI Confidence: {conversation.aiConfidence}% | 
                          {conversation.demographic.age} {conversation.demographic.gender} | 
                          {conversation.demographic.occupation}
                        </div>
                        
                        <div className="flex space-x-2">
                          <MobileButton variant="ghost" size="small">
                            <Eye className="w-4 h-4" />
                          </MobileButton>
                          <MobileButton variant="ghost" size="small">
                            <Copy className="w-4 h-4" />
                          </MobileButton>
                          <MobileButton variant="ghost" size="small">
                            <Share2 className="w-4 h-4" />
                          </MobileButton>
                        </div>
                      </div>
                    </div>
                  </MobileCard>
                );
              })}
            </div>
          </div>
        )}

        {/* Bot Configuration Tab */}
        {activeTab === 'bots' && (
          <div className="space-responsive">
            <div className="space-y-4">
              {botConfigurations.map(bot => (
                <MobileCard key={bot.id} padding="default">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${bot.active ? 'bg-green-100' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                        <Bot className={`w-6 h-6 ${bot.active ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-responsive-base font-semibold text-gray-900">
                            {bot.name}
                          </h4>
                          <div className={`w-3 h-3 rounded-full ${bot.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        
                        <p className="text-responsive-sm text-gray-700 mb-2">
                          {bot.description}
                        </p>
                        
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {bot.personality}
                          </span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            {bot.aiModel}
                          </span>
                          {bot.language.slice(0, 2).map(lang => (
                            <span key={lang} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                              {lang}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                          <span>Response Time: {bot.responseTime}s</span>
                          <span>Accuracy: {bot.accuracy}%</span>
                          <span>Satisfaction: {bot.satisfactionRate}%</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {bot.channels.map(channel => (
                            <span key={channel} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {channel}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-responsive-lg font-bold text-gray-900 mb-1">
                        {bot.totalConversations.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">Total Chats</div>
                      
                      <div className="flex space-x-2">
                        <MobileButton variant="outline" size="small">
                          <Settings className="w-4 h-4" />
                        </MobileButton>
                        <MobileButton variant="primary" size="small">
                          {bot.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </MobileButton>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-700 mb-2">Knowledge Base:</div>
                    <div className="flex flex-wrap gap-1">
                      {bot.knowledgeBase.map(kb => (
                        <span key={kb} className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                          {kb}
                        </span>
                      ))}
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-responsive">
            {/* Language Distribution */}
            <MobileCard padding="default">
              <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                Language Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.languageBreakdown).map(([language, percentage]) => (
                  <div key={language} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">{language}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-900 w-8">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>

            {/* Topic Analysis */}
            <MobileCard padding="default">
              <h3 className="text-responsive-base font-semibold text-gray-900 mb-4">
                Topic Analysis
              </h3>
              
              <div className="space-y-4">
                {topicAnalysis.map(topic => (
                  <div key={topic.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-responsive-sm font-semibold text-gray-900">
                        {topic.topic}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className={`w-4 h-4 ${getTrendColor(topic.trend)}`} />
                        <span className={`text-xs font-medium ${getTrendColor(topic.trend)}`}>
                          {topic.trend}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-2">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-responsive-sm font-bold text-gray-900">
                          {topic.mentions}
                        </div>
                        <div className="text-xs text-gray-600">Mentions</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className={`text-responsive-sm font-bold ${
                          topic.sentiment > 0.5 ? 'text-green-600' :
                          topic.sentiment < -0.5 ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {(topic.sentiment * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-600">Sentiment</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className={`text-responsive-sm font-bold ${getPriorityColor(topic.priority).split(' ')[0]}`}>
                          {topic.priority}
                        </div>
                        <div className="text-xs text-gray-600">Priority</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>Related Issues:</strong> {topic.relatedIssues.join(', ')}
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      <strong>Suggested Actions:</strong> {topic.suggestedActions.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </MobileCard>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-responsive">
            <MobileCard padding="default">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">
                AI-Generated Conversation Insights
              </h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Conversation Patterns
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    85% of conversations follow predictable patterns. Most users start with specific issues 
                    and evolve into broader policy discussions. Average conversation depth: 7.3 exchanges.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Sentiment Trends
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Healthcare discussions show improving sentiment (+12% this week). Education feedback 
                    remains consistently positive (78% positive sentiment). Transport concerns declining.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      User Behavior Analysis
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Young users prefer WhatsApp (67%), while older demographics use web interface (78%). 
                    Tamil conversations 40% longer on average than English ones.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Bot Performance Optimization
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Survey bot achieving highest accuracy (95%) but lowest satisfaction (82%). 
                    Youth Engagement bot has highest satisfaction (91%) with 88% accuracy.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h4 className="text-responsive-sm font-semibold text-gray-900">
                      Improvement Recommendations
                    </h4>
                  </div>
                  <p className="text-responsive-xs text-gray-700">
                    Reduce human handoffs by improving complaint resolution bot. Add more Tamil 
                    training data for better regional understanding. Implement proactive follow-ups.
                  </p>
                </div>
              </div>
            </MobileCard>
          </div>
        )}
      </div>
    </div>
  );
}