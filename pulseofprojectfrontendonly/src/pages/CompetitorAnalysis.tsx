import CompetitorTracking from '../components/CompetitorTracking';

export default function CompetitorAnalysisPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
          <p className="text-gray-600">Monitor competitor campaigns, strategies, and performance metrics</p>
        </div>
      </div>
      <CompetitorTracking />
    </div>
  );
}