import React from 'react';
import { Code, Server, Briefcase, Smartphone, Volume2, FileText, Play } from 'lucide-react';
import { jobProfiles } from '../utils/constants';

export const HomePage = ({
  selectedProfile,
  setSelectedProfile,
  voiceMode,
  setVoiceMode,
  onStartInterview
}) => {
  const getIcon = (iconName) => {
    const icons = { Code, Server, Briefcase, Smartphone };
    return icons[iconName] || Code;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#020617] via-[#020617] to-black relative overflow-hidden">

      {/* subtle background glow */}
      <div className="absolute -top-50 left-1/2 -translate-x-1/2 w-200 h-200 bg-purple-600/20 blur-[180px]" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">

        {/* HERO */}
        <div className="text-center max-w-3xl mb-14">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
            AI Mock Interview
          </h1>

          <p className="mt-5 text-lg text-gray-400 leading-relaxed">
            Simulate real interviews with AI-generated questions,
            voice interaction, and intelligent performance feedback.
          </p>
        </div>

        {/* MAIN GLASS CARD */}
        <div className="w-full max-w-6xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-[0_0_60px_rgba(0,0,0,0.6)]">

          {/* SECTION TITLE */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-white">
              Choose Your Interview Type
            </h2>
            <div className="w-24 h-0.5 bg-linear-to-r from-purple-500 to-pink-500 mx-auto mt-3 rounded-full" />
          </div>

          {/* PROFILE CARDS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {jobProfiles.map(profile => {
              const IconComponent = getIcon(profile.icon);
              const active = selectedProfile?.id === profile.id;

              return (
                <button
                  key={profile.id}
                  onClick={() => setSelectedProfile(profile)}
                  className={`group relative rounded-2xl p-6 text-left transition-all duration-300
                    ${active
                      ? 'bg-purple-500/10 border border-purple-500 scale-[1.04]'
                      : 'bg-white/5 border border-white/10 hover:border-purple-400 hover:bg-white/10'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${profile.color}`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-white font-semibold mb-2">
                    {profile.name}
                  </h3>

                  <p className="text-sm text-gray-400 leading-relaxed">
                    {profile.topics.join(', ')}
                  </p>

                  {/* hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none bg-linear-to-br from-purple-500/10 to-transparent" />
                </button>
              );
            })}
          </div>

          {/* MODE SELECTION */}
          {selectedProfile && (
            <>
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white">
                  Interview Mode
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                <button
                  onClick={() => setVoiceMode(true)}
                  className={`rounded-2xl p-6 border transition-all
                    ${voiceMode
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 hover:border-purple-400'
                    }`}
                >
                  <Volume2 className="w-10 h-10 text-purple-400 mb-3" />
                  <h3 className="text-white font-semibold mb-1">Voice Interview</h3>
                  <p className="text-sm text-gray-400">
                    AI asks questions verbally
                  </p>
                </button>

                <button
                  onClick={() => setVoiceMode(false)}
                  className={`rounded-2xl p-6 border transition-all
                    ${!voiceMode
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 hover:border-purple-400'
                    }`}
                >
                  <FileText className="w-10 h-10 text-purple-400 mb-3" />
                  <h3 className="text-white font-semibold mb-1">Text Interview</h3>
                  <p className="text-sm text-gray-400">
                    Read questions on screen
                  </p>
                </button>
              </div>

              {/* CTA */}
              <button
                onClick={onStartInterview}
                className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl
                  font-semibold text-lg flex items-center justify-center gap-2
                  hover:scale-[1.02] transition-transform shadow-xl"
              >
                <Play className="w-6 h-6" />
                Start {selectedProfile.name} Interview
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};