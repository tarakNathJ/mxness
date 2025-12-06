# Exness Clone

A full-stack trading platform clone built with a microservices architecture, featuring real-time market data streaming, order matching engine, and comprehensive user management.

## 🏗️ Architecture Overview

This project implements a distributed trading system using:
- **Microservices Architecture** with Docker containerization
- **Event-Driven Design** using Apache Kafka for message streaming
- **Time-Series Database** (TimescaleDB) for efficient market data storage
- **Turborepo** monorepo structure for code organization

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Components](#-architecture-components)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🔐 **User Authentication & Authorization** with JWT
- 📊 **Real-time Market Data** streaming via WebSocket
- 💹 **Order Matching Engine** for trade execution
- 📈 **Time-Series Data Storage** for historical market data
- 🔄 **Event-Driven Architecture** with Kafka message broker
- 🐳 **Fully Containerized** deployment with Docker Compose
- 🚀 **Scalable Microservices** architecture
- 🔍 **Real-time Data Polling** from external sources
- 📡 **Reverse Proxy** with Nginx for load balancing

## 🛠️ Tech Stack

### Backend Services
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe development
- **Express.js** - Web framework
- **Apache Kafka** - Event streaming platform (KRaft mode)
- **TimescaleDB** - PostgreSQL-based time-series database
- **Nginx** - Reverse proxy and load balancer

### Frontend
- **Next.js** - React framework
- **React** - UI library
- **Turborepo** - Monorepo build system

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 🏛️ Architecture Components

### 1. **Primary Backend** (`primary-backend`)
- **Purpose**: Handles user authentication, authorization, and user-related operations
- **Port**: 3000 (HTTP), 9078 (WebSocket)
- **Responsibilities**:
  - JWT-based authentication
  - User registration and login
  - User trade management
  - Database interactions

### 2. **Publish Data Service** (`publish_data`)
- **Purpose**: Publishes market data to Kafka topics
- **Port**: 5076
- **Responsibilities**:
  - Market data ingestion
  - Data validation and formatting
  - Publishing to MARKET-DATA topic

### 3. **Poller Service** (`poller`)
- **Purpose**: Polls external data sources for market information
- **Responsibilities**:
  - Fetching real-time market data
  - Data transformation
  - Feeding data to publish_data service

### 4. **Engine Service** (`engine`)
- **Purpose**: Core order matching and trade execution engine
- **Responsibilities**:
  - Order matching algorithm
  - Trade execution
  - Order book management
  - Publishing trade results to USER-TRADE topic
  - Storing trade data in TimescaleDB

### 5. **TimescaleDB**
- **Purpose**: Time-series optimized PostgreSQL database
- **Port**: 5432
- **Responsibilities**:
  - Storing market data with time-series optimization
  - Trade history
  - User account information

### 6. **Apache Kafka**
- **Purpose**: Message broker for event streaming
- **Port**: 9092 (Client), 9093 (Controller)
- **Mode**: KRaft (no Zookeeper dependency)
- **Topics**:
  - `MARKET-DATA`: Real-time market prices
  - `TRADE`: User trade requests
  - `USER-TRADE`: Executed trade results

### 7. **Nginx**
- **Purpose**: Reverse proxy and load balancer
- **Port**: 80
- **Responsibilities**:
  - Routing requests to backend services
  - Load balancing
  - SSL termination (when configured)
- **Proxies**: `primary-backend` and `publish_data` services

## 📦 Prerequisites

Before running this project, ensure you have:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 3.9 or higher)
- **Git** for cloning the repository
- **Node.js** (version 18+ for local development)
- **npm/yarn/pnpm** for package management

### System Requirements

- **RAM**: Minimum 4GB (2GB allocated to Kafka alone)
- **Disk Space**: At least 10GB free space
- **CPU**: 2+ cores recommended

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/tarakNathJ/Exness-Clone-.git
cd Exness-Clone-
```

### 2. Install Dependencies (for local development)

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Create Nginx Configuration

Create the nginx configuration directory and file:

```bash
mkdir -p nginx/conf.d
```

Create `nginx/conf.d/default.conf`:

```nginx
upstream primary_backend {
    server primary-backend:3000;
}

upstream publish_data {
    server publish_data:5076;
}

