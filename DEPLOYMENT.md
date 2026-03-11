# 🚀 WESU TV DEPLOYMENT GUIDE
## FROM YOUR GITHUB TO HOSTINGER VPS PRODUCTION

---

## 📋 **BEFORE YOU START**

**🔧 What You'll Need:**
- **Hostinger VPS** with Ubuntu
- **SSH access** to your VPS
- **Domain name** (optional - can add later)
- **Your GitHub:** `https://github.com/mbyo2/watutv1.git`

**🌐 Domain Flexibility:**
- ✅ **Deploy now with IP address** - no domain required
- ✅ **Add custom domain later** when you purchase one
- ✅ **Both IP and domain** will work simultaneously
- ✅ **Easy SSL setup** when you get your domain

**🚀 Quick Start Options:**
- **Option 1:** Deploy with IP address now (recommended)
- **Option 2:** Wait for domain, then deploy
- **Both options** work perfectly with this guide

---

## 📥 **STEP 1: CONNECT TO HOSTINGER VPS**

```bash
# SSH into your Hostinger VPS
ssh root@your-vps-ip-address

# Verify connection
whoami  # Should show "root"
lsb_release -a  # Check Ubuntu version
```

---

## 📥 **STEP 2: PREPARE SERVER**

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y git curl wget unzip nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify installations
node --version  # v18.x.x
npm --version
```

---

## 📥 **STEP 3: CLONE YOUR REPOSITORY**

```bash
# Navigate to web directory
cd /var/www/

# Clone YOUR WESU TV from GitHub
git clone https://github.com/mbyo2/watutv1.git wesu-tv

# Navigate to project
cd wesu-tv

# Set permissions
chown -R www-data:www-data /var/www/wesu-tv
chmod -R 755 /var/www/wesu-tv

# Verify files
ls -la
# Should show: index.html, package.json, assets/, etc.
```

---

## 📥 **STEP 4: INSTALL DEPENDENCIES**

```bash
# Install project dependencies
cd /var/www/wesu-tv
npm install

# This installs all packages from your package.json:
# - @fontsource/ibm-plex-mono
# - lodash, luxon, medium-zoom
# - video.js and plugins
```

---

## 📥 **STEP 5: BUILD FOR PRODUCTION**

```bash
# Build optimized version
npm run build

# Verify build
ls -la dist/
# Should contain: index.html, assets/, etc.
```

---

## 📥 **STEP 6: CONFIGURE NGINX**

```bash
# Create Nginx config
nano /etc/nginx/sites-available/wesu-tv
```

**📝 Paste this configuration:**
```nginx
server {
    listen 80;
    # Use IP address now, add domain later when you have one
    server_name your-vps-ip-address;  # Replace with your actual VPS IP
    
    # When you get a domain, update this line to:
    # server_name your-domain.com www.your-domain.com your-vps-ip-address;
    
    root /var/www/wesu-tv/dist;
    index index.html;
    
    # Enable compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss+xml application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Main location
    location / {
        try_files $uri $uri/ /index.html;
        
        # CORS for IPTV streams
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, Content-Type";
    }
    
    # Error handling
    error_page 404 /index.html;
    
    # Logging
    access_log /var/log/nginx/wesu-tv.access.log;
    error_log /var/log/nginx/wesu-tv.error.log;
}
```

**🔧 Important Notes:**
- **Replace `your-vps-ip-address`** with your actual VPS IP
- **Keep domain names commented** until you purchase one
- **Easy to add domain later** by just updating the `server_name` line
- **Both IP and domain** will work simultaneously when configured

---

## 📥 **STEP 7: ENABLE SITE**

```bash
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable your site
ln -s /etc/nginx/sites-available/wesu-tv /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Verify status
systemctl status nginx
```

---

## 📥 **STEP 8: CONFIGURE DOMAIN (Optional)**

**🌐 Option A: With Custom Domain**
**If you have a domain name:**
1. **Login to Hostinger Panel**
2. **Go to DNS Settings**
3. **Add A Record:**
   - **Type:** A
   - **Name:** @
   - **Value:** Your VPS IP
   - **TTL:** 3600
4. **Add CNAME Record:**
   - **Type:** CNAME
   - **Name:** www
   - **Value:** your-domain.com
   - **TTL:** 3600

**🌐 Option B: Without Custom Domain (Use VPS IP)**
**If you don't have a domain yet:**
1. **Skip DNS configuration** for now
2. **Use your VPS IP address** directly
3. **Access your site at:** `http://your-vps-ip-address`
4. **Add domain later** when you purchase it

