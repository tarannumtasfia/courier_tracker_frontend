import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("https://courier-tracker-backend-x3hy.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch {
      setError("Login error");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("https://courier-tracker-backend-x3hy.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }
      alert("Registration successful! Please login.");
      setIsRegistering(false);
      setUsername("");
      setPassword("");
    } catch {
      setError("Registration error");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 flex flex-col justify-center items-center px-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
          <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>

          <form
            onSubmit={isRegistering ? handleRegister : handleLogin}
            className="flex flex-col gap-5"
          >
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="border border-gray-300 rounded-md p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 rounded-md p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md py-3 transition"
            >
              {isRegistering ? "Register" : "Login"}
            </button>
          </form>

          {error && (
            <p className="text-red-600 mt-4 text-center font-medium">{error}</p>
          )}

          <p className="mt-6 text-center text-gray-600">
            {isRegistering ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setIsRegistering(false);
                    setError("");
                  }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setIsRegistering(true);
                    setError("");
                  }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Register
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Aamira Package Tracker</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition"
        >
          Logout
        </button>
      </header>
      <main className="p-6 bg-gray-50 min-h-screen">
        <Dashboard />
      </main>
    </>
  );
}

export default App;
