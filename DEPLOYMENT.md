# 🚀 Bihar Ka Swaad — Hostinger Deployment Guide

**Domain**: `biharkaswaad.com` | **Stack**: MERN | **Host**: Hostinger Business (Web Apps)

---

## Architecture (What Gets Deployed)

```
biharkaswaad.com
  └── Hostinger Node.js Web App
        ├── GET /           → server/public/index.html (React SPA)
        ├── GET /products   → server/public/index.html (React SPA)
        ├── GET /api/*      → Express.js API
        └── MongoDB Atlas   → External cloud database
```

Everything runs on **one Hostinger Web App** — the Node.js server serves both the API and the React frontend.

---

## Step 1: Push Code to GitHub

> The `.gitignore` is already set up to exclude all `.env` files. Never commit real credentials.

```bash
# From project root (ecommmerce_mern/)
git init
git add .
git commit -m "Initial commit — production ready"

# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/biharkaswaad.git
git push -u origin main
```

---

## Step 2: MongoDB Atlas — Whitelist Hostinger IPs

1. Log in to https://cloud.mongodb.com
2. Go to **Network Access** → **Add IP Address**
3. Click **Allow Access from Anywhere** (`0.0.0.0/0`) — Hostinger uses dynamic IPs
4. Make sure your cluster is **Active** (not paused)
5. Copy your connection string:
   ```
   mongodb+srv://adityapandeyadu_db_user:PASSWORD@cluster0.8sq0xyx.mongodb.net/ecommerce?retryWrites=true&w=majority
   ```

---

## Step 3: Create Web App on Hostinger hPanel

1. Log in to https://hpanel.hostinger.com
2. Go to **Websites** → **Add Website** → Select `biharkaswaad.com`
3. Choose **Node.js** as the project type
4. Click **Connect GitHub** → Authorize Hostinger → Select your repository
5. Set the **branch** to `main`

---

## Step 4: Configure Build & Start Commands

In the Hostinger Web App settings panel:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Node.js Version** | `20.x` |
| **Root Directory** | `/` (project root) |

---

## Step 5: Set Environment Variables

In hPanel → Your Web App → **Environment Variables**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | Your full Atlas connection string with real password |
| `JWT_SECRET` | A long random string (32+ chars) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://biharkaswaad.com` |
| `RAZORPAY_KEY_ID` | Your live Razorpay Key ID (`rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | Your live Razorpay Key Secret |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASSWORD` | Your Gmail App Password |
| `EMAIL_FROM` | `noreply@biharkaswaad.com` |

---

## Step 6: Update Razorpay Dashboard

1. Log in to https://dashboard.razorpay.com
2. Go to **Settings** → **Website & App**
3. Add `https://biharkaswaad.com` as an allowed domain

---

## Step 7: Deploy!

1. hPanel → Your Web App → Click **Deploy**
2. Watch the build logs
3. Visit `https://biharkaswaad.com/api/test`
   - Should return: `{"message":"Server is running!","environment":"production"}`

---

## Verification Checklist

- [ ] `https://biharkaswaad.com` — Homepage loads
- [ ] `https://biharkaswaad.com/api/test` — API health check passes
- [ ] Products page loads with real data
- [ ] Sign Up / Log In works
- [ ] Add to Cart works
- [ ] Wishlist works
- [ ] Razorpay checkout works
- [ ] Admin Dashboard at `/dashboard`
- [ ] Contact form sends email
- [ ] HTTPS is active (green padlock)

---

## Updating the App Later

With GitHub auto-deploy: every `git push` triggers automatic redeploy.
Manual: hPanel → Your Web App → **Redeploy**

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Cannot connect to MongoDB | Check Atlas IP whitelist + MONGODB_URI env var |
| CORS error in browser | Verify `CLIENT_URL=https://biharkaswaad.com` in env vars |
| 404 on page refresh | Server serves index.html for all non-API routes (already configured) |
| Payment failed | Use `rzp_live_` keys, add domain to Razorpay dashboard |
| Build fails | Check Hostinger build logs, ensure Node 20.x is selected |
| White screen | Check browser console; likely REACT_APP_API_URL missing in build |

---

## Local Development

```bash
# Terminal 1 — Backend
cd server && npm run dev   # port 5000

# Terminal 2 — Frontend
cd client && npm start     # port 3000
```
