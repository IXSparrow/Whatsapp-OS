export function isVoiceEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("nexus_voice_enabled") === "true";
}

export function setVoiceEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("nexus_voice_enabled", enabled ? "true" : "false");
}

export function speakFemale(text: string) {
  if (typeof window === "undefined") return;
  if (!isVoiceEnabled()) return;
  if (!("speechSynthesis" in window)) return;

  // Cancel any currently playing speech to avoid layering
  window.speechSynthesis.cancel();

  // Clean raw markdown characters from text before reading
  const cleanText = text
    .replace(/\*\*/g, "")
    .replace(/•/g, "")
    .replace(/\n/g, " ")
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "en-IN";
  utterance.rate = 0.95;
  utterance.pitch = 1.15;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();

  // Attempt to select a premium female, Samantha, Zira, Google Hindi, or en-IN voice
  const preferredVoice =
    voices.find((voice) =>
      /female|zira|samantha|google uk english female|google hindi|heera|kajal|neural/i.test(
        voice.name
      )
    ) || 
    voices.find((voice) => /en-IN|hi-IN|English/i.test(voice.lang)) || 
    voices[0];

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}
