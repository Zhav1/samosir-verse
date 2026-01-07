---
description: Deploy Samosir 360 to Vercel with custom domain setup
---

# Deploy to Vercel

This workflow guides you through deploying Samosir 360 to Vercel and connecting a custom domain.

## Prerequisites

- GitHub account connected to Vercel
- Your custom domain ready
- Access to your domain registrar's DNS settings

---

## Phase 1: Verify Build Locally

// turbo
1. Run the build command to ensure no errors:
```bash
npm run build
```

2. If build succeeds, you'll see output like:
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
```

---

## Phase 2: Push to GitHub

// turbo
3. Initialize git and push to GitHub (if not already):
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Phase 3: Deploy on Vercel

4. Go to [vercel.com](https://vercel.com) and sign in with GitHub

5. Click **"Add New Project"** → **"Import Git Repository"**

6. Select your `samosir-verse` repository

7. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

8. Add Environment Variables (click "Environment Variables" section):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wkhifdtasdmhsowkvgwy.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(your regenerated key)* |
| `GROQ_API_KEY` | *(your regenerated key)* |

9. Click **"Deploy"** and wait ~2-3 minutes

---

## Phase 4: Connect Custom Domain

10. After deployment, go to **Project Dashboard → Settings → Domains**

11. Enter your domain (e.g., `samosir360.com` or `yourdomain.com`)

12. Vercel will show DNS configuration instructions. Add these at your registrar:

### For Root Domain (@):
| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |

### For WWW Subdomain:
| Type | Name | Value |
|------|------|-------|
| CNAME | www | cname.vercel-dns.com |

13. Wait for DNS propagation (5 min - 48 hours, usually ~30 min)

14. Vercel auto-provisions free SSL certificate ✅

---

## Phase 5: Update Supabase CORS (If Needed)

15. Go to [Supabase Dashboard](https://supabase.com/dashboard)

16. Select your project → **Settings → API**

17. Under "Additional Redirect URLs", add:
    - `https://yourdomain.com/**`
    - `https://www.yourdomain.com/**`

---

## Verification Checklist

- [ ] Site loads at `https://yourdomain.com`
- [ ] 3D island renders with glowmarks
- [ ] 360° panoramas load correctly
- [ ] AI Opung chat responds
- [ ] Marketplace items display
- [ ] Mobile view works

---

## Troubleshooting

### Build Fails on Vercel
- Check Vercel build logs for errors
- Ensure all env vars are set correctly
- Run `npm run build` locally to reproduce

### 3D Model Not Loading
- Verify `public/models/samosir.glb` is committed to git
- Check browser console for 404 errors

### Environment Variables Not Working
- Verify names match exactly (case-sensitive)
- Redeploy after adding new vars

### Domain Not Connecting
- DNS propagation takes time, wait 30+ minutes
- Use [dnschecker.org](https://dnschecker.org) to verify propagation
