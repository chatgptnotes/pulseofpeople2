import SocialMediaMonitoring from '../components/SocialMediaMonitoring';

export default function SocialMediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Media Monitoring</h1>
          <p className="text-gray-600">Track social media conversations, trends, and public sentiment across platforms</p>
        </div>
      </div>
      <SocialMediaMonitoring />
    </div>
  );
}