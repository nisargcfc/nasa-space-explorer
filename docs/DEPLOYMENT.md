# 🚀 Deployment Guide

This guide will help you deploy the NASA Space Explorer application to production.

## 📋 Prerequisites

- **NASA API Key**: Get one free at [NASA API Portal](https://api.nasa.gov/)
- **Git repository**: Push your code to GitHub
- **Node.js 18+** for local testing

## 🌐 Frontend Deployment (Vercel)

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   vercel --prod
   ```

3. **Set Environment Variables**
   - In Vercel dashboard, go to your project settings
   - Add environment variable:
     - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api`)

### Method 2: GitHub Integration

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

2. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**
   - Add `VITE_API_URL` in project settings

## 🔧 Backend Deployment (Railway)

### Method 1: Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NASA_API_KEY=your_nasa_api_key
   railway variables set NODE_ENV=production
   railway variables set FRONTEND_URL=https://your-frontend.vercel.app
   ```

### Method 2: GitHub Integration

1. **Connect Repository**
   - Go to [Railway Dashboard](https://railway.app/)
   - Create new project from GitHub
   - Select your repository and `backend` folder

2. **Configure Environment Variables**
   ```
   NASA_API_KEY=your_nasa_api_key_here
   PORT=5001
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

3. **Deploy**
   - Railway will automatically deploy using the Dockerfile

## 🎯 Alternative Deployment Options

### Backend Alternatives

#### Render
1. Connect GitHub repository
2. Create Web Service
3. Set build command: `npm install`
4. Set start command: `node src/server.js`
5. Add environment variables

#### Heroku
1. Install Heroku CLI
2. Create app: `heroku create nasa-backend`
3. Set environment variables: `heroku config:set NASA_API_KEY=your_key`
4. Deploy: `git push heroku main`

### Frontend Alternatives

#### Netlify
1. Drag and drop `frontend/dist` folder to Netlify
2. Or connect GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## 🔗 Update CORS Settings

After deployment, update your backend CORS settings:

1. **Update `backend/src/server.js`**
   ```javascript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? [process.env.FRONTEND_URL, 'https://your-frontend-domain.vercel.app']
       : ['http://localhost:3000', 'http://localhost:5173'],
     credentials: true
   }));
   ```

2. **Redeploy backend** after updating CORS settings

## ✅ Deployment Checklist

### Before Deployment
- [ ] NASA API key obtained
- [ ] Repository pushed to GitHub
- [ ] Code tested locally
- [ ] Environment variables configured

### Frontend Deployment
- [ ] Build successful (`npm run build`)
- [ ] API URL environment variable set
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

### Backend Deployment
- [ ] Docker build successful
- [ ] All environment variables set
- [ ] Health check endpoint working (`/health`)
- [ ] CORS configured for production domain

### Post-Deployment Testing
- [ ] Frontend loads without errors
- [ ] API endpoints accessible
- [ ] Data loads correctly
- [ ] Error handling works
- [ ] Mobile responsiveness verified

## 🛠️ Environment Variables Reference

### Backend (.env)
```env
NASA_API_KEY=your_nasa_api_key_here
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.local)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured with correct frontend URL
   - Check that environment variables are set correctly

2. **API Rate Limits**
   - Use your own NASA API key (not DEMO_KEY)
   - Implement proper caching

3. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Check for TypeScript/ESLint errors

4. **Environment Variables Not Loading**
   - Verify variable names (VITE_ prefix for frontend)
   - Check deployment platform variable settings
   - Restart services after adding variables

### Performance Optimization

1. **Enable Gzip Compression** (already implemented)
2. **Use CDN** for static assets
3. **Monitor API Usage** to stay within NASA API limits
4. **Implement Service Workers** for offline functionality

## 📞 Support

If you encounter issues during deployment:
1. Check the application logs in your deployment platform
2. Verify all environment variables are set correctly
3. Test API endpoints manually using tools like Postman
4. Check browser console for frontend errors

## 🎉 Success!

Once deployed, your NASA Space Explorer will be live and accessible to users worldwide! 

**Frontend URL**: `https://your-app.vercel.app`  
**Backend API**: `https://your-api.railway.app`

Share your amazing space exploration app with the world! 🌌 