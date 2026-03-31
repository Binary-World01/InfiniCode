# 🚀 InfiniCode

### **A Production-Grade, AI-Powered Cloud IDE & Collaborative Learning Ecosystem**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Types-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🎯 Project Overview

**InfiniCode** is a full-stack Software-as-a-Service (SaaS) platform designed for the modern developer. It merges the capabilities of a **Professional Cloud IDE** (like GitHub Codespaces), a **Real-Time Collaborative Editor**, an **AI-Powered Mentor** (supporting multiple LLMs), and a **Structured Learning Center** into one elite workspace.

Whether you are building complex applications, learning a new tech stack from industry experts, or preparing for high-stakes technical interviews, InfiniCode provides the tools to excel.

---

## ✨ Key Features

### 💻 Professional Cloud IDE
*   **Monaco Editor Engine:** The same engine that powers VS Code, running directly in your browser.
*   **Multi-File Management:** Create, rename, delete, and organize files within a robust project tree.
*   **Sandboxed Execution:** Run code in **7+ languages** (Python, JS, Java, C++, Go, etc.) through our custom Java-based execution engine.
*   **Real-Time Collaboration:** Code with teammates live via WebSocket-enabled sync.
*   **Extension Marketplace:** Install essential developer tools like Prettier, ESLint, and TailWind CSS IntelliSense.

### 🤖 Hybrid AI Intelligence
*   **AI Waterfall Router:** A self-healing routing system that switches between **Gemini 2.0 Flash**, **Groq (Llama 3.3 70B)**, and **DeepSeek R1** for zero-downtime assistance.
*   **11 Specialized Modes:** From expert code reviews and bug fixing to security auditing and interview grading.
*   **Context-Aware:** The AI understands your entire project file structure and current code buffer.

### 🎓 Learning & Interview Ecosystem
*   **6-Track Curriculum:** 57+ lessons covering Frontend, AI/ML, DevOps, and more.
*   **Expert Content:** Every lesson features verified high-authority video lectures and deep-dive written material.
*   **Mock Interview Portal:** Practice with AI-proctored challenges, complete with auto-grading and complexity analysis.
*   **Activity Tracking:** A GitHub-style contribution heatmap to monitor your coding consistency.

---

## 🏗️ Technical Architecture

InfiniCode utilizes a **Dual-Backend Architecture** for maximum performance and security:

1.  **Frontend (Next.js 14):** Handles the high-fidelity UI, Framer Motion animations, and real-time state management.
2.  **BaaS (Supabase):** Manages Auth, PostgreSQL database, and Real-Time broadcast channels with enterprise-grade **Row Level Security (RLS)**.
3.  **Custom API (Spring Boot 3):** Handles heavy compute tasks — sandboxed code execution, AI orchestration, and complex JWT validation.

### AI Routing Waterfall:
```
User Request ➜ [1] Gemini 2.0 (Fastest) 
                     │ (if fails)
                     ▼
                [2] Groq Llama 3.3 (High Performance)
                     │ (if fails)
                     ▼
                [3] OpenRouter DeepSeek R1 (Reasoning)
```

---

## 🚀 Tech Stack

| Category | Technology |
| :-- | :-- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI, Monaco Editor |
| **Backend** | Java Spring Boot 3, Spring Security, WebSocket (STOMP) |
| **Database/Cloud** | Supabase (PostgreSQL), Supabase Auth, Realtime, RLS |
| **AI Models** | Google Gemini, Meta Llama (via Groq), DeepSeek R1 (via OpenRouter) |

---

## 🔑 Required Configuration

To run InfiniCode locally, you must set up the following environment variables.

### 🌐 Frontend Configuration (`infinicode-ui/.env.local`)
Create a `.env.local` file in the `infinicode-ui` directory:

```env
# Supabase (Auth & Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Keys (Direct or fallback)
GEMINI_API_KEY=your_google_gemini_key
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_key
GITHUB_MODELS_KEY=your_github_pat_token
```

### ⚙️ Backend Configuration (`backend/src/main/resources/application.properties`)
The backend can read keys from environment variables or be edited directly in the properties file:

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Primary AI provider for code analysis |
| `GROQ_API_KEY` | Secondary high-speed AI provider |
| `OPENROUTER_API_KEY` | DeepSeek fallback provider |
| `JWT_SECRET` | Secret key for local JWT validation (default provided) |

---

## 🛠️ Getting Started

### Prerequisites
*   Node.js 18+
*   Java JDK 17+
*   Supabase Account (for DB & Auth)

### Setup Instructions

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Binary-World01/InfiniCode.git
    cd InfiniCode
    ```

2.  **Frontend Setup**
    ```bash
    cd infinicode-ui
    npm install
    cp .env.example .env.local  # Add your Supabase & API keys
    npm run dev
    ```

3.  **Backend Setup**
    ```bash
    cd ../backend
    # Update src/main/resources/application.properties with your API keys
    ./mvnw spring-boot:run
    ```

---

## 📂 Project Structure

*   `backend/`: Java Spring Boot source code for AI routing and code execution.
*   `infinicode-ui/`: Next.js frontend application.
*   `fix_system_rls.sql`: Database schema and RLS policies for Supabase.

---

## 🛡️ Security

*   **JWT Bridge:** Secure token handoff between Supabase and Spring Boot.
*   **RLS Policies:** Database-level security ensuring users only access their own data.
*   **Sandboxing:** Code execution is isolated to prevent system interference.

---

*Built with passion by the InfiniCode Team. Inspired by the need for a truly unified developer ecosystem.*