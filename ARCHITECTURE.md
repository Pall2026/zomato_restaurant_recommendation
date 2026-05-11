# AI Restaurant Recommendation Service - Project Architecture Document

## Phase 1 → Project Setup & Structure *(Updated)*
**Goal**: Establish a scalable, maintainable, and developer-friendly foundation for both backend and frontend applications.
- **Components/Modules Involved**: 
  - Monorepo Management Tool (e.g., Turborepo or npm/yarn workspaces)
  - `apps/frontend` (Next.js environment)
  - `apps/backend` (Node.js environment)
  - `packages/shared` (Optional, for shared TypeScript types and utility functions)
  - Global Configuration (Linting, formatting, environment variables)
- **Responsibilities**:
  - Ensure strict separation of concerns between client UI and server logic while maintaining ease of unified operations.
  - Centralize `.env` management to cleanly separate development, staging, and production configurations.
  - *(New)* Expose `NEXT_PUBLIC_API_URL` to the frontend environment variables so the frontend knows where to reach the backend across local, staging, and production environments.
- **Component Interaction**:
  - The frontend and backend act as independent services but share configuration layers (like ESLint/Prettier) and API contracts/types from the shared package.
- **Tech/Tools Used**: Node.js, Next.js, Yarn Workspaces / Turborepo, ESLint, Prettier, dotenv.

## Phase 2 → Data Layer *(Updated)*
**Goal**: Securely and efficiently fetch, parse, format, and store the Zomato restaurant dataset from HuggingFace for rapid querying.
- **Components/Modules Involved**:
  - Dataset Ingestion/ETL Script *(Updated)*
  - Data Normalizer & Cleaner
  - Database System (e.g., PostgreSQL or MongoDB)
  - Caching Layer (Redis) *(Updated: RECOMMENDED/REQUIRED)*
- **Responsibilities**:
  - Pull raw dataset from the HuggingFace URL (`ManikaSaini/zomato-restaurant-recommendation`). *(Updated: HuggingFace datasets are served as Parquet files, not plain CSVs. Use `@huggingface/hub` SDK or the HuggingFace REST Datasets API with token auth.)*
  - Preprocess unstructured data: resolve missing values, normalize pricing into ranges, standardize location/cuisine tags.
  - Store normalized data into a database tailored for multi-parameter querying (location, price, cuisine, rating).
- **Component Interaction**:
  - *(Updated)* The ETL script is a ONE-TIME seed script that runs before the app launches. The live backend never calls HuggingFace during user requests. It processes the payload in-memory or via streams and writes to the Database layer.
  - The Backend API purely reads from the Database or Cache layer. *(Updated)* Caching frequent query results in Redis is critical because Groq has rate limits.
- **Tech/Tools Used**: Node.js, `@huggingface/hub`, Parquet parsing libraries, Database (PostgreSQL/MongoDB), Redis. *(Updated)*

## Phase 3 → LLM Integration with Groq *(Updated)*
**Goal**: Leverage the Groq LLM to intelligently filter, evaluate, and generate natural language recommendations based on user preferences and database matches.
- **Components/Modules Involved**:
  - Groq API Client Service
  - Prompt Engineering Matrix 
  - Context Assembler (combines DB results with user preferences)
  - Output Parser
- **Responsibilities**:
  - Define system prompts that instruct the LLM to behave as an expert food critic and recommendation engine. *(New)* Prompts should be versioned (e.g., v1, v2) so that changes to the prompt don't silently corrupt cached LLM responses.
  - Accept raw user preferences (price, location, rating, cuisine) and pre-filtered list of restaurants from the DB, formatting them into a rich prompt.
  - Validate and parse the LLM's raw string output back into a structured JSON format to be cleanly consumed by the frontend.
  - *(New)* Retry & Fallback Strategy:
    - **Retry logic**: Implement exponential backoff on Groq API failures or timeouts.
    - **Fallback behavior**: If Groq fails after retries, return the raw filtered DB results to the user with a graceful message instead of a hard error.
- **Component Interaction**:
  - Receives data from the Backend API Layer (User Query + DB Results).
  - Sends the compiled prompt via network request to the Groq inference endpoint.
  - Returns parsed, structured recommendation objects back to the Backend API.
- **Tech/Tools Used**: Groq API SDK, Node.js, JSON schema validation tools (e.g., Zod).

## Phase 4 → Backend API Layer *(Updated)*
**Goal**: Serve as the central orchestrator connecting the frontend UI, the database, and the Groq LLM service.
- **Components/Modules Involved**:
  - RESTful or GraphQL Router (e.g., Express.js or Fastify)
  - Request Validators & Middleware
  - Recommendation Controller
  - Error/Exception Handler
- **Responsibilities**:
  - Expose a secure endpoint (`POST /api/recommendations`) to receive user preferences. *(Updated)* Apply Rate Limiting middleware to this endpoint using `express-rate-limit` to prevent Groq quota exhaustion from spam.
  - *(New)* Expose a Health Check endpoint (`GET /health`) that returns server status, DB connectivity, and Groq API reachability. Required for deployment monitoring.
  - Validate incoming payloads to ensure minimum required fields are present.
  - *(New)* Optional lightweight API key or session token auth to prevent unauthorized use of the recommendation endpoint.
  - *(New)* Explicit CORS configuration: The backend must whitelist the Next.js frontend origin in all environments (dev, staging, production).
  - Query the Data Layer to fetch a preliminary list of candidate restaurants matching hard filters (like location and price range).
  - Pass the candidate list and user query to the Groq LLM Integration Module.
  - Standardize error responses (e.g., Rate limits, DB failures, Groq timeouts).
- **Component Interaction**:
  - Acts as the bridge: Validates Frontend requests → Queries Data Layer for candidates → Sends to LLM Integration for final selection/reasoning → Responds to Frontend.
