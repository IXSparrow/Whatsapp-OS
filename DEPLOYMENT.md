# n8n Lead Generation Workflow - Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker Desktop installed and running

### Steps

1. **Start n8n with Docker:**
   ```powershell
   docker-compose up -d
   ```

2. **Access n8n:**
   - Open browser: http://localhost:5678
   - Set up admin credentials on first login

3. **Import the Workflow:**
   - Click **+** → **Import from file**
   - Select `lead-generation-workflow.json`
   - Click **Import**

4. **Configure Credentials:**
   - Go to **Credentials**
   - Add **SerpAPI Key** (for Google Maps search)
     - Get free API key: https://serpapi.com/
     - Create credential: Type "HTTP Query Auth", add `api_key` parameter

5. **Update Workflow Parameters:**
   - Edit the "Set Input Parameters" node
   - Replace placeholders:
     - `businessType`: e.g., "dentists", "plumbers"
     - `location`: e.g., "New York, NY"
     - `maxResults`: number of results to fetch

6. **Activate & Run:**
   - Click **Save**
   - Toggle **Active** switch to ON
   - Click **Execute Workflow** or set schedule

## Output
- CSV file exported with leads
- Data saved to n8n Data Table
- Fields: Business name, phone, address, rating, hours, website, etc.

## Stop n8n
```powershell
docker-compose down
```

## Troubleshooting
- **Port already in use:** Change port in docker-compose.yml (5678:xxxx)
- **Workflow fails:** Check SerpAPI credentials and API quota
- **Docker not found:** Install Docker Desktop from docker.com
