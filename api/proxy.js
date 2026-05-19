// Vercel Serverless Function to dynamically proxy API requests to the persistent backend
export default async function handler(req, res) {
  // Read target backend URL from environment variables
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  // Clean up host and other headers that might conflict
  const headers = { ...req.headers };
  delete headers.host;
  delete headers['content-length']; // Let fetch compute this automatically
  
  // Construct destination URL (keeping the /api/ prefix if it's there)
  const destinationUrl = `${backendUrl.replace(/\/$/, '')}${req.url}`;

  try {
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // For POST/PUT/DELETE requests, we need to forward the body
      if (req.body) {
        fetchOptions.body = typeof req.body === 'object' ? JSON.stringify(req.body) : req.body;
      }
    }

    const response = await fetch(destinationUrl, fetchOptions);
    const contentType = response.headers.get('content-type');
    
    // Set status and copy headers
    res.status(response.status);
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      res.json(json);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error) {
    console.error('Vercel API Proxy Error:', error);
    res.status(502).json({ 
      success: false, 
      error: 'Vercel proxy failed to reach the persistent backend.',
      details: error.message,
      target: destinationUrl
    });
  }
}
