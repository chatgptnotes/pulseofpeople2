import VoterDatabase from '../components/VoterDatabase';

export default function VoterDatabasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voter Database</h1>
          <p className="text-gray-600">Comprehensive voter registration and demographic management</p>
        </div>
      </div>
      <VoterDatabase />
    </div>
  );
}