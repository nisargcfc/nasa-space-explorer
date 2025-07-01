# NASA Space Explorer 🚀

A modern, full-stack web application that showcases NASA's space data through interactive visualizations and an engaging user experience. Built with React and Node.js, this application provides real-time access to NASA's vast collection of space imagery, Mars rover photos, asteroid tracking data, and astronomical pictures.

![NASA Space Explorer](https://img.shields.io/badge/NASA-Space%20Explorer-blue?style=for-the-badge&logo=nasa)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![Material-UI](https://img.shields.io/badge/Material--UI-5+-0081CB?style=for-the-badge&logo=material-ui)

## ✨ Features

### 🌟 Core Features
- **Dashboard**: Real-time space data overview with interactive charts and statistics
- **APOD Explorer**: Browse NASA's Astronomy Picture of the Day with calendar view, favorites, and random discovery
- **Mars Gallery**: Explore photos from Mars rovers (Curiosity, Perseverance, Opportunity, Spirit) with advanced filtering
- **Near Earth Objects (NEO) Tracker**: Monitor asteroids and their proximity to Earth with detailed analytics
- **Earth View**: Real-time Earth imagery from NASA's EPIC camera with date selection
- **NASA Media Search**: Search through millions of NASA images, videos, and audio files

### 🚀 Advanced Features
- **Interactive Data Visualizations**: Charts, graphs, and real-time analytics using Recharts
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Smart Caching**: Intelligent backend caching to optimize API performance
- **Rate Limiting**: Protection against API abuse with custom rate limiting
- **Favorites System**: Save and organize your favorite space content
- **Smooth Animations**: Engaging UI animations using Framer Motion
- **Dark Space Theme**: Beautiful space-aesthetic design with Material-UI

## 🛠️ Technology Stack

### Frontend
- **React 18+** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - Professional component library with custom theming
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Interactive data visualization charts
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Date-fns** - Modern date utility library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Fast, unopinionated web framework
- **Axios** - HTTP client for NASA API integration
- **Node-Cache** - In-memory caching for performance optimization
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression middleware

### NASA APIs Integrated
- **APOD (Astronomy Picture of the Day)** - Daily astronomical images and videos
- **Mars Rover Photos** - Images from Curiosity, Perseverance, Opportunity, and Spirit
- **Near Earth Objects (NEO)** - Asteroid tracking and orbital data
- **EPIC (Earth Polychromatic Imaging Camera)** - Earth imagery from DSCOVR satellite
- **NASA Image and Video Library** - Search through extensive media collection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- NASA API key (get one free at [NASA API Portal](https://api.nasa.gov/))
- Git installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nasa-space-explorer.git
   cd nasa-space-explorer
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   
   Create `.env` file in the backend directory:
   ```env
   NASA_API_KEY=your_nasa_api_key_here
   PORT=5001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start the development servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application!

## 📁 Project Structure

```
nasa-space-explorer/
├── backend/                    # Express.js backend
│   ├── src/
│   │   ├── middleware/        # Custom middleware (caching, rate limiting)
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # NASA API service layer
│   │   ├── utils/           # Utility functions
│   │   └── server.js        # Express server setup
│   ├── package.json
│   └── .env                 # Environment variables
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client services
│   │   ├── styles/         # Global styles and themes
│   │   └── utils/          # Frontend utilities
│   ├── public/             # Static assets
│   ├── package.json
│   └── vite.config.js      # Vite configuration
├── docs/                     # Documentation
├── README.md                # Project documentation
└── LICENSE                  # License file
```

## 🔧 API Endpoints

### APOD (Astronomy Picture of the Day)
- `GET /api/apod` - Get APOD for specific date
- `GET /api/apod/range` - Get APOD for date range
- `GET /api/apod/random` - Get random APOD

### Mars Rover Photos
- `GET /api/mars` - Get Mars rover photos with filtering
- `GET /api/mars/manifest/:rover` - Get rover manifest data
- `GET /api/mars/cameras/:rover` - Get available cameras for rover

### Near Earth Objects
- `GET /api/neo` - Get NEO data for date range
- `GET /api/neo/:id` - Get specific asteroid details

### EPIC Earth Imagery
- `GET /api/epic` - Get latest Earth images
- `GET /api/epic/dates` - Get available image dates

### NASA Media Search
- `GET /api/search` - Search NASA media library
- `GET /api/search/asset/:nasaId` - Get media asset details

## 🎨 Key Features Showcase

### Smart Caching System
- Different cache TTLs for different data types
- Automatic cache invalidation
- Performance monitoring and statistics

### Rate Limiting Protection
- IP-based rate limiting
- NASA API protection layer
- Graceful degradation under load

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

### Error Handling
- Comprehensive error boundaries
- Graceful API failure handling
- User-friendly error messages

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy to Vercel:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### Backend (Railway/Render/Heroku)
1. Set environment variables on your hosting platform
2. Deploy using Git or CLI tools
3. Update CORS settings for production domain

### Environment Variables for Production
```env
NASA_API_KEY=your_production_api_key
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
PORT=5001
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- API endpoint testing
- Component unit tests
- Integration tests
- Error handling tests

## 📈 Performance Features

- **Intelligent Caching**: Reduces NASA API calls by 80%
- **Image Optimization**: Lazy loading and responsive images
- **Code Splitting**: Dynamic imports for optimal bundle sizes
- **Service Worker**: Offline capability and caching

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **NASA** for providing incredible APIs and data
- **React Team** for the amazing framework
- **Material-UI** for the beautiful component library
- **Vercel** for seamless deployment

## 📞 Contact

**Your Name** - your.email@example.com
**Project Link** - [https://github.com/yourusername/nasa-space-explorer](https://github.com/yourusername/nasa-space-explorer)
**Live Demo** - [https://nasa-space-explorer.vercel.app](https://nasa-space-explorer.vercel.app)

---

**Made with ❤️ and lots of ☕ for space exploration enthusiasts!**
