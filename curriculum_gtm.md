# THE GTM ENGINEERING MASTERCLASS: CURRICULUM & TOOLBOX

Welcome to your structured GTM Engineering study guide. This document outlines the step-by-step roadmap and the exact tools you will master to land a remote GTM Engineer role in 2026.

---

## 🗺️ THE 6-MODULE STUDY ROADMAP

### 📦 Module 1: Client-Side Web Tracking & Analytics (Foundations)
* **Goal**: Understand how browsers load webpages, execute JavaScript, capture user interactions, and push structured data to analytics platforms.
* **Topics**:
  - The Browser DOM (Document Object Model) and Event Listeners.
  - Client-side Cookie policies (`document.cookie`), LocalStorage, and SessionStorage.
  - Structuring a standardize `window.dataLayer` for Google Tag Manager (GTM).
  - GTM Variables, Triggers, Custom HTML Tags, and Tag templates.
* **Key Interview Question**: *"Why is scraping CSS class selectors for triggers bad practice, and how does the dataLayer solve this?"*

---

### 🔀 Module 2: Serverless Webhooks & API Middleware (The Pipeline)
* **Goal**: Write scripts that capture webhooks from GTM in real time, extract parameters, and route them to external services.
* **Topics**:
  - HTTP Protocol basics: GET, POST, PUT, DELETE, Headers, and Status Codes.
  - Writing web endpoints in Python (using FastAPI or Flask) or Node.js.
  - Deploying serverless functions (Vercel, AWS Lambda, Google Cloud Functions).
  - Payload parsing, secure environment variables (`.env`), and rate-limit handling.
* **Key Interview Question**: *"How do you handle a sudden traffic spike of 10,000 signups per minute to your webhook API without losing data?"*

---

### 🧠 Module 3: Waterfall Enrichment & Scoring Systems (The Operations)
* **Goal**: Automate data lookups using external enrichment databases to profile companies and score accounts.
* **Topics**:
  - Waterfall Enrichment logic: sequencing API calls to fall back to secondary data providers if the first returns null.
  - Sourcing executive contacts (CEOs, Founders, Heads of Growth) based on company domain.
  - Email verification protocols: SMTP handshakes, MX records, and catch-all validation.
  - Writing custom scoring algorithms combining company data (headcount, funding) and product usage engagement.
* **Key Interview Question**: *"Explain how you would write a waterfall enrichment logic that queries Clearbit first, falls back to Apollo, and finally scrapes LinkedIn."*

---

### 📥 Module 4: CRM API Integration & Sales Ops Automation (The Destination)
* **Goal**: Programmatically write enriched lead data, pipeline deals, and owner assignments directly into Customer Relationship Management (CRM) tools.
* **Topics**:
  - REST APIs for CRMs: HubSpot REST API and Salesforce REST API.
  - Authentication methods: OAuth 2.0 vs. Private App Access Tokens.
  - Creating, updating, and associating Contacts, Companies, and Deals.
  - Round-robin lead routing algorithms and instant Slack webhook alerting.
* **Key Interview Question**: *"How do you associate a Contact object with a Company object in HubSpot via API in a single script?"*

---

### 💾 Module 5: Revenue Data Warehousing & SQL/dbt Modeling (The warehouse)
* **Goal**: Consolidate front-end activity logs and CRM data in a central warehouse to calculate multi-touch marketing attribution and retention.
* **Topics**:
  - Extract, Load, Transform (ELT) pipelines vs. Reverse ETL (syncing database fields back to HubSpot).
  - Writing advanced analytical SQL queries (window functions, CTEs).
  - Building dbt (Data Build Tool) models to structure raw event logs.
  - Calculating marketing attribution (First-touch, Last-touch, Linear) and customer lifetime value (LTV).
* **Key Interview Question**: *"Write a SQL query that calculates the First-Touch marketing channel for every user who converted to a paid subscriber last week."*

---

### 🛡️ Module 6: Privacy Infrastructure & Server-Side GTM (Advanced Ad Tech)
* **Goal**: Manage data tracking under modern privacy regulations (GDPR, CCPA, Apple iOS14+ App Tracking Transparency) and Safari's ITP (Intelligent Tracking Prevention).
* **Topics**:
  - Browser-side pixel limitations: why ad-blockers and Safari delete third-party cookies after 1–7 days.
  - Server-Side GTM (sGTM): Deploying a tracking server container on Google Cloud Run.
  - Mapping first-party subdomains (e.g., `track.domain.com`) to write secure HTTP-Only cookies.
  - Meta Conversions API (CAPI) and Google Ads Offline Conversion Imports (OCI).
* **Key Interview Question**: *"Explain Safari's Intelligent Tracking Prevention (ITP) cookie limitations and how hosting sGTM on a custom subdomain mitigates it."*

---

## 🛠️ THE GTM ENGINEERING TOOL DIRECTORY

Here are the tools you must have in your toolkit:

| Tool Category | Core Tool | What it does | When to use it |
| :--- | :--- | :--- | :--- |
| **Analytics & CDP** | **Google Tag Manager** | The standard web tracking tag management system. | Use to trigger scripts client-side when users interact with the UI. |
| **Analytics & CDP** | **Segment (Twilio)** | Customer Data Platform (CDP) that consolidates tracking events. | Use when you want to route browser events to multiple endpoints (Slack, HubSpot, Mixpanel) with a single setup. |
| **Data Enrichment** | **Clay.com** | Data operations platform that runs waterfall lookup scripts across 50+ providers. | Use to automate company size, LinkedIn URL, and email enrichment. |
| **Data Enrichment** | **Apollo.io API** | B2B lead database and email sourcing engine. | Use to find founders' contact details and corporate email addresses. |
| **CRM & Routing** | **HubSpot CRM** | Standard B2B sales database and sequence automation system. | Use as the source of truth for deal pipelines, contact cards, and sales sequences. |
| **APIs & Backend** | **Vercel / Cloud Run** | Serverless hosting platforms to deploy API endpoints. | Use to host your Python webhook scripts so they run live on the web. |
| **Data Warehouse** | **dbt (Data Build Tool)** | SQL transformation framework for analytics. | Use to join website visits (GTM) and CRM sales (HubSpot) in BigQuery to calculate ROI. |
