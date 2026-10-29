const express = require("express");
const jwt = require("jsonwebtoken");
const supabase = require("../supabaseClient");
const { createAuthClient } = require("../supabaseClient");
const { JWT_SECRET, requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /auth/register : Register a new user
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  try {
    let user = null;
    let userName = name?.trim() || "Kitchen Chef";
    const cleanEmail = email.trim().toLowerCase();

    // Prefer admin.createUser with email_confirm: true to avoid SMTP rate limits & email delay
    try {
      if (supabase.auth.admin?.createUser) {
        const adminRes = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: { name: userName },
        });

        if (!adminRes.error && adminRes.data?.user) {
          user = adminRes.data.user;
        } else if (adminRes.error && adminRes.error.message?.includes("already been registered")) {
          return res.status(400).json({ error: "An account with this email already exists" });
        }
      }
    } catch (adminErr) {
      console.warn("admin.createUser skipped/failed, falling back to signUp:", adminErr.message);
    }

    // Fallback to standard signUp if admin create didn't resolve
    if (!user) {
      const authClient = createAuthClient();
      const { data, error } = await authClient.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { name: userName },
        },
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }
      user = data.user;
    }

    if (!user) {
      return res.status(400).json({ error: "Failed to create user account" });
    }

    userName = user.user_metadata?.name || userName;

    const token = jwt.sign(
      { id: user.id, email: user.email, name: userName },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      ok: true,
      user: { id: user.id, email: user.email, name: userName },
      token,
      message: "Account created successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/login : Authenticate user and return JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const authClient = createAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message || "Invalid email or password" });
    }

    const user = data.user;
    const userName = user.user_metadata?.name || "Kitchen Chef";

    const token = jwt.sign(
      { id: user.id, email: user.email, name: userName },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      ok: true,
      user: { id: user.id, email: user.email, name: userName },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /auth/google : Start Google OAuth flow
router.get("/google", async (req, res) => {
  const redirectTo = req.query.redirect_to || "http://localhost:3000";
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ ok: true, url: data.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /auth/oauth-callback : Handle OAuth access_token or code
router.post("/oauth-callback", async (req, res) => {
  const { access_token, code } = req.body;

  if (!access_token && !code) {
    return res.status(400).json({ error: "access_token or code is required" });
  }

  try {
    let user = null;
    const authClient = createAuthClient();

    if (access_token) {
      const { data, error } = await authClient.auth.getUser(access_token);
      if (error || !data?.user) {
        return res.status(401).json({ error: error?.message || "Invalid OAuth access token" });
      }
      user = data.user;
    } else if (code) {
      const { data, error } = await authClient.auth.exchangeCodeForSession(code);
      if (error || !data?.user) {
        return res.status(401).json({ error: error?.message || "Failed to exchange auth code" });
      }
      user = data.user;
    }

    const userName = user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split("@")[0] : "Kitchen Chef");
    const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    const token = jwt.sign(
      { id: user.id, email: user.email, name: userName, avatar: userAvatar },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      ok: true,
      user: { id: user.id, email: user.email, name: userName, avatar: userAvatar },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /auth/me : Get currently authenticated user details
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
