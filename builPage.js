/**
 * Simple page builder function.
 * Generates clean HTML dynamically depending on whether the user is logged in.
 */
function buildPage({ user = null } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Google Auth Demo</title>
  
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background-color: #0f172a; /* Slate 900 */
      color: #f8fafc; /* Slate 50 */
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }

    .card {
      background-color: #1e293b; /* Slate 800 */
      border: 1px solid #334155; /* Slate 700 */
      border-radius: 16px;
      padding: 36px 32px;
      width: 100%;
      max-width: 380px;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }

    h1 {
      font-size: 24px;
      margin: 0 0 10px 0;
      font-weight: 700;
    }

    p {
      color: #94a3b8; /* Slate 400 */
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 24px 0;
    }

    .btn-google {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background-color: #ffffff;
      color: #0f172a;
      text-decoration: none;
      font-weight: 600;
      padding: 12px 20px;
      border-radius: 8px;
      width: 100%;
      box-sizing: border-box;
      transition: background-color 0.2s;
    }

    .btn-google:hover {
      background-color: #f1f5f9; /* Slate 100 */
    }

    .btn-google svg {
      width: 18px;
      height: 18px;
    }

    .avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      margin-bottom: 16px;
      border: 3px solid #6366f1; /* Indigo 500 */
    }

    .btn-logout {
      display: inline-block;
      color: #94a3b8;
      text-decoration: none;
      font-size: 13px;
      border: 1px solid #475569;
      padding: 8px 16px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .btn-logout:hover {
      color: #ef4444; /* Red 500 */
      border-color: #ef4444;
    }
  </style>
</head>
<body>

  <div class="card">
    ${!user ? `
      <!-- STATE 1: SIGNED OUT - SHOW LOGIN BOX -->
      <h1>Continue with Google</h1>
      <p>Sign in with your Google account to proceed to the next page.</p>
      
      <a href="/auth/google" class="btn-google">
        <!-- Google "G" SVG Icon -->
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </a>
    ` : `
      <!-- STATE 2: SIGNED IN - SHOW PROFILE PAGE -->
      <img class="avatar" src="${user.photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}" alt="Google Avatar">
      <h1>Welcome, ${user.name}!</h1>
      <p>${user.email}</p>
      
      <a href="/" class="btn-logout">Sign Out</a>
    `}
  </div>

</body>
</html>`;
}

export default buildPage;