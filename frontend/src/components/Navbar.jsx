import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Navbar.css";
import SignUp from "./../components/SignUp/SignUp";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("http://localhost:8080/auth/verify", {
          withCredentials: true,
        });
        if (res.data.registered) setUser(res.data.user);
        else setUser(null);
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8080/auth/logout", {
        withCredentials: true,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      setDropdownOpen(false);
    }
  };

  return (
    <>
      <nav className="navbar-custom">
        <a className="brand-name" href="/">
          Work Life Balancer
        </a>
        <div className="nav-items">
          <a className="nav-link-custom" href="#tasks">
            Tasks
          </a>
          <a className="nav-link-custom" href="#mood-check">
            Mood Check
          </a>
          <a className="nav-link-custom" href="/dashboard">
            Dashboard
          </a>

          {!user ? (
            <button
              className="signup-button"
              onClick={() => setShowSignup(true)}
            >
              Sign Up
            </button>
          ) : (
            <div style={{ position: "relative" }}>
              <div
                className="avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              {dropdownOpen && (
                <div className="profile-signout-card">
                  <button
                    className="close-cross"
                    onClick={() => setDropdownOpen(false)}
                    aria-label="Close dropdown"
                  >
                    &times;
                  </button>

                  <div className="profile-avatar-circle">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>

                  <button className="signout-row" onClick={handleLogout}>
                    <svg
                      className="signout-icon"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M17 16.59V15h-4v-2h4V9.41L20.59 13 17 16.59zM5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3h-2V7H5v10h7v-3h2v3a2 2 0 0 1-2 2H5z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {showSignup && (
        <SignUp
          onClose={() => setShowSignup(false)}
          onSuccess={() => setUser({})}
        />
      )}
    </>
  );
};

export default Navbar;
