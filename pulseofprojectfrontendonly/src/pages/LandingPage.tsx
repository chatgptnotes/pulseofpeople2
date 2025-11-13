import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VideoModal from '../components/VideoModal';
import DemoModal from '../components/DemoModal';
import {
  ArrowRight,
  BarChart3,
  Users,
  Target,
  Brain,
  Share2,
  Vote,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  Star,
  Play,
  Award,
  MapPin,
  Clock,
  Briefcase,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';
import {
  Event as CalendarIcon,
  Lock as LockIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  HowToVote as VoteIcon
} from '@mui/icons-material';

export default function LandingPage() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const handleVideoClick = () => {
    setIsVideoModalOpen(true);
  };

  const handleBookDemoClick = () => {
    setIsDemoModalOpen(true);
  };
  const features = [
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Monitor voter sentiment and campaign performance with live data visualization and comprehensive reporting tools.'
    },
    {
      icon: Users,
      title: 'Voter Database Management',
      description: 'Comprehensive voter registration, demographic analysis, and targeted outreach capabilities.'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms provide predictive analytics and strategic campaign recommendations.'
    },
    {
      icon: Share2,
      title: 'Social Media Monitoring',
      description: 'Track conversations, trends, and sentiment across all major social media platforms in real-time.'
    },
    {
      icon: Target,
      title: 'Competitor Analysis',
      description: 'Monitor opponent campaigns, strategies, and performance metrics to stay ahead of the competition.'
    },
    {
      icon: Briefcase,
      title: 'Field Operations',
      description: 'Manage field workers, volunteers, and ground-level campaign activities with comprehensive tools.'
    }
  ];

  const stats = [
    { number: '50M+', label: 'Voter Records Analyzed' },
    { number: '99.9%', label: 'Platform Uptime' },
    { number: '24/7', label: 'Real-Time Monitoring' },
    { number: '500+', label: 'Successful Campaigns' }
  ];

  const testimonials = [
    {
      quote: "BETTROI transformed our campaign strategy with incredible insights. The AI-powered recommendations helped us increase voter engagement by 300%.",
      author: "Sarah Johnson",
      role: "Campaign Manager",
      party: "Progressive Alliance",
      avatar: <TrendingUpIcon className="w-8 h-8 text-blue-500" />
    },
    {
      quote: "The real-time sentiment analysis gave us the edge we needed. We could respond to public opinion shifts within hours instead of days.",
      author: "Rajesh Kumar",
      role: "Political Strategist",
      party: "Democratic Coalition",
      avatar: <BarChartIcon className="w-8 h-8 text-green-500" />
    },
    {
      quote: "Field worker management became seamless with BETTROI. Our volunteer coordination improved dramatically, leading to better ground coverage.",
      author: "Maria Rodriguez",
      role: "Operations Director",
      party: "United Reform Party",
      avatar: <VoteIcon className="w-8 h-8 text-purple-500" />
    }
  ];

  const useCases = [
    {
      icon: Vote,
      title: 'Election Campaigns',
      description: 'Complete campaign management from voter outreach to performance tracking.'
    },
    {
      icon: TrendingUp,
      title: 'Policy Research',
      description: 'Understand public opinion on key issues and policy proposals.'
    },
    {
      icon: Globe,
      title: 'Public Sentiment Analysis',
      description: 'Monitor community response to political events and announcements.'
    },
    {
      icon: Shield,
      title: 'Crisis Management',
      description: 'Early detection and response to political crises and reputation threats.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Brand Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
              <Award className="w-4 h-4 mr-2" />
              #1 Political Intelligence Platform
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block mb-2">
                Pulse of People
              </span>
              Win Elections with Data-Driven Intelligence
            </h1>

            {/* Hero Subtitle */}
            <p className="text-xl lg:text-2xl text-gray-200 max-w-4xl mx-auto mb-10 leading-relaxed">
              Pulse of People combines real-time voter sentiment analysis, AI-powered campaign insights,
              and comprehensive political intelligence to help you make informed decisions and win elections.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleBookDemoClick}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center transform hover:scale-105"
              >
                <CalendarIcon className="mr-2 w-5 h-5" />
                Book a Demo
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                to="/login"
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center transform hover:scale-105"
              >
                <LockIcon className="mr-2 w-5 h-5" />
                Login
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={handleVideoClick}
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center transform hover:scale-105"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/70 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                SOC 2 Type II Certified
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-400" />
                GDPR Compliant
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-purple-400" />
                24/7 Support
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-indigo-500/10 rounded-full animate-ping"></div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything you need to
              <span className="text-blue-600 block">win your campaign</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From voter sentiment analysis to field operations management,
              Pulse of People provides all the tools modern political campaigns need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Built for every
              <span className="text-purple-600 block">political need</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're running for office, conducting policy research, or managing public relations,
              BETTROI adapts to your specific requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start space-x-6 p-8 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <useCase.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by winning
              <span className="text-green-600 block">campaigns worldwide</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how political leaders and campaign managers are using BETTROI
              to gain the insights they need to win.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="mr-4 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.party}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to transform your campaign?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join hundreds of successful campaigns that trust BETTROI for their political intelligence needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBookDemoClick}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-105"
            >
              <CalendarIcon className="mr-2 w-5 h-5" />
              Book a Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
            >
              <LockIcon className="mr-2 w-5 h-5" />
              Admin Login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold">Pulse of People</div>
                    {/* <div className="text-sm text-gray-400">by BETTROI</div> */}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                The world's most ADVANCED political intelligence platform,
                empowering campaigns with data-driven insights and real-time pulse monitoring.
              </p>
              <div className="flex items-center text-gray-400">
                <MapPin className="w-4 h-4 mr-2" />
                Animal-i Initiative • Global Headquarters: Dubai
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link to="/voter-database" className="hover:text-white transition-colors">Voter Database</Link></li>
                <li><Link to="/ai-insights" className="hover:text-white transition-colors">AI Insights</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact Sales</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                  <span className="text-sm">Dubai, UAE (HQ)</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-blue-400" />
                  <a href="tel:+971547148580" className="text-sm hover:text-white transition-colors">
                    +971 54 714 8580
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-green-400" />
                  <a href="tel:+919373111709" className="text-sm hover:text-white transition-colors">
                    +91 9373111709 (India)
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-orange-400" />
                  <a href="tel:+971521700972" className="text-sm hover:text-white transition-colors">
                    +971 52 170 0972
                  </a>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-cyan-400" />
                  <a href="mailto:contact@pulseofpeople.com" className="text-sm hover:text-white transition-colors">
                    contact@pulseofpeople.com
                  </a>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2 text-yellow-400" />
                  <a href="https://wa.me/971547148580" className="text-sm hover:text-white transition-colors">
                    WhatsApp Sales
                  </a>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <p className="text-xs font-medium">24/7 Sales Support</p>
                  <p className="text-xs">Tamil Nadu Project Office Available</p>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BETTROI. All rights reserved. Built with ❤️ for political change.</p>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title="BETTROI Platform Demo"
      />

      {/* Demo Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
