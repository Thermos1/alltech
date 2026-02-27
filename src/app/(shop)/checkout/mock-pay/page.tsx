import { Suspense } from 'react';
import MockPayForm from './MockPayForm';

export default function MockPayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-8 h-8 mx-auto border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm mt-4">Загрузка...</p>
        </div>
      </div>
    }>
      <MockPayForm />
    </Suspense>
  );
}
