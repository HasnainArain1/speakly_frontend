import { useState, useEffect } from 'react';
import { vocabularyAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { BookOpen, Search, Volume2, CheckCircle2, Bookmark, CheckCircle, Info, Star } from 'lucide-react';

export default function Vocabulary() {
  const [words, setWords] = useState([]);
  const [wordOfDay, setWordOfDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState(''); // Empty string means "All"
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    loadWordOfDay();
    loadWords();
  }, [level]);

  const loadWordOfDay = async () => {
    try {
      const res = await vocabularyAPI.getWordOfDay();
      setWordOfDay(res.data.vocabulary);
    } catch (err) {
      console.error('Failed to load Word of the Day');
    }
  };

  const loadWords = async () => {
    setLoading(true);
    try {
      const res = await vocabularyAPI.getAll(level || undefined, search || undefined);
      setWords(res.data);
    } catch (err) {
      toast.error('Failed to load vocabulary list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadWords();
  };

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMarkLearned = async (wordId) => {
    try {
      await vocabularyAPI.markLearned(wordId);
      toast.success('Word marked as learned! +1 XP');
      // Update local state
      setWords((prev) =>
        prev.map((w) => (w.id === wordId ? { ...w, learned: true } : w))
      );
      if (selectedWord && selectedWord.id === wordId) {
        setSelectedWord((prev) => ({ ...prev, learned: true }));
      }
      if (wordOfDay && wordOfDay.id === wordId) {
        setWordOfDay((prev) => ({ ...prev, learned: true }));
      }
    } catch (err) {
      toast.error('Could not update word status');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 text-gray-900">
        {/* Title Section */}
        <section className="stagger-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-bold text-gray-900">Vocabulary Builder</h2>
          <p className="text-xs text-gray-505 font-semibold mt-0.5">
            Build your English vocabulary with Urdu meanings and sentence contexts.
          </p>
        </section>

        {/* Word of the Day Hero */}
        {wordOfDay && (
          <section className="stagger-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative overflow-hidden bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6">
                <div>
                  <span className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
                    Word of the Day
                  </span>
                  <div className="flex items-end gap-4 mb-2 flex-wrap">
                    <h3 className="text-4xl md:text-5xl font-bold text-primary">{wordOfDay.word}</h3>
                    {wordOfDay.pronunciation && (
                      <span className="text-2xl font-bold text-gray-400 mb-1">
                        /{wordOfDay.pronunciation}/
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    Urdu Translation:{' '}
                    <span className="text-primary font-bold text-2xl ml-2 font-urdu">{wordOfDay.urdu_meaning}</span>
                  </h4>
                  <p className="text-body-lg text-gray-700 max-w-xl mb-6 leading-relaxed">
                    {wordOfDay.meaning}
                  </p>
                  {wordOfDay.example_sentence && (
                    <p className="italic text-gray-700 bg-gray-50 border border-gray-100 p-4 rounded-xl mb-6">
                      "{wordOfDay.example_sentence}"
                    </p>
                  )}
                  <div className="flex gap-4">
                    <button
                      onClick={() => speakWord(wordOfDay.word)}
                      className="flex items-center justify-center w-12 h-12 border border-gray-200 rounded-xl text-primary hover:bg-gray-50 transition-all"
                    >
                      <Volume2 size={20} />
                    </button>
                    {!wordOfDay.learned ? (
                      <button
                        onClick={() => handleMarkLearned(wordOfDay.id)}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
                      >
                        Mark Learned
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-success font-bold">
                        <CheckCircle size={20} /> Learned
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block w-48 h-48 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                  <BookOpen size={96} className="text-primary/20" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Search & Filtering Bar */}
        <section className="stagger-up flex flex-col md:flex-row gap-4" style={{ animationDelay: '0.3s' }}>
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search any English word..."
              className="w-full bg-white border border-gray-250 text-gray-900 placeholder-gray-400 rounded-2xl py-3 pl-12 pr-6 shadow-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-body-md"
            />
          </form>
          <div className="flex gap-2 flex-wrap">
            {['', 'easy', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all capitalize border ${
                  level === lvl
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {lvl === '' ? 'All Levels' : lvl}
              </button>
            ))}
          </div>
        </section>

        {/* Words Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : words.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl text-center py-12 text-gray-500">
            No words found matching your filters.
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-up" style={{ animationDelay: '0.4s' }}>
            {words.map((word) => (
              <div
                key={word.id}
                onClick={() => setSelectedWord(word)}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 relative flex flex-col justify-between cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest border ${
                      word.level === 'advanced'
                        ? 'bg-red-50 text-red-650 border-red-100'
                        : word.level === 'intermediate'
                        ? 'bg-purple-50 text-purple-650 border-purple-100'
                        : 'bg-green-50 text-green-650 border-green-100'
                    }`}>
                      {word.level}
                    </span>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => speakWord(word.word)}
                        className="text-gray-400 hover:text-primary transition-colors"
                      >
                        <Volume2 size={18} />
                      </button>
                      <button
                        onClick={() => handleMarkLearned(word.id)}
                        disabled={word.learned}
                        className={`${word.learned ? 'text-success' : 'text-gray-400 hover:text-success'} transition-colors`}
                      >
                        {word.learned ? <CheckCircle2 size={18} /> : <Bookmark size={18} />}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-primary mb-1">{word.word}</h3>
                  {word.pronunciation && (
                    <p className="text-xs text-gray-500 mb-4">/{word.pronunciation}/</p>
                  )}
                  <div className="h-px bg-gray-100 w-full my-3" />
                  <p className="text-xl font-bold text-primary mb-2 font-urdu">{word.urdu_meaning}</p>
                  <p className="text-sm text-gray-650 line-clamp-2">{word.meaning}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Word Detail Modal */}
        {selectedWord && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] animate-fade-in backdrop-blur-sm">
            <div className="bg-white border border-gray-100 rounded-2xl max-w-xl w-full p-8 relative shadow-xl text-gray-900">
              <button
                onClick={() => setSelectedWord(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 font-bold text-lg p-2"
              >
                ✕
              </button>

              <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-md uppercase tracking-wider">
                {selectedWord.level}
              </span>

              <div className="flex items-end gap-3 mt-4 mb-2">
                <h3 className="text-3xl font-bold text-primary">{selectedWord.word}</h3>
                {selectedWord.pronunciation && (
                  <span className="text-lg text-gray-500 mb-1">/{selectedWord.pronunciation}/</span>
                )}
              </div>

              <div className="h-px bg-gray-150 w-full my-4" />

              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Urdu Translation:{' '}
                <span className="text-primary font-bold text-xl ml-2 font-urdu">{selectedWord.urdu_meaning}</span>
              </h4>

              <div className="space-y-4 my-6">
                <div>
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Meaning</h5>
                  <p className="text-body-md text-gray-750">{selectedWord.meaning}</p>
                </div>
                {selectedWord.example_sentence && (
                  <div>
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Example Sentence</h5>
                    <p className="italic text-body-md text-gray-700 bg-gray-50 border border-gray-100 p-4 rounded-xl">
                      "{selectedWord.example_sentence}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => speakWord(selectedWord.word)}
                  className="flex items-center justify-center w-12 h-12 border border-gray-200 rounded-xl text-primary hover:bg-gray-50 transition-all"
                >
                  <Volume2 size={20} />
                </button>
                {!selectedWord.learned ? (
                  <button
                    onClick={() => handleMarkLearned(selectedWord.id)}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
                  >
                    Mark as Learned
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 bg-success/10 text-success border border-success/20 py-3 rounded-xl font-bold">
                    <CheckCircle size={20} /> Already Learned
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
