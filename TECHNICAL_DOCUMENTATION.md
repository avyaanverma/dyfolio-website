# DyFolio — Technical Documentation

## 1. Objective

Build a dynamic portfolio dashboard that combines stable portfolio holdings with current market data and financial fundamentals, then calculates and displays portfolio-level and sector-level metrics.

The application is designed to keep the portfolio API responsive while handling unreliable external market-data providers.

---

## 2. Architecture

```text
Excel
  │ one-time import
  ▼
PostgreSQL
  │ Prisma
  ▼
Repository
  │
  ├──────────────────────────────┐
  │                              │
  ▼                              ▼
Portfolio Service          Market Data Worker
  │                              │
  │                        Yahoo Provider
  │                              │
  │                        Google Provider
  │                              │
  │                              ▼
  │                         PostgreSQL
  │                    CMP / Price History /
  │                       Fundamentals
  │
  ▼
Derived calculations
  │
  ▼
GET /api/portfolio
  │
  ▼
Next.js UI
```

The application separates **market-data collection** from the user-facing portfolio API.

The API primarily reads persisted data and performs portfolio calculations, while market-data collection is handled separately. This prevents slow external provider requests from directly affecting portfolio API response time.

---

## 3. Database

```prisma
model Stock {
  id           Int    @id @default(autoincrement())
  name         String
  exchangeCode String
  sector       String

  holding Holding?
}

model Holding {
  id            Int @id @default(autoincrement())
  stockId       Int @unique
  purchasePrice Decimal
  quantity      Int

  stock Stock @relation(fields: [stockId], references: [id])
}
```

The database stores stable portfolio information such as:

- stock name
- exchange code
- sector
- purchase price
- quantity

Derived values such as investment, portfolio percentage, present value and gain/loss are calculated by the application.

Market data such as current price and rolling price history can also be persisted so that the portfolio API does not need to contact external providers for every request.

---

## 4. Excel Import

The provided workbook is treated as a **one-time initialization source** rather than a runtime data source.

The importer:

1. Reads the Excel workbook.
2. Normalizes the exchange codes.
3. Finds or creates the corresponding stock.
4. Creates or updates the associated holding.
5. Stores the normalized data in PostgreSQL.

After the initial import, PostgreSQL becomes the application's source of truth for portfolio holdings.

---

## 5. Provider Layer

```text
providers/
├── yahoo.provider.ts
├── google.provider.ts
├── symbol-mapper.ts
├── google-symbol-mapper.ts
├── bse-symbol-map.ts
└── types.ts
```

Yahoo Finance is used for current market prices and price data.

Google Finance is used for P/E ratio and latest earnings.

Provider logic is isolated from the portfolio service so that external data-source changes do not leak into the rest of the application.

This abstraction is particularly important because both sources are unofficial and may behave differently for different symbols.

---

## 6. Market Data Collection

Market data is separated from the request-response path.

```text
Market Data Worker
       │
       ├── Fetch CMP
       │
       ├── Detect price changes
       │
       ├── Store changed price
       │
       └── Keep bounded price history
                │
                ▼
           PostgreSQL
```

The worker fetches current prices in batches and stores changed prices in PostgreSQL.

Only changed prices are inserted into the rolling price history to avoid unnecessary database writes.

The history is intentionally bounded to a small number of recent points so that the sparkline remains lightweight.

The portfolio API then reads this persisted market data instead of fetching Yahoo chart data during every portfolio request.

---

## 7. Calculations

```text
Investment = Purchase Price × Quantity

Present Value = CMP × Quantity

Gain/Loss = Present Value − Investment

Portfolio % = Investment / Total Investment × 100
```

Portfolio totals are aggregated from holding-level calculations.

Sector summaries group holdings by sector and calculate:

- total investment
- total present value
- total gain/loss

Keeping these calculations in the service layer ensures that the frontend receives already-processed portfolio data.

---

## 8. API Contract

### `GET /api/health`

Returns a simple service health response and is also useful for deployment verification.

### `GET /api/portfolio`

Returns the processed portfolio:

```json
{
  "summary": {
    "totalInvestment": 0,
    "totalPresentValue": 0,
    "totalGainLoss": 0
  },
  "sectors": [],
  "holdings": []
}
```

Each holding contains:

