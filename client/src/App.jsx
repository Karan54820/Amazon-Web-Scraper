import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Scraper from "./pages/Scraper";
import Navbar from "./components/Navbar";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Circle from "./components/Circle";

export default function App() {
  const [showCircle, setShowCircle] = useState(true); // State to control Circle visibility

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/scraper"
          element={<Scraper setShowCircle={setShowCircle} />} // Pass setShowCircle to Scraper
        />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      {showCircle && <Circle />} {/* Conditionally render Circle */}
    </Router>
  );
}