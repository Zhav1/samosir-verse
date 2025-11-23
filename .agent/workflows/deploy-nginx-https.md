---
description: Deploy to VPS with Nginx and HTTPS
---

# Deploying Samosir 360 to VPS with Nginx and HTTPS

This workflow guides you through deploying the Next.js application to a VPS with Nginx as a reverse proxy and HTTPS enabled.

## Prerequisites

- VPS with Ubuntu/Debian (or similar Linux distribution)
- Domain name pointed to your VPS IP address
- SSH access to your VPS
- `root` or `sudo` privileges

## Step 1: Prepare Your VPS

SSH into your VPS and update the system:

```bash
sudo apt update && sudo apt upgrade -y
```

## Step 2: Install Node.js (v18 or higher)

```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

## Step 3: Install Nginx

```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

## Step 4: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## Step 5: Create Application Directory

```bash
# Create directory for your app
sudo mkdir -p /var/www/samosir-verse
sudo chown -R $USER:$USER /var/www/samosir-verse
cd /var/www/samosir-verse
```

## Step 6: Transfer Files to VPS

From your **local machine**, build and transfer your application:

### Option A: Using Git (Recommended)

If your project is in a Git repository:

```bash
# On VPS
cd /var/www/samosir-verse
git clone <your-repository-url> .
npm install
```

### Option B: Using SCP/SFTP

From your local machine:

```bash
# Build the application first
npm run build

# Transfer files (adjust paths and server details)
scp -r .next package.json package-lock.json public src next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs user@your-vps-ip:/var/www/samosir-verse/
```

## Step 7: Set Up Environment Variables

On your VPS, create the `.env.local` file:

```bash
cd /var/www/samosir-verse
nano .env.local
```

Add your production environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

## Step 8: Install Dependencies and Build

```bash
cd /var/www/samosir-verse
npm install
npm run build
```

## Step 9: Start Application with PM2

```bash
cd /var/www/samosir-verse
pm2 start npm --name "samosir-verse" -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup
# Follow the command output instructions
```

## Step 10: Configure Nginx

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/samosir-verse
```

Add the following configuration (replace `your-domain.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect all HTTP traffic to HTTPS (will be configured later)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for large file uploads
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }

    # Handle Next.js static files
    location /_next/static {
        alias /var/www/samosir-verse/.next/static;
        expires 365d;
        access_log off;
    }

    # Handle public files
    location /public {
        alias /var/www/samosir-verse/public;
        expires 30d;
        access_log off;
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/samosir-verse /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Step 11: Install SSL Certificate with Let's Encrypt

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain and install SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

Certbot will automatically modify your Nginx configuration to enable HTTPS.

## Step 12: Set Up Auto-Renewal

Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

The renewal is automatically set up via systemd timer. Verify it:

```bash
sudo systemctl status certbot.timer
```

## Step 13: Configure Firewall

If you're using UFW:

```bash
# Allow Nginx
sudo ufw allow 'Nginx Full'

# Allow SSH (if not already allowed)
sudo ufw allow OpenSSH

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Step 14: Verify Deployment

1. Visit `https://your-domain.com` in your browser
2. Check PM2 status: `pm2 status`
3. View logs: `pm2 logs samosir-verse`
4. Monitor Nginx logs:
   - Access log: `sudo tail -f /var/nginx/access.log`
   - Error log: `sudo tail -f /var/nginx/error.log`

## Useful PM2 Commands

```bash
# View logs
pm2 logs samosir-verse

# Restart application
pm2 restart samosir-verse

# Stop application
pm2 stop samosir-verse

# View application status
pm2 status

# Monitor resources
pm2 monit
```

## Updating Your Application

To update your application:

```bash
# Pull latest changes (if using Git)
cd /var/www/samosir-verse
git pull

# Install dependencies (if package.json changed)
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart samosir-verse
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Nginx Configuration Errors

```bash
# Test configuration
sudo nginx -t

# View error log
sudo tail -f /var/nginx/error.log
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs samosir-verse --lines 100

# Restart PM2
pm2 restart samosir-verse
```

## Performance Optimization (Optional)

### Enable Gzip Compression in Nginx

Edit `/etc/nginx/nginx.conf`:

```nginx
http {
    # ... existing config ...
    
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
```

Reload Nginx:

```bash
sudo systemctl reload nginx
```

### Set Up Nginx Caching

Add to your Nginx server block:

```nginx
# Cache settings
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;

server {
    # ... existing config ...
    
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://localhost:3000;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

## Security Best Practices

1. **Keep system updated**: `sudo apt update && sudo apt upgrade`
2. **Use strong SSH keys**: Disable password authentication
3. **Configure fail2ban**: Protect against brute-force attacks
4. **Regular backups**: Back up your application and database
5. **Monitor logs**: Regularly check application and system logs
6. **Use environment variables**: Never commit secrets to Git

## Next Steps

- Set up automated backups
- Configure monitoring (e.g., UptimeRobot, New Relic)
- Set up CI/CD pipeline for automated deployments
- Configure CDN for static assets (e.g., Cloudflare)
