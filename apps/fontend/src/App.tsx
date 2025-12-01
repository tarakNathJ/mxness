import { useState } from "react";
import "./App.css";
import { LandingPage } from "./components/LandingPage.jsx";
import { ThemeProvider } from "./components/ThemeProvider.js";
import { Routes, Route } from "react-router-dom";
import { AuthPage } from "./components/AuthPage.jsx";

import { Layout } from "./components/Layout.jsx";

import { PortfolioPage } from "./components/PortfolioPage.jsx";
import { TradePage } from "./components/TradePage.jsx";

type Page =
  | "landing"
  | "login"
  | "signup"
  | "dashboard"
  | "markets"
  | "portfolio"
  | "trade"
  | "settings";
function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };
  return (
    <>
      <ThemeProvider>
        <Layout currentPage={currentPage} onNavigate={handleNavigate}>
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage
                  onNavigate={function (page: string): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <AuthPage
                  onNavigate={function (page: string): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              }
            />
            <Route
              path="/login"
              element={
                <AuthPage
                  onNavigate={function (page: string): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              }
            />
            
            
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/trade" element={<TradePage />} />
          </Routes>
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default App;
