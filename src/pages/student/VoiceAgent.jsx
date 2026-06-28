import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { voiceAPI } from '../../services/api';
import useVoiceRecorder from '../../hooks/useVoiceRecorder';
import toast from 'react-hot-toast';
import { Mic, Volume2, VolumeX, Square, ArrowLeft, Loader2, Sparkles, Trophy, CheckCircle, BrainCircuit, AlertTriangle, Target, XCircle, ChevronDown, Play } from 'lucide-react';

export default function VoiceAgent() {
  const navigate = useNavigate();
  const { isRecording, audioBlob, startRecording, stopRecording } = useVoiceRecorder();

  const [sessionId, setSessionId] = useState(null);
  const [topic, setTopic] = useState('Daily Life');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [conversation, setConversation] = useState([]);
  const [status, setStatus] = useState('Idle'); // Idle, Recording, Processing, Speaking
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(480); // 8 minutes (480 seconds)
  const [sessionActive, setSessionActive] = useState(false);
  const [showEarlyEndMessage, setShowEarlyEndMessage] = useState(false);
  const [earlyEndData, setEarlyEndData] = useState(null);
  const [showTwoMinuteWarning, setShowTwoMinuteWarning] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Voice selection state
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => localStorage.getItem('speakly_voice') || '');
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const voicePickerRef = useRef(null);

  const timerRef = useRef(null);
  const chatEndRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const activeUtteranceRef = useRef(null);
  const resumeIntervalRef = useRef(null);

  // Timer logic (counts down from 8 minutes)
  useEffect(() => {
    if (sessionActive && !showReport) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionActive, showReport]);

  // Load available voices from the browser — only show reliably working ones
  useEffect(() => {
    // Whitelist of voice info with friendly name, gender, and quality
    const VOICE_INFO = {
      // Edge Online Natural Voices
      'microsoft jenny': { friendlyName: 'Jenny (US)', gender: 'Female', quality: 'Natural' },
      'microsoft guy': { friendlyName: 'Guy (US)', gender: 'Male', quality: 'Natural' },
      'microsoft sonia': { friendlyName: 'Sonia (UK)', gender: 'Female', quality: 'Natural' },
      'microsoft ryan': { friendlyName: 'Ryan (UK)', gender: 'Male', quality: 'Natural' },
      'andrew multilingual': { friendlyName: 'Andrew (US)', gender: 'Male', quality: 'Natural' },
      
      // Google Voices (Chrome)
      'google us english': { friendlyName: 'Google (US)', gender: 'Female', quality: 'Standard' },
      'google uk english female': { friendlyName: 'Google Female (UK)', gender: 'Female', quality: 'Standard' },
      'google uk english male': { friendlyName: 'Google Male (UK)', gender: 'Male', quality: 'Standard' },
      
      // Local Windows Voices
      'microsoft david': { friendlyName: 'David (US)', gender: 'Male', quality: 'Standard' },
      'microsoft zira': { friendlyName: 'Zira (US)', gender: 'Female', quality: 'Standard' },
      'microsoft george': { friendlyName: 'George (UK)', gender: 'Male', quality: 'Standard' },
      
      // Apple / Safari Voices
      'samantha': { friendlyName: 'Samantha (US)', gender: 'Female', quality: 'Standard' },
      'daniel': { friendlyName: 'Daniel (UK)', gender: 'Male', quality: 'Standard' },
      'karen': { friendlyName: 'Karen (AU)', gender: 'Female', quality: 'Standard' },
      'moira': { friendlyName: 'Moira (IE)', gender: 'Female', quality: 'Standard' },
      'tessa': { friendlyName: 'Tessa (ZA)', gender: 'Female', quality: 'Standard' }
    };

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));

      // Find whitelisted voices
      const matched = [];
      englishVoices.forEach(voice => {
        const lowerName = voice.name.toLowerCase();
        const key = Object.keys(VOICE_INFO).find(k => lowerName.includes(k));
        if (key) {
          const info = VOICE_INFO[key];
          matched.push({
            id: voice.name,
            name: voice.name,
            friendlyName: info.friendlyName,
            gender: info.gender,
            quality: info.quality,
            lang: voice.lang,
            nativeVoice: voice
          });
        }
      });

      // If we don't have enough matched voices, fill up using other English voices
      englishVoices.forEach(voice => {
        if (matched.length >= 5) return;
        if (matched.some(m => m.id === voice.name)) return;

        const lower = voice.name.toLowerCase();
        let gender = 'Female';
        if (lower.includes('guy') || lower.includes('male') || lower.includes('david') || lower.includes('george') || lower.includes('daniel') || lower.includes('ryan')) {
          gender = 'Male';
        }

        matched.push({
          id: voice.name,
          name: voice.name,
          friendlyName: voice.name.replace(/Microsoft |Google |Apple /gi, '').split(' ')[0],
          gender: gender,
          quality: voice.name.toLowerCase().includes('natural') ? 'Natural' : 'Standard',
          lang: voice.lang,
          nativeVoice: voice
        });
      });

      // Limit to exactly 5 custom voices
      const selectedCustom = matched.slice(0, 5);

      // Build the final list: Default Voice + 5 Custom Voices
      const final = [
        {
          id: 'default',
          name: 'default',
          friendlyName: 'Default Voice',
          gender: 'System',
          quality: 'Default',
          lang: 'en-US',
          nativeVoice: null
        },
        ...selectedCustom
      ];

      setAvailableVoices(final);

      // Restore saved voice or default to first
      const saved = localStorage.getItem('speakly_voice');
      if (saved && final.some(v => v.id === saved)) {
        setSelectedVoiceName(saved);
      } else {
        setSelectedVoiceName('default');
        localStorage.setItem('speakly_voice', 'default');
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Close voice picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (voicePickerRef.current && !voicePickerRef.current.contains(e.target)) {
        setShowVoicePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup speech synthesis and intervals on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (resumeIntervalRef.current) {
        clearInterval(resumeIntervalRef.current);
      }
    };
  }, []);

  const handleEndSessionRef = useRef(null);
  useEffect(() => {
    handleEndSessionRef.current = handleEndSession;
  });

  // Auto-end when timeLeft reaches 0
  useEffect(() => {
    if (timeLeft === 0 && sessionActive) {
      toast.success("8 minutes reached! Auto-ending session to generate your report.");
      if (handleEndSessionRef.current) {
        handleEndSessionRef.current();
      }
    }
  }, [timeLeft, sessionActive]);

  // Show 2-minute warning
  useEffect(() => {
    if (timeLeft === 120 && sessionActive) {
      setShowTwoMinuteWarning(true);
      setTimeout(() => setShowTwoMinuteWarning(false), 5000);
    }
  }, [timeLeft, sessionActive]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Handle transcribed audio once available
  useEffect(() => {
    if (audioBlob) {
      handleAudioUpload(audioBlob);
    }
  }, [audioBlob]);

  const handleAudioUpload = async (blob) => {
    setStatus('Processing');
    const t = toast.loading('Transcribing voice...');
    try {
      // 1. Transcribe audio to text
      const transcribeRes = await voiceAPI.transcribe(blob);
      const studentText = transcribeRes.data.text;
      const studentLang = transcribeRes.data.language;
      toast.dismiss(t);

      if (!studentText.trim()) {
        toast.error('No speech detected. Try again.');
        setStatus('Idle');
        return;
      }

      // Get voice name and gender to align the AI's identity
      const activeVoice = availableVoices.find(v => v.id === selectedVoiceName);
      const voiceName = activeVoice && activeVoice.id !== 'default' ? activeVoice.friendlyName.split(' ')[0] : 'Aria';
      const voiceGender = activeVoice ? activeVoice.gender : 'Female';

      // 2. Get AI Response
      const responseRes = await voiceAPI.respond({
        session_id: sessionId,
        text: studentText,
        language: studentLang,
        topic,
        difficulty,
        conversation,
        voice_name: voiceName,
        voice_gender: voiceGender
      });

      setSessionId(responseRes.data.session_id);
      setConversation(responseRes.data.conversation);

      // Speak AI reply
      speakReply(responseRes.data.reply);
    } catch (err) {
      toast.dismiss(t);
      toast.error(err.response?.data?.detail || 'Failed to process voice response');
      setStatus('Idle');
    }
  };

  const speakReply = (text) => {
    if (isMuted || !synthRef.current) {
      setStatus('Idle');
      return;
    }

    // Clear any active resume interval
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }

    // Cancel any current speaking
    synthRef.current.cancel();

    // Give the browser voice engine 80ms to clear the queue
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Apply user-selected voice
        if (selectedVoiceName && selectedVoiceName !== 'default') {
          const chosen = window.speechSynthesis.getVoices().find(v => v.name === selectedVoiceName);
          if (chosen) utterance.voice = chosen;
        }

        // Keep a strong reference in a React ref to prevent garbage collection
        activeUtteranceRef.current = utterance;

        utterance.onstart = () => {
          setStatus('Speaking');
          // Chrome/Edge bug fix: trigger resume every 4 seconds to prevent speech freezing
          resumeIntervalRef.current = setInterval(() => {
            if (synthRef.current && synthRef.current.speaking) {
              synthRef.current.resume();
            } else {
              if (resumeIntervalRef.current) {
                clearInterval(resumeIntervalRef.current);
                resumeIntervalRef.current = null;
              }
            }
          }, 4000);
        };

        utterance.onend = () => {
          setStatus('Idle');
          if (resumeIntervalRef.current) {
            clearInterval(resumeIntervalRef.current);
            resumeIntervalRef.current = null;
          }
          activeUtteranceRef.current = null;
        };

        utterance.onerror = (e) => {
          console.warn("SpeechSynthesisUtterance error:", e);
          setStatus('Idle');
          if (resumeIntervalRef.current) {
            clearInterval(resumeIntervalRef.current);
            resumeIntervalRef.current = null;
          }
          activeUtteranceRef.current = null;
        };

        synthRef.current.speak(utterance);
      } catch (err) {
        console.error("SpeechSynthesis speak failed:", err);
        setStatus('Idle');
      }
    }, 80);
  };

  const handleRecordButton = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        // Cancel any current speaking before recording
        synthRef.current.cancel();
        await startRecording();
        setStatus('Recording');
        if (!sessionActive) {
          setSessionActive(true);
        }
      } catch (err) {
        toast.error('Could not access microphone.');
      }
    }
  };

  const handleEndSession = async () => {
    synthRef.current.cancel();
    if (isRecording) {
      stopRecording();
    }

    if (!sessionId) {
      navigate('/student/home');
      return;
    }

    const duration = 480 - timeLeft;

    // Part B: Warn before early end
    if (duration < 480) {
      const confirmEnd = window.confirm(
        "Ending now will not generate a detailed report since the session is under 8 minutes. Do you want to end?"
      );
      if (!confirmEnd) return;
    }

    setLoadingReport(true);
    setSessionActive(false); // Stop countdown timer
    const t = toast.loading('Analyzing conversation...');
    try {
      const res = await voiceAPI.endSession({
        session_id: sessionId,
        conversation,
        topic,
        duration_seconds: duration,
      });
      
      toast.dismiss(t);

      if (res.data.session_too_short) {
        setEarlyEndData({
          duration_seconds: duration,
          minutes_completed: (duration / 60).toFixed(1)
        });
        setShowEarlyEndMessage(true);
      } else {
        setReport(res.data);
        setShowReport(true);
        toast.success('Session report generated!');
      }
    } catch (err) {
      toast.dismiss(t);
      toast.error('Failed to generate session report');
      setSessionActive(true); // Resume timer on error
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 text-gray-900 flex flex-col overflow-hidden z-50">
      {/* Background Atmospheric Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[55%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-150 z-10 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              synthRef.current.cancel();
              navigate('/student/home');
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex flex-col">
            <span className="text-gray-500 uppercase tracking-wider text-[10px]">
              Session Timer
            </span>
            <span className="text-xl font-mono font-bold text-gray-900">
              {formatTimer(timeLeft)}
            </span>
          </div>
        </div>

        {/* Voice Selector */}
        <div className="relative" ref={voicePickerRef}>
          <button
            onClick={() => setShowVoicePicker(!showVoicePicker)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
            title="Select AI Voice"
          >
            <Volume2 size={16} className="text-primary" />
            <span className="text-gray-700 font-medium max-w-[120px] truncate hidden sm:inline">
              {availableVoices.find(v => v.id === selectedVoiceName)?.friendlyName || 'Default Voice'}
            </span>
            <ChevronDown size={14} className={`text-gray-500 transition-transform ${showVoicePicker ? 'rotate-180' : ''}`} />
          </button>

          {showVoicePicker && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Select AI Voice — tap ▶ to preview</p>
              </div>
              {availableVoices.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No voices available</p>
              ) : (
                availableVoices.map((voice) => {
                  const isNatural = voice.quality === 'Natural';
                  const isDefault = voice.id === 'default';
                  return (
                    <div
                      key={voice.id}
                      className={`flex items-center justify-between px-4 py-2.5 hover:bg-primary/5 transition-colors ${
                        selectedVoiceName === voice.id
                          ? 'bg-primary/10'
                          : ''
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedVoiceName(voice.id);
                          localStorage.setItem('speakly_voice', voice.id);
                          setShowVoicePicker(false);
                        }}
                        className="flex-1 text-left flex flex-col min-w-0"
                      >
                        <span className={`text-sm truncate ${
                          selectedVoiceName === voice.id ? 'text-primary font-semibold' : 'text-gray-700'
                        }`}>
                          {voice.friendlyName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400 uppercase">{voice.lang}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            voice.gender === 'Female' 
                              ? 'bg-pink-100 text-pink-700' 
                              : voice.gender === 'Male'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-150 text-gray-600'
                          }`}>
                            {voice.gender}
                          </span>
                          {isNatural && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">NATURAL</span>
                          )}
                        </div>
                      </button>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {!isDefault && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.speechSynthesis.cancel();
                              const testUtterance = new SpeechSynthesisUtterance('Hello, I am your English tutor.');
                              if (voice.nativeVoice) {
                                testUtterance.voice = voice.nativeVoice;
                                testUtterance.lang = voice.nativeVoice.lang;
                              }
                              testUtterance.rate = 1.0;
                              window.speechSynthesis.speak(testUtterance);
                            }}
                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-primary/10 flex items-center justify-center transition-colors"
                            title="Preview this voice"
                          >
                            <Play size={12} className="text-gray-600 ml-0.5" />
                          </button>
                        )}
                        {selectedVoiceName === voice.id && (
                          <CheckCircle size={16} className="text-primary" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-between relative px-6 max-w-5xl mx-auto w-full overflow-hidden py-8">
        {!showReport ? (
          <>
            {/* Visualizer Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative w-full mb-8">
              {/* Pulsing Rings */}
              {status === 'Recording' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-[200px] h-[200px] rounded-full bg-primary/20 animate-pulse" />
                  <div className="absolute w-[260px] h-[260px] rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              )}

              {/* Central Button */}
              <button
                onClick={handleRecordButton}
                disabled={status === 'Processing'}
                className={`relative w-48 h-48 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 duration-200 z-10 ${
                  status === 'Recording'
                    ? 'bg-red-500 hover:bg-red-655'
                    : status === 'Processing'
                    ? 'bg-amber-500'
                    : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {status === 'Processing' ? (
                  <Loader2 size={64} className="animate-spin text-white" />
                ) : status === 'Recording' ? (
                  <Square size={64} className="text-white" />
                ) : (
                  <Mic size={64} className="text-white" />
                )}
              </button>

              {/* Status Text */}
              <div className="mt-8 text-center">
                <p className="text-2xl font-bold tracking-wide uppercase text-gray-900">
                  {status === 'Recording' ? 'Listening...' : status === 'Processing' ? 'Thinking...' : status === 'Speaking' ? 'AI Speaking...' : 'Tap Mic to Speak'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {status === 'Recording' ? 'Speak clearly in English' : status === 'Processing' ? 'Analyzing your words' : status === 'Speaking' ? 'Listen carefully' : 'Start a natural discussion'}
                </p>
              </div>
            </div>

            {/* Conversational Chat History */}
            <div className="w-full h-48 overflow-y-auto space-y-4 pb-6 bg-white p-4 rounded-2xl border border-gray-150 hide-scrollbar mb-20 shadow-sm">
              {conversation.length === 0 ? (
                <p className="text-center text-sm text-gray-500 italic pt-12">
                  No conversation logs yet. Tap the microphone to begin.
                </p>
              ) : (
                conversation.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                        msg.role === 'student'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-200'
                      }`}
                    >
                      <p className="text-[10px] uppercase font-bold opacity-60 mb-1">
                        {msg.role === 'student' ? 'You' : 'AI Tutor'}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
          </>
        ) : (
          /* Report Screen */
          <div className="w-full flex-grow overflow-y-auto px-2 py-4 hide-scrollbar space-y-8 pb-24">
            {loadingReport ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 size={64} className="animate-spin text-primary" />
                <p className="text-lg font-bold text-gray-500">Generating your grammar report...</p>
              </div>
            ) : (
              <div className="space-y-8 animate-slide-up">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <Sparkles className="text-amber-500" />
                    Session Assessment Report
                  </h3>
                  <p className="text-gray-500 mt-2 text-sm">
                    AI evaluation of your English grammar, vocabulary, and fluency.
                  </p>
                </div>

                {/* Score circle cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Grammar', score: report?.grammar_score, icon: BrainCircuit },
                    { label: 'Fluency', score: report?.fluency_score, icon: Sparkles },
                    { label: 'Vocabulary', score: report?.vocabulary_score, icon: Trophy },
                    { label: 'Overall', score: report?.overall_score, icon: CheckCircle },
                  ].map(({ label, score = 0, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-2xl p-6 border border-gray-150 flex flex-col items-center text-center shadow-sm">
                      <Icon className="text-primary mb-2" size={28} />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                      <p className="text-3xl font-bold mt-2 text-primary">{score}/100</p>
                    </div>
                  ))}
                </div>

                {/* Mistakes Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4">
                  <h4 className="text-lg font-bold text-danger flex items-center gap-2">
                    <XCircle size={20} /> Key Mistakes Detected
                  </h4>
                  <div className="p-4 bg-danger/5 border border-danger/10 rounded-xl">
                    <p className="text-sm text-gray-750 font-medium leading-relaxed">
                      Please visit the <span className="font-bold text-danger">Progress Hub</span> to view the detailed list of grammar mistakes detected during this session.
                    </p>
                  </div>
                </div>

                {/* Areas to Improve */}
                <div className="bg-white p-6 rounded-2xl border border-gray-150 space-y-4">
                  <h4 className="text-lg font-bold text-warning flex items-center gap-2">
                    <AlertTriangle size={20} /> Areas to Improve
                  </h4>
                  <div className="p-4 bg-warning/5 border border-warning/10 rounded-xl">
                    <p className="text-sm text-gray-750 font-medium leading-relaxed">
                      Please visit the <span className="font-bold text-warning">Progress Hub</span> to view your personalized speaking improvement areas.
                    </p>
                  </div>
                </div>

                {/* Focus On Next */}
                {report?.improvement_areas && report.improvement_areas.length > 0 && (
                  <div className="bg-primary/[0.03] p-6 rounded-2xl border border-primary/15 space-y-3">
                    <h4 className="text-lg font-bold text-primary flex items-center gap-2">
                      <Target size={20} /> Focus On Next
                    </h4>
                    <ul className="space-y-2">
                      {report.improvement_areas.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-primary shrink-0">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Goal */}
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/15 text-center">
                  <h4 className="font-bold text-md text-gray-900 mb-1 flex items-center justify-center gap-2">
                    <Sparkles size={16} className="text-amber-500" /> Next Session Goal
                  </h4>
                  <p className="text-sm text-gray-750">{report?.next_session_goal || 'Keep practicing daily!'}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 flex items-center justify-center bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent pt-20 z-20">
        {!showReport ? (
          <div className="flex items-center gap-8">
            {/* End Session Button */}
            <button
              onClick={handleEndSession}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full border border-danger/30 flex items-center justify-center hover:bg-danger/5 transition-colors">
                <Square size={20} className="text-danger" />
              </div>
              <span className="text-[10px] text-danger font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                End Session
              </span>
            </button>

            {/* Mic click trigger */}
            <button
              onClick={handleRecordButton}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all bg-primary hover:bg-primary-dark`}
            >
              {status === 'Recording' ? (
                <Square size={24} className="text-white" />
              ) : (
                <Mic size={32} className="text-white" />
              )}
            </button>

            {/* Mute AI Output */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                {isMuted ? <VolumeX size={20} className="text-gray-700" /> : <Volume2 size={20} className="text-gray-700" />}
              </div>
              <span className="text-[10px] text-gray-650 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                {isMuted ? 'Unmute AI' : 'Mute AI'}
              </span>
            </button>
          </div>
        ) : (
          !loadingReport && (
            <button
              onClick={() => navigate('/student/home')}
              className="px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-sm"
            >
              Back to Dashboard
            </button>
          )
        )}
      </footer>

      {showTwoMinuteWarning && (
        <div className="fixed top-4 right-4 bg-primary text-white 
          px-4 py-3 rounded-xl shadow-lg z-45 animate-bounce">
          🎯 2 minutes left — keep going to get your report!
        </div>
      )}

      {showEarlyEndMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center 
          justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full 
            text-center shadow-xl">
            
            {/* Icon */}
            <div className="w-16 h-16 bg-warning/10 rounded-full 
              flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⏱️</span>
            </div>
            
            {/* Heading */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Session Too Short
            </h3>
            
            {/* Message */}
            <p className="text-gray-500 mb-1">
              You practiced for{' '}
              <span className="font-semibold text-gray-800">
                {earlyEndData?.minutes_completed} minutes
              </span>
              .
            </p>
            <p className="text-gray-500 mb-6">
              Complete at least{' '}
              <span className="font-semibold text-primary">
                8 minutes
              </span>{' '}
              of speaking to get your detailed report with strengths,
              weaknesses, and improvement areas.
            </p>
            
            {/* Progress bar showing how far they got */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>0 min</span>
                <span>8 min needed</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div 
                  className="bg-warning h-3 rounded-full"
                  style={{
                    width: `${Math.min(
                      (earlyEndData?.duration_seconds / 480) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEarlyEndMessage(false);
                  setSessionActive(true);
                  // Reset timer to remaining time
                  setTimeLeft(480 - (earlyEndData?.duration_seconds || 0));
                }}
                className="flex-1 bg-primary text-white py-3 rounded-xl 
                  font-medium hover:bg-primary-dark transition"
              >
                Continue Session
              </button>
              <button
                onClick={() => {
                  setShowEarlyEndMessage(false);
                  navigate('/student/home');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 
                  rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
