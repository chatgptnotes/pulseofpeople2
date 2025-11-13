import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Star,
  Download,
  Filter,
  Search,
  Tag,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  category?: 'complaint' | 'faq' | 'feedback' | 'suggestion';
  sentiment?: number;
  status?: 'pending' | 'resolved' | 'escalated';
  rating?: number;
}

interface FeedbackEntry {
  id: string;
  type: 'complaint' | 'faq' | 'feedback' | 'suggestion';
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  timestamp: Date;
  userInfo: {
    location: string;
    demographic: string;
    contactMethod?: string;
  };
  sentiment: number;
  tags: string[];
  assignedTo?: string;
  resolution?: string;
  satisfactionRating?: number;
}

export default function FeedbackChatbot() {
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'management'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock feedback entries
  const [feedbackEntries] = useState<FeedbackEntry[]>([
    {
      id: '1',
      type: 'complaint',
      title: 'Delayed Healthcare Services',
      content: 'Long waiting time at government hospital in Kochi. Waited 3 hours for consultation.',
      category: 'Healthcare',
      priority: 'high',
      status: 'in_progress',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      userInfo: {
        location: 'Kochi',
        demographic: 'Senior (60+)',
        contactMethod: 'phone'
      },
      sentiment: 0.2,
      tags: ['waiting-time', 'government-hospital', 'healthcare'],
      assignedTo: 'Healthcare Team'
    },
    {
      id: '2',
      type: 'suggestion',
      title: 'Digital Job Portal for Youth',
      content: 'Create a centralized digital platform for job postings specifically for Tamil Nadu youth with skill matching.',
      category: 'Employment',
      priority: 'medium',
      status: 'open',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      userInfo: {
        location: 'Thiruvananthapuram',
        demographic: 'Youth (22)',
        contactMethod: 'online'
      },
      sentiment: 0.7,
      tags: ['youth', 'employment', 'digital-platform', 'skill-matching']
    },
    {
      id: '3',
      type: 'feedback',
      title: 'Improved School Infrastructure',
      content: 'Happy to see new smart classrooms being installed in our local school. Kids are more engaged now.',
      category: 'Education',
      priority: 'low',
      status: 'resolved',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      userInfo: {
        location: 'Kollam',
        demographic: 'Parent (35)',
        contactMethod: 'online'
      },
      sentiment: 0.8,
      tags: ['education', 'infrastructure', 'smart-classroom', 'positive'],
      satisfactionRating: 5
    }
  ]);

  // Initial bot message - friendly greeting
  useEffect(() => {
    if (chatMessages.length === 0) {
      const hour = new Date().getHours();
      let greeting = 'Hey there! 👋';

      if (hour < 12) greeting = 'Good morning! ☀️';
      else if (hour < 17) greeting = 'Hey there! 👋';
      else greeting = 'Good evening! 🌙';

      setChatMessages([{
        id: '1',
        type: 'bot',
        message: `${greeting} I'm your friendly assistant for Tamil Nadu 2026 elections! 😊\n\nI'd love to help you with:\n• 💬 Complaints or concerns\n• ❓ Questions you might have\n• 💭 Feedback to share\n• 💡 Suggestions for improvement\n\nWhat's on your mind today?`,
        timestamp: new Date()
      }]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      setChatMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    let response = '';
    let category: 'complaint' | 'faq' | 'feedback' | 'suggestion' | undefined;

    // Determine category and response with friendly, casual tone
    if (input.includes('complain') || input.includes('problem') || input.includes('issue') || input.includes('delay') || input.includes('bad')) {
      category = 'complaint';
      response = 'I hear you, and I\'m really sorry you\'re facing this issue. 💙 Let\'s work on this together!\n\nI\'ve logged your complaint and it\'ll reach the right team ASAP. Could you share a bit more about:\n• Where this happened\n• When it occurred\n• Any other details that might help\n\nWe\'re on it! 💪';
    } else if (input.includes('suggest') || input.includes('idea') || input.includes('improve') || input.includes('recommend')) {
      category = 'suggestion';
      response = 'Wow, love hearing your ideas! 💡✨\n\nYour suggestion has been recorded and our policy team will definitely check it out. Your input helps us do better!\n\nGot more thoughts to share? I\'m all ears! 😊';
    } else if (input.includes('good') || input.includes('happy') || input.includes('satisfied') || input.includes('thank')) {
      category = 'feedback';
      response = 'This made my day! 🌟😊\n\nThanks so much for sharing your positive experience! It really means a lot to the whole team. We love hearing when things go well!\n\nAnything specific you\'d like to highlight? Your feedback helps us keep up the good work! 🙌';
    } else if (input.includes('how') || input.includes('what') || input.includes('when') || input.includes('where') || input.includes('?')) {
      category = 'faq';
      if (input.includes('vote') || input.includes('election')) {
        response = 'Great question! 🗳️\n\nHere\'s what you need to know about voting:\n• Elections are coming up in 2026\n• Bring your valid ID to your polling station\n• Check if you\'re registered to vote\n\nNeed help finding your polling station or want to register? Just let me know! 👍';
      } else if (input.includes('manifesto') || input.includes('policy')) {
        response = 'Awesome that you\'re checking out the policies! 📋\n\nYou can find all the manifestos in our "Manifesto Match" section - it\'s really cool because it compares what parties promise with what voters want.\n\nWant me to walk you through it? 😊';
      } else {
        response = 'I\'d love to help you out! 😊\n\nI can answer questions about:\n• 🗳️ Voting procedures\n• 👥 Candidate info\n• 📋 Party manifestos\n• 📍 Polling locations\n• ✅ Registration details\n\nWhat would you like to know more about?';
      }
    } else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      response = 'Hey! 👋 Great to chat with you!\n\nHow can I help you today? Feel free to ask me anything about the elections, share feedback, or just let me know what\'s on your mind! 😊';
    } else {
      response = 'Hmm, I\'m not quite sure I got that! 🤔\n\nNo worries though! I\'m here to help with:\n• 💬 Any complaints or concerns\n• ❓ Questions about elections\n• 💭 Feedback you want to share\n• 💡 Suggestions for improvement\n\nCould you tell me a bit more about what you\'re looking for? 😊';
    }

    setCurrentCategory(category);

    return {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      message: response,
      timestamp: new Date(),
      category,
      sentiment: calculateSentiment(userInput)
    };
  };

  const calculateSentiment = (text: string): number => {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'thank', 'improve', 'better'];
    const negativeWords = ['bad', 'terrible', 'awful', 'delay', 'problem', 'complaint', 'issue', 'worst'];
    
    let score = 0.5; // neutral
    positiveWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score += 0.1;
    });
    negativeWords.forEach(word => {
      if (text.toLowerCase().includes(word)) score -= 0.1;
    });
    
    return Math.max(0, Math.min(1, score));
  };

  const handleRateResponse = (messageId: string, rating: 'up' | 'down') => {
    setChatMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, rating: rating === 'up' ? 1 : -1 } : msg
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'complaint': return <AlertCircle className="h-4 w-4" />;
      case 'suggestion': return <Zap className="h-4 w-4" />;
      case 'feedback': return <Star className="h-4 w-4" />;
      case 'faq': return <HelpCircle className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Bot className="mr-2 h-6 w-6 text-blue-600" />
            AI Feedback Management System
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered chatbot for complaints, FAQ, feedback, and suggestions
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
          >
            <MessageCircle className="mr-1 h-4 w-4" />
            {isChatOpen ? 'Close Chat' : 'Open Chat'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'chat', label: 'AI Chat Interface', icon: MessageCircle },
              { key: 'analytics', label: 'Analytics', icon: Search },
              { key: 'management', label: 'Management', icon: Filter }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
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

      {/* Chat Interface Tab */}
      {activeTab === 'chat' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-blue-800">Available</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-sm text-green-800">Resolution Rate</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-purple-800">Languages</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">&lt;2min</div>
              <div className="text-sm text-orange-800">Avg Response</div>
            </div>
          </div>

          {isChatOpen ? (
            <div className="border border-gray-300 rounded-lg h-96 flex flex-col">
              {/* Chat Header */}
              <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  <span className="font-medium">AI Assistant - Tamil Nadu Elections 2026</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Online</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.type === 'bot' && <Bot className="h-4 w-4 mt-0.5 text-blue-600" />}
                        {message.type === 'user' && <User className="h-4 w-4 mt-0.5" />}
                        <div className="flex-1">
                          <div className="text-sm">{message.message}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                          {message.category && (
                            <div className="text-xs mt-1">
                              <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                                {message.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {message.type === 'bot' && !message.rating && (
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleRateResponse(message.id, 'up')}
                            className="text-gray-600 hover:text-green-600 transition-colors"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleRateResponse(message.id, 'down')}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-300 p-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border border-gray-300 rounded-lg bg-gray-50">
              <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Assistant Ready</h4>
              <p className="text-gray-600 mb-4">Click "Open Chat" to start a conversation</p>
              <div className="flex justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                  Complaints
                </div>
                <div className="flex items-center">
                  <HelpCircle className="h-4 w-4 mr-1 text-blue-500" />
                  FAQ
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-green-500" />
                  Feedback
                </div>
                <div className="flex items-center">
                  <Zap className="h-4 w-4 mr-1 text-purple-500" />
                  Suggestions
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-red-900">
                    {feedbackEntries.filter(e => e.type === 'complaint').length}
                  </div>
                  <div className="text-sm text-red-700">Total Complaints</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <HelpCircle className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">156</div>
                  <div className="text-sm text-blue-700">FAQ Responses</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-green-900">
                    {feedbackEntries.filter(e => e.type === 'feedback').length}
                  </div>
                  <div className="text-sm text-green-700">Feedback Received</div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-purple-900">
                    {feedbackEntries.filter(e => e.type === 'suggestion').length}
                  </div>
                  <div className="text-sm text-purple-700">Suggestions</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Response Time Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Instant (AI)</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-200 rounded-full h-2 w-24 relative">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">&lt;1 hour</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-200 rounded-full h-2 w-24 relative">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12%' }}></div>
                    </div>
                    <span className="text-sm font-medium">12%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">1-24 hours</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-yellow-200 rounded-full h-2 w-24 relative">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '3%' }}></div>
                    </div>
                    <span className="text-sm font-medium">3%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Sentiment Analysis</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Positive</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-200 rounded-full h-2 w-20 relative">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Neutral</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-200 rounded-full h-2 w-20 relative">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Negative</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-red-200 rounded-full h-2 w-20 relative">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Management Tab */}
      {activeTab === 'management' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-gray-900">Feedback Management</h4>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                <Filter className="h-4 w-4 inline mr-1" />
                Filter
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Download className="h-4 w-4 inline mr-1" />
                Export
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {feedbackEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center text-gray-600">
                        {getTypeIcon(entry.type)}
                        <span className="ml-1 text-sm font-medium capitalize">{entry.type}</span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(entry.priority)}`}>
                        {entry.priority.toUpperCase()}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(entry.status)}`}>
                        {entry.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">{entry.title}</h5>
                    <p className="text-sm text-gray-700 mb-2">{entry.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span>{entry.userInfo.location}</span>
                      <span>{entry.userInfo.demographic}</span>
                      <span>{entry.timestamp.toLocaleDateString()}</span>
                      {entry.assignedTo && <span>Assigned to: {entry.assignedTo}</span>}
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <div className="flex space-x-1">
                      {entry.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {entry.satisfactionRating && (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < entry.satisfactionRating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {entry.resolution && (
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-green-900">Resolution</div>
                        <div className="text-sm text-green-800">{entry.resolution}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}