- stock information
- purchase price
- quantity
- investment
- portfolio percentage
- CMP
- present value
- gain/loss
- P/E ratio
- latest earnings
- persisted price-history data

The API is intentionally read-oriented. The frontend does not directly access PostgreSQL.

---

## 9. Caching and Refresh

External market-data providers have different refresh requirements.

Current market price needs relatively frequent updates, while fundamentals such as P/E and latest earnings do not need to be fetched at the same frequency.

The architecture therefore separates their refresh behaviour.

```text
Market Data Collection
        │
        ├── CMP → frequent updates
        │
        ├── Fundamentals → less frequent updates
        │
        └── Price History → bounded persistence
```

Batching is used for independent market-data requests to reduce unnecessary sequential latency.

Caching and controlled refresh frequency are used to reduce repeated calls to external providers and lower the risk of rate limiting.

---

## 10. Frontend

```text
PortfolioDashboard
├── PortfolioHeader
├── PortfolioStats
├── SectorSummary
└── HoldingsTable
    └── Sparkline
```

The dashboard is responsible for the UI state and refreshing portfolio data.

Presentation components receive processed data through props rather than making their own database or provider requests.

The sparkline uses the persisted price-history points returned by the API.

---

## 11. Dynamic Updates

The dashboard periodically requests the latest portfolio data:

```text
Initial load
   ↓
GET /api/portfolio
   ↓
Refresh interval
   ↓
GET /api/portfolio
   ↓
repeat
```

The refresh interval is cleaned up when the dashboard component unmounts.

Because market data is collected separately, the frontend does not need to communicate directly with Yahoo Finance or Google Finance.

---

## 12. UI Decisions

The visual direction is deliberately restrained:

- dark financial-terminal aesthetic
- dense data table
- subtle borders
- green/red semantic financial signals
- compact price charts
- restrained motion
- no excessive gradients
- no glassmorphism
- minimal visual noise

The intention was to make the dashboard feel like a practical financial tool rather than a generic dashboard template.

---

# 13. Challenges & How They Were Solved

### 13.1 Unreliable unofficial market-data sources

One of the biggest challenges was working with Yahoo Finance and Google Finance because the assignment required sources that are not guaranteed production APIs.

Some symbols could return incomplete data or fail entirely.

**Solution:**

Provider calls were isolated behind provider functions with graceful error handling. A failure for one symbol does not cause the entire portfolio request to fail.

---

### 13.2 Yahoo Finance requests making the API slow

Initially, market prices and historical chart data were being fetched while handling the portfolio request.

This created unnecessary latency because the API had to wait for external providers before responding.

The historical chart request was particularly problematic for symbols where Yahoo returned no data.

**Solution:**

Market-data collection was separated from the user-facing API.

```text
Before:

Frontend
   ↓
Portfolio API
   ↓
Yahoo Finance
   ↓
Response


After:

Market Data Worker
   ↓
Yahoo Finance
   ↓
PostgreSQL

Frontend
   ↓
Portfolio API
   ↓
PostgreSQL
```

This makes the API primarily read-oriented and prevents external provider latency from directly affecting dashboard requests.

---

### 13.3 Symbol mapping between exchanges and providers

The portfolio data contains NSE/BSE exchange codes, while external providers can expect different symbol formats.

For example, NSE and BSE symbols may require different representations when querying Yahoo or Google.

**Solution:**

Symbol mapping was isolated into dedicated mapper modules.

```text
Portfolio Exchange Code
        ↓
Symbol Mapper
        ↓
Provider-specific Symbol
```

This keeps provider-specific symbol formatting out of the business logic.

---

### 13.4 Rate limits and excessive external requests

A naive implementation could request market data for every stock on every frontend refresh.

With a 15-second frontend refresh, this could result in a large number of unnecessary provider requests.

**Solution:**

The application uses:

- batching
- caching
- controlled refresh frequency
- separate refresh strategies for CMP and fundamentals
- persisted market data
- bounded price history

`Promise.all` is used to execute independent requests concurrently, but it is **not treated as a rate-limit solution**. Caching and controlled provider access are the primary protections.

---

### 13.5 Keeping price history lightweight

The dashboard requires a visual representation of price movement, but storing unlimited historical points would unnecessarily increase the amount of data being processed and displayed.

**Solution:**

Only a bounded number of recent price points are retained for each holding.

When a new price is recorded, older points outside the configured limit are removed.

