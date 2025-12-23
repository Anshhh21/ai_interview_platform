// Text to speech
export const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Stop speaking
  export const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };
  
  // Check if speech synthesis is supported
  export const isSpeechSynthesisSupported = () => {
    return 'speechSynthesis' in window;
  };