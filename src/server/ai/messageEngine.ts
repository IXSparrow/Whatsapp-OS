import OpenAI from 'openai';
import { env } from '../../lib/env';

// Gracefully handle missing or mock OpenAI API keys
const hasRealKey = env.OPENAI_API_KEY && !env.OPENAI_API_KEY.startsWith('sk-...');
const openai = hasRealKey 
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

export interface LeadScoreResult {
  leadScore: number;
  intentScore: number;
  responseProbability: number;
  priority: 'Hot' | 'Warm' | 'Cold';
  bestContactTime: string;
  recommendedChannel: string;
}

export interface ReplyAnalysisResult {
  intent: 'Interested' | 'Not Interested' | 'Question' | 'Callback' | 'Pricing' | 'Unknown';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  priority: 'Hot' | 'Warm' | 'Cold';
  nextAction: string;
  summary: string;
}

export class MessageEngine {
  // 1. AI Message Personalizer
  static async generatePersonalizedMessage(lead: any, templateText: string): Promise<string> {
    // Basic local templating replacements
    let msg = templateText
      .replace(/{name}/g, lead.name || 'there')
      .replace(/{businessName}/g, lead.businessName || 'your business')
      .replace(/{category}/g, lead.category || 'business')
      .replace(/{city}/g, lead.city || 'your city')
      .replace(/{rating}/g, lead.rating ? String(lead.rating) : '4.5')
      .replace(/{offer}/g, 'exclusive optimization pipeline access');

    if (!openai) {
      return msg;
    }

    try {
      const prompt = `
You are an expert sales personalizer. Take the following message template and customize it naturally for this business:
Template: "${msg}"
Business details:
- Business Name: ${lead.businessName || 'N/A'}
- Category: ${lead.category || 'N/A'}
- City: ${lead.city || 'N/A'}
- Rating: ${lead.rating || 'N/A'}
- Reviews Count: ${lead.reviews || 'N/A'}

Rules:
1. Keep the main offer/question from the template intact.
2. Integrate 1 unique detail (rating, reviews count, or category) naturally.
3. Keep it under 280 characters.
4. Never return blank text.
`;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 150,
      });
      return response.choices[0].message.content?.trim() || msg;
    } catch (e) {
      console.error('OpenAI Personalizer Error:', e);
      return msg;
    }
  }

  // 2. AI Lead Scoring Engine
  static calculateLeadScore(lead: any): LeadScoreResult {
    let score = 0;

    // phone exists +20
    if (lead.phone) score += 20;
    // website exists +10
    if (lead.website || lead.email) score += 10;
    // rating above 4 +15
    const rating = lead.rating ? parseFloat(lead.rating) : 0;
    if (rating >= 4.0) score += 15;
    // reviews above 50 +15
    const reviews = lead.reviews ? parseInt(lead.reviews, 10) : 0;
    if (reviews >= 50) score += 15;
    // category match +10
    if (lead.category && lead.category.length > 2) score += 10;
    // city match +10
    if (lead.city && lead.city.length > 2) score += 10;
    // business name quality +10
    if (lead.businessName && lead.businessName.length > 3) score += 10;
    // social/contact availability +10
    if (lead.facebook || lead.instagram || lead.linkedin) score += 10;

    // Intent score estimation based on reviews/ratings
    let intentScore = 50;
    if (reviews > 100 && rating >= 4.5) {
      intentScore = 90;
    } else if (reviews > 30 || rating >= 4.0) {
      intentScore = 75;
    }

    const responseProbability = Math.round((score + intentScore) / 2);
    let priority: 'Hot' | 'Warm' | 'Cold' = 'Cold';
    if (responseProbability >= 75) {
      priority = 'Hot';
    } else if (responseProbability >= 50) {
      priority = 'Warm';
    }

    // Dynamic contact times based on category or intent
    let bestContactTime = '09:00 AM - 11:30 AM';
    if (lead.category?.toLowerCase().includes('restaurant') || lead.category?.toLowerCase().includes('food')) {
      bestContactTime = '02:00 PM - 04:30 PM';
    } else if (priority === 'Hot') {
      bestContactTime = '10:00 AM - 12:30 PM';
    }

    return {
      leadScore: score,
      intentScore,
      responseProbability,
      priority,
      bestContactTime,
      recommendedChannel: 'WhatsApp'
    };
  }

  // 3. AI Reply Analyzer
  static async analyzeReply(replyText: string): Promise<ReplyAnalysisResult> {
    const text = replyText.toLowerCase();
    
    // Quick local sentiment and intent analysis
    let intent: ReplyAnalysisResult['intent'] = 'Unknown';
    let sentiment: ReplyAnalysisResult['sentiment'] = 'Neutral';
    let priority: ReplyAnalysisResult['priority'] = 'Cold';
    let nextAction = 'Follow up next week.';
    let summary = 'Acknowledge reply and qualify further.';

    if (text.includes('yes') || text.includes('ha') || text.includes('sure') || text.includes('interested') || text.includes('how')) {
      intent = 'Interested';
      sentiment = 'Positive';
      priority = 'Hot';
      nextAction = 'Schedule a discovery call and share workspace details.';
      summary = 'Lead showed positive interest in our solutions.';
    } else if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
      intent = 'Pricing';
      sentiment = 'Neutral';
      priority = 'Warm';
      nextAction = 'Send standard pricing PDF & agent details.';
      summary = 'Lead requested product pricing catalog.';
    } else if (text.includes('call') || text.includes('number') || text.includes('phone')) {
      intent = 'Callback';
      sentiment = 'Positive';
      priority = 'Hot';
      nextAction = 'Call immediately or schedule booking calendar.';
      summary = 'Lead requested an interactive call.';
    } else if (text.includes('stop') || text.includes('no') || text.includes('don\'t') || text.includes('unsubscribe')) {
      intent = 'Not Interested';
      sentiment = 'Negative';
      priority = 'Cold';
      nextAction = 'Opt-out lead and mark as stopped.';
      summary = 'Lead requested to opt-out.';
    }

    if (!openai) {
      return { intent, sentiment, priority, nextAction, summary };
    }

    try {
      const prompt = `
Analyze this WhatsApp message response from a lead:
"${replyText}"

Categorize and output exactly in JSON format:
{
  "intent": "Interested" | "Not Interested" | "Question" | "Callback" | "Pricing" | "Unknown",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "priority": "Hot" | "Warm" | "Cold",
  "nextAction": "Short action instruction",
  "summary": "Short 1-sentence recap"
}
`;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 150,
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      return {
        intent: parsed.intent || intent,
        sentiment: parsed.sentiment || sentiment,
        priority: parsed.priority || priority,
        nextAction: parsed.nextAction || nextAction,
        summary: parsed.summary || summary
      };
    } catch (e) {
      console.error('OpenAI Intent Analyzer Error:', e);
      return { intent, sentiment, priority, nextAction, summary };
    }
  }

  // 4. AI Template Generator
  static async generateTemplate(type: string, name: string = 'Campaign'): Promise<string> {
    const templatesMap: Record<string, string> = {
      'Friendly': 'Hi {name}, hope you are having a wonderful day! I saw {businessName} in {city} and was really impressed by your category listing. Would you be open to a quick chat about optimizing your customer reach?',
      'Premium': 'Hello {name}, we noticed {businessName} is currently rated {rating}/5 in {city}. Excellent work. We developed a custom workflow to automatically book appointments for {category} firms. Open to a brief demo?',
      'Luxury': 'Greetings {name}, your brand {businessName} exhibits premium reputation credentials in {city}. We invite you to explore our invite-only concierge pipeline built exclusively for leading {category} operators.',
      'Direct': 'Hi {name}, I noticed {businessName} is missing a quick-response WhatsApp link on search engines. We can auto-sync one for you in 5 minutes. Are you available for a fast setup call today?',
      'Local Business': 'Hey {name}, I live near {city} and love local businesses like {businessName}. We created a local pipeline that helps {category} owners generate 20+ bookings weekly. Can I send a short summary?',
      'WhatsApp Short Pitch': 'Hi {name}! Love your business {businessName}. Open to generating 2x more replies from high-intent leads using automated campaigns? Check us out!',
      'Follow-up': 'Hi {name}, just following up on my previous message. I know you are busy running {businessName}. If you want to automate your lead outreach, let me know!'
    };

    const defaultTpl = templatesMap[type] || templatesMap['Friendly'];
    if (!openai) {
      return defaultTpl;
    }

    try {
      const prompt = `
Generate a highly engaging, professional sales template text for a campaign of type "${type}".
The template MUST use placeholders: {name}, {businessName}, {category}, {city}, {rating}, {offer}.

Rules:
1. Make it feel highly premium and customized for the style.
2. Keep it under 240 characters.
3. Only return the template text, no labels.
`;
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: prompt }],
        max_tokens: 150,
      });
      return response.choices[0].message.content?.trim() || defaultTpl;
    } catch (e) {
      console.error('OpenAI Template Generator Error:', e);
      return defaultTpl;
    }
  }
}