**📋 Update Nginx Config for IP Access:**
```bash
# Edit Nginx config for IP access
nano /etc/nginx/sites-available/wesu-tv

# Change server_name line:
# From: server_name your-domain.com www.your-domain.com;
# To: server_name your-vps-ip-address;

# Or use both for flexibility:
server_name your-vps-ip-address your-domain.com www.your-domain.com;
```

**🔄 Later - When You Get a Domain:**
```bash
# Update Nginx config with domain
nano /etc/nginx/sites-available/wesu-tv

# Change server_name:
server_name your-domain.com www.your-domain.com;

# Test and reload
nginx -t
systemctl reload nginx

# Then configure DNS as shown in Option A
```

---

## 📥 **STEP 9: SECURE WITH SSL (Optional)**

**🔒 Option A: With Custom Domain**
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your actual domain)
certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@example.com --agree-tos --non-interactive

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

**🔒 Option B: Without Custom Domain (Skip SSL for Now)**
```bash
# Skip SSL setup until you get a domain
# SSL certificates require a domain name
# You can add SSL later when you purchase a domain

# For now, your site will work with HTTP:
# http://your-vps-ip-address

# Later - When you get a domain:
# 1. Update Nginx config with domain (see STEP 8)
# 2. Run SSL setup from Option A
# 3. Update any hardcoded HTTP links to HTTPS
```

**🔄 Adding SSL Later:**
```bash
# When you get your domain, simply run:
certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@example.com --agree-tos --non-interactive

# Certbot will automatically:
# - Update Nginx config for HTTPS
# - Set up auto-renewal
# - Configure redirects from HTTP to HTTPS
```

---

## 📥 **STEP 10: FINAL DEPLOYMENT**

```bash
# Restart all services
systemctl restart nginx

# Test your site (choose appropriate URL)
# If you have a domain:
curl -I http://your-domain.com

# If you're using IP address:
curl -I http://your-vps-ip-address

# Check logs
tail -f /var/log/nginx/wesu-tv.access.log
```

**🎯 Your Site is Now Live!**

**🌐 Access Methods:**
- **With Domain:** `http://your-domain.com`
- **Without Domain:** `http://your-vps-ip-address`
- **HTTPS:** `https://your-domain.com` (if SSL configured)

**📱 What Users Will See:**
- **3582+ IPTV channels**
- **YouTube-style player** with quality selection
- **Zambia category** with local channels
- **Kids category** with 174+ channels
- **English category** with 500+ channels
- **Movies category** with 400+ channels
- **Mobile responsive** design
- **All categories** (Sports, News, Music, Religious, Radio, African)

---

## 🔄 **STEP 11: SETUP UPDATES**

```bash
# Create update script
nano /home/update-wesu-tv.sh
```

**📝 Update script content:**
```bash
#!/bin/bash
cd /var/www/wesu-tv
git pull origin main
npm install
npm run build
systemctl reload nginx
echo "WESU TV updated from https://github.com/mbyo2/watutv1.git on $(date)"
```

```bash
# Make executable
chmod +x /home/update-wesu-tv.sh

# Schedule weekly updates
crontab -e
# Add: 0 2 * * 0 /home/update-wesu-tv.sh
```

---

## 🔄 **STEP 12: SYNC GITHUB CHANGES TO PRODUCTION**

### **🌐 Automatic Sync from GitHub**

**📋 When you make changes to your GitHub repository, you need to sync them to production:**

#### **🔧 Method 1: Manual Update**
```bash
# SSH into your VPS
ssh root@your-vps-ip-address

# Navigate to project directory
cd /var/www/wesu-tv

# Pull latest changes from GitHub
git pull origin main

# Install new dependencies (if any)
npm install

# Build for production
npm run build

# Restart Nginx to apply changes
systemctl reload nginx

# Check status
systemctl status nginx
```

