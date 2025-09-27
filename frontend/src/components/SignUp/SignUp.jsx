import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./SignUp.css";

const SignUp = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleFormSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8080/auth/signup",
        { fullName: email.split("@")[0], email, password },
        { withCredentials: true }
      );
      if (res.status >= 200 && res.status < 300) {
        toast.success("Signup successful! Welcome aboard", {
          position: "top-center",
          autoClose: 8000,
        });
        setIsSignedIn(true);
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again.",
        { position: "top-center", autoClose: 8000 }
      );
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:8080/auth/google";
  };

  const handleSignOut = async () => {
    try {
      await axios.get(
        "http://localhost:8080/auth/logout",
        {},
        { withCredentials: true }
      );
      toast.success("Signed out successfully!", {
        position: "top-center",
        autoClose: 8000,
      });
      setIsSignedIn(false);
    } catch (error) {
      toast.error("Sign out failed. Please try again.", {
        position: "top-center",
        autoClose: 8000,
      });
    }
  };

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-title"
    >
      <div className="signup-card">
        <button
          className="close-btn"
          aria-label="Close Sign Up form"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 id="signup-title">Welcome to Work Life Balancer</h2>
        <p className="sub-text">
          {isSignedIn
            ? "You are signed in"
            : "Sign up to start your journey with us"}
        </p>

        {!isSignedIn ? (
          <>
            <form
              className="signup-form"
              onSubmit={handleFormSignUp}
              noValidate
            >
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <span className="forgot-link" tabIndex={0}>
                Forgot Password?
              </span>
              <button type="submit" className="btn-primary-custom">
                Sign Up
              </button>
            </form>

            <div className="or-divider">Or</div>

            <button
              onClick={handleGoogleSignUp}
              className="google-btn"
              type="button"
            >
              <img
                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                alt="Google logo"
                className="google-logo"
                aria-hidden="true"
              />
              Sign up with Google
            </button>
          </>
        ) : (
          <button onClick={handleSignOut} className="btn-primary-custom">
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default SignUp;