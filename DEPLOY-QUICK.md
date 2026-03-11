# 🚀 WESU TV ONE-CLICK DEPLOYMENT

## 📋 **EASY DEPLOYMENT - JUST RUN THIS SCRIPT!**

### **🎯 What This Script Does:**
- ✅ **Updates system** packages
- ✅ **Installs Node.js** and Nginx
- ✅ **Clones your GitHub** repository
- ✅ **Installs dependencies** and builds
- ✅ **Configures Nginx** web server
- ✅ **Sets up SSL** (if you have domain)
- ✅ **Configures automatic** updates
- ✅ **Makes your site live** immediately

---

## 🔧 **HOW TO USE**

### **📥 Step 1: Upload Script to VPS**
```bash
# Upload deploy.sh to your VPS home directory
# Using SCP (from your local machine):
scp deploy.sh root@your-vps-ip-address:~/

# Or create directly on VPS:
nano deploy.sh
# Paste the script content and save
```

### **🔧 Step 2: Make Script Executable**
```bash
# SSH into your VPS
ssh root@your-vps-ip-address

# Make script executable
chmod +x deploy.sh
```

### **🚀 Step 3: Run the Script**
```bash
# Run the deployment script
./deploy.sh

# Or if you want to see all output:
bash deploy.sh 2>&1 | tee deployment.log
```

---

## ⚙️ **CONFIGURATION (Optional)**

### **📝 Edit These Values in the Script:**
```bash
# Your GitHub repository (already set)
GITHUB_REPO="https://github.com/mbyo2/watutv1.git"

# Domain name (leave empty if you don't have one yet)
DOMAIN_NAME=""  # e.g., "your-domain.com"

# Your email (for SSL certificate)
YOUR_EMAIL="your-email@example.com"
```

### **🔧 To Edit:**
```bash
# Before running the script:
nano deploy.sh

# Edit the configuration section at the top
# Save with Ctrl+X, then Y, then Enter
```

---

## 🎯 **DEPLOYMENT OPTIONS**

### **🌐 Option 1: Deploy with IP Address (Recommended)**
```bash
# Keep DOMAIN_NAME="" (empty)
# Your site will be accessible at: http://your-vps-ip-address
# Add domain later when you purchase one
```

### **🌐 Option 2: Deploy with Domain**
```bash
# Set DOMAIN_NAME="your-domain.com"
# Set YOUR_EMAIL="your-email@example.com"
# Script will automatically configure SSL
```

---

## 📱 **AFTER DEPLOYMENT**

### **🎉 Your Site Will Be Live At:**
- **With IP:** `http://your-vps-ip-address`
- **With Domain:** `http://your-domain.com` and `https://your-domain.com`

### **📺 What Users Get:**
- **3582+ IPTV channels**
- **YouTube-style player** with quality selection
- **Zambia category** with local channels
- **Kids category** with 174+ channels
- **English category** with 500+ channels
- **Movies category** with 400+ channels
- **Mobile responsive** design

---

## 🔄 **MANAGING YOUR SITE**

### **📊 Check Status:**
```bash
# Check if site is running
systemctl status nginx

# View logs
tail -f /var/log/nginx/wesu-tv.access.log

# Check errors
tail -f /var/log/nginx/wesu-tv.error.log
```

### **🔄 Update Site:**
```bash
# Manual update (when you push changes to GitHub)
/home/update-wesu-tv.sh

# View update logs
tail -f /var/log/wesu-tv/updates.log
```

### **🔧 Restart Services:**
```bash
# Restart Nginx
systemctl restart nginx

# Restart everything
systemctl restart nginx
```

---

## 🌐 **ADDING DOMAIN LATER**

### **📋 If You Deployed with IP First:**
```bash
# Edit Nginx config
nano /etc/nginx/sites-available/wesu-tv

# Find this line:
server_name your-vps-ip-address;

# Change to:
server_name your-domain.com www.your-domain.com your-vps-ip-address;

# Test and reload
nginx -t
systemctl reload nginx

# Add SSL
certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@example.com --agree-tos --non-interactive
```

---

## 🎯 **TROUBLESHOOTING**

### **🔧 Common Issues:**

**Script Fails:**
```bash
# Check what went wrong
bash deploy.sh 2>&1 | tee deployment.log

# Look at the error message and fix
# Most common: missing dependencies or permissions
```

**Site Not Accessible:**
```bash
# Check Nginx status
systemctl status nginx

# Check if Nginx is running
netstat -tlnp | grep :80

# Restart Nginx
systemctl restart nginx
```

**Build Fails:**
```bash
# Check Node.js version
node --version  # Should be v18.x.x

# Rebuild manually
cd /var/www/wesu-tv
npm install
npm run build
```

---

## 🎉 **SUCCESS!**

### **✅ What You Get:**
- **Production-ready** WESU TV
- **Automatic updates** from GitHub
- **SSL certificate** (if domain provided)
- **Optimized** performance
- **Mobile responsive** design
- **3582+ channels** ready for users

### **🌟 Your WESU TV is Live!**

**Just run the script and enjoy your IPTV platform!** 🚀🎬📺

---

## 📞 **SUPPORT**

### **🔗 If You Need Help:**
- **Script Issues:** Check the error messages
- **GitHub Issues:** https://github.com/mbyo2/watutv1/issues
- **Documentation:** See DEPLOYMENT.md for detailed steps

**🎊 Happy Streaming!** 🇿🇲🌟
