## 1. Introduction

The Voting App is a lightweight web application that allows distributed teams or groups to coordinate on meeting times (or any set of options) via an online poll. Users register with a username, create an event with multiple time-slot options, vote on up to N slots, and instantly see aggregated results in a bar chart. This tool eliminates back-and-forth emails or chat threads by centralizing availability polling and visualization.

## 2. Problem Statement

Scheduling meetings or gatherings across multiple participants often requires cumbersome email chains, manual availability spreadsheets, or fragmented chat messages. Existing tools can be overkill, require accounts, or lack real-time summary. We need a simple, no-friction web app that:
- Lets anyone register with just a username (no passwords).  
- Enables an organizer to propose multiple time slots.  
- Allows each participant to vote on up to a configurable number of slots.  
- Shows instant, aggregate results so the group can pick the best time.

## 3. System Architecture
````` 
Below is the high‐level architecture of the Voting App:  
Browser (HTML/CSS/JS)
│
│ HTTP requests (REST API)
▼
Express API Server (server.js)
│
│ SQLite queries (better-sqlite3)
▼
SQLite Database (db/voting.db)
````` 


- **Client**  
  - index.html  
  - assets/style/style.css  
  - assets/js/main.js (handles form flows, fetch calls, Chart.js)

- **Server**  
  - server.js (Express routes for /api/register, /api/events, /api/vote, /api/results)  
  - db/schema.sql (table definitions for users, events, slots, votes)

- **Data Flow**  
  1. Browser loads static files.  
  2. User actions send JSON to Express endpoints.  
  3. Express reads/writes SQLite and returns JSON.  
  4. Front-end updates UI or redraws Chart.js bar chart.
