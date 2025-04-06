# Amazon Web Scraper

A full-stack web application that allows users to scrape and analyze product data from Amazon. Built with React for the frontend and Express.js for the backend.

## Features

- Real-time web scraping of Amazon product data
- Modern and responsive user interface
- RESTful API endpoints for data retrieval
- Concurrent server and client development setup
- Environment variable configuration for secure data handling

## Tech Stack

### Frontend
- React.js
- Vite
- Modern UI components
- Responsive design

### Backend
- Node.js
- Express.js
- Web scraping capabilities
- RESTful API architecture

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd amazon-web-scraper
```

2. Install all dependencies (both client and server):
```bash
npm run install:all
```

3. Set up environment variables:
   - Create a `.env` file in the server directory
   - Add necessary environment variables (see `.env.example` for reference)

## Running the Application

### Development Mode

To run both client and server concurrently in development mode:
```bash
npm start
```

This will start:
- Frontend at `http://localhost:5173`
- Backend at `http://localhost:3000`

### Running Separately

To run the client and server separately:

```bash
# Run the client
npm run client

# Run the server
npm run server
```

## Project Structure

```
amazon-web-scraper/
├── client/                 # Frontend React application
│   ├── src/               # Source files
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
├── server/                # Backend Express application
│   ├── utils/            # Utility functions
│   ├── public/           # Static files
│   └── server.js         # Main server file
├── package.json          # Root package.json
└── README.md            # Project documentation
```

