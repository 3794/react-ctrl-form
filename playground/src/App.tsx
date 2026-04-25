import { useState, useEffect } from "react";
import { BasicFormTab } from "./tabs/BasicFormTab";
import { ValidationTab } from "./tabs/ValidationTab";
import { AdvancedTab } from "./tabs/AdvancedTab";
import { ContextTab } from "./tabs/ContextTab";

export function App() {
  const [activeTab, setActiveTab] = useState("basic");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="card">
      <div className="header">
        <h1>🎯 react-ctrl-form Demo</h1>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          Basic Form
        </button>
        <button
          className={`tab-button ${activeTab === "validation" ? "active" : ""}`}
          onClick={() => setActiveTab("validation")}
        >
          Validation
        </button>
        <button
          className={`tab-button ${activeTab === "advanced" ? "active" : ""}`}
          onClick={() => setActiveTab("advanced")}
        >
          Advanced
        </button>
        <button
          className={`tab-button ${activeTab === "context" ? "active" : ""}`}
          onClick={() => setActiveTab("context")}
        >
          Context
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "basic" && <BasicFormTab />}
        {activeTab === "validation" && <ValidationTab />}
        {activeTab === "advanced" && <AdvancedTab />}
        {activeTab === "context" && <ContextTab />}
      </div>
    </div>
  );
}
