import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backTo?: string;
  actions?: React.ReactNode;
  highlightBackButton?: boolean;
}

export default function PageHeader({
  title,
  description,
  showBackButton = true,
  backTo,
  actions,
  highlightBackButton = false
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <div className="mb-6">
      {showBackButton && (
        <button
          onClick={handleBack}
          className={`relative flex items-center mb-4 transition-all group ${
            highlightBackButton
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 shadow-lg border-2 border-blue-300 font-semibold'
              : 'text-gray-600 hover:text-gray-900 transition-colors'
          }`}
        >
          <ArrowLeft className={`mr-2 group-hover:-translate-x-1 transition-transform ${
            highlightBackButton ? 'w-5 h-5' : 'w-5 h-5'
          }`} />
          <span className={highlightBackButton ? 'font-semibold' : 'font-medium'}>Back</span>
          {highlightBackButton && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">NEW</span>
          )}
        </button>
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
