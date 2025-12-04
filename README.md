# WebCrawl

Lightweight full‑stack project that crawls ISP websites, extracts internet plan data, and provides search, suggestions, and basic analytics.

## Features
- Selenium-based web crawler to extract plan details
- CSV-backed storage with in-memory inverted index for fast full-text search
- Trie-based word completion and simple spell checker
- Endpoints for search, suggestions, spellcheck, crawl control, frequency analysis, history, and plans
- React + TypeScript frontend (Vite) for UI and controls

## Repository layout
- backend/src — Java HTTP server and services (BackendServer.java, SearchEngine.java, WebCrawlerService.java, SpellChecker.java, WordCompletion.java)
- frontend — React (TypeScript) app (components, services, Vite config)
- Data/ or root — provider CSV files (bell_plans.csv, rogers_plans.csv, fido_plans.csv, etc.)
- .classpath / .project — Eclipse settings

## Prerequisites
- Java 18+
- Node.js 18+
- Chrome/Chromium (for Selenium)
- Selenium jars on classpath (if running from CLI)

## Quick start (Windows)
1. Clone repo
   git clone <repo-url>
   cd WebCrawl

2. Backend (IDE recommended)
   - Import `backend` into Eclipse/IntelliJ and run `BackendServer.main`.
   - Or compile/run from CLI (adjust classpath to Selenium jars):
     ```
     javac -cp "lib/*;backend/src" -d backend/bin backend/src/*.java
     java -cp "lib/*;backend/bin" BackendServer
     ```
   - Server listens on: http://localhost:8080

3. Frontend
   ```
   cd frontend
   npm install
   npm run dev
   ```
   - Frontend default: http://localhost:5173

## API (examples)
- GET /api/search?query=term
- GET /api/suggest?prefix=pre
- GET /api/spellcheck?word=wrng
- POST /api/crawl?url=https://example.com
- GET /api/frequency
- GET /api/history
- GET /api/plans

Responses are JSON.

## Data files
CSV schema: Provider,PlanName,Price,Speed,Data,Features,Category,URL  
Place provider CSVs in repository root or update BackendServer.loadData paths.

## Notes
- This project is for educational/demo purposes. Respect target sites' robots.txt and terms before crawling.
- Large CSVs may increase startup time due to indexing.
- Consider migrating to a database for production use.

## Contributors
Sahitya Nagar, Dev Kansara, Jaimil Kohtari, Sarhan Kapadiya

## License
Educational / demo — no warranty. Review before production use.# ConnectHub
A full-stack web application that crawls internet service provider websites to extract and compare internet plans across multiple carriers in Canada and North America.
