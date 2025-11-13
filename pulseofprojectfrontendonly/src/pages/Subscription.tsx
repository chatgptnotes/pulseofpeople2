import React, { useState } from 'react';
import {
  Check,
  Star,
  Shield,
  Users,
  BarChart3,
  Globe,
  Phone,
  Mail,
  CreditCard,
  Lock,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
  BookOpen,
  MapPin,
  Crown,
  Sparkles,
  Award,
  HeadphonesIcon,
  Clock
} from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
  enterprise?: boolean;
  badge?: string;
}

export default function Subscription() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const pricingPlans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: billingCycle === 'monthly' ? 3000 : 30000,
      period: billingCycle === 'monthly' ? 'per month' : 'per year',
      description: 'Perfect for small constituencies or pilot campaigns',
      features: [
        'Up to 2 election areas',
        'Basic sentiment analysis',
        'Ward-level heat maps',
        'Standard dashboard',
        '1,000 data points/month',
        'Email support',
        'Monthly reports',
        'Mobile responsive interface'
      ],
      limitations: [
        'No AI agents',
        'No manifesto matching',
        'No real-time pulse monitoring'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: billingCycle === 'monthly' ? 6000 : 60000,
      period: billingCycle === 'monthly' ? 'per election area/month' : 'per election area/year',
      description: 'Comprehensive solution for serious political campaigns',
      features: [
        'Unlimited election areas',
        'Advanced sentiment analysis',
        'Enhanced ward-level heat maps with raw data collection',
        'Pulse of the People dashboard',
        'Manifesto match feature',
        '10 specialized AI agents',
        'Real-time data collection',
        'Feedback chatbot',
        'My Constituency app',
        '50,000 data points/month',
        'Priority phone & email support',
        'Weekly detailed reports',
        'DPDP compliant data handling',
        'Social media monitoring',
        'Competitor analysis'
      ],
      popular: true,
      badge: 'Most Popular'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 15000 : 150000,
      period: billingCycle === 'monthly' ? 'per election area/month' : 'per election area/year',
      description: 'Full-scale solution with all 50 AI agents and premium features',
      features: [
        'Everything in Professional',
        'All 50 AI agents for voter segments',
        'Privata.site integration',
        'Advanced predictive analytics',
        'Custom manifesto analysis',
        'Unlimited data points',
        'Dedicated account manager',
        '24/7 priority support',
        'Daily real-time reports',
        'Custom integrations',
        'White-label options',
        'Advanced security features',
        'Multi-language support',
        'Video consultation calls',
        'On-site training sessions'
      ],
      enterprise: true,
      badge: 'Best Value'
    }
  ];

  const additionalFeatures = [
    {
      icon: Shield,
      title: 'DPDP Compliant',
      description: 'Full compliance with Data Protection and Digital Privacy Act'
    },
    {
      icon: Globe,
      title: 'Global Support',
      description: 'Support centers in Dubai, Macedonia, Switzerland, Germany, and more'
    },
    {
      icon: Zap,
      title: 'Real-time Processing',
      description: 'Live data collection and instant sentiment analysis'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'End-to-end encryption and privacy-first architecture'
    }
  ];

  const yearlyDiscount = 20; // 20% discount for yearly billing

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const getDiscountedPrice = (price: number) => {
    if (billingCycle === 'yearly') {
      return Math.round(price * (1 - yearlyDiscount / 100));
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              Animal-i Initiative
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pulse of People</span> by Animal-I
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose Your Political Intelligence Plan - The most ADVANCED, Secure, Private AI-powered voter sentiment analysis platform. 
            DPDP COMPLIANT with global headquarters in Dubai.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                  billingCycle === 'yearly' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 mb-8">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              DPDP COMPLIANT
            </div>
            <div className="flex items-center">
              <Lock className="w-4 h-4 mr-2 text-blue-500" />
              Secure - Private AI
            </div>
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2 text-purple-500" />
              Global Support
            </div>
            <div className="flex items-center">
              <Crown className="w-4 h-4 mr-2 text-yellow-500" />
              Most ADVANCED
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-blue-500 transform hover:scale-105' 
                  : plan.enterprise 
                    ? 'border-purple-500 transform hover:scale-105' 
                    : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium text-white ${
                  plan.popular ? 'bg-blue-500' : 'bg-purple-500'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-4xl font-bold text-gray-900">
                        ₹{getDiscountedPrice(plan.price).toLocaleString()}
                      </span>
                      {billingCycle === 'yearly' && plan.price !== getDiscountedPrice(plan.price) && (
                        <span className="ml-2 text-lg text-gray-500 line-through">
                          ₹{plan.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{plan.period}</p>
                    {billingCycle === 'yearly' && (
                      <p className="text-green-600 text-sm font-medium">
                        Save ₹{((plan.price * 12) - getDiscountedPrice(plan.price)).toLocaleString()} annually
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                      plan.popular || plan.enterprise
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.enterprise ? 'Contact Sales' : 'Start Free Trial'}
                  </button>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className={`h-5 w-5 mt-0.5 mr-3 ${
                        plan.popular || plan.enterprise ? 'text-blue-500' : 'text-green-500'
                      }`} />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations && plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start opacity-50">
                      <span className="h-5 w-5 mt-0.5 mr-3 text-gray-400">✗</span>
                      <span className="text-gray-500 text-sm line-through">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Pulse of People</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 mb-4 inline-block">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-100 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What is included in the ₹6,000/month pricing?</h3>
              <p className="text-gray-600 text-sm">
                The Professional plan includes complete access to all core features per election area, including sentiment analysis, heat maps, AI agents, and real-time monitoring.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial available?</h3>
              <p className="text-gray-600 text-sm">
                Yes, we offer a 30-day free trial for all plans so you can experience the full power of our platform before committing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does DPDP compliance work?</h3>
              <p className="text-gray-600 text-sm">
                Our platform is fully compliant with India's Data Protection and Digital Privacy Act, ensuring all voter data is handled securely and ethically.
              </p>
            </div>
            <div>
              <h3 className="font-semibent text-gray-900 mb-2">What support is available?</h3>
              <p className="text-gray-600 text-sm">
                We provide 24/7 support with global centers in Dubai, Macedonia, Switzerland, Germany, and other locations worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade plans?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades occur at the next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, bank transfers, and Indian payment methods including UPI and net banking.
              </p>
            </div>
          </div>
        </div>

        {/* Global Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Global Headquarters & Support</h2>
          <p className="text-blue-100 mb-6">Animal-i Initiative with worldwide presence</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">🏢 Global Headquarters</h3>
              <p className="text-blue-100">Dubai, UAE</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🌍 International Offices</h3>
              <p className="text-blue-100 text-sm">
                Macedonia, Albania, Switzerland, Germany, Maldives, Uruguay, 
                Saudi Arabia, Kuwait, Qatar, Oman, Cameroon, Uganda, 
                South Sudan, USA & Canada, Angola, Zimbabwe
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">📞 Contact Sales</h3>
              <p className="text-blue-100">All mobile numbers available</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:sales@bettroi.com"
              className="flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:shadow-lg transition-all"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Sales
            </a>
            <a
              href="tel:+971-xxx-xxxx"
              className="flex items-center justify-center px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Now
            </a>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Powered by <strong>Animal-i Initiative</strong> • Global Headquarters: Dubai</p>
          <p className="mt-1">The world's most advanced political intelligence platform</p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold mb-4">Complete Your Subscription</h4>
            
            {/* Plan Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {pricingPlans.find(p => p.id === selectedPlan)?.name} Plan
                </span>
                <span className="font-bold">
                  ₹{getDiscountedPrice(pricingPlans.find(p => p.id === selectedPlan)?.price || 0).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {pricingPlans.find(p => p.id === selectedPlan)?.period}
              </div>
            </div>

            {/* Payment Form */}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="1234 5678 9012 3456"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10"
                  />
                  <CreditCard className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-blue-800">
                  <Lock className="h-4 w-4 mr-2" />
                  Your payment information is secured with 256-bit SSL encryption
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:shadow-lg transition-all"
                >
                  Subscribe Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}