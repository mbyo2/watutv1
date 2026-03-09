# 🚀 WESU TV DEPLOYMENT GUIDE
## FROM YOUR GITHUB TO HOSTINGER VPS PRODUCTION

---

## 📋 **BEFORE YOU START**

**🔧 What You'll Need:**
- **Hostinger VPS** with Ubuntu
- **SSH access** to your VPS
- **Domain name** pointing to Hostinger
- **Your GitHub:** `https://github.com/mbyo2/watutv1.git`

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
    server_name your-domain.com www.your-domain.com;
    
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

## 📥 **STEP 8: CONFIGURE DOMAIN**

**🌐 In Hostinger Panel:**
1. **Login to Hostinger**
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

---

## 📥 **STEP 9: SECURE WITH SSL**

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@example.com --agree-tos --non-interactive

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📥 **STEP 10: FINAL DEPLOYMENT**

```bash
# Restart all services
systemctl restart nginx

# Test your site
curl -I http://your-domain.com

# Check logs
tail -f /var/log/nginx/wesu-tv.access.log
```

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
