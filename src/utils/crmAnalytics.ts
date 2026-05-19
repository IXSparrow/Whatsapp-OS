export interface CRMLead {
  id: string;
  businessName: string;
  category: string;
  location: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviews: number;
  googleMapsUrl: string;
  leadScore: number;
  qualityScore: number;
  opportunityScore: number;
  crmStage: string;
  status: string;
  createdAt: string;
  extractedAt: string;
  nextFollowUpAt: string;
  notes: string;
  revenuePotential: number;
}

export function cleanAndNormalizeLeads(rawLeads: any[]): { cleaned: CRMLead[], duplicatesRemoved: number } {
  if (!Array.isArray(rawLeads)) return { cleaned: [], duplicatesRemoved: 0 };
  
  const seen = new Set();
  let duplicates = 0;

  const validLeads: CRMLead[] = [];

  for (const lead of rawLeads) {
    if (!lead) continue;
    
    const businessName = lead.name || lead.businessName || 'Unnamed Lead';
    const category = lead.category || 'Unknown';
    const location = lead.address || lead.location || 'Unknown Location';
    const phone = lead.phone || lead.whatsapp || '';
    const website = lead.website || '';
    const googleMapsUrl = lead.mapsUrl || lead.googleMapsUrl || '';

    const key = `${businessName}-${phone}-${website}-${location}`.toLowerCase();
    
    if (seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);

    // Calculate custom scores
    let quality = 0;
    if (phone) quality += 30;
    if (lead.email) quality += 30;
    if (website) quality += 20;
    if (lead.rating && lead.rating >= 4.0) quality += 20;

    let opportunity = 50;
    if (lead.reviews && lead.reviews > 50) opportunity += 20;
    if (lead.rating && lead.rating >= 4.5) opportunity += 30;

    const leadScore = lead.leadScore || Math.min(100, Math.round((quality + opportunity) / 2));
    
    let revPotential = 2000;
    if (leadScore >= 80) revPotential = 10000;
    else if (leadScore >= 50) revPotential = 5000;

    validLeads.push({
      id: lead.id || Math.random().toString(36).substr(2, 9),
      businessName,
      category,
      location,
      city: location.split(',').slice(-2, -1)[0]?.trim() || location.split(',')[0],
      address: location,
      phone,
      email: lead.email || '',
      website,
      rating: lead.rating || 0,
      reviews: lead.reviews || 0,
      googleMapsUrl,
      leadScore,
      qualityScore: lead.qualityScore || quality,
      opportunityScore: lead.opportunityScore || opportunity,
      crmStage: lead.crmStage || 'New Lead',
      status: lead.status || 'Uncontacted',
      createdAt: lead.createdAt || new Date().toISOString(),
      extractedAt: lead.extractedAt || lead.createdAt || new Date().toISOString(),
      nextFollowUpAt: lead.nextFollowUpAt || new Date(Date.now() + 86400000 * (leadScore > 80 ? 1 : leadScore > 50 ? 3 : 7)).toISOString(),
      notes: lead.notes || '',
      revenuePotential: lead.revenuePotential || revPotential
    });
  }

  return { cleaned: validLeads, duplicatesRemoved: duplicates };
}

export function calculateCRMAnalytics(leads: CRMLead[]) {
  const totalLeads = leads.length;
  
  const validLeadsList = leads.filter(l => l.phone || l.email || l.website || l.address !== 'Unknown Location');
  const validLeads = validLeadsList.length;
  const invalidLeads = totalLeads - validLeads;
  
  const revenuePotential = leads.reduce((sum, l) => sum + l.revenuePotential, 0);
  
  const whatsappReadyLeads = leads.filter(l => l.phone).length;
  const emailReadyLeads = leads.filter(l => l.email).length;
  const campaignReadyLeads = leads.filter(l => l.phone || l.email).length;
  const websiteMissingLeads = leads.filter(l => !l.website).length;
  
  const needsEnrichment = leads.filter(l => !l.phone || !l.email || !l.website || !l.category || !l.rating).length;
  
  const followupReady = leads.filter(l => (l.phone || l.email) && l.status !== 'Converted' && l.status !== 'Lost').length;
  const followUpReadyPercentage = totalLeads ? Math.round((followupReady / totalLeads) * 100) : 0;
  
  const avgLeadQuality = totalLeads ? Math.round(leads.reduce((sum, l) => sum + l.leadScore, 0) / totalLeads) : 0;
  
  const catMap: Record<string, number> = {};
  leads.forEach(l => { catMap[l.category] = (catMap[l.category] || 0) + 1; });
  const categoryDistribution = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalLeads) * 100) }));
    
  const locMap: Record<string, number> = {};
  leads.forEach(l => { locMap[l.city] = (locMap[l.city] || 0) + 1; });
  const locationDistribution = Object.entries(locMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalLeads) * 100) }));

  const activityMap: Record<string, number> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    activityMap[d.toISOString().split('T')[0]] = 0;
  }
  leads.forEach(l => {
    const dateStr = new Date(l.extractedAt).toISOString().split('T')[0];
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
  });
  const leadsActivityByDate = Object.entries(activityMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-7)
    .map(([date, count]) => ({ date, time: date.substring(5).replace('-', '/'), leads: count }));

  const pipelineStages = [
    { name: 'New Lead', value: 0 },
    { name: 'Qualified', value: 0 },
    { name: 'Contacted', value: 0 },
    { name: 'Interested', value: 0 },
    { name: 'Follow-up', value: 0 },
    { name: 'Converted', value: 0 },
    { name: 'Lost', value: 0 },
  ];
  leads.forEach(l => {
    const st = pipelineStages.find(s => s.name === l.crmStage);
    if (st) st.value++;
    else pipelineStages[0].value++;
  });

  const topPriorityLeads = [...leads].sort((a, b) => b.leadScore - a.leadScore).slice(0, 10);

  // Generate real AI insights
  const insights = [];
  if (categoryDistribution.length > 0) {
    insights.push(`Top opportunity category is **${categoryDistribution[0].name}** with ${categoryDistribution[0].count} leads.`);
  }
  if (locationDistribution.length > 0) {
    insights.push(`Best location is **${locationDistribution[0].name}** based on highest valid leads.`);
  }
  if (whatsappReadyLeads > 0) {
    insights.push(`**${Math.round((whatsappReadyLeads/totalLeads)*100)}%** of leads are WhatsApp ready.`);
  }
  if (needsEnrichment > 0) {
    insights.push(`**${needsEnrichment}** leads need enrichment because website or contact info is missing.`);
  }
  const highScoreLeads = leads.filter(l => l.leadScore >= 80 && l.phone).length;
  if (highScoreLeads > 0) {
    insights.push(`Start outreach with **${highScoreLeads}** high-priority phone-ready leads first.`);
  }
  insights.push(`Estimated revenue potential across all leads is **₹${revenuePotential.toLocaleString()}**.`);
  if (whatsappReadyLeads >= emailReadyLeads) {
    insights.push(`Best outreach channel is **WhatsApp**, covering ${whatsappReadyLeads} prospects.`);
  } else {
    insights.push(`Best outreach channel is **Email**, covering ${emailReadyLeads} prospects.`);
  }

  return {
    totalLeads,
    validLeads,
    invalidLeads,
    revenuePotential,
    followUpReadyPercentage,
    needsEnrichment,
    avgLeadQuality,
    categoryDistribution,
    locationDistribution,
    leadsActivityByDate,
    pipelineStages,
    topPriorityLeads,
    campaignReadyLeads,
    whatsappReadyLeads,
    emailReadyLeads,
    websiteMissingLeads,
    aiInsights: insights
  };
}
