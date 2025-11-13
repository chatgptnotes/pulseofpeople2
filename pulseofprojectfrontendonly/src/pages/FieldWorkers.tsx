import FieldWorkerManagement from '../components/FieldWorkerManagement';

export default function FieldWorkersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Field Worker Management</h1>
          <p className="text-gray-600">Manage field operations, volunteers, and ground-level campaign activities</p>
        </div>
      </div>
      <FieldWorkerManagement />
    </div>
  );
}