import React from 'react';
import { Camera, AlertCircle } from 'lucide-react';

export const CameraView = ({ videoRef, postureWarnings, isReady }) => {
  const latestWarning = postureWarnings.length > 0 
    ? postureWarnings[postureWarnings.length - 1] 
    : null;

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-5 h-5 text-white" />
        <h3 className="text-white font-semibold">Camera View</h3>
        {isReady && <span className="text-green-400 text-xs">● Live</span>}
      </div>
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
        />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <Camera className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Starting camera...</p>
            </div>
          </div>
        )}
      </div>
      {latestWarning && (
        <div className="mt-3 bg-yellow-900/50 border border-yellow-600 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-200 text-sm">
              {latestWarning.type}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};