#### **🔄 Method 2: Use Update Script**
```bash
# Run the update script we created
/home/update-wesu-tv.sh

# This will automatically:
# - Pull latest changes from GitHub
# - Install dependencies
# - Build for production
# - Restart Nginx
```

#### **⚡ Method 3: Automatic Updates (Recommended)**
```bash
# The cron job we set up will automatically update weekly
# To check if it's running:
crontab -l

# To force an immediate update:
/home/update-wesu-tv.sh

# To see update logs:
tail -f /var/log/wesu-tv-updates.log
```

### **📊 Update Workflow**

**🔄 Typical Update Process:**

1. **Make Changes Locally:**
   ```bash
   # On your development machine
   # Edit files in your project
   # Test changes locally with: npm run dev
   ```

2. **Commit to GitHub:**
   ```bash
   # Add changes
   git add .

   # Commit changes
   git commit -m "Your commit message describing changes"

   # Push to GitHub
   git push origin main
   ```

3. **Deploy to Production:**
   ```bash
   # SSH into VPS
   ssh root@your-vps-ip-address

   # Run update script
   /home/update-wesu-tv.sh

   # Or manual update
   cd /var/www/wesu-tv && git pull origin main && npm install && npm run build && systemctl reload nginx
   ```

### **🔍 Verify Updates**

**📋 Check if Updates Applied:**
```bash
# Check current Git commit
cd /var/www/wesu-tv
git log --oneline -1

# Check build files
ls -la dist/

# Test website
curl -I http://your-domain.com

# Check Nginx status
systemctl status nginx
```

### **⚠️ Troubleshooting Updates**

**🔧 Common Update Issues:**

**Git Pull Fails:**
```bash
# If there are conflicts, reset and pull fresh
cd /var/www/wesu-tv
git reset --hard origin/main
git pull origin main
```

**Build Fails:**
```bash
# Clean build
cd /var/www/wesu-tv
rm -rf node_modules package-lock.json dist/
npm install
npm run build
```

**Nginx Issues:**
```bash
# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx

# Check logs
tail -f /var/log/nginx/wesu-tv.error.log
```

### **🔄 Advanced Sync Options**

#### **🚀 Method 4: Webhook Integration (Advanced)**
```bash
# Create webhook script
nano /home/webhook-update.sh
```

**📝 Webhook script content:**
```bash
#!/bin/bash
# This script can be triggered by GitHub webhooks
cd /var/www/wesu-tv
git pull origin main
npm install
npm run build
systemctl reload nginx
echo "Webhook update completed on $(date)"
```

#### **📱 Method 5: GitHub Actions (Advanced)**
```yaml
# Create .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to server
      run: |
        # SSH commands to update production
        ssh root@your-vps-ip-address "cd /var/www/wesu-tv && git pull origin main && npm install && npm run build && systemctl reload nginx"
```

### **📋 Update Monitoring**

**🔍 Monitor Update Process:**
```bash
# Create update log
mkdir -p /var/log/wesu-tv/

# Update script with logging
nano /home/update-wesu-tv.sh
```

**📝 Enhanced update script with logging:**
```bash
#!/bin/bash
LOG_FILE="/var/log/wesu-tv/updates.log"
echo "===== Update started at $(date) =====" >> $LOG_FILE

cd /var/www/wesu-tv

# Pull changes
echo "Pulling from GitHub..." >> $LOG_FILE
git pull origin main >> $LOG_FILE 2>&1

# Install dependencies
echo "Installing dependencies..." >> $LOG_FILE
npm install >> $LOG_FILE 2>&1

# Build
echo "Building..." >> $LOG_FILE
npm run build >> $LOG_FILE 2>&1

# Restart Nginx
echo "Restarting Nginx..." >> $LOG_FILE
systemctl reload nginx >> $LOG_FILE 2>&1

echo "===== Update completed at $(date) =====" >> $LOG_FILE

# Show last 10 lines of log
tail -n 10 $LOG_FILE
```

### **🎯 Best Practices**

**✅ Recommended Update Workflow:**

1. **Test Locally First**
   - Always test changes locally with `npm run dev`
   - Ensure everything works before pushing

