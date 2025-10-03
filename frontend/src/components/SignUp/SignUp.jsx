import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./SignUp.css";
import {useNavigate} from "react-router-dom";

const SignUp = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);


  // Form Validation
  const validateForm = () =>{
        if(!email.trim() || !password.trim()){
            toast.error("Email and Password are required. ");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            toast.error("Please enter a valid email address.");
            return false;
        }
        if(password.length < 6){
          toast.error("Password must be at least 6 characters long.");
          return false;
        }
        return true;
  }

  const handleFormSignUp = async (e) => {
    e.preventDefault();

    if(!validateForm()) return;
    try {
      const res = await axios.post(
        "http://localhost:8080/auth/signup",
        { fullName: email.split("@")[0], email, password },
        { withCredentials: true }
      );
      
      if (res.status >= 200 && res.status < 300) {
        // Store the token and user info in localStorage
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        if (res.data.user) {
          localStorage.setItem("userId", res.data.user.id);
          localStorage.setItem("userEmail", res.data.user.email);
          localStorage.setItem("userName", res.data.user.name);
        }
        
        navigate("/dashboard",{ state: { showToast: true } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed. Please try again.");
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
      
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      
      navigate("/", { state: { showSignOutToast: true}});
    } catch (error) {
      toast.error("Sign out failed. Please try again.");
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