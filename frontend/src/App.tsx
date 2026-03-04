import { useEffect, useState } from "react";

function App() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("Ответ появится здесь.");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiOk, setApiOk] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await fetch(API_URL + "/requests");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHistory(data);
      setApiOk(true);
    } catch {
      setHistory([]);
      setApiOk(false);
    }
  };

  const sendPrompt = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(API_URL + "/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setAnswer(data.answer || "Пустой ответ");
      setPrompt("");
      fetchHistory();
    } catch {
      setAnswer("Ошибка подключения к backend.");
      setApiOk(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#060910] text-[#e6ecf3] relative overflow-x-hidden p-8">
      {/* Glow blobs */}
      <div className="fixed w-125 h-125 bg-[#2fe0a2] opacity-10 blur-[100px] rounded-full -top-24 -right-40"></div>
      <div className="fixed w-125 h-125 bg-[#4fd1ff] opacity-10 blur-[100px] rounded-full bottom-0 -left-40"></div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#0e8761] to-[#44ffc5] flex items-center justify-center font-bold text-black">
              AI
            </div>
            <div>
              <h1 className="text-3xl font-semibold">AI Bridge</h1>
              <p className="text-sm text-gray-400">
                Frontend → FastAPI → Gemini
              </p>
            </div>
          </div>

          <div
            className={`px-4 py-2 rounded-xl text-sm border ${
              apiOk
                ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
                : "bg-red-500/10 border-red-400/30 text-red-300"
            }`}
          >
            {apiOk ? "🟢 API доступен" : "🔴 API недоступен"}
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
          {/* Main Panel */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Задайте вопрос</h2>
            <p className="text-sm text-gray-400 mb-4">
              Ctrl / ⌘ + Enter — отправить
            </p>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Например: придумай стратегию запуска pet-проекта с бюджетом 100$"
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  sendPrompt();
                }
              }}
              className="w-full min-h-40 p-4 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 resize-y mb-4"
            />

            <div className="flex justify-between items-center">
              <button
                onClick={() => setPrompt("")}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Очистить
              </button>

              <button
                onClick={sendPrompt}
                disabled={loading}
                className="px-5 py-2 rounded-lg font-semibold bg-linear-to-r from-emerald-400 to-emerald-300 text-black shadow-lg hover:scale-[1.02] transition disabled:opacity-60"
              >
                {loading ? "Генерируем..." : "Отправить"}
              </button>
            </div>

            <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 min-h-30">
              {loading ? "Генерируем ответ..." : answer}
            </div>
          </div>

          {/* History Panel */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">История</h2>
              <button
                onClick={fetchHistory}
                className="text-sm px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                Обновить
              </button>
            </div>

            <div className="space-y-3 max-h-125 overflow-y-auto pr-2">
              {history.length === 0 ? (
                <div className="text-gray-400 text-center border border-dashed border-white/10 rounded-lg p-4">
                  История пуста
                </div>
              ) : (
                history
                  .slice()
                  .reverse()
                  .map((item: any) => (
                    <div
                      key={item.id}
                      className="border border-white/10 bg-white/5 rounded-xl p-3"
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        #{item.id}
                      </div>
                      <p className="text-sm mb-1">{item.prompt}</p>
                      <p className="text-xs text-gray-400">{item.response}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
