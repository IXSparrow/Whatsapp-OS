// Helper to scrape basic email/socials using native fetch + regex
async function enrichWebsite(url) {
  try {
    if (!url || !url.startsWith('http')) return { email: '', socialLinks: [] };
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    
    const res = await fetch(url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    clearTimeout(timeout);
    
    if (!res.ok) return { email: '', socialLinks: [] };
    
    const html = await res.text();
    
    // Basic regex for email extraction
    const emailMatch = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : '';
    
    const socialLinks = [];
    const socialPlatforms = ['facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'x.com'];
    
    const hrefs = html.match(/href=["'](https?:\/\/[^"']+)["']/g) || [];
    for (const match of hrefs) {
      const link = match.replace(/href=["']/g, '').replace(/["']/g, '');
      if (socialPlatforms.some(p => link.includes(p)) && !socialLinks.includes(link)) {
        socialLinks.push(link);
      }
    }
    
    return { email, socialLinks: socialLinks.slice(0, 3) };
  } catch (err) {
    return { email: '', socialLinks: [] };
  }
}

export default async function handler(req, res) {
  // Ensure CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_key_here' || apiKey === 'YOUR_REAL_GOOGLE_PLACES_API_KEY') {
    return res.status(400).json({ 
      success: false, 
      error: 'Google Places API key missing. Add GOOGLE_PLACES_API_KEY to Vercel Environment Variables.' 
    });
  }

  // Parse body properly for serverless
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }

  const { businessType, location, maxResults, qualityFloor } = body || {};
  
  if (!businessType || !location) {
    return res.status(400).json({ success: false, error: 'Business type and location are required' });
  }

  const limit = maxResults ? parseInt(maxResults, 10) : 20;
  const ratingFloor = qualityFloor ? parseFloat(qualityFloor.split('+')[0]) : 0;

  try {
    const query = encodeURIComponent(`${businessType} in ${location}`);
    let allPlaces = [];
    let pagesFetched = 0;

    let nextToken = '';
    let hasNext = true;
    while (hasNext && allPlaces.length < limit && pagesFetched < 10) {
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}${nextToken ? \`&pagetoken=\${nextToken}\` : ''}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
        return res.status(500).json({ success: false, error: `Google API Error: ${searchData.status}` });
      }
      
      const pageResults = (searchData.results || []).map((p) => ({
        place_id: p.place_id,
        name: p.name,
        formatted_address: p.formatted_address,
        rating: p.rating,
        user_ratings_total: p.user_ratings_total,
        types: p.types,
        url: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
        formatted_phone_number: '',
        website: ''
      }));
      
      allPlaces.push(...pageResults);
      pagesFetched++;
      
      nextToken = searchData.next_page_token;
      if (nextToken && allPlaces.length < limit) {
        // Sleep slightly to allow token to become valid on Google's end
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        hasNext = false;
      }
    }

    if (ratingFloor > 0) {
      allPlaces = allPlaces.filter((p) => p.rating && p.rating >= ratingFloor);
    }
    
    // Deduplicate
    const uniquePlaces = new Map();
    allPlaces.forEach(item => uniquePlaces.set(item.place_id || item.name, item));
    allPlaces = Array.from(uniquePlaces.values()).slice(0, limit);
    
    const leads = [];

    // Website enrichment & processing
    for (const p of allPlaces) {
      let email = '';
      let socialLinks = [];
      let phone = p.formatted_phone_number || p.phone || '';
      let website = p.website || '';
      let address = p.formatted_address || p.address || '';
      let url = p.url || `https://www.google.com/maps/place/?q=place_id:${p.place_id}`;
      
      if (p.place_id) {
         const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=name,formatted_phone_number,website,formatted_address,rating,user_ratings_total,types,url&key=${apiKey}`;
         const detailRes = await fetch(detailsUrl);
         const detailData = await detailRes.json();
         if (detailData.status === 'OK') {
           const d = detailData.result;
           phone = d.formatted_phone_number || phone;
           website = d.website || website;
           address = d.formatted_address || address;
           url = d.url || url;
         }
      }
      
      if (website) {
        const enrichment = await enrichWebsite(website);
        email = enrichment.email;
        socialLinks = enrichment.socialLinks;
      }

      leads.push({
        name: p.name || p.title || '',
        phone: phone,
        website: website,
        address: address,
        rating: p.rating || 0,
        reviews: p.user_ratings_total || p.reviews || 0,
        category: p.types && p.types.length > 0 ? p.types[0].replace(/_/g, ' ') : businessType,
        mapsUrl: url,
        email: email,
        socialLinks: socialLinks,
        status: (phone || email) ? 'valid' : 'incomplete'
      });
    }

    return res.status(200).json({
      success: true,
      source: "Google Places API (Serverless Engine)",
      total: leads.length,
      requestedMax: limit,
      pagesFetched: pagesFetched,
      leads: leads
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during extraction' });
  }
}
