# Deployment Guide

## Setting Backend API URL for Production

When deploying to production, you need to set the `REACT_APP_API_URL` environment variable to point to your backend server.

### Option 1: Environment Variable (Recommended)

Set the environment variable before building:

**Windows:**
```cmd
set REACT_APP_API_URL=https://your-backend-domain.com
npm run build
```

**Linux/Mac:**
```bash
export REACT_APP_API_URL=https://your-backend-domain.com
npm run build
```

### Option 2: .env File

Create a `.env` file in the `frontend` directory:

```
REACT_APP_API_URL=https://your-backend-domain.com
```

Then build:
```bash
npm run build
```

### Option 3: Platform-Specific Configuration

#### Netlify
1. Go to Site settings → Build & deploy → Environment
2. Add variable: `REACT_APP_API_URL` = `https://your-backend-domain.com`

#### Vercel
1. Go to Project settings → Environment Variables
2. Add variable: `REACT_APP_API_URL` = `https://your-backend-domain.com`

#### Heroku
```bash
heroku config:set REACT_APP_API_URL=https://your-backend-domain.com -a your-app-name
```

### Important Notes:

1. **No trailing slash**: Don't include a trailing slash in the URL
   - ✅ Correct: `https://api.example.com`
   - ❌ Wrong: `https://api.example.com/`

2. **Include protocol**: Always include `http://` or `https://`
   - ✅ Correct: `https://api.example.com`
   - ❌ Wrong: `api.example.com`

3. **Rebuild after changes**: After setting the environment variable, rebuild your app:
   ```bash
   npm run build
   ```

4. **Development**: In development, the proxy in `package.json` handles this automatically, so you don't need to set it.

### Example:

If your backend is deployed at `https://moodify-api.herokuapp.com`, set:

```
REACT_APP_API_URL=https://moodify-api.herokuapp.com
```

Then rebuild:
```bash
npm run build
```

