import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Coffee } from 'lucide-react';
import type { User } from '../types/pos';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (cleanEmail === 'admin@brewlycoffee.com' && cleanPassword === 'admin123') {
        onLogin({
          id: 'usr-admin-1',
          name: 'Manager Admin',
          email: 'admin@brewlycoffee.com',
          role: 'ADMIN',
        });
      } else if (cleanEmail === 'kasir@brewlycoffee.com' && cleanPassword === 'kasir123') {
        onLogin({
          id: 'usr-kasir-1',
          name: 'Kasir Shift Pagi',
          email: 'kasir@brewlycoffee.com',
          role: 'CASHIER',
        });
      } else {
        setErrorMessage('Email atau kata sandi salah. Harap periksa kembali.');
        setIsLoading(false);
      }
    }, 350);
  };

  return (
    <div className="login-split-container">
      {/* LEFT VISUAL BRAND PANEL (DESKTOP) */}
      <div className="login-left-panel">
        <div className="login-bg-overlay" />
        <img
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&auto=format&fit=crop&q=80"
          alt="Brewly Coffee Shop Visual"
          className="login-bg-image"
        />

        <div className="login-left-content">
          {/* Top Brand Tag */}
          <div className="login-brand-header">
            <div className="login-logo-box">
              <img src="/brewly-logo.svg" alt="Brewly Coffee Logo" className="login-brand-logo" />
            </div>
            <div>
              <h1 className="login-brand-title">Brewly Coffee</h1>
              <span className="login-brand-badge">POS & Management System</span>
            </div>
          </div>

          {/* Center Inspirational Hero Message */}
          <div className="login-hero-message">
            <div className="login-tagline">
              <Coffee size={16} />
              <span>Crafted for Coffee Excellence</span>
            </div>
            <h2 className="login-quote">"Good coffee, better business."</h2>
            <p className="login-subquote">
              Manage products, transactions, inventory, and sales performance in one unified workplace.
            </p>
          </div>

          {/* Bottom Footer Spacer */}
          <div className="login-left-footer" style={{ minHeight: '24px' }} />
        </div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div className="login-right-panel">
        <div className="login-form-wrapper">
          {/* Form Header */}
          <div className="login-header">
            <div className="mobile-brand-logo">
              <img src="/brewly-logo.svg" alt="Brewly Coffee Logo" style={{ height: '42px', width: 'auto' }} />
            </div>
            <h2 className="login-welcome-title">Selamat Datang Kembali</h2>
            <p className="login-welcome-subtitle">Masuk untuk mengelola Brewly Coffee.</p>
          </div>

          {/* Inline Error Alert */}
          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Address Field */}
            <div className="form-group">
              <label className="form-label">Alamat Email</label>
              <div className="input-relative-box">
                <Mail className="input-icon-left" size={18} />
                <input
                  type="email"
                  required
                  placeholder="masukkan@email.com"
                  className="login-input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Kata Sandi</label>
              <div className="input-relative-box">
                <Lock className="input-icon-left" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi"
                  className="login-input-field"
                  style={{ paddingRight: '44px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Non-active Forgot Password Row */}
            <div className="login-options-row">
              <label className="remember-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="custom-checkbox"
                />
                <span>Ingat saya</span>
              </label>

              {/* Placeholder / non-active link for reset password */}
              <span
                className="forgot-password-disabled"
                title="Fitur reset password online belum tersedia. Harap hubungi Admin Store."
              >
                Lupa kata sandi?
              </span>
            </div>

            {/* Primary Submit Button */}
            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="btn-spinner" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* System Footer Note */}
          <div className="login-system-footer">
            <p>Brewly Coffee internal management system.</p>
          </div>
        </div>
      </div>

      {/* Embedded Responsive Scoped Styles */}
      <style>{`
        .login-split-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background-color: #FAF9F6;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif;
          overflow-x: hidden;
        }

        /* Left Visual Panel */
        .login-left-panel {
          width: 44%;
          position: relative;
          background-color: #1A1311;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          overflow: hidden;
          color: #FFFFFF;
        }

        .login-bg-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.38;
          filter: contrast(1.05) brightness(0.9);
          transition: transform 10s ease;
        }

        .login-left-panel:hover .login-bg-image {
          transform: scale(1.03);
        }

        .login-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(26, 19, 17, 0.75) 0%,
            rgba(26, 19, 17, 0.85) 50%,
            rgba(26, 19, 17, 0.96) 100%
          );
          z-index: 1;
        }

        .login-left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .login-brand-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .login-logo-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .login-brand-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .login-brand-title {
          font-size: 22px;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .login-brand-badge {
          font-size: 11px;
          font-weight: 600;
          color: #D4A373;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .login-hero-message {
          margin: 60px 0;
          max-width: 480px;
        }

        .login-tagline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 20px;
          background: rgba(212, 163, 115, 0.15);
          border: 1px solid rgba(212, 163, 115, 0.3);
          color: #E6C5A5;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .login-quote {
          font-size: 36px;
          font-weight: 800;
          line-height: 1.2;
          color: #FFFFFF;
          margin-bottom: 16px;
          letter-spacing: -0.03em;
        }

        .login-subquote {
          font-size: 14.5px;
          line-height: 1.6;
          color: #D1C9C3;
          margin: 0;
          font-weight: 400;
        }

        .login-left-footer {
          display: flex;
          align-items: center;
        }

        .login-footer-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #A89F97;
          font-weight: 500;
        }

        /* Right Form Panel */
        .login-right-panel {
          width: 56%;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background-color: #FFFFFF;
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
        }

        .mobile-brand-logo {
          display: none;
          margin-bottom: 20px;
        }

        .login-header {
          margin-bottom: 32px;
        }

        .login-welcome-title {
          font-size: 28px;
          font-weight: 800;
          color: #1A1311;
          margin: 0 0 8px 0;
          letter-spacing: -0.025em;
        }

        .login-welcome-subtitle {
          font-size: 14px;
          color: #6E6761;
          margin: 0;
          font-weight: 500;
        }

        .login-error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          background-color: #FDF2F2;
          border: 1px solid rgba(153, 27, 27, 0.2);
          color: #991b1b;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
          animation: fadeIn 0.2s ease;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 600;
          color: #2D2A26;
        }

        .input-relative-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon-left {
          position: absolute;
          left: 14px;
          color: #8C8580;
          pointer-events: none;
        }

        .login-input-field {
          width: 100%;
          height: 48px;
          padding-left: 42px;
          padding-right: 14px;
          border-radius: 12px;
          border: 1px solid #E2DFDA;
          background-color: #FAFAFA;
          color: #1A1311;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
        }

        .login-input-field:focus {
          background-color: #FFFFFF;
          border-color: #4B3832;
          box-shadow: 0 0 0 3px rgba(75, 56, 50, 0.12);
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #8C8580;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease;
        }

        .password-toggle-btn:hover {
          color: #4B3832;
        }

        .login-options-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -4px;
        }

        .remember-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #57524E;
          cursor: pointer;
          user-select: none;
        }

        .custom-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #4B3832;
          cursor: pointer;
        }

        .forgot-password-disabled {
          font-size: 13px;
          color: #A8A29E;
          cursor: not-allowed;
          font-weight: 500;
          user-select: none;
          text-decoration: underline;
          text-decoration-style: dotted;
          text-underline-offset: 3px;
        }

        .login-submit-btn {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          border: none;
          background-color: #4B3832;
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 14px rgba(75, 56, 50, 0.22);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: 6px;
        }

        .login-submit-btn:hover:not(:disabled) {
          background-color: #372824;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(75, 56, 50, 0.3);
        }

        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit-btn:disabled {
          opacity: 0.75;
          cursor: wait;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-system-footer {
          margin-top: 36px;
          text-align: center;
        }

        .login-system-footer p {
          font-size: 12px;
          color: #A8A29E;
          margin: 0;
          font-weight: 500;
        }

        /* RESPONSIVE DESIGN (TABLET & MOBILE) */
        @media (max-width: 900px) {
          .login-left-panel {
            display: none;
          }

          .login-right-panel {
            width: 100%;
            padding: 32px 20px;
          }

          .mobile-brand-logo {
            display: flex;
          }

          .login-welcome-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};
