import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Users, Check, X, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PoliticalChoice() {
  const [selectedChoices, setSelectedChoices] = useState<{[key: string]: string}>({});

  const handleChoice = (questionId: string, choice: string) => {
    setSelectedChoices(prev => ({
      ...prev,
      [questionId]: choice
    }));
  };

  const politicalQuestions = [
    {
      id: 'economic-policy',
      question: 'Which economic approach should the government prioritize?',
      choices: [
        { id: 'market-driven', label: 'Market-Driven Growth', description: 'Reduce regulations, cut taxes, encourage private sector' },
        { id: 'social-welfare', label: 'Social Welfare Focus', description: 'Increase public spending, expand social programs' },
        { id: 'balanced-approach', label: 'Balanced Approach', description: 'Mix of private enterprise and government intervention' }
      ]
    },
    {
      id: 'healthcare',
      question: 'What should be the government\'s role in healthcare?',
      choices: [
        { id: 'universal', label: 'Universal Healthcare', description: 'Government-funded healthcare for all citizens' },
        { id: 'private', label: 'Private Healthcare', description: 'Market-based healthcare with minimal government involvement' },
        { id: 'hybrid', label: 'Hybrid System', description: 'Public-private partnership in healthcare delivery' }
      ]
    },
    {
      id: 'education',
      question: 'How should education be funded and managed?',
      choices: [
        { id: 'public', label: 'Public Education', description: 'Fully government-funded and managed education system' },
        { id: 'school-choice', label: 'School Choice', description: 'Voucher system allowing choice between public and private' },
        { id: 'mixed', label: 'Mixed System', description: 'Strong public system with private alternatives' }
      ]
    }
  ];

  const getResults = () => {
    const totalQuestions = politicalQuestions.length;
    const answeredQuestions = Object.keys(selectedChoices).length;
    const completionRate = (answeredQuestions / totalQuestions) * 100;
    
    return { totalQuestions, answeredQuestions, completionRate };
  };

  const { totalQuestions, answeredQuestions, completionRate } = getResults();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/legacy"
                className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold text-white">Political Choice Center</h1>
            </div>
            <div className="text-white/70 text-sm">
              Express Your Political Preferences
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Your Political Preference Survey</h2>
            <div className="text-white/70">
              {answeredQuestions} of {totalQuestions} completed
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <p className="text-gray-300 text-sm">
            Help us understand the political landscape by sharing your policy preferences. 
            Your choices help build comprehensive voter sentiment analysis.
          </p>
        </div>

        {/* Political Questions */}
        <div className="space-y-8">
          {politicalQuestions.map((question) => (
            <div key={question.id} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
              <div className="flex items-start space-x-3 mb-6">
                <div className="flex-shrink-0">
                  {selectedChoices[question.id] ? (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{question.question}</h3>
                  <div className="space-y-3">
                    {question.choices.map((choice) => (
                      <div key={choice.id} className="relative">
                        <button
                          onClick={() => handleChoice(question.id, choice.id)}
                          className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                            selectedChoices[question.id] === choice.id
                              ? 'bg-blue-500/20 border-blue-400 text-white'
                              : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium mb-1">{choice.label}</div>
                              <div className="text-sm opacity-80">{choice.description}</div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedChoices[question.id] === choice.id
                                ? 'border-blue-400 bg-blue-500'
                                : 'border-gray-400'
                            }`}>
                              {selectedChoices[question.id] === choice.id && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Results Summary */}
        {completionRate > 0 && (
          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Your Political Profile Summary
            </h3>
            
            {completionRate === 100 ? (
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-green-400 mb-2">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Survey Complete!</span>
                </div>
                <p className="text-green-100 text-sm">
                  Thank you for sharing your political preferences. Your responses contribute to our comprehensive voter sentiment analysis.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">In Progress</span>
                </div>
                <p className="text-yellow-100 text-sm">
                  Complete all questions to see your full political profile and contribute to the analysis.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{answeredQuestions}</div>
                <div className="text-sm text-gray-300">Questions Answered</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{Math.round(completionRate)}%</div>
                <div className="text-sm text-gray-300">Complete</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{totalQuestions - answeredQuestions}</div>
                <div className="text-sm text-gray-300">Remaining</div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-6 border border-blue-400/30">
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <div className="text-lg font-bold text-blue-400 mb-2">Anonymous & Secure</div>
            <div className="text-blue-100 text-sm">Your responses are completely anonymous and help build aggregate insights</div>
          </div>
          <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-6 border border-green-400/30">
            <BarChart3 className="w-8 h-8 text-green-400 mb-3" />
            <div className="text-lg font-bold text-green-400 mb-2">Real-time Analysis</div>
            <div className="text-green-100 text-sm">Responses are analyzed in real-time to track political sentiment trends</div>
          </div>
        </div>
      </div>
    </div>
  );
}