2. **Use Descriptive Commits**
   - Clear commit messages help track changes
   - Example: "Fix channel loading issue" or "Add new category"

3. **Backup Before Updates**
   ```bash
   # Create backup before major updates
   cp -r /var/www/wesu-tv /var/www/wesu-tv-backup-$(date +%Y%m%d)
   ```

4. **Monitor After Updates**
   - Check website functionality
   - Monitor error logs
   - Verify all features work

5. **Rollback if Needed**
   ```bash
   # If update breaks something, rollback
   cd /var/www/wesu-tv
   git log --oneline -10  # See recent commits
   git revert HEAD  # Revert last commit
   npm run build
   systemctl reload nginx
   ```

---

## 🎯 **YOUR WESU TV IS LIVE!**

**🌐 Access Your Site:**
- **HTTP:** `http://your-domain.com`
- **HTTPS:** `https://your-domain.com` (with SSL)

**📱 What Users Get:**
- ✅ **3582+ IPTV channels**
- ✅ **YouTube-style player** with quality selection
- ✅ **Zambia category** with local channels
- ✅ **Kids category** with 174+ channels
- ✅ **English category** with 500+ channels
- ✅ **Movies category** with 400+ channels
- ✅ **Mobile responsive** design
- ✅ **Modern Netflix-style UI**

**🔄 Updates:**
- **Pulls from:** `https://github.com/mbyo2/watutv1.git`
- **Automatic** with cron jobs
- **Zero-downtime** deployments

---

## 🛠️ **TROUBLESHOOTING**

**🔧 Common Issues:**

**Nginx Not Starting:**
```bash
# Check configuration
nginx -t

# View error logs
tail -f /var/log/nginx/error.log

# Restart Nginx
systemctl restart nginx
```

**Build Fails:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Domain Not Working:**
```bash
# Check DNS propagation
nslookup your-domain.com

# Verify Nginx is listening
netstat -tlnp | grep :80
```

**SSL Issues:**
```bash
# Test SSL renewal
certbot renew --dry-run

# Check certificate status
certbot certificates
```

---

## 📊 **MONITORING**

**🔍 Check System Health:**
```bash
# System resources
htop
df -h
free -h

# Nginx logs
tail -f /var/log/nginx/wesu-tv.access.log
tail -f /var/log/nginx/wesu-tv.error.log

# Site accessibility
curl -I https://your-domain.com
```

**📈 Performance Monitoring:**
```bash
# Check response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Monitor concurrent connections
ss -n | awk '{print $1}' | sort | uniq -c | sort -rn
```

---

## 🔄 **MAINTENANCE**

**📅 Regular Tasks:**

**Weekly:**
```bash
# Update system packages
apt update && apt upgrade -y

# Update WESU TV
/home/update-wesu-tv.sh

# Check SSL certificates
certbot certificates
```

**Monthly:**
```bash
# Backup configuration
cp -r /etc/nginx/sites-available/wesu-tv /home/wesu-tv-backup/

# Clean old logs
find /var/log/nginx/ -name "*.log" -mtime +30 -delete
```

---

## 🎉 **DEPLOYMENT COMPLETE!**

**✅ Your WESU TV Features:**
- **Live on Hostinger VPS**
- **Your custom domain**
- **SSL secured**
- **Auto-updating**
- **Production optimized**
- **3582+ channels**
- **YouTube-style player**

**🌟 Your WESU TV is ready for users!**

---

## 📞 **SUPPORT**

**🔗 Helpful Links:**
- **GitHub Repository:** https://github.com/mbyo2/watutv1
- **Hostinger Documentation:** https://support.hostinger.com/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **Node.js Documentation:** https://nodejs.org/docs/

**🐛 Report Issues:**
- **GitHub Issues:** https://github.com/mbyo2/watutv1/issues
- **Email Support:** your-email@example.com

---

## 📜 **LICENSE**

**📄 This project is licensed under the GPL-3.0 License.**
- **See LICENSE file** for details
- **Free to use** and modify
- **Attribution required**

---

## 🌟 **ENJOY YOUR WESU TV!**

**🚀 Deploy now and enjoy your live IPTV platform!**

**Built with ❤️ for Zambia and the world!** 🇿🇲🌍📺
