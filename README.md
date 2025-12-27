# 📈 Exness Clone - Trading Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://exness-clone-fontend.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-97.9%25-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)](https://vitejs.dev/)

A full-stack trading platform clone inspired by Exness, built with modern technologies in a Turborepo monorepo structure.

## 🌐 Live Demo

**Frontend**: [https://exness-clone-fontend.vercel.app/](https://exness-clone-fontend.vercel.app/)


**Grafana**: [https://grafana.taraknathjana.com/goto/ff8eei84nfev4b?orgId=1](https://grafana.taraknathjana.com/goto/ff8eei84nfev4b?orgId=1)


**Test Account**:{ email:tarakjana55@gmail.com , password: 1234 }

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Development](#-development)
- [Build & Deployment](#-build--deployment)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Trading Features

- 🔐 **User Authentication** - Register, Login, JWT-based auth
- 📊 **Real-time Trading** - WebSocket-based live price updates
- 💰 **Portfolio Management** - Track assets, positions, and P&L
- 📈 **Interactive Charts** - Advanced charting with lightweight-charts
- 💳 **Multi-asset Support** - Forex, Crypto, Stocks, Commodities
- 🔔 **Toast Notifications** - Real-time alerts and updates

### UI/UX Features

- 🎨 **Modern Design** - Built with Radix UI & Tailwind CSS
- 🌓 **Dark/Light Mode** - Theme switching with next-themes
- 📱 **Responsive Design** - Mobile-first approach
- ♿ **Accessibility** - WCAG compliant components
- 🎯 **Professional UI** - shadcn/ui component library

### Technical Features

- ⚡ **Optimized Performance** - Vite build with code splitting
- 🔄 **State Management** - Redux Toolkit & Zustand
- 🛣️ **Client-side Routing** - React Router DOM v7
- 📦 **Monorepo Architecture** - Turborepo for efficient builds
- 🐳 **Docker Support** - Containerized deployment

---

## 🛠 Tech Stack

### Frontend

| Technology             | Version  | Purpose            |
| ---------------------- | -------- | ------------------ |
| **React**              | 19.2.0   | UI Library         |
| **TypeScript**         | ~5.9.3   | Type Safety        |
| **Vite**               | 7.2.4    | Build Tool         |
| **Tailwind CSS**       | 4.1.17   | Styling            |
| **Redux Toolkit**      | 2.11.0   | State Management   |
| **React Router**       | 7.9.6    | Routing            |
| **Axios**              | 1.13.2   | HTTP Client        |
| **Radix UI**           | Multiple | UI Components      |
| **Recharts**           | 3.5.0    | Data Visualization |
| **Lightweight Charts** | 3.8.0    | Trading Charts     |

### Backend (Inferred)

- Node.js
- WebSocket Server
- RESTful API
- JWT Authentication

### DevOps & Tools

- **Turborepo** - Monorepo management
- **Docker** - Containerization
- **Vercel** - Frontend hosting
- **ESLint** - Code linting
- **Git** - Version control

---

## 📁 Project Structure

```
Exness-Clone-/
├── apps/
│   ├── fontend/                    # Main frontend application
│   │   ├── src/
│   │   │   ├── components/         # React components
│   │   │   │   ├── AuthPage.tsx    # Authentication
│   │   │   │   ├── TradePage.tsx   # Trading interface
│   │   │   │   ├── PortfolioPage.tsx # Portfolio view
│   │   │   │   ├── api/            # API layer
│   │   │   │   │   └── auth.ts     # Auth API calls
│   │   │   │   └── ui/             # UI components (shadcn)
│   │   │   │       ├── button.tsx
│   │   │   │       ├── dialog.tsx
│   │   │   │       ├── chart.tsx
│   │   │   │       ├── sidebar.tsx
│   │   │   │       ├── toaster.tsx
│   │   │   │       └── ...
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   │   ├── use-mobile.tsx  # Mobile detection
│   │   │   │   └── use-toast.ts    # Toast notifications
│   │   │   ├── lib/                # Utility functions
│   │   │   │   └── utils.ts        # cn() helper
│   │   │   ├── redux/              # Redux store
│   │   │   │   └── store.ts        # Redux configuration
│   │   │   ├── App.tsx             # Root component
│   │   │   ├── main.tsx            # Entry point
│   │   │   └── vite-env.d.ts       # Vite types
│   │   ├── public/                 # Static assets
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   └── backend/                    # Backend application (if exists)
├── packages/
│   ├── ui/                         # Shared UI components
│   ├── eslint-config/              # Shared ESLint configs
│   └── typescript-config/          # Shared TS configs
├── .gitignore
├── .npmrc
├── package.json                    # Root package.json
├── turbo.json                      # Turborepo config
├── Dockerfile                      # Docker configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** >= 9.x or **pnpm** >= 8.x (recommended)
- **Git**
- **Docker** (optional, for containerized deployment)

### System Requirements

- **OS**: Windows, macOS, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/tarakNathJ/Exness-Clone-.git
cd Exness-Clone-
```

### 2. Install Dependencies

Using npm:

```bash
npm install
```

Using pnpm (recommended for monorepos):

```bash
pnpm install
```

### 3. Setup Environment Variables

Create `.env` files in the frontend app:

```bash
cd apps/fontend
touch .env
```

Add the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_URI_PUBLISH=ws://localhost:3001
VITE_API_URL_WS=ws://localhost:3002

# Optional: Feature Flags
VITE_ENABLE_ANALYTICS=false
```

### 4. Create Missing Directories & Files

The frontend requires these utility files:

```bash
# Create directories
mkdir -p apps/fontend/src/hooks
mkdir -p apps/fontend/src/lib

# Add the utility files (see installation guide)
```

**Required files:**

- `apps/fontend/src/hooks/use-mobile.tsx`
- `apps/fontend/src/hooks/use-toast.ts`
- `apps/fontend/src/lib/utils.ts`
- `apps/fontend/src/vite-env.d.ts`

---

## 💻 Development

### Start Development Server

Run all apps in the monorepo:

```bash
# From root directory
npm run dev

# Or with Turborepo
turbo dev
```

Run only the frontend:

```bash
# With filter
turbo dev --filter=fontend

# Or navigate to app
cd apps/fontend
npm run dev
```

The frontend will be available at: **http://localhost:5173**

### Development Features

- ⚡ **Hot Module Replacement (HMR)** - Instant updates
- 🔍 **TypeScript type checking** - Real-time error detection
- 🎨 **Tailwind CSS IntelliSense** - Auto-completion
- 📦 **Auto-import optimization** - Faster builds

---

## 🏗 Build & Deployment

### Build for Production

Build all apps:

```bash
npm run build
```

Build only frontend:

```bash
turbo build --filter=fontend
```

Output will be in `apps/fontend/dist/`

### Preview Production Build

```bash
cd apps/fontend
npm run preview
```

### Deploy to Vercel

The frontend is already deployed at: [https://exness-clone-fontend.vercel.app/](https://exness-clone-fontend.vercel.app/)

To deploy your own instance:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/fontend
vercel
```

### Docker Deployment

Build Docker image:

```bash
docker build -t exness-clone .
docker run -p 3000:3000 exness-clone
```

---

## 🔐 Environment Variables

### Frontend Variables

| Variable               | Description                | Default                 | Required |
| ---------------------- | -------------------------- | ----------------------- | -------- |
| `VITE_API_URL`         | Backend API base URL       | `http://localhost:3000` | ✅ Yes   |
| `VITE_API_URI_PUBLISH` | WebSocket publish endpoint | `ws://localhost:3001`   | ✅ Yes   |
| `VITE_API_URL_WS`      | WebSocket trading data     | `ws://localhost:3002`   | ✅ Yes   |

### Backend Variables (if applicable)

| Variable       | Description         | Required |
| -------------- | ------------------- | -------- |
| `PORT`         | Server port         | ✅ Yes   |
| `JWT_SECRET`   | JWT signing key     | ✅ Yes   |
| `DATABASE_URL` | Database connection | ✅ Yes   |
| `REDIS_URL`    | Redis cache URL     | Optional |

---

## 📚 API Documentation

### Authentication Endpoints

#### Register

```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

#### Login

```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

### Trading Endpoints

#### Get Market Data

```http
GET /api/markets
Authorization: Bearer {token}
```

#### Place Order

```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "symbol": "EUR/USD",
  "type": "buy",
  "amount": 1000,
  "price": 1.0850
}
```

### WebSocket Events

#### Subscribe to Price Updates

```javascript
const ws = new WebSocket(`${VITE_API_URL_WS}`);

ws.onopen = () => {
  ws.send(
    JSON.stringify({
      action: "subscribe",
      symbols: ["EUR/USD", "BTC/USD"],
    })
  );
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle price update
};
```

---

## 🧪 Testing

### Test Cases Overview

Comprehensive test cases are available in `TEST_CASES.md` covering:

- ✅ Unit tests for components
- ✅ Integration tests for API
- ✅ E2E tests for user flows
- ✅ WebSocket connection tests
- ✅ Authentication flows
- ✅ Trading operations
- ✅ Portfolio management

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific suite
npm test -- --grep "Authentication"
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**Tarak Nath J**

- GitHub: [@tarakNathJ](https://github.com/tarakNathJ)
- Repository: [Exness-Clone-](https://github.com/tarakNathJ/Exness-Clone-)

---

## 🙏 Acknowledgments

- [Exness](https://www.exness.com/) - Inspiration for the trading platform design
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Vercel](https://vercel.com/) - Hosting and deployment

---

## 📞 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/tarakNathJ/Exness-Clone-/issues) page
2. Create a new issue with detailed information
3. Contact via GitHub discussions

---

## 🔮 Roadmap

- [ ] Add comprehensive test coverage
- [ ] Implement advanced charting features
- [ ] Add more trading instruments
- [ ] Mobile app development
- [ ] Real-time notifications
- [ ] Social trading features
- [ ] Performance analytics dashboard
- [ ] Multi-language support

---

## ⚠️ Disclaimer

This is a clone project for educational purposes. It is not affiliated with or endorsed by Exness. Do not use this for real trading or financial transactions.

---

## 📊 Project Stats

- **Language**: TypeScript (97.9%)
- **Frameworks**: React, Vite, Tailwind CSS
- **Architecture**: Monorepo (Turborepo)
- **Dependencies**: 50+ npm packages
- **Build Time**: ~3-5 seconds
- **Bundle Size**: Optimized with code splitting

---

Made with ❤️ by [Tarak Nath Jana](https://github.com/tarakNathJ)

**Star ⭐ this repository if you found it helpful!**
