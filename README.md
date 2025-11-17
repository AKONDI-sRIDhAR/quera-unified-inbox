⚡ Quera: Unified Query Management System
Quera is a modern, AI-driven platform for managing customer queries from multiple channels in a single unified inbox. It leverages a serverless function and the Gemini API for intelligent message analysis, automatically applying priority and category tags.
live: https://quera-unified-inbox.vercel.app/
✨ Features
Unified Inbox: Real-time display of all new and active customer queries.

AI-Powered Triage: Automatically tags incoming queries with a category (e.g., question, complaint, request) and assigns a priority (1-5, with 5 being urgent) using a Supabase Edge Function powered by the Gemini API.

Real-time Updates: Uses Supabase Realtime to automatically update the inbox, quick stats, and assignment lists across all agent dashboards.

Agent Workflow: Dedicated sections for viewing and managing queries assigned to the logged-in agent. Agents can mark queries as Resolved.

Quick Stats: Displays at-a-glance metrics like Total Queries, Open Queries, Avg Response Time (simulated), and Top Category.

Modern UI/UX: Features a sleek, responsive dashboard with dynamic theming and custom visual effects using Framer Motion
