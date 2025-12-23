import React from 'react';
import { Award, Code, Server, Briefcase, Smartphone, Volume2, FileText, Play } from 'lucide-react';
import { jobProfiles } from '../utils/constants';

export const HomePage = ({ 
  selectedProfile, 
  setSelectedProfile, 
  voiceMode, 
  setVoiceMode, 
  onStartInterview 
}) => {
  const getIcon = (iconName) => {
    const icons = {
      Code,
      Server,
      Briefcase,
      Smartphone
    };
    return icons[iconName] || Code;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-12 h-12 text-white" />
            <h1 className="text-5xl font-bold text-white">AI Mock Interview</h1>
          </div>
          <p className="text-xl text-white/90">Ace your next interview with AI-powered practice</p>
          <p className="text-white/80 mt-2">
            Get real-time feedback on your technical skills, communication, and body language
          </p>
        </div>

        {/* Job Profile Selection */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Choose Your Interview Type</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobProfiles.map(profile => {
              const IconComponent = getIcon(profile.icon);
              return (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                    selectedProfile?.id === profile.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className={`${profile.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{profile.name}</h3>
                  <p className="text-sm text-gray-600">{profile.topics.join(', ')}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interview Mode Selection */}
        {selectedProfile && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Interview Mode</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => setVoiceMode(true)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  voiceMode
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <Volume2 className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Voice Questions</h3>
                <p className="text-sm text-gray-600">AI will read questions aloud</p>
              </button>

              <button
                onClick={() => setVoiceMode(false)}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  !voiceMode
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <FileText className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Text Questions</h3>
                <p className="text-sm text-gray-600">Read questions on screen</p>
              </button>
            </div>

            <button
              onClick={onStartInterview}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6" />
              Start {selectedProfile.name} Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};