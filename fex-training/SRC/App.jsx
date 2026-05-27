import React, { useState, useEffect } from 'react';
import { ChevronRight, RotateCcw, Menu, LogOut, TrendingUp, Users } from 'lucide-react';

export default function FEXTrainingApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'agent' or 'manager'
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [currentScenario, setCurrentScenario] = useState(null);
  const [agentResponse, setAgentResponse] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState([]);
  const [view, setView] = useState('scenarios'); // 'scenarios', 'history', 'dashboard'
  const [teamMembers, setTeamMembers] = useState([]);

  // Scenarios based on the coaching framework
  const scenarios = [
    {
      id: 1,
      objection: "I'm not interested",
      context: "Older adult, Facebook inquiry, low trust",
      customerMessage: "Look, I appreciate the call, but I'm just not interested in talking about this right now.",
      coachingFocus: "Deflection vs disinterest — uncover the real concern without pushing"
    },
    {
      id: 2,
      objection: "Call me later",
      context: "Prospect seems busy or overwhelmed",
      customerMessage: "I'm in the middle of something. Can you just call me back next week?",
      coachingFocus: "Respect the request but don't let them postpone without moving forward"
    },
    {
      id: 3,
      objection: "You're dragging this out",
      context: "Prospect feels pressure mounting",
      customerMessage: "Look, you've been going on about this for a while now. You're making this feel way more complicated than it needs to be.",
      coachingFocus: "Lower tension, give control back, reset the conversation"
    },
    {
      id: 4,
      objection: "Just send me information",
      context: "Prospect wants to avoid the conversation",
      customerMessage: "Why don't you just email me something and let me look it over?",
      coachingFocus: "Don't default to sending info — redirect back into conversation"
    },
    {
      id: 5,
      objection: "I already have insurance",
      context: "Prospect claims they're covered",
      customerMessage: "I already have insurance through my bank. So I don't need this.",
      coachingFocus: "Don't contradict — gently verify the type of coverage they have"
    },
    {
      id: 6,
      objection: "It's too expensive",
      context: "Price objection emerges",
      customerMessage: "That sounds like a lot of money every month. I don't think I can afford that right now.",
      coachingFocus: "Don't defend price — ask what range feels manageable"
    },
    {
      id: 7,
      objection: "I need to think about it",
      context: "Prospect wants to delay decision",
      customerMessage: "I appreciate the information, but I really need to think this through. Maybe we can talk in a couple weeks?",
      coachingFocus: "Don't chase — find the unresolved concern underneath"
    },
    {
      id: 8,
      objection: "Dark humor / sarcasm",
      context: "Prospect deflects with jokes",
      customerMessage: "Yeah, well, I'm not worried about it. When I'm gone, I'll be gone. Not my problem anymore! *laughs*",
      coachingFocus: "Treat as protective deflection — find what matters underneath"
    }
  ];

  // Mock function to call Claude API
  const analyzeResponse = async (response, scenario) => {
    setLoading(true);
    try {
      // In production, this would call your backend which calls Claude API
      // For MVP, we'll simulate the analysis
      const analysisPrompt = `You are The Skeptical Lead Assistant coaching an insurance agent on final expense sales.

A prospect said: "${scenario.customerMessage}"

The agent responded: "${response}"

Analyze this response using this exact framework and return ONLY a JSON object with NO other text:

{
  "emotional_meaning": "Brief explanation of what may be underneath the prospect's concern (1-2 sentences)",
  "main_issue": "One of: trust, money, urgency, confusion, control, resentment, emotional_avoidance, discomfort, fear",
  "best_approach": "Concise summary of the best conversational approach (1-2 sentences)",
  "suggested_response": "A better 2-5 sentence response the agent could use",
  "follow_up_question": "A single open-ended question starting with What, How, Tell me, Walk me, Where, or When",
  "soft_close": "A single open-ended closing question",
  "text_follow_up": "Optional text message under 300 chars that continues the conversation",
  "quality_score": 0-100,
  "strengths": ["Array of what the agent did well"],
  "improvements": ["Array of specific improvements"]
}`;

      // Call Claude API via our backend
      const response_data = await fetch('/api/analyze-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentResponse: response,
          scenario: scenario,
          prompt: analysisPrompt
        })
      }).catch(() => null);

      if (response_data?.ok) {
        const result = await response_data.json();
        setFeedback(result);
      } else {
        // Fallback for MVP/demo
        setFeedback(generateMockFeedback(response, scenario));
      }

      // Save response
      setResponses([...responses, {
        id: Date.now(),
        scenarioId: scenario.id,
        scenarioTitle: scenario.objection,
        agentResponse: response,
        timestamp: new Date().toLocaleString(),
        qualityScore: Math.floor(Math.random() * 30 + 60)
      }]);
    } catch (error) {
      console.error('Error analyzing response:', error);
      setFeedback(generateMockFeedback(response, scenario));
    }
    setLoading(false);
  };

  // Mock feedback generator for MVP
  const generateMockFeedback = (response, scenario) => {
    const scoreFactors = {
      "I hear you": 15,
      "What": 10,
      "How": 10,
      "family": 15,
      "sense": 10,
      "comfortable": 10
    };

    let score = 50;
    Object.keys(scoreFactors).forEach(word => {
      if (response.toLowerCase().includes(word.toLowerCase())) {
        score += scoreFactors[word];
      }
    });
    score = Math.min(100, score);

    return {
      emotional_meaning: "The prospect may be feeling pressure or loss of control in the conversation.",
      main_issue: "control",
      best_approach: "Acknowledge their feeling without apologizing, lower tension, and give control back.",
      suggested_response: "I hear you, and that makes sense. I may have made this feel like more than it needs to be. What part feels like too much right now?",
      follow_up_question: "What would actually be helpful to understand about this?",
      soft_close: "What would make it worth looking at this differently?",
      text_follow_up: "I get it — let's slow down. What part feels most important to you?",
      quality_score: score,
      strengths: [
        response.toLowerCase().includes("hear") ? "✓ Used empathetic acknowledgment" : "Consider starting with 'I hear you'",
        response.toLowerCase().includes("what") ? "✓ Used open-ended question" : "Add an open-ended question",
        response.length < 150 ? "✓ Kept response concise" : "Consider shortening your response"
      ],
      improvements: [
        response.toLowerCase().includes("sell") || response.toLowerCase().includes("buy") ? "Avoid sales-heavy language" : "",
        response.toLowerCase().includes("but") ? "Replace 'but' with 'and'" : "",
        !response.toLowerCase().includes("what") && !response.toLowerCase().includes("how") ? "Add more questions, fewer statements" : ""
      ].filter(Boolean)
    };
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password && agencyName) {
      setCurrentUser(email);
      const role = email.includes('manager') ? 'manager' : 'agent';
      setUserRole(role);
      setShowLogin(false);

      // Mock team data for managers
      if (role === 'manager') {
        setTeamMembers([
          { name: 'John Smith', responses: 12, avgScore: 72, lastPractice: '2 hours ago' },
          { name: 'Sarah Johnson', responses: 8, avgScore: 68, lastPractice: '1 day ago' },
          { name: 'Mike Davis', responses: 5, avgScore: 65, lastPractice: '3 days ago' }
        ]);
      }
    }
  };

  // Select a scenario
  const handleSelectScenario = (scenario) => {
    setCurrentScenario(scenario);
    setAgentResponse('');
    setFeedback(null);
  };

  // Submit response for analysis
  const handleSubmitResponse = () => {
    if (agentResponse.trim()) {
      analyzeResponse(agentResponse, currentScenario);
    }
  };

  // Reset current practice
  const handleReset = () => {
    setAgentResponse('');
    setFeedback(null);
  };

  const logout = () => {
    setCurrentUser(null);
    setUserRole(null);
    setShowLogin(true);
    setEmail('');
    setPassword('');
    setAgencyName('');
    setView('scenarios');
  };

  // LOGIN SCREEN
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">FEX Rebuttal</h1>
              <p className="text-sm text-slate-600">Sales Training Platform</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Agency Name</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Your Agency"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@agency.com (use 'manager' for manager role)"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-600 text-center mb-4">
                <strong>Demo Login:</strong>
              </p>
              <div className="space-y-2 text-xs">
                <p><strong>Agent:</strong> agent@company.com / password</p>
                <p><strong>Manager:</strong> manager@company.com / password</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-700">
                <strong>⚠️ Compliance Notice:</strong> This is sales training support only. Follow all carrier, state, licensing, and compliance-approved requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AGENT VIEW - SCENARIOS & PRACTICE
  if (userRole === 'agent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">FEX Rebuttal Training</h1>
              <p className="text-sm text-slate-600">Practice handling objections with AI coaching</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{currentUser}</p>
                <p className="text-xs text-slate-600">{responses.length} practices completed</p>
              </div>
              <button
                onClick={logout}
                className="text-slate-600 hover:text-slate-900 p-2"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t border-slate-200 bg-slate-50">
            <div className="max-w-6xl mx-auto px-4 flex gap-1">
              <button
                onClick={() => setView('scenarios')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  view === 'scenarios'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Practice Scenarios
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  view === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                My Responses ({responses.length})
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* SCENARIOS VIEW */}
          {view === 'scenarios' && (
            <div>
              {!currentScenario ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      onClick={() => handleSelectScenario(scenario)}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border border-slate-200 hover:border-blue-400"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-slate-900">{scenario.objection}</h3>
                        <ChevronRight className="text-blue-600" size={20} />
                      </div>
                      <p className="text-sm text-slate-600 mb-4">{scenario.context}</p>
                      <p className="text-sm text-slate-700 italic mb-4">"{scenario.customerMessage}"</p>
                      <p className="text-xs bg-blue-50 text-blue-900 p-2 rounded font-medium">
                        Focus: {scenario.coachingFocus}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <button
                    onClick={() => setCurrentScenario(null)}
                    className="text-blue-600 hover:text-blue-700 font-medium mb-6 flex items-center gap-2"
                  >
                    ← Back to Scenarios
                  </button>

                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{currentScenario.objection}</h2>
                    <p className="text-sm text-slate-600 mb-4">{currentScenario.context}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-6 mb-8 border-l-4 border-blue-500">
                    <p className="text-sm font-semibold text-slate-600 mb-2">PROSPECT SAYS:</p>
                    <p className="text-lg text-slate-900 italic">"{currentScenario.customerMessage}"</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Your Response:
                    </label>
                    <textarea
                      value={agentResponse}
                      onChange={(e) => setAgentResponse(e.target.value)}
                      placeholder="Type how you would respond to this objection..."
                      disabled={loading || feedback}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium h-32 resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-600 mt-2">
                      {agentResponse.length} characters — Keep it under 300 for natural conversation
                    </p>
                  </div>

                  {!feedback && (
                    <button
                      onClick={handleSubmitResponse}
                      disabled={!agentResponse.trim() || loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                      {loading ? 'Analyzing...' : 'Get AI Coaching Feedback'}
                    </button>
                  )}

                  {/* FEEDBACK DISPLAY */}
                  {feedback && (
                    <div className="space-y-6 mt-8 pt-8 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-900">Your Coaching Feedback</h3>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Quality Score</p>
                          <p className={`text-4xl font-bold ${
                            feedback.quality_score >= 80 ? 'text-green-600' :
                            feedback.quality_score >= 60 ? 'text-blue-600' :
                            'text-amber-600'
                          }`}>
                            {feedback.quality_score}%
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 mb-2 uppercase">Main Issue</p>
                          <p className="text-sm text-blue-900 font-medium capitalize">{feedback.main_issue}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <p className="text-xs font-semibold text-purple-900 mb-2 uppercase">Emotional Meaning</p>
                          <p className="text-sm text-purple-900">{feedback.emotional_meaning}</p>
                        </div>
                      </div>

                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <p className="text-xs font-semibold text-amber-900 mb-2 uppercase">Best Approach</p>
                        <p className="text-sm text-amber-900">{feedback.best_approach}</p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-xs font-semibold text-green-900 mb-2 uppercase">Suggested Response</p>
                        <p className="text-sm text-green-900 font-medium italic">"{feedback.suggested_response}"</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <p className="text-xs font-semibold text-slate-900 mb-2 uppercase">Follow-Up Question</p>
                          <p className="text-sm text-slate-900 italic">"{feedback.follow_up_question}"</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <p className="text-xs font-semibold text-slate-900 mb-2 uppercase">Soft Close</p>
                          <p className="text-sm text-slate-900 italic">"{feedback.soft_close}"</p>
                        </div>
                      </div>

                      {feedback.text_follow_up && (
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                          <p className="text-xs font-semibold text-indigo-900 mb-2 uppercase">Text Follow-Up</p>
                          <p className="text-sm text-indigo-900">"{feedback.text_follow_up}"</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-semibold text-green-700 mb-3">What You Did Well:</p>
                          <ul className="space-y-2">
                            {feedback.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-green-700">✓ {strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-700 mb-3">Next Steps:</p>
                          <ul className="space-y-2">
                            {feedback.improvements.map((improvement, idx) => (
                              <li key={idx} className="text-sm text-amber-700">→ {improvement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={() => {
                            handleReset();
                            setCurrentScenario(null);
                          }}
                          className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <RotateCcw size={18} />
                          Try Another Scenario
                        </button>
                        <button
                          onClick={handleReset}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* HISTORY VIEW */}
          {view === 'history' && (
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Practice History</h2>
              {responses.length === 0 ? (
                <p className="text-center text-slate-600 py-12">No responses yet. Start with a scenario!</p>
              ) : (
                <div className="space-y-4">
                  {responses.map((resp) => (
                    <div key={resp.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">{resp.scenarioTitle}</h4>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-600">{resp.qualityScore}%</p>
                          <p className="text-xs text-slate-600">{resp.timestamp}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 line-clamp-2">"{resp.agentResponse}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // MANAGER VIEW - TEAM DASHBOARD
  if (userRole === 'manager') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">FEX Training Dashboard</h1>
              <p className="text-sm text-slate-600">Manage team training and track progress</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{currentUser}</p>
                <p className="text-xs text-slate-600">Training Manager</p>
              </div>
              <button
                onClick={logout}
                className="text-slate-600 hover:text-slate-900 p-2"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Team Members</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{teamMembers.length}</p>
                </div>
                <Users className="text-blue-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Practices</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {teamMembers.reduce((sum, m) => sum + m.responses, 0)}
                  </p>
                </div>
                <TrendingUp className="text-green-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Avg Score</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {Math.round(teamMembers.reduce((sum, m) => sum + m.avgScore, 0) / (teamMembers.length || 1))}%
                  </p>
                </div>
                <div className="text-purple-500 text-3xl font-bold">✓</div>
              </div>
            </div>
          </div>

          {/* Team Members Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Team Members</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Agent Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Practices</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Avg Score</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teamMembers.map((member, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{member.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{member.responses} scenarios</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          member.avgScore >= 80 ? 'bg-green-100 text-green-800' :
                          member.avgScore >= 60 ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {member.avgScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{member.lastPractice}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>📊 Dashboard Coming Soon:</strong> Response analytics, objection weak spots, individual coaching plans, and team leaderboards.
            </p>
          </div>
        </main>
      </div>
    );
  }
}
