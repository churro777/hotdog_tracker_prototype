# Deployment & CI/CD

## 🚀 Current Deployment Setup

### Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **CI/CD**: GitHub Actions

### Environment Configuration

#### Development Environment

```bash
# .env (local development)
VITE_APP_NAME="Hot Dog Tracker"
VITE_APP_VERSION="0.0.0"
VITE_APP_ENVIRONMENT="development"
VITE_USE_FIREBASE="true"
VITE_FIREBASE_PROJECT_ID="hotdog-tracker-def59"
# ... other Firebase config
```

#### Production Environment

```bash
# Injected via GitHub Secrets during CI/CD
VITE_APP_NAME="Hot Dog Tracker"
VITE_APP_VERSION="1.0.0"  
VITE_APP_ENVIRONMENT="production"
VITE_USE_FIREBASE="true"
# Firebase config from repository secrets
```

## 🏗️ CI/CD Pipeline

### Pipeline Overview

Located in `.github/workflows/pipeline.yml`, the pipeline runs on:

- **Push to main**: Full pipeline including deployment
- **Pull requests**: Quality checks only (no deployment)
- **Daily schedule**: Security scans

### Pipeline Stages

#### 1. Quality Checks

```yaml
quality-checks:
  - Install dependencies
  - Lint code (ESLint)
  - Format check (Prettier)  
  - Type check (TypeScript)
  - Run tests (Vitest)
  - Generate coverage
  - Build application
  - Bundle size analysis
```

#### 2. Security Scans

```yaml
security-scans:
  - Dependency vulnerability scan (npm audit)
  - Code security analysis (CodeQL)
  - Secret scanning (GitLeaks)
  - Container vulnerability scan (Trivy)
```

#### 3. Deployment (Main Branch Only)

```yaml
deploy:
  - Create .env.production from GitHub secrets
  - Build production bundle
  - Deploy to Firebase Hosting
  - Update deployment status
```

#### 4. Accessibility Testing (Post-Deploy)

```yaml
accessibility-tests:
  - Run Lighthouse CI on deployed site
  - Generate accessibility reports
  - Performance benchmarking
```

## 🔐 Security Configuration

### GitHub Repository Secrets

Required secrets for deployment:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN  
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID

# Firebase Service Account (for deployment)
FIREBASE_SERVICE_ACCOUNT_HOTDOG_TRACKER_DEF59
```

### Environment Variable Injection

During deployment, secrets are dynamically injected:

```bash
# Create .env.production during CI/CD
cat > .env.production << EOF
VITE_APP_NAME="Hot Dog Tracker"
VITE_FIREBASE_API_KEY="${{ secrets.VITE_FIREBASE_API_KEY }}"
# ... other secrets
EOF
```

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contest data - authenticated read, own write
    match /contest-users/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    match /contest-posts/{document} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 📦 Build Process

### Vite Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth']
        }
      }
    }
  }
})
```

### Bundle Analysis

Automatic bundle size tracking:

```bash
npm run build:size
# Outputs bundle sizes for monitoring
```

### Bundle Optimization

- **Code splitting**: Separate vendor and Firebase chunks
- **Tree shaking**: Remove unused code automatically
- **Minification**: Terser for production builds
- **Gzip compression**: Enabled in Firebase Hosting

## 🌍 Firebase Hosting Configuration

### firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          { "key": "Cache-Control", "value": "max-age=31536000" }
        ]
      }
    ]
  }
}
```

### CDN & Caching

- **Static assets**: 1 year cache (with content hashing)
- **HTML**: No cache (for immediate updates)
- **Global CDN**: Firebase's worldwide distribution
- **Automatic HTTPS**: SSL certificates managed by Firebase

## 🔍 Monitoring & Observability

### Performance Monitoring

#### Lighthouse CI

Automated performance testing on every deployment:

```javascript
// .lighthouserc.cjs
module.exports = {
  ci: {
    collect: {
      url: ['https://hotdog-tracker-def59.web.app/'],
      settings: {
        chromeFlags: ['--headless', '--no-sandbox']
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.6 }],
        'categories:accessibility': ['error', { minScore: 0.8 }]
      }
    }
  }
}
```

#### Key Performance Metrics

- **First Contentful Paint**: < 2 seconds
- **Largest Contentful Paint**: < 3 seconds  
- **Time to Interactive**: < 5 seconds
- **Cumulative Layout Shift**: < 0.1

### Error Monitoring

#### Firebase Crashlytics (Future)

```typescript
// Error logging setup
import { logEvent } from 'firebase/analytics'

export function logError(error: Error, context: string) {
  logEvent(analytics, 'exception', {
    description: error.message,
    fatal: false,
    context
  })
}
```

#### Client-Side Error Boundary

```typescript
// ErrorBoundary component captures React errors
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, 'react-error-boundary')
  }
}
```

## 🚨 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing locally and in CI
- [ ] Bundle size within acceptable limits
- [ ] Security scan results reviewed
- [ ] Environment variables updated if needed
- [ ] Database migrations completed (if any)

### Deployment

- [ ] Pipeline successfully completes all stages
- [ ] Application loads correctly in production
- [ ] Authentication flow works end-to-end
- [ ] Database connectivity verified
- [ ] Lighthouse scores meet thresholds

### Post-Deployment

- [ ] Smoke test critical user paths
- [ ] Monitor error rates and performance metrics
- [ ] Verify real-time features (leaderboard, feed) working
- [ ] Check mobile responsive behavior
- [ ] Validate all environment-specific configurations

## 🛠️ Local Development Setup

### Prerequisites

```bash
# Required tools
node >= 18.0.0
npm >= 8.0.0
git
```

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/churro777/hotdog_tracker_prototype.git
cd hotdog_tracker_prototype

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Update .env with development Firebase config

# 4. Start development server
npm run dev

# 5. Run tests (optional)
npm run test
```

### Development Workflow

```bash
# Run linting
npm run lint

# Run formatting
npm run format

# Run tests with coverage
npm run test:coverage

# Build for production (testing)
npm run build
```

## 🔄 Rollback Procedures

### Immediate Rollback

If critical issues are detected:

1. **Firebase Hosting**: Previous version available via hosting history
2. **Database**: Point-in-time recovery available
3. **Configuration**: Revert environment variables via GitHub

### Rollback Commands

```bash
# Firebase CLI rollback (if needed)
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION_ID TARGET_SITE_ID

# Git-based rollback
git revert HEAD
git push origin main  # Triggers new deployment
```

### Rollback Decision Tree

- **UI Bug**: Rolling back acceptable
- **Data Corruption**: Database recovery may be needed
- **Performance Regression**: Monitor and decide based on user impact
- **Security Issue**: Immediate rollback required

## 📈 Scaling Considerations

### Current Capacity

- **Firebase Firestore**: 10K reads/writes per second
- **Firebase Hosting**: Global CDN, unlimited bandwidth  
- **Firebase Auth**: 1M active users included

### Scaling Triggers

- **User Growth**: > 1000 concurrent users
- **Data Volume**: > 100K documents
- **Request Volume**: > 5K requests/minute

### Scaling Options

1. **Firebase Auto-scaling**: Handled automatically
2. **Database Optimization**: Add indexes, optimize queries
3. **Caching Layer**: Implement Redis for frequently accessed data
4. **CDN Enhancement**: Additional edge locations if needed
