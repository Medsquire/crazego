"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Camera, MapPin, X, Loader2, Calendar, Map as MapIcon } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Function to create a custom marker icon containing the snap image preview
const createCustomIcon = (imageUrl: string) => {
  return L.divIcon({
    className: 'custom-snap-marker',
    html: `
      <div style="width: 60px; height: 60px; border-radius: 12px; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3); overflow: hidden; background-color: white; transform: rotate(-5deg); transition: transform 0.2s;">
        <img src="${imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  });
};

// Mock data (Focused on Eluru)
const INITIAL_SNAPS = [
  {
    id: 1,
    lat: 16.7107,
    lng: 81.0952, // Eluru
    nickname: 'EluruLocal',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=500&h=500&fit=crop',
    description: 'Beautiful day in Eluru!',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    lat: 16.7150,
    lng: 81.1000, // Near Eluru
    nickname: 'AndhraExplorer',
    imageUrl: 'https://images.unsplash.com/photo-1522262590532-a991489a0253?w=500&h=500&fit=crop',
    description: 'Exploring the local streets.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  }
];

// Component to dynamically update map center
function MapUpdater({ center }: { center: { lat: number, lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapInner({ currentUser }: { currentUser?: { nickname: string } }) {
  const [snaps, setSnaps] = useState(INITIAL_SNAPS);
  
  // Modals state
  const [expandedSnap, setExpandedSnap] = useState<typeof INITIAL_SNAPS[0] | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Upload State
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [description, setDescription] = useState('');
  
  // Default center focused on Eluru
  const [center, setCenter] = useState({ lat: 16.7107, lng: 81.0952 });

  const handleCameraClick = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setCurrentLocation(loc);
          setCenter(loc);
          setIsLocating(false);
          setShowUploadModal(true);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not get your location. Please enable location permissions.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported.");
      setIsLocating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handlePostSnap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLocation || !previewImage || !nickname) return;
    setIsUploading(true);
    setTimeout(() => {
      const newSnap = {
        id: Date.now(),
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        nickname,
        imageUrl: previewImage,
        description,
        timestamp: new Date().toISOString()
      };
      setSnaps([...snaps, newSnap]);
      setShowUploadModal(false);
      setIsUploading(false);
      setPreviewImage(null);
      setNickname(currentUser?.nickname || '');
      setDescription('');
    }, 1000);
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full h-screen relative bg-gray-100">
      <MapContainer center={[center.lat, center.lng]} zoom={13} className="w-full h-full z-0" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        
        {snaps.map((snap) => (
          <Marker 
            key={snap.id} 
            position={[snap.lat, snap.lng]}
            icon={createCustomIcon(snap.imageUrl)}
            eventHandlers={{ click: () => setExpandedSnap(snap) }}
          />
        ))}
        {currentLocation && showUploadModal && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} />
        )}
      </MapContainer>

      {/* Upload Button */}
      <button 
        onClick={handleCameraClick}
        disabled={isLocating}
        className="absolute bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-[1000] flex items-center disabled:bg-blue-400 transition-transform active:scale-95"
      >
        {isLocating ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
      </button>

      {/* Big Expanded Snap Modal */}
      {expandedSnap && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[2000] p-4 backdrop-blur-sm" onClick={() => setExpandedSnap(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl text-black relative flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-white md:text-gray-400 hover:text-white md:hover:text-gray-700 bg-black/50 md:bg-transparent rounded-full p-1 z-10" 
              onClick={() => setExpandedSnap(null)}
            >
              <X size={24} />
            </button>
            
            {/* Left side: Full Image */}
            <div className="md:w-3/5 bg-black flex items-center justify-center min-h-[300px]">
              <img 
                src={expandedSnap.imageUrl} 
                alt="Full Snap" 
                className="max-w-full max-h-[90vh] object-contain"
              />
            </div>

            {/* Right side: Details */}
            <div className="md:w-2/5 p-6 md:p-8 flex flex-col bg-white overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">@{expandedSnap.nickname}</h2>
              
              {expandedSnap.description && (
                <p className="text-gray-700 text-lg mb-6">{expandedSnap.description}</p>
              )}
              
              <div className="space-y-4 mt-auto">
                <div className="flex items-center gap-3 text-gray-500">
                  <Calendar size={20} className="text-blue-500" />
                  <span className="text-sm font-medium">{formatDate(expandedSnap.timestamp)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-500">
                  <MapIcon size={20} className="text-blue-500" />
                  <span className="text-sm font-medium">
                    {expandedSnap.lat.toFixed(4)}, {expandedSnap.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md text-black relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setShowUploadModal(false)}>
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-blue-600" /> Post a Snap
            </h2>
            <form onSubmit={handlePostSnap} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-500 relative overflow-hidden">
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                ) : (
                  <div className="py-8">
                    <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">Tap to take a photo</p>
                  </div>
                )}
                <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nickname</label>
                <input type="text" required value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 resize-none" rows={3} />
              </div>
              <button type="submit" disabled={isUploading || !previewImage} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex justify-center gap-2">
                {isUploading ? <><Loader2 size={20} className="animate-spin" /> Posting...</> : 'Post Snap'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
