# 🇮🇳 CitizenHub: Civic Mobilization & Volunteer Action Platform

CitizenHub is a full-stack civic action and community mobilization platform designed to transform passive digital petition signers into active, on-ground changemakers. It bridges grassroots organizers, skilled volunteers, and civic administrators through intelligent task matching, time-bound accountability timers, verified proof of work, and frictionless Indian Rupee (INR) community funding.

---

## 🌟 Vision & Core Problems Solved

Traditional online petition platforms often suffer from the **"clicktivism" gap**: thousands of people sign a petition, but very few are mobilized into real-world action. CitizenHub solves this by providing:

1. **From Signing to Action**: Every campaign can feature bite-sized, skill-matched volunteer tasks alongside petitions, turning signers into active contributors.
2. **Accountability & Anti-Hoarding Timers**: Claimed tasks feature an automatic 48-hour countdown timer. If proof of work is not submitted before expiration, the task automatically returns to the open pool for other volunteers.
3. **Multimodal Proof Verification**: Volunteers submit photos, URLs, and field notes. Campaigners review submissions to grant reputation badges and reliability points (+10 pts).
4. **Community Movement Moderation**: Citizens can initiate their own civic movements, which are routed to an admin approval queue to ensure trust and safety before public publication.
5. **Frictionless INR Giving**: Native single-currency (₹ INR) contributions via Razorpay (UPI, Google Pay, NetBanking, Cards) with zero tax-computation overhead for grassroots movements.
6. **AI & ML Intelligence**: Personalized task recommendations powered by content-based TF-IDF cosine similarity, paired with predictive campaign success modeling.

---

## 🚀 Key Features

### 🧑‍💼 For Volunteers / Citizens
- **Skill-Based Onboarding**: 3-step wizard to register causes, location (City & State), and skills (Graphic Design, Legal/RTI, Social Media, Field Organizing, Content Writing, Tech, Video Editing).
- **Personalized Action Feed**: Recommended tasks dynamically scored and ranked according to skills, geographic proximity, urgency, and reliability score.
- **Task Claiming & 48h Countdown**: Claim tasks with live countdown clocks, ensuring active tasks are delivered promptly.
- **Proof of Work Submission**: Upload photographic evidence (stored locally or via Cloudinary), URLs, and execution summaries.
- **My Impact Hub**: Dedicated dashboard showcasing completed actions, reliability score, earned badges, and signed petitions.
- **Start a Movement**: Propose grassroots civic campaigns that transition through administrator vetting before going live.

### 📢 For Campaign Organizers
- **Modular Campaign Builder**: Create rich campaigns with customizable blocks:
  - 📝 Petition signing targets and milestones.
  - 🤝 Volunteer task requirements with custom deadlines and skill tags.
  - 💰 Financial donation goals in ₹ INR.
  - 📍 On-ground events and location coordinates.
- **Volunteer Directory**: Filter and discover registered volunteers by specific skills, cities, availability, and reliability scores.
- **Task Review Queue**: Inspect submitted proof of work, approve completed assignments to award reliability points, or request revisions with direct feedback.
- **Predictive Campaign Analytics**: Machine learning insights evaluating campaign feasibility, target volunteer ratios, and success probability.

### 🛡️ For Administrators
- **Campaigner Verification**: Review organizer credentials and approve or reject campaign creator applications to prevent platform spam.
- **Movement Approval Queue**: Inspect community-initiated campaigns, verify their legitimacy, and publish them to the public directory.
- **Platform Analytics & Telemetry**: Monitor real-time platform statistics, donation totals, volunteer density across Indian cities, and task completion rates.

---

## 🤖 Smart Matching & Machine Learning

CitizenHub incorporates two distinct intelligence layers:

### 1. Dynamic Task Recommender Engine (`server/services/taskRecommender.js`)
An in-engine content-based recommendation system that scores open tasks for each volunteer:
- **TF-IDF & Cosine Similarity**: Analyzes task titles, descriptions, and cause categories against volunteer interests.
- **Exact & Partial Skill Matching**: Weighs mandatory and preferred skills.
- **Geographic Proximity**: Prioritizes local on-ground tasks matching the volunteer's city while keeping remote tasks accessible.
- **Urgency & Reliability Weights**: Factors in task deadlines and the volunteer's track record.
- **Transparent Justifications**: Emits human-readable match explanations (e.g., *"Matches your Graphic Design skill"*, *"Can be done remotely"*, *"Urgent campaign in your city"*).

### 2. Campaign Success Prediction Model (`ml/campaign_success_model.py`)
A predictive Scikit-Learn pipeline assessing campaign parameters:
- **Features**: Category, city/state, signature target, volunteer quota, fundraising goal, description depth, and organizer reliability history.
- **Architecture**: `ColumnTransformer` (StandardScaler for numerics + OneHotEncoder for categoricals) with a Logistic Regression classifier.
- **Utility**: Helps organizers calibrate realistic goals and optimize volunteer mobilization targets prior to launch.

---

## 🛠️ Tech Stack & Architecture

| Tier | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Fast, responsive Single Page Application (SPA) |
| **Styling** | Tailwind CSS | Modern utility-first CSS design system |
| **Icons & Charts** | Lucide React, Recharts | Data visualizations (city density, skill breakdown, mobilization growth) |
| **Routing & HTTP** | React Router 6, Axios | Declarative client routing with automatic JWT refresh interceptor |
| **Backend** | Node.js, Express.js | Scalable REST API with modular routing and background cron routines |
| **Database** | MongoDB & Mongoose ODM | Document-oriented schemas for Users, Campaigns, Tasks, and Donations |
| **Authentication** | Dual-Token JWT & bcryptjs | 15-minute Access Tokens + 7-day Refresh Tokens with secure password hashing |
| **Payments** | Razorpay INR Gateway | Direct Indian Rupee contributions with simulated fallback mode for demos |
| **File Storage** | Multer & Cloudinary | Multi-image task proof uploads supporting local storage and Cloudinary |
| **Machine Learning**| Python 3, Scikit-Learn, Joblib | Campaign success classifier and data preprocessing pipeline |

