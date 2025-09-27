import React from "react";
import Navbar from "./../Navbar";
import { useEffect } from "react";
import { toast } from "react-toastify";
import "./LandingPage.css";

const LandingPage = () => {
  useEffect(() => {
    // Check for a success message from Google OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("google_signup_success")) {
      toast.success("Google Sign Up successful! Welcome aboard", {
        position: "top-center",
        autoClose: 8000,
      });

      // Clear the URL to prevent the toast from showing on every refresh
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);



  return (
    <>
      <Navbar />
      <main className="content-wrapper" role="main">
        <section className="text-container" aria-label="Welcome Text">
          <h1 className="welcome-title">Welcome to Work Life Balancer</h1>
          <p className="welcome-subtitle">
            Discover the power of balancing your professional tasks with your
            mood and well-being. A healthy work-life balance leads to increased
            productivity, happiness, and long-term success.
          </p>
        </section>

        <section
          className="image-container"
          aria-label="Work Life Balancer Illustration"
        >
          <img
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
            alt="Illustration representing work life balance"
            draggable={false}
          />
        </section>
      </main>
    </>
  );
};

export default LandingPage;
