/**
 * Complete Authentication UI System
 * All pages: Login, Register, Dashboard, Profile, Forgot Password, Reset Password
 */
function buildPage({ user = null, page = 'login', error = null, success = null } = {}) {
  const isLoggedIn = user && user.id;

  // ============ BASE HTML TEMPLATE ============
  const baseHTML = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${getPageTitle(page, isLoggedIn)}</title>
  
  <style>
    /* ============ RESET & BASE ============ */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    /* ============ CONTAINERS ============ */
    .auth-container {
      width: 100%;
      max-width: 440px;
      animation: fadeIn 0.5s ease;
    }

    .dashboard-container {
      max-width: 600px;
    }

    .card {
      background: rgba(30, 41, 59, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 20px;
      padding: 40px 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease;
    }

    .card:hover {
      transform: translateY(-4px);
    }

    /* ============ ANIMATIONS ============ */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ============ LOGO ============ */
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo h1 {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #818cf8, #6366f1, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }

    .logo p {
      color: #94a3b8;
      font-size: 14px;
      margin-top: 4px;
    }

    /* ============ TYPOGRAPHY ============ */
    h2 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #f8fafc;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 24px;
    }

    /* ============ FORM ELEMENTS ============ */
    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 6px;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 12px 16px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid #334155;
      border-radius: 10px;
      color: #f8fafc;
      font-size: 14px;
      transition: all 0.3s;
      outline: none;
    }

    .form-group input:focus,
    .form-group select:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
      background: rgba(15, 23, 42, 0.8);
    }

    .form-group input::placeholder {
      color: #64748b;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* ============ BUTTONS ============ */
    .btn {
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
    }

    .btn-primary:hover {
      transform: scale(1.02);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
    }

    .btn-secondary {
      background: #334155;
      color: white;
    }

    .btn-secondary:hover {
      background: #475569;
      transform: scale(1.02);
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
      transform: scale(1.02);
    }

    .btn-google {
      background: white;
      color: #0f172a;
      border: 1px solid #e2e8f0;
    }

    .btn-google:hover {
      background: #f1f5f9;
      transform: scale(1.02);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }

    .btn-google svg {
      width: 20px;
      height: 20px;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
      width: auto;
    }

    .btn-block {
      width: 100%;
    }

    /* ============ LINKS ============ */
    .auth-links {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #94a3b8;
    }

    .auth-links a {
      color: #818cf8;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s;
    }

    .auth-links a:hover {
      color: #6366f1;
      text-decoration: underline;
    }

    /* ============ MESSAGES ============ */
    .message {
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 16px;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .message-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .message-success {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #86efac;
    }

    /* ============ DIVIDER ============ */
    .divider {
      display: flex;
      align-items: center;
      margin: 20px 0;
      color: #64748b;
      font-size: 13px;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-top: 1px solid #334155;
    }

    .divider::before {
      margin-right: 16px;
    }

    .divider::after {
      margin-left: 16px;
    }

    /* ============ DASHBOARD SPECIFIC ============ */
    .profile-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 4px solid #6366f1;
      object-fit: cover;
      margin-bottom: 16px;
    }

    .user-name {
      font-size: 24px;
      font-weight: 700;
      color: #f8fafc;
    }

    .user-email {
      color: #94a3b8;
      font-size: 14px;
    }

    .user-badge {
      display: inline-block;
      background: #22c55e;
      color: white;
      font-size: 12px;
      padding: 2px 14px;
      border-radius: 20px;
      margin-top: 8px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 20px 0;
    }

    .stat-card {
      background: rgba(15, 23, 42, 0.6);
      padding: 16px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #334155;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #818cf8;
    }

    .stat-label {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }

    .btn-group {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* ============ RESPONSIVE ============ */
    @media (max-width: 480px) {
      .card {
        padding: 24px 16px;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }
      
      .btn-group {
        flex-direction: column;
      }
      
      .btn-group .btn {
        width: 100%;
      }
    }
  </style>
</head>
<body>

  <div class="auth-container ${isLoggedIn ? 'dashboard-container' : ''}">
    <div class="card">
      
      <!-- ============ LOGO ============ -->
      <div class="logo">
        <h1>🔐 AuthPro</h1>
        <p>${getTagline(page, isLoggedIn, user)}</p>
      </div>

      <!-- ============ MESSAGES ============ -->
      ${error ? `<div class="message message-error">❌ ${error}</div>` : ''}
      ${success ? `<div class="message message-success">✅ ${success}</div>` : ''}

      <!-- ============ PAGE CONTENT ============ -->
      ${content}

    </div>
  </div>

  <script>
    // ============ CLIENT-SIDE VALIDATION ============
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function(e) {
        const password = this.querySelector('input[name="password"]');
        const confirm = this.querySelector('input[name="confirmPassword"]');
        
        if (password && confirm && password.value !== confirm.value) {
          e.preventDefault();
          alert('❌ Passwords do not match!');
          return false;
        }
      });
    });

    // ============ AUTO-HIDE MESSAGES ============
    setTimeout(() => {
      document.querySelectorAll('.message').forEach(msg => {
        msg.style.transition = 'opacity 0.5s';
        msg.style.opacity = '0';
        setTimeout(() => msg.remove(), 500);
      });
    }, 5000);
  </script>

