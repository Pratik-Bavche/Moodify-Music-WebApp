# 🎵 Moodify - YouTube API + yt-dlp Streaming Music App

A modern music streaming application that uses YouTube API for search and yt-dlp for high-quality audio streaming. Unlimited, free, and legal music streaming with mood-based recommendations.

## 🚀 Features

### ✅ YouTube API Integration

- **Unlimited Music Library** - Access to entire YouTube music catalog
- **Mood-Based Search** - 8 predefined moods with smart keyword expansion
- **Trending Songs** - Get popular songs by mood
- **Video Metadata** - Rich song information and thumbnails

### ✅ yt-dlp Streaming

- **High-Quality Audio** - Best available audio formats
- **Direct Streaming** - No downloads, pure streaming
- **Global Access** - Works worldwide
- **No Storage** - Streams directly to player

### ✅ Modern UI/UX

- **Responsive Design** - Works on all devices
- **Custom Audio Player** - Full-featured streaming player
- **Mood-Based Interface** - Intuitive mood selection
- **Real-time Search** - Instant search results

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **YouTube API** - Music search
- **yt-dlp** - Stream extraction

### Frontend

- **React** - UI framework
- **Axios** - HTTP client
- **React Icons** - Icon library
- **CSS3** - Styling with gradients and animations

## 📋 Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or cloud)
3. **YouTube API Key** (free from Google Cloud Console)
4. **Git** (for cloning)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Moodify
```

### 2. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/moodify
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
YOUTUBE_API_KEY=your-youtube-api-key-here
PORT=5000
NODE_ENV=development" > .env

# Start the server
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎯 Available Moods

| Mood          | Emoji | Description               |
| ------------- | ----- | ------------------------- |
| **Happy**     | 😊    | Upbeat and positive vibes |
| **Sad**       | 😢    | Melancholic and emotional |
| **Energetic** | ⚡    | High energy and pump up   |
| **Calm**      | 😌    | Relaxing and peaceful     |
| **Romantic**  | 💕    | Love and romance          |
| **Nostalgic** | 🕰️    | Throwback and classic     |
| **Focused**   | 🎯    | Study and concentration   |
| **Party**     | 🎉    | Dance and celebration     |

## 🔧 API Endpoints

### Public Routes (No Auth Required)

```bash
# Search songs by mood or keyword
GET /api/streaming/search?query=happy&maxResults=10

# Get available moods
GET /api/streaming/moods

# Get trending songs by mood
GET /api/streaming/trending?mood=happy&maxResults=10

# Get video details
GET /api/streaming/details/:videoId
```

### Protected Routes (Auth Required)

```bash
# Get stream URL for playback
GET /api/streaming/stream/:videoId
```

## 🎵 How It Works

### 1. Search Process

```
User Search → YouTube API → Video Results → yt-dlp → Stream URL → Frontend Player
```

### 2. Streaming Flow

```
1. User searches by mood or keyword
2. YouTube API returns relevant videos
3. Backend uses yt-dlp to extract stream URLs
4. Frontend receives stream URL
5. Custom player streams audio directly
```

### 3. Mood-Based Search

```
Mood Selection → Keyword Expansion → YouTube Search → Filtered Results
```

## 🎨 Frontend Components

### StreamingPlayer

- Custom audio player with streaming support
- Full controls (play, pause, seek, volume)
- Progress bar and time display
- Error handling and loading states

### Mood Selection

- Visual mood cards with emojis
- Smart search suggestions
- Trending songs by mood

### Search Interface

- Real-time search results
- Fallback to trending songs
- Rich song metadata display

## 🔒 Security Features

- **JWT Authentication** - Secure user sessions
- **CORS Configuration** - Cross-origin requests
- **Input Validation** - Sanitized user inputs
- **Error Handling** - Graceful error responses

## 📱 Responsive Design

- **Desktop** - Full-featured interface
- **Tablet** - Optimized layout
- **Mobile** - Touch-friendly controls

## 🚨 Important Notes

### YouTube API Limits

- **Free Tier**: 10,000 requests/day
- **Quota Management**: Implemented in backend
- **Error Handling**: Graceful fallbacks

### yt-dlp Benefits

- **No Rate Limits** - Unlimited streaming
- **High Quality** - Best available audio
- **Global Access** - Works everywhere
- **Legal** - Uses YouTube's public API

### Performance

- **Caching** - Stream URLs cached
- **Optimization** - Efficient search algorithms
- **Loading States** - User feedback

## 🎉 Benefits

✅ **Unlimited Songs** - Access to entire YouTube music library  
✅ **Free to Use** - No licensing fees or subscriptions  
✅ **High Quality** - Best available audio formats  
✅ **Mood-Based** - Smart search by emotion  
✅ **Real-time** - No downloads, instant streaming  
✅ **Global** - Works everywhere YouTube is available  
✅ **Legal** - Uses YouTube's public APIs  
✅ **Modern** - Beautiful, responsive UI

## 🔧 Development

### Backend Structure

```
backend/
├── config/
│   ├── db.js
│   └── config.js
├── controllers/
│   ├── authController.js
│   ├── songController.js
│   └── streamingController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── User.js
│   └── Song.js
├── routes/
│   ├── authRoutes.js
│   ├── songRoutes.js
│   └── streamingRoutes.js
├── services/
│   └── youtubeService.js
└── server.js
```

### Frontend Structure

```
frontend/src/
├── components/
│   ├── StreamingPlayer.js
│   ├── Header.js
│   └── ...
├── services/
│   ├── streamingService.js
│   └── ...
├── pages/
│   ├── Dashboard.js
│   └── ...
└── styles/
    └── ...
```

## 🐛 Troubleshooting

### Common Issues

1. **YouTube API Error**

   - Check API key configuration
   - Verify API quota limits
   - Ensure YouTube Data API v3 is enabled

2. **yt-dlp Error**

   - Update yt-dlp: `npm update yt-dlp-exec`
   - Check internet connection
   - Verify video availability

3. **Streaming Issues**
   - Check CORS configuration
   - Verify authentication token
   - Test with different browsers

### Debug Mode

```bash
# Backend debug
DEBUG=* npm run dev

# Frontend debug
REACT_APP_DEBUG=true npm start
```

## 📄 License

This project is for educational purposes. Please respect YouTube's Terms of Service and API usage guidelines.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:

- Check the troubleshooting section
- Review the API documentation
- Test with different moods and searches

---

**🎵 Enjoy unlimited music streaming with Moodify! 🎵**
"# Moodify_Music_App" 
"# Moodify-Music-App" 
"# Moodify-Music-Web" 
"# Moodify-Music-WebApp" 
"# Moodify-Music-WebApp" 


