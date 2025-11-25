# 🌊 TethysMind - The Ocean of Unlimited Growth

![TethysMind Banner](https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=2600&auto=format&fit=crop)

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Tech](https://img.shields.io/badge/stack-React%20%7C%20Supabase%20%7C%20Gemini-blueviolet)]()

**TethysMind** is a next-generation educational platform that gamifies the university admission process. Inspired by the ancient Tethys Ocean, it provides a boundless environment for student growth, tracking achievements, and offering personalized AI mentorship using Google's Gemini 2.5 Flash model.

---

## 🚀 Key Features

### 🎓 For Students

*   **❄️ Achievement Iceberg**
    *   A dynamic, physics-based visualization of a student's progress.
    *   The more TethysPoints you earn, the higher your iceberg rises out of the water.
    *   Includes animated weather effects, day/night cycles, and floating elements using `framer-motion`.

*   **🤖 AI Mentor (Gemini 2.5 Flash)**
    *   Real-time chat interface for career guidance and university selection.
    *   Analyzes the student's portfolio to calculate admission probabilities for top global universities.
    *   Provides personalized study plans and book recommendations.

*   **📚 Smart Library**
    *   Upload PDF textbooks and research papers.
    *   **AI Insights:** Automatically generates summaries, key takeaways, and quizzes from uploaded documents.
    *   Integrated note-taking system linked to specific book pages.

*   **🏆 Smart Portfolio**
    *   Track GPA, IELTS/SAT scores, Olympiad results, and certificates.
    *   Automatic verification of certificates using AI Vision capabilities.
    *   Calculates a "Portfolio Strength" score to benchmark against other applicants.

*   **🛍️ Educational Marketplace**
    *   Buy and sell courses, study guides, and books.
    *   Creator Dashboard for teachers and top students to monetize their knowledge.
    *   Supports filtering by category, price, and popularity.

*   **🌍 Skills Map**
    *   Interactive visualization of hard and soft skills.
    *   Tracks progress in specific domains (IT, Science, Arts, Languages).

### 👨‍👩‍👧 For Parents

*   **Parental Dashboard:** Monitor child's academic progress without being intrusive.
*   **Growth Analytics:** View monthly trends in GPA and TethysPoints accumulation.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework:** [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
*   **Language:** TypeScript
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI based)
*   **Animations:** [Motion](https://motion.dev/) (formerly Framer Motion)
*   **State Management:** Zustand (for Global State & Localization)
*   **Routing:** React Router DOM
*   **Charts:** Recharts

### Backend & Infrastructure
*   **Platform:** [Supabase](https://supabase.com/) (Firebase alternative)
*   **Database:** PostgreSQL
*   **Authentication:** Supabase Auth (Email/Password, Social Logins)
*   **Storage:** Supabase Storage (for User Avatars, PDF Books, Diplomas)
*   **Edge Functions:** Deno (TypeScript) for server-side logic and AI proxying.

### Artificial Intelligence
*   **Model:** Google Gemini 2.5 Flash
*   **Integration:** Direct API calls via secure Edge Functions (`/supabase/functions/server`)
*   **Capabilities:** Text generation, Vision (Certificate verification), Document analysis.

---

## 📂 Project Structure

```bash
/
├── src/
│   ├── components/     # Reusable UI components (Iceberg, PDFReader, etc.)
│   ├── components/ui/  # Shadcn UI primitive components
│   ├── contexts/       # React Context Providers (Auth, Theme)
│   ├── pages/          # Main application routes (Home, Portfolio, Marketplace...)
│   ├── styles/         # Global CSS and Tailwind directives
│   └── utils/          # Helper functions, API clients, i18n configuration
├── supabase/
│   ├── functions/      # Deno Edge Functions (Backend API)
│   │   └── server/     # Main Hono server entry point
│   └── migrations/     # SQL scripts for database schema
└── public/             # Static assets
```

---

## ⚡ Getting Started

### Prerequisites
*   Node.js 18.0 or later
*   npm or yarn
*   A Supabase project

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/tethysmind.git
    cd tethysmind
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory (optional for local dev if hardcoded, but recommended):
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Start Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Architecture

*   **Row Level Security (RLS):** All database tables are protected by PostgreSQL RLS policies. Users can only access their own data or public data (like Marketplace items).
*   **Edge Functions:** Sensitive logic (AI calls, Payment processing) runs on the server-side to protect API keys.
*   **Theme Persistence:** Theme preference (Light/Dark) is synced between LocalStorage and the Database to ensure a consistent experience across devices.

---

## 🤝 Contributing

We welcome contributions to TethysMind!

1.  **Fork** the project.
2.  Create your **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

### 🌟 Acknowledgements

*   [Unsplash](https://unsplash.com) for the beautiful ocean imagery.
*   [Lucide React](https://lucide.dev) for the icon set.
*   The open-source community for the amazing tools used in this project.
