import AIInsightsEngine from '../components/AIInsightsEngine';

export default function AIInsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights & Predictions</h1>
          <p className="text-gray-600">AI-powered campaign insights, predictions, and strategic recommendations</p>
        </div>
      </div>
      <AIInsightsEngine />
    </div>
  );
}