import { useState } from 'react';
import { Send, MessageCircle, Bot, User, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'welcome' | 'command' | 'data' | 'confirmation';
}

export default function WhatsAppBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to Animal-I Data Bot! 🤖\n\nI can help you submit ground intelligence data quickly. Use these commands:\n\n📊 /daily - Submit daily sentiment report\n📈 /weekly - Submit weekly summary\n📋 /survey - Submit survey results\n🔍 /status - Check submission status\n❓ /help - Show all commands',
      sender: 'bot',
      timestamp: new Date(),
      type: 'welcome'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (text: string, sender: 'user' | 'bot', type?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      type: type as any
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = '';
      let type = 'command';

      if (userMessage.toLowerCase().includes('/daily')) {
        response = 'Starting daily sentiment report submission... 📝\n\nPlease provide:\n1️⃣ Your ward number\n2️⃣ 3 positive reactions heard today\n3️⃣ 3 negative reactions heard today\n4️⃣ Any viral content links\n\nExample: Ward 15, Positive: "Good road repair work", Negative: "Water shortage in sector 12"';
      } else if (userMessage.toLowerCase().includes('/weekly')) {
        response = 'Weekly summary submission initiated 📊\n\nPlease include:\n🔸 Ward-wise feedback summary\n🔸 Opposition activity snapshot\n🔸 Event turnout numbers\n🔸 Key trends observed\n\nSend your data in the format above.';
      } else if (userMessage.toLowerCase().includes('/survey')) {
        response = 'Survey results submission 📋\n\nPlease provide:\n📈 Survey methodology\n👥 Sample size\n📊 Key findings\n📍 Coverage areas\n\nYou can also attach CSV/Excel files.';
      } else if (userMessage.toLowerCase().includes('/status')) {
        response = 'Your recent submissions:\n\n✅ Daily Report (Aug 15) - Verified\n⏳ Weekly Summary (Aug 14) - Pending Review\n❌ Survey Data (Aug 12) - Needs Revision\n\nTotal submissions this month: 23';
      } else if (userMessage.toLowerCase().includes('/help')) {
        response = 'Animal-I Bot Commands 🤖\n\n📊 /daily - Daily sentiment report\n📈 /weekly - Weekly summary\n📋 /survey - Survey results\n🔍 /status - Check submission status\n📱 /contact - Get support contact\n📖 /guide - Data collection guide\n\nFor complex submissions, use the web form: bettroi.com/submit';
      } else if (userMessage.toLowerCase().includes('ward')) {
        response = 'Great! I see you\'re reporting from a ward. Your data has been recorded:\n\n✅ Location captured\n✅ Sentiment data logged\n✅ Timestamp added\n\nSubmission ID: #BR' + Math.random().toString(36).substr(2, 9).toUpperCase() + '\n\nYour data will be verified within 2 hours. Thank you for contributing! 🙏';
        type = 'confirmation';
      } else {
        response = 'I didn\'t understand that command. 🤔\n\nType /help to see available commands or use /daily to start a quick sentiment report.';
      }

      setIsTyping(false);
      addMessage(response, 'bot', type);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    addMessage(inputText, 'user');
    simulateBotResponse(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickCommands = ['/daily', '/weekly', '/status', '/help'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-96 flex flex-col">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center">
        <MessageCircle className="w-6 h-6 mr-3" />
        <div>
          <h3 className="font-semibold">Animal-I Data Bot</h3>
          <p className="text-xs text-green-100">WhatsApp Integration Demo</p>
        </div>
        <div className="ml-auto">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md ${
              message.sender === 'user' 
                ? 'bg-green-500 text-white rounded-l-lg rounded-tr-lg' 
                : 'bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg'
            } p-3`}>
              <div className="flex items-start">
                {message.sender === 'bot' && (
                  <Bot className="w-4 h-4 mr-2 mt-0.5 text-green-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${
                      message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.sender === 'user' && (
                      <CheckCircle className="w-3 h-3 text-green-200" />
                    )}
                  </div>
                </div>
                {message.sender === 'user' && (
                  <User className="w-4 h-4 ml-2 mt-0.5 text-green-200" />
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-r-lg rounded-tl-lg p-3 max-w-xs">
              <div className="flex items-center">
                <Bot className="w-4 h-4 mr-2 text-green-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Commands */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex space-x-2 mb-2">
          {quickCommands.map((command) => (
            <button
              key={command}
              onClick={() => {
                setInputText(command);
                setTimeout(() => {
                  addMessage(command, 'user');
                  simulateBotResponse(command);
                  setInputText('');
                }, 100);
              }}
              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              {command}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message or use commands..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}