server {
    listen 80;
    server_name localhost;

    # Primary Backend (Auth & User Management)
    location /api/auth/ {
        proxy_pass http://primary_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Support for Primary Backend
    location /ws/ {
        proxy_pass http://primary_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Publish Data Service (Market Data API)
    location /api/market/ {
        proxy_pass http://publish_data/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Default location
    location / {
        return 404 '{"error": "Not Found"}';
        add_header Content-Type application/json;
    }
}
```

## ⚙️ Configuration

### Environment Variables

The Docker Compose file includes pre-configured environment variables. Key configurations:

#### Primary Backend
```env
DATABASE_URL=postgresql://postgres:mysecretpassword@timescaledb:5432/postgres
KAFKA_BROKER=localhost:9092
JWT_SECRET=my-first-secret
PORT=9078
KAFKA_TOPIC=MARKET-DATA
KAFKA_TOPIC_PRIMARY=USER-TRADE
```

#### Engine Service
```env
MARKET_KAFKA_TOPIC=MARKET-DATA
USER_KAFKA_TOPIC=TRADE
KAFKA_USER_TREAD_TOPIC=USER-TRADE
DATABASE_URL=postgresql://postgres:mysecretpassword@timescaledb:5432/postgres
```

#### Publish Data Service
```env
PORT=5076
KAFKA_TOPIC=MARKET-DATA
KAFKA_BROKER=localhost:9092
```

#### Kafka Topics
- `MARKET-DATA`: Market price updates
- `TRADE`: User trade orders
- `USER-TRADE`: Trade execution results

**⚠️ Known Issues in docker-compose.yml**:
1. Line 89: `imescaledb` should be `timescaledb` in engine dependencies
2. Line 60: `KAFKA_BROCKER` should be `KAFKA_BROKER` in poller environment

**⚠️ Security Note**: Change default passwords and secrets before deploying to production!

### Production Configuration

For production, update the following:

1. **Database Password**: Change `POSTGRES_PASSWORD` in TimescaleDB
2. **JWT Secret**: Use a strong, random secret for `JWT_SECRET`
3. **Kafka Security**: Enable authentication and encryption
4. **Nginx SSL**: Add SSL/TLS certificates for HTTPS

## 🎯 Usage

### Starting the Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f primary-backend
```

### Stopping the Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete all data)
docker-compose down -v
```

### Accessing Services

- **Nginx Proxy**: http://localhost:80
  - Auth API: http://localhost/api/auth/
  - Market Data API: http://localhost/api/market/
  - WebSocket: ws://localhost/ws/
- **Primary Backend** (Direct): http://localhost:3000
- **WebSocket** (Direct): ws://localhost:9078
- **Publish Data API** (Direct): http://localhost:5076
- **TimescaleDB**: postgresql://postgres:mysecretpassword@localhost:5432/postgres
- **Kafka**: localhost:9092

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```bash
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

#### Login
```bash
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Trading Endpoints

#### Place Order
```bash
POST /api/trade
Authorization: Bearer <token>
Content-Type: application/json

{
  "symbol": "BTC/USD",
  "type": "BUY",
  "quantity": 0.5,
  "price": 45000
}
```

#### Get Market Data
```bash
GET /api/market-data?symbol=BTC/USD
```

### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:9078');

ws.onopen = () => {
  console.log('Connected to trading server');
  
  // Subscribe to market data
  ws.send(JSON.stringify({
    type: 'subscribe',
    channel: 'market-data',
    symbols: ['BTC/USD', 'ETH/USD']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Market update:', data);
};
```

## 💻 Development

### Project Structure

```
Exness-Clone-/
├── apps/
│   ├── docs/              # Documentation Next.js app
│   ├── web/               # Main web application
│   ├── primary-backend/   # Authentication service
│   ├── publish_data/      # Data publishing service
│   ├── poller/            # Market data poller
│   └── engine/            # Order matching engine
├── packages/
│   ├── ui/                # Shared UI components
│   ├── eslint-config/     # Shared ESLint config
│   └── typescript-config/ # Shared TypeScript config
├── nginx/
│   └── conf.d/            # Nginx configurations
├── docker-compose.yml     # Docker orchestration
├── turbo.json            # Turborepo configuration
└── package.json          # Root package configuration
```

### Running in Development Mode

```bash
# Install global turbo (recommended)
npm install -g turbo

# Start development servers
turbo dev

# Build all packages
turbo build

# Run specific package
turbo dev --filter=web
```

### Building Docker Images

```bash
# Build specific service
docker build -t taraknathjana09/primary_backend:latest ./apps/primary-backend

# Build all services
docker-compose build

# Rebuild and restart a specific service
docker-compose up -d --build primary-backend
```

### Database Migrations

```bash
# Access TimescaleDB
docker exec -it timescaledb psql -U postgres -d postgres

# Run migrations (if using a migration tool)
docker exec -it primary_backend npm run migrate
```

## 🌐 Deployment

### Production Deployment Checklist

- [ ] Update all default passwords and secrets
- [ ] Configure SSL/TLS certificates for Nginx
- [ ] Enable Kafka authentication and encryption
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set resource limits in docker-compose.yml
- [ ] Use environment-specific configurations
- [ ] Enable CORS properly for production domains
- [ ] Set up CI/CD pipeline
- [ ] Configure auto-scaling (if using Kubernetes)

### Scaling Services

To scale specific services:

```bash
# Scale the engine service to 3 instances
docker-compose up -d --scale engine=3

# Note: Kafka partitioning should be configured accordingly
```

### Health Checks

Add health checks to docker-compose.yml:

```yaml
primary-backend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Nginx Configuration Missing

**Problem**: Nginx container fails to start with "no such file or directory"

**Solution**:
```bash
# Create nginx configuration directory
mkdir -p nginx/conf.d

# Create the default.conf file (see Configuration section above)
# Or copy from the README's Nginx configuration example

# Restart nginx
docker-compose up -d nginx
```

#### 2. Engine Service Dependency Error

**Problem**: Engine service fails with "service 'imescaledb' not found"

**Solution**: This is a typo in docker-compose.yml line 89. Fix it:
```yaml
# Change this:
depends_on:
  - kafka
  - imescaledb  # ❌ Wrong

# To this:
depends_on:
  - kafka
  - timescaledb  # ✅ Correct
```

#### 3. Kafka Connection Issues

**Problem**: Services can't connect to Kafka

**Solution**:
```bash
# Check if Kafka is running
docker-compose ps kafka

# View Kafka logs
docker-compose logs kafka

# Verify Kafka topics
docker exec -it kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# Note: Fix KAFKA_BROCKER typo in poller service to KAFKA_BROKER
```

#### 4. Database Connection Errors

**Problem**: Services fail to connect to TimescaleDB

**Solution**:
```bash
# Check database is running
docker-compose ps timescaledb

# Test connection
docker exec -it timescaledb psql -U postgres -d postgres -c "SELECT 1;"

# Verify network connectivity
docker network inspect exness-clone-_backend_network
```

#### 5. Out of Memory Errors

**Problem**: Services crash due to memory limits

**Solution**:
- Reduce Kafka heap size in KAFKA_HEAP_OPTS
- Increase Docker daemon memory allocation
- Close unnecessary applications

#### 6. Port Conflicts

**Problem**: Port already in use

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process or change port in docker-compose.yml
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service with tail
docker-compose logs -f --tail=100 primary-backend

# Export logs to file
docker-compose logs > app-logs.txt
```

### Resetting the Environment

```bash
# Stop and remove everything
docker-compose down -v

# Remove images (optional)
docker-compose down --rmi all

# Clean rebuild
docker-compose build --no-cache
docker-compose up -d
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation for API changes
- Follow conventional commit messages
- Ensure Docker builds succeed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Turborepo](https://turborepo.com/)
- Powered by [Apache Kafka](https://kafka.apache.org/)
- Database by [TimescaleDB](https://www.timescale.com/)
- Inspired by [Exness](https://www.exness.com/) trading platform

## 📧 Contact

Tarak Nath Jana - [@tarakNathJ](https://github.com/tarakNathJ)

Project Link: [https://github.com/tarakNathJ/Exness-Clone-](https://github.com/tarakNathJ/Exness-Clone-)

---

**⭐ If you find this project helpful, please consider giving it a star!**