---

## 📁 Project Structure

```text
CitizenHub/
├── client/                     # Frontend React (Vite) Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, TaskCard, etc.)
│   │   ├── context/            # Auth and state management contexts
│   │   ├── pages/              # Application views (Feed, Builder, Impact, Admin, etc.)
│   │   ├── services/           # Axios API service instances and interceptors
│   │   ├── App.jsx             # Main routing configuration
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js          # Vite config with /api and /uploads proxy
│
├── server/                     # Backend Node.js / Express API
│   ├── config/                 # Database connection and DNS configurations
│   ├── middleware/             # Auth guards and Multer file upload handlers
│   ├── models/                 # Mongoose schemas (User, Campaign, Task, Donation)
│   ├── routes/                 # Express REST route endpoints
│   ├── services/               # TF-IDF recommender & background expiration workers
│   ├── uploads/                # Local uploaded proof images
│   ├── .env.example            # Backend environment template
│   ├── seed.js                 # Database seeder script
│   ├── server.js               # Server entry point
│   └── package.json
│
├── ml/                         # Machine Learning Modules
│   ├── campaign_success_model.py       # Scikit-Learn training & prediction script
│   ├── campaign_success_model.joblib   # Trained pipeline artifact
│   ├── campaign_success_training.csv   # Training dataset
│   └── requirements.txt                # Python dependencies
│
└── README.md                   # Project documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/citizenhub`) or a MongoDB Atlas URI
- **Python** *(Optional, for ML model training)*: Python 3.9+ with `pip`

---

### 1. Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   *Verify or adjust `MONGO_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` in `.env` as needed.*

4. Seed the database with sample campaigns, volunteers, tasks, and admin users:
   ```bash
   npm run seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`.

---

### 2. Frontend Setup

1. In a new terminal, navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

---

### 3. Machine Learning Setup (Optional)

If you wish to retrain or inspect the campaign success prediction model:

1. Navigate to the `ml` directory:
   ```bash
   cd ml
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Train or evaluate the model:
   ```bash
   python campaign_success_model.py --train
   ```

---

## 🔑 Demo Accounts & Quick Login

The application comes pre-configured with demo accounts. On the login page, you can use the **1-Click Quick Login** buttons or enter the credentials below:

| Role | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Volunteer / Citizen** | `rohan.designer@gmail.com` | `password123` | Action feed, skill matching, claim tasks, submit proof, My Impact hub |
| **Campaigner (Approved)** | `arjun@jhatkaa.org` | `password123` | Campaign builder, volunteer directory, proof review queue |
| **Campaigner (Pending)** | `neha@cleanrivers.org` | `password123` | Awaits admin verification before campaign publishing |
| **Super Admin** | `admin@citizenhub.org` | `password123` | Movement moderation, campaigner verification, platform telemetry |

> **Note:** The Admin portal is accessible via `/admin/login`. Running `npm run seed` resets the database to these known seed accounts.

---

## 📡 Key API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new citizen or campaigner account
- `POST /api/auth/login` - Authenticate and obtain access + refresh tokens
- `POST /api/auth/refresh` - Rotate access token using valid refresh token
- `GET /api/auth/me` - Fetch authenticated user profile and impact stats

### Campaigns & Movements (`/api/campaigns`)
- `GET /api/campaigns` - List all active published campaigns
- `GET /api/campaigns/:id` - Fetch comprehensive campaign details
- `POST /api/campaigns` - Create a new campaign or volunteer movement
- `GET /api/campaigns/pending-approval` - Admin queue for pending movements
- `PUT /api/campaigns/:id/review` - Approve or reject a submitted movement
- `POST /api/campaigns/:id/sign` - Sign a campaign petition

### Tasks & Volunteering (`/api/tasks`)
- `GET /api/tasks/recommended` - Fetch personalized, AI-ranked tasks for the current user
- `POST /api/tasks/:id/claim` - Claim a task (initiates 48-hour countdown timer)
- `POST /api/tasks/:id/submit` - Submit proof of completion (photos, URLs, notes)
- `POST /api/tasks/:id/review` - Campaigner review: approve work or request revisions

### Payments & Donations (`/api/donations`)
- `POST /api/donations/create-order` - Create a Razorpay INR order
- `POST /api/donations/verify` - Verify Razorpay payment signature & update campaign totals

### Analytics (`/api/analytics`)
- `GET /api/analytics/overview` - Aggregate telemetry for volunteers, tasks, signatures, and cities

---

## 🔒 Security & Data Integrity

- **Dual-Token Rotation**: Short-lived (15m) access tokens minimize replay risk, while refresh tokens (7d) allow seamless user sessions without storing raw passwords in localStorage.
- **Strict Role-Based Routing**: Campaign management and administrative functions are protected by both backend middleware guards and frontend private route wrappers.
- **Anti-Hoarding Background Worker**: Recurring timers monitor open task reservations and automatically free expired claims back to the community.
- **Input Sanitization & Password Hashing**: Passwords hashed with bcrypt (salt rounds = 10) and structured payload validation on all endpoints.

---

## 📄 License

CitizenHub is open-source software released under the [MIT License](LICENSE).