- **Tech/Tools Used**: Node.js, Express.js / Fastify, Zod / Joi (validation), CORS, Winston / Morgan (logging), `express-rate-limit`. *(Updated)*

## Phase 5 → Frontend UI (Next.js) *(Updated)*
**Goal**: Provide an intuitive, responsive, and engaging user interface to collect preferences and elegantly display AI-curated recommendations.
- **Components/Modules Involved**:
  - Landing / Input Page (Form component with selectors for location, price, cuisine, rating)
  - Loading State / Skeleton UI (Crucial for masking LLM latency)
  - Recommendation Results View (Cards detailing the restaurant, AI reasoning, and metrics)
  - API Communication Utility (Fetch / Axios abstraction)
- **Responsibilities**:
  - Capture user input with robust client-side validation.
  - Manage application state (idle, loading, success, error).
  - Render the AI reasoning and restaurant details clearly, highlighting why a specific place was chosen.
- **Component Interaction**:
  - The Form component triggers the API Communication Utility. *(Updated)* The utility explicitly references `NEXT_PUBLIC_API_URL` to route requests to the correct backend instance.
  - Waits for the Backend API Layer to resolve, transitions state, and passes data down to the Results View components for rendering.
- **Tech/Tools Used**: Next.js (App or Pages router), React, Tailwind CSS (or similar styling tool), React Hook Form, Axios/Fetch.

## Phase 6 → Integration, Testing & Deployment *(Updated)*
**Goal**: Guarantee system reliability, validate the end-to-end user flow, and deploy the application to a scalable hosting environment.
- **Components/Modules Involved**:
  - Unit & Integration Test Suites
  - CI/CD Pipelines
  - Hosting Infrastructure
- **Responsibilities**:
  - Validate prompt parsing logic (ensure the LLM doesn't break the application with unexpected formats).
  - Verify database queries fetch the correct sub-set of restaurants.
  - Automate build and deployment steps.
  - *(New)* Secrets Management: Groq API key, DB credentials, and Redis URL must be stored as environment secrets on the hosting platform (Render/Railway/Vercel) — never committed to the repository.
  - *(New)* Containerization: A Dockerfile for the Node.js backend is recommended to ensure consistent behavior across local, staging, and production environments (Railway and Render both support Docker-based deploys natively).
- **Component Interaction**:
  - The CI/CD pipeline runs tests against the Backend API and Frontend components on every commit. Once passed, it triggers a deployment to the respective hosting platforms.
  - *(New)* The deployment process pings the `GET /health` endpoint as a readiness/liveness probe during rollout.
- **Tech/Tools Used**: Jest / Vitest (Unit tests), Playwright / Cypress (E2E), GitHub Actions, Vercel / Netlify (Frontend Hosting), Render / Railway / AWS (Backend Hosting), Docker. *(Updated)*

---

## High-Level Architecture Diagram (Text Representation) *(Updated)*

```text
[ User / Browser ]
       │
       │ (1) Submits preferences (Location, Price, Cuisine)
       ▼
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                   │
│  - User Input Form                                     │
│  - Loading/State Management                            │
│  - Results UI Rendering                                │
└────────────────────────────────────────────────────────┘
       │
       │ (2) POST /api/recommendations (JSON Payload) & CORS
       │     (Target: NEXT_PUBLIC_API_URL)
       ▼
┌────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                    │
│                                                        │
│  [ Router & Validator ]                                │
│       |-- Rate Limiting                                │
│       |-- Auth Check                                   │
│       |-- GET /health (Readiness Probe)                │
│       │                                                │
│      (3)                                               │
│       │───────────► [ Cache Layer (Redis) ]            │
│       │                   │   │                        │
│       ▼           (Hit) ◄─┘   │ (Miss)                 │
│  [ DB Engine ] ◄──────────────┘                        │
│       │                                                │
│       ▼                                                │
│ (Fetches Candidates)                                   │
│       │                                                │
│      (6) Return Structured Response (or Fallback DB)   │
│       ▲                                                │
│       │                                                │
│ [ LLM Orchestration Module ]                           │
│ (Prompt Versioning + Combines candidates & query)      │
│       │     ▲                                          │
│       ▼     │                                          │
│    Retry & Fallback                                    │
│       │     │                                          │
└───────│─────│──────────────────────────────────────────┘
        │     │              
        │     │ (4) Prompt   
        │     │  & Context   
        ▼     │              
┌────────────────────────────┐
│     EXTERNAL SERVICES      │
│                            │
│  [ Groq API (LLM) ] ─(5)──► Return JSON Analysis
│                            │
│  [ Target DB ] <── (Built ONCE via Parquet ETL from HuggingFace)
└────────────────────────────┘
```

**Data Flow Summary**: *(Updated)*
1. The user inputs their desired criteria on the Next.js Frontend.
2. The Frontend sends an HTTP POST request to the Node.js Backend using the `NEXT_PUBLIC_API_URL`. The backend enforces CORS, Rate Limiting, and Optional Auth.
3. The Backend checks the Redis Cache for recent identical queries to circumvent rate limits. On a cache miss, it validates the request and queries the local Database to get a shortlist of restaurants matching the hard constraints.
4. The Backend injects those shortlisted restaurants alongside the user's specific prompt (using a versioned prompt strategy) into the Groq API Client.
5. The Groq LLM analyzes the options, picks the best matches, and returns a generated rationale for each choice in a structured format.
6. If the Groq API fails or times out, the Backend retries with exponential backoff. If it ultimately fails, it falls back to returning the raw database candidates with a graceful message. Otherwise, the Backend caches the successful response in Redis, processes the LLM response safely, and sends it back to the Frontend to be displayed to the user.
