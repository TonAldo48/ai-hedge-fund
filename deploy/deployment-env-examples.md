# Deployment Environment Variables

This file contains examples of environment variables needed for deploying the AI Hedge Fund application.

## Backend Environment Variables (.env)

```
# API Configuration
PORT=8000
HOST=0.0.0.0

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000

# API Keys for external services
ANTHROPIC_API_KEY=your-anthropic-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
GROQ_API_KEY=your-groq-api-key
GOOGLE_API_KEY=your-google-api-key
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key
OPENAI_API_KEY=your-openai-api-key

# Optional: Database configuration if applicable
# DATABASE_URL=postgresql://username:password@host:port/database
```

## Frontend Environment Variables (.env.local in web directory)

```
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES=false
```

## Important Notes

1. **Production Deployment**:
   - Never commit real API keys to your repository
   - Use environment variable management in your deployment platform
   - Rotate API keys regularly for security

2. **Local Development**:
   - Create `.env` files locally based on these examples
   - For frontend local development, use `NEXT_PUBLIC_API_URL=http://localhost:8000`
   - For backend local development, use `ALLOWED_ORIGINS=http://localhost:3000`

3. **Testing**:
   - Consider using separate API keys for testing environments 