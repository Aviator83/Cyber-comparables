import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
  LineChart, Line, ComposedChart, Area
} from 'recharts';
import { Shield, TrendingUp, Info, Calendar, Activity, Lock, Target, Sparkles, BrainCircuit, RefreshCw, Globe, Zap, Lightbulb, Trophy } from 'lucide-react';

const apiKey = ""; // Provided at runtime

const App = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiHeading, setAiHeading] = useState("Sector Analysis");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);
//  const [test] = useState(null);


  const data = [
    { 
      name: 'F5 (FFIV)', 
      revenue: 822.5, 
      growth: 7.3, 
      margin: 26.0, 
      sum: 33.3, 
      status: 'Actual', 
      date: 'Jan 27, 2026',
      explanation: 'Software-first pivot successful; significant systems revenue surge (37%). Beat consensus by $56M.'
    },
    { 
      name: 'Palo Alto (PANW)', 
      revenue: 2470, 
      growth: 13.8, 
      margin: 13.5, 
      sum: 27.3, 
      status: 'Consensus', 
      date: 'Feb 12, 2026',
      explanation: 'Guidance reflects initial CyberArk integration costs. NG Security ARR targeting $7B+ in FY26.'
    },
    { 
      name: 'Cloudflare (NET)', 
      revenue: 591.4, 
      growth: 28.6, 
      margin: -4.4, 
      sum: 24.2, 
      status: 'Consensus', 
      date: 'Feb 10, 2026',
      explanation: 'High demand for Workers AI and agentic security. GAAP profitability remains the core focus.'
    },
    { 
      name: 'CrowdStrike (CRWD)', 
      revenue: 1100, 
      growth: 25.1, 
      margin: -7.0, 
      sum: 18.1, 
      status: 'Consensus', 
      date: 'Mar 3, 2026',
      explanation: 'Consolidation on Falcon platform offset by "Commitment Packages" following 2024 outage.'
    },
    { 
      name: 'Akamai (AKAM)', 
      revenue: 1015, 
      growth: 4.2, 
      margin: 14.0, 
      sum: 18.2, 
      status: 'Consensus', 
      date: 'Feb 19, 2026',
      explanation: 'Security & Compute now >70% of mix, offsetting 18% decline in legacy CDN delivery.'
    },
    { 
      name: 'Okta (OKTA)', 
      revenue: 682, 
      growth: 13.0, 
      margin: 1.2, 
      sum: 14.2, 
      status: 'Consensus', 
      date: 'Mar 2, 2026',
      explanation: 'Competitive pressure from Microsoft Entra and PANW/CyberArk integration impacting net adds.'
    },
    { 
      name: 'Yubico (YUBCF)', 
      revenue: 56.5, 
      growth: 16.8, 
      margin: 14.5, 
      sum: 31.3, 
      status: 'Consensus', 
      date: 'Feb 11, 2026',
      explanation: 'Phishing-resistant hardware mandate driving high-margin enterprise renewals.'
    }
  ];

  const cleanText = (text) => {
    return text.replace(/\*\*/g, '');
  };

  const callGemini = async (prompt, systemPrompt, tools = []) => {
    setIsGenerating(true);
    setAiError(null);
    let delay = 1000;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };
    if (tools.length > 0) payload.tools = tools;

    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          setIsGenerating(false);
          return cleanText(result.candidates[0].content.parts[0].text);
        }
        throw new Error("Invalid API response");
      } catch (err) {
        if (i === 4) {
          setAiError("Failed to connect to AI consultant.");
          setIsGenerating(false);
          return null;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const fetch2026Strategy = async () => {
    setAiHeading("2026 Growth Drivers & Projected Winners");
    const context = JSON.stringify(data);
    const systemPrompt = `You are a Senior Strategic Consultant (McKinsey/BCG style). 
    Your goal is to identify 2026 growth drivers and pick likely winners from the provided data.
    Focus on: 1. Regulatory shifts (NIS2, SEC), 2. Agentic AI Security, 3. Platform Consolidation.
    Format the output with clear headers for Drivers and a 'Projected Winners' table-like summary. 
    Avoid all bold formatting (no asterisks). Use professional, data-driven language.`;
    
    const userPrompt = `Based on the Q4 2025 performance data: ${context}, which 3 factors will drive the 2026 cybersecurity cycle? Identify the top 2 'winners' and provide arguments for each based on their Rule of 40 performance and current strategy.`;
    
    const text = await callGemini(userPrompt, systemPrompt, [{ google_search: {} }]);
    if (text) setAiAnalysis(text);
  };

  const generateMarketSummary = async () => {
    setAiHeading("Sector Analysis");
    const context = JSON.stringify(data);
    const systemPrompt = "You are a management consultant. Analyze growth vs profitability. Professional tone. No bold.";
    const userPrompt = `Summarize the sector health based on: ${context}.`;
    const text = await callGemini(userPrompt, systemPrompt);
    if (text) setAiAnalysis(text);
  };

  const generateCompanyDeepDive = async (index) => {
    const company = data[index];
    setAiHeading(`${company.name} Strategic Deep-Dive`);
    const systemPrompt = "Financial analyst SWOT summary. No bold formatting.";
    const userPrompt = `Analyze ${company.name} using: ${JSON.stringify(company)}.`;
    const text = await callGemini(userPrompt, systemPrompt);
    if (text) setAiAnalysis(text);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="text-indigo-600" size={32} />
              Security & Edge: CQ4 2025 Analysis
            </h1>
            <p className="text-slate-500 mt-1">Strategic Intelligence Portal | Jan 31, 2026</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={fetch2026Strategy}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg text-sm font-bold border-b-2 border-indigo-500"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Lightbulb size={16} />}
              ✨ 2026 Growth Engine
            </button>
            <button 
              onClick={generateMarketSummary}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-sm text-sm font-bold"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
              ✨ Market Summary
            </button>
          </div>
        </div>
      </div>

      {/* AI Strategic Output */}
      { (aiAnalysis || aiError) && (
        <div className="max-w-7xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-xl relative overflow-hidden border border-slate-200">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Trophy size={180} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 text-indigo-600 font-bold uppercase text-xs tracking-[0.2em] border-b pb-4">
                <BrainCircuit size={18} />
                {aiHeading}
              </div>
              {aiError ? (
                <p className="text-rose-500 font-medium">{aiError}</p>
              ) : (
                <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {aiAnalysis}
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 italic">Analysis powered by Gemini 2.5 Strategic Model + Google Search Grounding</span>
                <button 
                  onClick={() => setAiAnalysis("")}
                  className="text-xs text-slate-400 hover:text-indigo-600 underline font-bold"
                >
                  Dismiss Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visual Analytics */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              Efficiency Scorecard (Rule of 40)
            </h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="sum" radius={[0, 4, 4, 0]} barSize={32}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.status === 'Actual' ? '#4f46e5' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Actionable Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
              <Calendar size={18} className="text-indigo-600" />
              Earnings Calendar
            </h3>
            <div className="space-y-3">
              {data.map((item, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${selectedCompany === i ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm'}`}
                  onClick={() => setSelectedCompany(i)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-slate-700">{item.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.status === 'Actual' ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{item.date}</div>
                </div>
              ))}
            </div>
          </div>
          {selectedCompany !== null && (
            <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg animate-in slide-in-from-bottom-2">
              <h4 className="font-bold text-lg mb-2">{data[selectedCompany].name}</h4>
              <p className="text-indigo-100 text-xs leading-relaxed mb-4">{data[selectedCompany].explanation}</p>
              <button 
                onClick={() => generateCompanyDeepDive(selectedCompany)}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 shadow-md"
              >
                {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                Generate SWOT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Table */}
      <div className="max-w-7xl mx-auto mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Shield size={18} className="text-indigo-600" />
            CQ4 2025 Comprehensive Matrix
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-slate-400 bg-white">
                <th className="px-6 py-4 font-bold border-b">Company</th>
                <th className="px-6 py-4 font-bold border-b">Date</th>
                <th className="px-6 py-4 font-bold border-b text-center">Rev (M)</th>
                <th className="px-6 py-4 font-bold border-b text-center">Growth %</th>
                <th className="px-6 py-4 font-bold border-b text-center">EBIT %</th>
                <th className="px-6 py-4 font-bold border-b text-center">R40 Sum</th>
                <th className="px-6 py-4 font-bold border-b">Status</th>
                <th className="px-6 py-4 font-bold border-b">Analysis</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.map((item, i) => (
                <tr key={i} className="hover:bg-indigo-50/30 border-b border-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{item.date}</td>
                  <td className="px-6 py-4 text-slate-600 text-center font-medium">${item.revenue}</td>
                  <td className="px-6 py-4 text-slate-600 text-center">{item.growth}%</td>
                  <td className={`px-6 py-4 text-center font-medium ${item.margin < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{item.margin}%</td>
                  <td className={`px-6 py-4 text-center font-bold ${item.sum >= 40 ? 'text-indigo-600' : 'text-slate-600'}`}>{item.sum}%</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${item.status === 'Actual' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => generateCompanyDeepDive(i)} className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
                      <Zap size={12} /> Strategic Dive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default App;
