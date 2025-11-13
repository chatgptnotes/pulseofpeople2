import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { mockCompetitorData } from '../data/mockData'

export default function CompetitorComparison() {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitor Sentiment Comparison</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockCompetitorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="issue" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[0, 1]}
              tick={{ fontSize: 12 }}
              label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft' }}
            />
            <Legend />
            <Bar 
              dataKey="candidateA" 
              fill="#3b82f6" 
              name="Candidate A"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="candidateB" 
              fill="#f59e0b" 
              name="Candidate B"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}