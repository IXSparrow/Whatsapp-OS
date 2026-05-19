#!/usr/bin/env python3
"""
Lead Generation Workflow - Terminal Runner
Runs the n8n workflow logic locally to generate leads from Google Maps
"""

import json
import requests
from datetime import datetime
import csv
import re
import random
import sys
from collections import Counter

import os

# Configuration
SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "c4aa5172ff0b6cfdcaa443a5c4c143261db62e166abaa2c040852e19e005335e")
SERPAPI_URL = "https://serpapi.com/search"

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

class LeadGenerationWorkflow:
    def __init__(self):
        self.businesses = []
        self.duplicates_removed = 0
        self.low_quality_filtered = 0
        self.randomizer = random.SystemRandom()
        self.current_business_type = ""
        self.current_location = ""
        
    def run(self, business_type="dentists", location="New York, NY", max_results=60):
        """Execute the full workflow"""
        self.businesses = []
        self.duplicates_removed = 0
        self.low_quality_filtered = 0
        self.current_business_type = business_type
        self.current_location = location

        print(f"\n{'='*70}")
        print(f"🚀 LEAD GENERATION WORKFLOW - PRODUCTION RUN")
        print(f"{'='*70}\n")
        
        # Step 1: Generate Search Queries
        print("📝 Step 1: Generating Search Queries...")
        queries = self.generate_queries(business_type, location, max_results)
        print(f"   ✅ Generated {len(queries)} search queries:")
        for i, q in enumerate(queries, 1):
            print(f"      {i}. {q}")
        
        # Step 2: Search Google Maps
        print(f"\n🔍 Step 2: Searching Google Maps...")
        results = []
        per_query_limit = max(1, max_results // len(queries))
        for i, query in enumerate(queries, 1):
            print(f"   ⏳ Query {i}/{len(queries)}: '{query}'")
            items = self.search_google_maps(query, per_query_limit)
            results.extend(items)
            print(f"      ✅ Found {len(items)} results")
        
        print(f"   📊 Total initial results: {len(results)}")
        
        # Step 3: Extract Business Data
        print(f"\n📋 Step 3: Extracting Business Data...")
        self.extract_business_data(results)
        print(f"   ✅ Extracted {len(self.businesses)} businesses")
        
        # Step 4: Remove Duplicates
        print(f"\n🔄 Step 4: Removing Duplicates...")
        self.remove_duplicates()
        print(f"   ✅ Removed {self.duplicates_removed} duplicates")
        print(f"   📊 Remaining: {len(self.businesses)} unique businesses")
        
        # Step 5: Clean and Normalize
        print(f"\n🧹 Step 5: Cleaning & Normalizing Data...")
        self.clean_and_normalize()
        print(f"   ✅ Data normalized and formatted")
        
        # Step 6: Filter Quality Leads
        print(f"\n⭐ Step 6: Filtering Quality Leads...")
        self.filter_quality_leads()
        print(f"   ✅ Filtered {self.low_quality_filtered} low-quality leads")
        print(f"   📊 Final leads: {len(self.businesses)}")
        
        # Step 7: Export to CSV
        print(f"\n💾 Step 7: Exporting to CSV...")
        csv_file = self.export_to_csv()
        print(f"   ✅ Exported to: {csv_file}")
        
        # Summary
        print(f"\n{'='*70}")
        print(f"✨ WORKFLOW COMPLETED SUCCESSFULLY!")
        print(f"{'='*70}")
        print(f"📊 Final Statistics:")
        print(f"   • Business Type: {business_type}")
        print(f"   • Location: {location}")
        print(f"   • Initial Results: {len(results) + self.duplicates_removed + self.low_quality_filtered}")
        print(f"   • Duplicates Removed: {self.duplicates_removed}")
        print(f"   • Low-Quality Filtered: {self.low_quality_filtered}")
        print(f"   • Quality Leads Generated: {len(self.businesses)}")
        print(f"   • CSV File: {csv_file}")
        print(f"\n💡 Output Location: {csv_file}")
        print(f"\n🎉 Ready for use!\n")
        
        return csv_file
    
    def generate_queries(self, business_type, location, max_results=60):
        """Step 1: Generate search query variations"""
        query_pool = [
            f"{business_type} in {location}",
            f"best {business_type} near {location}",
            f"{business_type} services {location}",
            f"top rated {business_type} {location}",
            f"{business_type} companies in {location}",
            f"{business_type} providers {location}",
            f"local {business_type} {location}",
            f"affordable {business_type} {location}",
            f"highly rated {business_type} near {location}",
            f"{business_type} open now {location}",
            f"{business_type} with reviews {location}",
            f"{business_type} nearby {location}"
        ]

        self.randomizer.shuffle(query_pool)
        query_count = max(3, min(6, (max_results + 9) // 10, len(query_pool)))
        return query_pool[:query_count]
    
    def search_google_maps(self, query, limit=20):
        """Step 2: Search Google Maps via SerpAPI"""
        try:
            params = {
                "engine": "google_maps",
                "q": query,
                "type": "search",
                "num": min(limit, 20),
                "start": self.randomizer.choice([0, 20, 40]),
                "no_cache": "true",
                "api_key": SERPAPI_KEY
            }
            
            response = requests.get(SERPAPI_URL, params=params, timeout=10)
            
            if response.status_code != 200:
                print(f"      ⚠️  API Error: {response.status_code}")
                return []
            
            data = response.json()
            return data.get("local_results", [])
        
        except Exception as e:
            print(f"      ❌ Error: {str(e)}")
            return []
    
    def extract_business_data(self, results):
        """Step 3: Extract and structure business information"""
        for business in results:
            # Extract address components
            address = business.get("address", "")
            address_parts = [s.strip() for s in address.split(",")]
            city = address_parts[-2] if len(address_parts) > 1 else ""
            state_zip = address_parts[-1] if address_parts else ""
            state_parts = state_zip.split()
            state = state_parts[0] if state_parts else ""
            postal_code = " ".join(state_parts[1:]) if len(state_parts) > 1 else ""
            
            # Extract operating hours
            opening_hours = ""
            if business.get("operating_hours"):
                hours_list = []
                for day, hours in business["operating_hours"].items():
                    hours_list.append(f"{day.capitalize()}: {hours}")
                opening_hours = "; ".join(hours_list)
            elif business.get("hours"):
                opening_hours = business.get("hours", "")
            
            # Store business data
            self.businesses.append({
                "businessName": business.get("title", ""),
                "category": business.get("type", ""),
                "description": business.get("description", ""),
                "address": address,
                "city": city,
                "state": state,
                "postalCode": postal_code,
                "country": "US",
                "latitude": str(business.get("gps_coordinates", {}).get("latitude", "")),
                "longitude": str(business.get("gps_coordinates", {}).get("longitude", "")),
                "phone": business.get("phone", ""),
                "email": "",
                "website": business.get("website", ""),
                "googleMapsUrl": f"https://www.google.com/maps/place/?q=place_id:{business.get('place_id', '')}" if business.get("place_id") else "",
                "rating": str(business.get("rating", "")),
                "reviewCount": business.get("review_count", 0) if business.get("review_count") else business.get("reviews", 0),
                "priceRange": business.get("price", ""),
                "openingHours": opening_hours,
                "socialLinks": ""
            })
    
    def remove_duplicates(self):
        """Step 4: Remove duplicate businesses"""
        seen = set()
        unique_businesses = []
        
        for business in self.businesses:
            key = (
                business["businessName"].lower().strip(),
                business["phone"].lower().strip(),
                business["address"].lower().strip()
            )
            
            if key not in seen:
                seen.add(key)
                unique_businesses.append(business)
            else:
                self.duplicates_removed += 1
        
        self.businesses = unique_businesses
    
    def clean_and_normalize(self):
        """Step 5: Clean and normalize data"""
        for business in self.businesses:
            # Trim whitespace
            business["businessName"] = business["businessName"].strip()
            business["category"] = business["category"].strip()
            business["description"] = business["description"].strip()
            business["address"] = business["address"].strip()
            business["city"] = business["city"].strip()
            
            # Format phone (luxurious international format if possible)
            phone = re.sub(r"[^0-9]", "", business["phone"])
            if len(phone) == 10:
                business["phone"] = f"+1 ({phone[:3]}) {phone[3:6]}-{phone[6:]}"
            elif len(phone) > 10:
                business["phone"] = f"+{phone}"
            
            # Normalize email
            business["email"] = business["email"].strip().lower()
            
            # Normalize state and country
            business["state"] = business["state"].strip().upper()
            business["country"] = business["country"].strip().upper()
            
            # Normalize website
            business["website"] = business["website"].strip()
            business["googleMapsUrl"] = business["googleMapsUrl"].strip()

            # --- CALCULATE LUXURY LEAD SCORE (0-100) ---
            score = 0
            try:
                rating_str = str(business.get("rating", "0") or "0").strip()
                rating = float(rating_str) if rating_str and rating_str != "None" else 0.0
            except:
                rating = 0.0
                
            try:
                reviews_str = str(business.get("reviewCount", "0") or "0").strip()
                reviews = int(reviews_str) if reviews_str and reviews_str != "None" else 0
            except:
                reviews = 0
            
            # Rating contribution (max 40)
            score += min(40, rating * 8)
            
            # Review volume contribution (max 30)
            score += min(30, (reviews / 50) * 10)
            
            # Digital presence (max 30)
            if business.get("website"): score += 20
            if business.get("email"): score += 10
            
            business["leadScore"] = int(score)
            
            # Opportunity Level
            if score >= 80:
                business["opportunity"] = "💎 DIAMOND"
            elif score >= 60:
                business["opportunity"] = "🥇 GOLD"
            elif score >= 40:
                business["opportunity"] = "🥈 SILVER"
            else:
                business["opportunity"] = "🥉 BRONZE"
    
    def filter_quality_leads(self):
        """Step 6: Filter low-quality leads"""
        quality_leads = []
        
        for business in self.businesses:
            # Keep only if has business name AND address
            if business["businessName"].strip() and business["address"].strip():
                quality_leads.append(business)
            else:
                self.low_quality_filtered += 1
        
        self.businesses = quality_leads

        # Keep exports from repeated runs from preserving Google Maps' ranking order.
        self.randomizer.shuffle(self.businesses)
    
    def export_to_csv(self):
        """Step 7: Export leads to CSV file"""
        business_type = self.sanitize_filename_part(self.current_business_type)
        country, state = self.get_export_location_parts()
        import time
        timestamp = int(time.time())
        filename = f"leads_{business_type.upper().replace(' ', '_')}_{self.current_location.upper().replace(' ', '_').replace(',', '')}_{timestamp}.csv"
        filepath = f"{filename}"
        
        if not self.businesses:
            print(f"      ⚠️  No leads to export")
            return filename
        
        # CSV headers (21 fields now)
        headers = [
            "businessName", "category", "description", "address", "city", "state",
            "postalCode", "country", "latitude", "longitude", "phone", "email",
            "website", "rating", "reviewCount", "googleMapsUrl", "search_query",
            "leadScore", "opportunity"
        ]
        
        try:
            with open(filepath, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=headers)
                writer.writeheader()
                for business in self.businesses:
                    # Ensure all headers exist in the business dict
                    row = {h: business.get(h, "") for h in headers}
                    writer.writerow(row)
            
            return filename
        except Exception as e:
            print(f"      ❌ Error writing CSV: {str(e)}")
            return filename

    def get_export_location_parts(self):
        """Build country/state tokens for the CSV filename."""
        countries = [
            self.sanitize_filename_part(business.get("country", ""))
            for business in self.businesses
            if business.get("country", "").strip()
        ]
        states = [
            self.sanitize_filename_part(business.get("state", ""))
            for business in self.businesses
            if business.get("state", "").strip()
        ]

        country = Counter(countries).most_common(1)[0][0] if countries else "UNKNOWN_COUNTRY"
        state = Counter(states).most_common(1)[0][0] if states else "UNKNOWN_STATE"
        return country, state

    def sanitize_filename_part(self, value):
        """Convert free-form text into a filename-safe token."""
        cleaned = re.sub(r"[^A-Za-z0-9]+", "_", value.strip().upper())
        cleaned = re.sub(r"_+", "_", cleaned).strip("_")
        return cleaned or "UNKNOWN"


import argparse

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Lead Generation from Google Maps')
    parser.add_argument('--business', type=str, help='Business Type (e.g. dentists)')
    parser.add_argument('--location', type=str, help='Location (e.g. New York, NY)')
    parser.add_argument('--limit', type=int, help='Max Results (default: 60)')
    
    args = parser.parse_args()

    print("\n" + "="*70)
    print("💼 LEAD GENERATION FROM GOOGLE MAPS")
    print("="*70)
    
    if args.business and args.location:
        business_type = args.business
        location = args.location
        max_results = args.limit or 60
    else:
        print("\nEnter workflow parameters (press Enter for defaults):\n")
        business_type = input("Business Type (default: dentists): ").strip() or "dentists"
        location = input("Location (default: New York, NY): ").strip() or "New York, NY"
        try:
            max_results = input("Max Results (default: 60): ").strip() or "60"
            max_results = int(max_results)
        except:
            max_results = 60
    
    # Run workflow
    workflow = LeadGenerationWorkflow()
    csv_file = workflow.run(business_type, location, max_results)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Workflow interrupted by user.\n")
    except Exception as e:
        print(f"\n\n❌ Error: {str(e)}\n")
