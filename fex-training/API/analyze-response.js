// api/analyze-response.js
// Claude API integration for FEX Training

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agentResponse, scenario } = req.body;

  if (!agentResponse || !scenario) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk').default;
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const systemPrompt = `You are The Skeptical Lead Assistant analyzing an insurance agent's response to a prospect objection.

Prospect said: "${scenario.customerMessage}"

Agent responded: "${agentResponse}"

Analyze this response and return ONLY a valid JSON object (no markdown, no other text):

{
  "emotional_meaning": "What the prospect is really feeling underneath (1-2 sentences)",
  "main_issue": "trust|money|urgency|confusion|control|resentment|emotional_avoidance|discomfort|fear",
  "best_approach": "How the agent should handle it (1-2 sentences)",
  "suggested_response": "A better 2-5 sentence response",
  "follow_up_question": "One open-ended question starting with What/How/Tell me/Walk me/Where/When",
  "soft_close": "One open-ended closing question",
  "text_follow_up": "Optional text under 300 chars",
  "quality_score": 0-100,
  "strengths": ["What they did well"],
  "improvements": ["What to improve"]
}`;

    const message = await client.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: systemPrompt
        }
      ]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Clean up response text
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    let feedback;
    try {
      feedback = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return res.status(500).json({
        error: 'Failed to parse coaching feedback',
        message: 'The AI response was not in the expected format'
      });
    }

    return res.status(200).json(feedback);
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return res.status(500).json({
      error: 'Failed to generate coaching feedback',
      message: error.message
    });
  }
}
