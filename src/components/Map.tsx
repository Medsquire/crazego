"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <Loader2 size={48} className="animate-spin text-blue-600" />
    </div>
  ),
});

export default function MapComponent({ currentUser }: { currentUser?: { nickname: string } }) {
  return <MapInner currentUser={currentUser} />;
}
