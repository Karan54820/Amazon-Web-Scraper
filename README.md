# SmartScraper

SmartScraper is a web application that extracts detailed data from Amazon India's smart TV listings, including prices, offers, reviews, and specifications. It streamlines product analysis, helping users make informed decisions effortlessly.

## Features

- Advanced web scraping of Amazon product pages
- Real-time data extraction of product details, prices, and offers
- AI-powered review summarization
- Beautiful, responsive user interface with animations
- Multi-page application with Home, About, Contact, and Scraper pages

## Tech Stack

- **Frontend**: React, Framer Motion, TailwindCSS, Vite
- **Backend**: Node.js, Express, Puppeteer, Puppeteer-Extra with Stealth Plugin
- **AI**: OpenAI/Google Generative AI for review summarization

## Installation

### Prerequisites

- Node.js (version 18 or higher)
- npm (version 8 or higher)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-scraper.git
   cd smart-scraper
   ```

2. Install dependencies for client, server, and root:
   ```bash
   npm run install:all
   ```

3. Create environment files:
   
   For client (.env in client folder):
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
   
   For server (.env in server folder):
   ```
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   You'll need to replace `your_gemini_api_key_here` with your actual Google Gemini API key. You can obtain one from [Google AI Studio](https://makersuite.google.com/).

## Development

To run the application in development mode:

```bash
npm run dev
```

This will start both the client (on port 3000) and server (on port 5000) concurrently.

To run just the client:
```bash
npm run client
```

To run just the server:
```bash
npm run server
```

## Production Deployment

### Build for Production

```bash
npm run build
```

This will create a production build in the `client/build` directory.

### Deployment Options

#### Heroku

1. Create a Heroku account and install the Heroku CLI
2. Create a new Heroku app:
   ```bash
   heroku create your-app-name
   ```
3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
   ```
4. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

#### Other Platforms

The application is configured to work with most cloud platforms like Render, Vercel, or AWS:

1. Set the required environment variables
2. Deploy using the platform's deployment method
3. Ensure the server is running and can handle Puppeteer (headless browser) operations

## License

MIT License 