</body>
</html>`;

  // ============ PAGE RENDERER ============
  const pageContent = renderPage();
  return baseHTML(pageContent);

  // ============ PAGE ROUTER ============
  function renderPage() {
    if (isLoggedIn) {
      if (page === 'profile') return renderProfilePage();
      return renderDashboardPage();
    }
    
    switch(page) {
      case 'register': return renderRegisterPage();
      case 'forgot': return renderForgotPasswordPage();
      case 'reset': return renderResetPasswordPage();
      default: return renderLoginPage();
    }
  }

  // ============ LOGIN PAGE ============
  function renderLoginPage() {
    return `
      <h2>Welcome Back</h2>
      <p class="subtitle">Sign in to your account</p>

      <form action="/api/auth/login" method="POST">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" name="email" placeholder="you@example.com" required autofocus />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" placeholder="••••••••" required minlength="6" />
        </div>

        <button type="submit" class="btn btn-primary">Sign In</button>
      </form>

      <div class="divider">or continue with</div>

      <a href="/auth/google" class="btn btn-google">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </a>

      <div class="auth-links">
        Don't have an account? <a href="/register">Create one</a><br />
        <a href="/forgot-password" style="font-size: 13px;">Forgot password?</a>
      </div>
    `;
  }

  // ============ REGISTER PAGE ============
  function renderRegisterPage() {
    return `
      <h2>Create Account</h2>
      <p class="subtitle">Join us today</p>

      <form action="/api/auth/register" method="POST">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" name="fullname" placeholder="John Doe" required minlength="2" maxlength="50" autofocus />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label>Contact</label>
            <input type="tel" name="contact" placeholder="+1234567890" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="••••••••" required minlength="6" />
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" placeholder="••••••••" required minlength="6" />
          </div>
        </div>

        <div class="form-group">
          <label>Account Type</label>
          <select name="isSeller">
            <option value="false">Buyer</option>
            <option value="true">Seller</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary">Create Account</button>
      </form>

      <div class="divider">or</div>

      <a href="/auth/google" class="btn btn-google">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign up with Google
      </a>

      <div class="auth-links">
        Already have an account? <a href="/">Sign in</a>
      </div>
    `;
  }

  // ============ DASHBOARD PAGE ============
  function renderDashboardPage() {
    return `
      <div class="profile-header">
        <img 
          class="avatar" 
          src="${user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=100`}" 
          alt="${user?.name}"
        />
        <div class="user-name">${user?.name || 'User'}</div>
        <div class="user-email">${user?.email || 'No email'}</div>
        <span class="user-badge">✓ Verified Account</span>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${user?.id ? '🆔' : '—'}</div>
          <div class="stat-label">User ID</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${user?.role || 'User'}</div>
          <div class="stat-label">Role</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${user?.googleId ? '🔗' : '📧'}</div>
          <div class="stat-label">${user?.googleId ? 'Google Auth' : 'Email Auth'}</div>
        </div>
      </div>

      <hr class="divider" style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />

      <div class="btn-group">
        <a href="/profile" class="btn btn-secondary btn-sm">👤 View Profile</a>
        <form action="/api/auth/logout" method="POST" style="display:inline;">
          <button type="submit" class="btn btn-danger btn-sm">🚪 Sign Out</button>
        </form>
      </div>

      <div style="margin-top: 12px; text-align: center; font-size: 12px; color: #64748b;">
        Last login: ${new Date().toLocaleString()}
      </div>
    `;
  }

  // ============ PROFILE PAGE ============
  function renderProfilePage() {
    return `
      <h2>👤 My Profile</h2>
      <p class="subtitle">Your account details</p>

      <div style="text-align: center; margin-bottom: 20px;">
        <img 
          class="avatar" 
          src="${user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&size=100`}" 
          alt="${user?.name}"
          style="width: 80px; height: 80px;"
        />
      </div>

      <div style="background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155;">
          <span style="color: #94a3b8;">Full Name</span>
          <span style="font-weight: 600;">${user?.name || 'N/A'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155;">
          <span style="color: #94a3b8;">Email</span>
          <span style="font-weight: 600;">${user?.email || 'N/A'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #334155;">
          <span style="color: #94a3b8;">User ID</span>
          <span style="font-weight: 600; font-size: 12px;">${user?.id || 'N/A'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
          <span style="color: #94a3b8;">Auth Method</span>
          <span style="font-weight: 600;">${user?.googleId ? 'Google OAuth' : 'Email/Password'}</span>
        </div>
      </div>

      <div class="btn-group">
        <a href="/dashboard" class="btn btn-secondary btn-sm">← Back to Dashboard</a>
        <form action="/api/auth/logout" method="POST" style="display:inline;">
          <button type="submit" class="btn btn-danger btn-sm">🚪 Sign Out</button>
        </form>
      </div>
    `;
  }

  // ============ FORGOT PASSWORD PAGE ============
  function renderForgotPasswordPage() {
    return `
      <h2>🔑 Forgot Password</h2>
      <p class="subtitle">We'll send you a reset link</p>

      <form action="/api/auth/forgot-password" method="POST">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" name="email" placeholder="you@example.com" required autofocus />
        </div>

        <button type="submit" class="btn btn-primary">Send Reset Link</button>
      </form>

      <div class="auth-links">
        Remember your password? <a href="/">Sign in</a><br />
        <a href="/register" style="font-size: 13px;">Create new account</a>
      </div>
    `;
  }

  // ============ RESET PASSWORD PAGE ============
  function renderResetPasswordPage() {
    return `
      <h2>🔐 Reset Password</h2>
      <p class="subtitle">Enter your new password</p>

      <form action="/api/auth/reset-password" method="POST">
        <input type="hidden" name="token" value="${new URLSearchParams(window.location.search).get('token') || ''}" />
        
        <div class="form-group">
          <label>New Password</label>
          <input type="password" name="newPassword" placeholder="••••••••" required minlength="6" autofocus />
        </div>

        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" placeholder="••••••••" required minlength="6" />
        </div>

        <button type="submit" class="btn btn-primary">Reset Password</button>
      </form>

      <div class="auth-links">
        <a href="/">Back to Sign in</a>
      </div>
    `;
  }

  // ============ HELPERS ============
  function getPageTitle(page, loggedIn) {
    if (loggedIn) return 'Dashboard - AuthPro';
    const titles = {
      login: 'Sign In - AuthPro',
      register: 'Sign Up - AuthPro',
      forgot: 'Forgot Password - AuthPro',
      reset: 'Reset Password - AuthPro',
    };
    return titles[page] || 'AuthPro';
  }

  function getTagline(page, loggedIn, user) {
    if (loggedIn) return `Welcome back, ${user?.name || 'User'}!`;
    const taglines = {
      login: 'Secure Authentication System',
      register: 'Create your account',
      forgot: 'Reset your password',
      reset: 'Set new password',
    };
    return taglines[page] || 'Authentication System';
  }
}

export default buildPage;