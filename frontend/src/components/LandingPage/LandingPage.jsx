import React from "react";
import Navbar from "./../Navbar";
import { useEffect } from "react";
import { toast } from "react-toastify";
import "./LandingPage.css";
import { useLocation } from "react-router-dom";

const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    if(location.state?.showSignOutToast){
      toast.success("Signed out successfully");
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);


  return (
    <>
      <Navbar />
      <main className="content-wrapper" role="main">
        <section className="text-container" aria-label="Welcome Text">
          <h1 className="welcome-title">Welcome to Work Life Balancer</h1>
          <p className="welcome-subtitle subtitle-start">
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
