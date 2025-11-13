import LoadingSpinner from './LoadingSpinner';

interface LoadingCardProps {
  title?: string;
  height?: string;
  className?: string;
}

export default function LoadingCard({ 
  title = 'Loading...', 
  height = 'h-64', 
  className = '' 
}: LoadingCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${height} ${className}`}>
      <div className="flex flex-col items-center justify-center h-full">
        <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
}