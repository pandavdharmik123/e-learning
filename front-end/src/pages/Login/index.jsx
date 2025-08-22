import React, { useState } from "react";
import { UserOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from "@ant-design/icons";
import "./login.scss";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Please enter a valid email");
    }

    if(!password) {
      setPasswordError("Please enter a password");
    }

    console.log(email, password);
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <div className="signin-left">
          <div className="signin-header">
            <h2>E-Learning</h2>
            <p>Please fill your detail to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="signin-form">
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <UserOutlined className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmailError("");
                    setEmail(e.target.value)
                  }}
                  placeholder="Enter email"
                  className={emailError ? "error" : ""}
                />
              </div>
              {emailError && <div className="error-text">{emailError}</div>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <LockOutlined className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPasswordError("");
                    setPassword(e.target.value)
                  }}
                  placeholder="Enter Password"
                  className={passwordError ? "error" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                </button>
              </div>
              {passwordError && <div className="error-text">{passwordError}</div>}
            </div>

            <div className="forgot">
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="signup">
              <span>Don't have an account? </span>
              <a href="#">Sign up</a>
            </div>
          </form>
        </div>

        <div className="signin-right">
          <div className="branding">
            <div className="logo-wrapper">
              <div className="logo">
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <path d="M25 12.5L15 7.5L5 12.5L15 17.5L25 12.5Z" fill="white"/>
                  <path d="M25 17.5L15 12.5L5 17.5L15 22.5L25 17.5Z" fill="white" opacity="0.7"/>
                  <circle cx="23" cy="8" r="3" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="decor-circle circle1"></div>
          <div className="decor-circle circle2"></div>
          <div className="decor-circle circle3"></div>
          <div className="overlay"></div>
        </div>
      </div>
    </div>
  );
}