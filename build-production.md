# Production Build Guide

## Prerequisites

1. Node.js (v16 or higher)
2. MongoDB instance
3. Environment variables configured

## Backend Production Build

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment variables
Create a `.env` file in the `backend` directory with production values:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_secure_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://your-frontend-domain.com
TRUST_PROXY=1
```

### 3. Build TypeScript
```bash
npm run build
```

### 4. Start production server
```bash
npm start
```

## Frontend Production Build

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Configure production API URL
Update `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### 3. Build for production
```bash
npm run build
```

This will create an optimized production build in the `frontend/dist` directory.

### 4. Preview production build locally (optional)
```bash
npm run preview
```

## Deployment Options

### Option 1: Static Hosting (Frontend)
Deploy the `frontend/dist` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Option 2: Node.js Hosting (Backend)
Deploy the backend to:
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

### Option 3: Docker Deployment
Use Docker containers for both frontend and backend (see Docker configuration below).

## Docker Configuration (Optional)

### Backend Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend Dockerfile
Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
Create `frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Compose
Create `docker-compose.yml` in the root:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/quiz-system?authSource=admin
      JWT_SECRET: your_jwt_secret
      JWT_REFRESH_SECRET: your_refresh_secret
      CORS_ORIGIN: http://localhost:3000
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

## Performance Optimization Checklist

- [x] Code splitting implemented (Vite config)
- [x] Lazy loading for routes
- [x] API response caching
- [x] Image optimization
- [x] Minification and compression
- [x] Security headers (Helmet.js)
- [x] Rate limiting
- [x] Database indexing

## Security Checklist

- [ ] Update all environment variables with secure values
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set secure cookie flags
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database backups configured

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)
- Uptime monitoring (UptimeRobot)
- Log aggregation (ELK Stack, Papertrail)