This keeps the sparkline lightweight while still providing enough recent movement to visualize the trend.

---

### 13.6 Handling partial provider failures

A single unavailable symbol should not make the entire portfolio dashboard unusable.

For example, if Yahoo Finance cannot return a CMP for one stock, the remaining holdings should still be displayed.

**Solution:**

Provider functions handle failures independently and return nullable/empty results where appropriate.

The portfolio service can therefore construct a partial response rather than failing the complete request.

---

### 13.7 Separating stable data from derived data

Another design challenge was deciding what should actually be stored in PostgreSQL.

Values such as investment and gain/loss depend on other values and can change whenever the CMP changes.

**Solution:**

Stable portfolio data is stored as the source of truth, while derived financial metrics are calculated by the service layer.

This avoids storing redundant calculated values and reduces the possibility of stale calculations.

---

### 13.8 Keeping the architecture simple

It would have been possible to introduce Redis, WebSockets, Kafka, multiple microservices, or a more complex event-driven architecture.

However, these would add infrastructure and operational complexity without providing meaningful benefits for the workload of this assignment.

**Solution:**

The final architecture intentionally uses:

```text
Next.js
   ↓
Express API
   ↓
PostgreSQL

Separate market-data collection
   ↓
PostgreSQL
```

This keeps the system understandable while still addressing the important performance and reliability concerns.

---

### 13.9 Type safety across the stack

The application combines data from Excel, PostgreSQL, external providers and frontend components. Each source can have different data shapes.

**Solution:**

TypeScript types are used across the backend and frontend, with provider-specific types separated from application-level portfolio types.

This makes transformations explicit and catches mismatches during development rather than at runtime.

---

### 13.10 Deployment and environment configuration

The application uses multiple services:

```text
Vercel
   ↓
Next.js

Render
   ↓
Express API

Neon
   ↓
PostgreSQL
```

This required careful separation of public and private environment variables.

**Solution:**

Only the backend URL is exposed to the browser through:

```env
NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com
```

Database credentials remain server-side:

```env
DATABASE_URL=<Neon/PostgreSQL connection string>
```

`DATABASE_URL` is never exposed through a `NEXT_PUBLIC_` variable.

---

## 14. Error Handling

External providers can fail independently.

Provider functions catch errors and return `null` or empty history where appropriate.

The API therefore has the ability to return partial portfolio data instead of failing the entire response because of one unavailable external data point.

The application also includes:

- API rate limiting
- centralized error handling
- request logging
- health checks
- frontend error handling
- TypeScript validation during development
- automated tests

---

## 15. Security

The browser only needs the public backend URL.

Database credentials and other secrets remain server-side.

```env
# Web
NEXT_PUBLIC_API_URL=https://<render-service>.onrender.com

# API
DATABASE_URL=<Neon/PostgreSQL connection string>
```

Never put `DATABASE_URL` behind a `NEXT_PUBLIC_` variable.

---

## 16. Testing & CI

The project includes automated checks for the backend and frontend.

The CI pipeline verifies:

```text
Install dependencies
       ↓
Generate Prisma Client
       ↓
Lint
       ↓
Typecheck
       ↓
Run tests
       ↓
Production build
```

This ensures that changes are checked before being merged into the main branch.

---

## 17. Deployment

```text
Vercel → Next.js
   ↓
Render → Express API
   ↓
Neon → PostgreSQL
```

Deployment verification:

1. Open `/api/health`.
2. Open `/api/portfolio`.
3. Set `NEXT_PUBLIC_API_URL` on Vercel to the Render API URL.
4. Redeploy the frontend.
5. Verify the dashboard loads production data.
6. Verify refresh behaviour.
7. Verify graceful handling of provider failures.

---

## 18. Scope Decisions

Not implemented because they are outside the assignment scope:

- authentication
- multiple users
- multiple portfolios
- transactions
- order execution
- brokerage integration
- Redis
- Kafka
- microservices
- WebSockets

The goal is a small architecture that is understandable, maintainable and sufficient for the required workload.

---

## 19. Limitations

Yahoo Finance and Google Finance are external/unofficial sources for this use case. Their response formats and availability can change.

Symbol mapping, provider isolation, caching, batching and graceful failure handling reduce the impact of these limitations but cannot eliminate provider-side changes.

The dashboard should therefore be considered a demonstration application rather than a production trading or investment platform.
