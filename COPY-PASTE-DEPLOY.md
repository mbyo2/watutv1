# 🚀 WESU TV - COPY & PASTE DEPLOYMENT

## 📋 **EASIEST DEPLOYMENT EVER - JUST COPY & PASTE!**

### **🎯 Step 1: Connect to Your Server**
```bash
# Replace with your actual VPS IP address
ssh root@your-vps-ip-address
```

---

### **🔥 Step 2: Copy & Paste This Command (ALL AT ONCE)**

**Just copy this entire block and paste it into your terminal:**

```bash
# Create deployment script directly on server
cat > deploy-wesu-tv.sh << 'EOF'
#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting WESU TV Deployment...${NC}"

# Update system
echo -e "${GREEN}📋 Updating system...${NC}"
apt update && apt upgrade -y

# Install tools
echo -e "${GREEN}📋 Installing tools...${NC}"
apt install -y git curl wget unzip nginx

# Install Node.js
echo -e "${GREEN}📋 Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Clone repository
echo -e "${GREEN}📋 Cloning your WESU TV...${NC}"
cd /var/www/
git clone https://github.com/mbyo2/watutv1.git wesu-tv
cd wesu-tv

# Set permissions
chown -R www-data:www-data /var/www/wesu-tv
chmod -R 755 /var/www/wesu-tv

# Install dependencies
echo -e "${GREEN}📋 Installing dependencies...${NC}"
npm install

# Build project
echo -e "${GREEN}📋 Building project...${NC}"
npm run build

# Get server IP dynamically
SERVER_IP=$(curl -s ifconfig.me)
echo -e "${BLUE}🌐 Server IP: $SERVER_IP${NC}"

# Create Nginx config
echo -e "${GREEN}📋 Configuring web server...${NC}"
cat > /etc/nginx/sites-available/wesu-tv << 'NGINXEOF'
server {
    listen 80;
    # Server IP will be set automatically
    server_name SERVER_IP_PLACEHOLDER;
    
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
        try_files \$uri \$uri/ /index.html;
        
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
NGINXEOF

# Replace IP placeholder with actual IP
sed -i "s/SERVER_IP_PLACEHOLDER/$SERVER_IP/g" /etc/nginx/sites-available/wesu-tv

# Enable site
rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/wesu-tv /etc/nginx/sites-enabled/

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

# Create update script
echo -e "${GREEN}📋 Setting up automatic updates...${NC}"
cat > /home/update-wesu-tv.sh << 'UPDATEEOF'
#!/bin/bash
cd /var/www/wesu-tv
git pull origin main
npm install
npm run build
systemctl reload nginx
echo "WESU TV updated successfully!"
UPDATEEOF

chmod +x /home/update-wesu-tv.sh
mkdir -p /var/log/wesu-tv/

# Setup weekly updates
(crontab -l 2>/dev/null; echo "0 2 * * 0 /home/update-wesu-tv.sh") | crontab -

echo -e "${GREEN}✅ WESU TV Deployment Complete!${NC}"
echo -e "${BLUE}🌐 Your site is live at: http://$SERVER_IP${NC}"
echo -e "${BLUE}📱 Features: 3582+ channels, YouTube-style player, Zambia-optimized${NC}"
echo -e "${BLUE}🔄 Update anytime with: /home/update-wesu-tv.sh${NC}"
echo -e "${BLUE}🔄 Update logs: /var/log/wesu-tv/updates.log${NC}"
echo ""
echo -e "${GREEN}🚀 ENJOY YOUR WESU TV! 🇿🇲📺🌟${NC}"
echo -e "${GREEN}============================================================================${NC}"
EOF

# Make script executable and run it
chmod +x deploy-wesu-tv.sh
./deploy-wesu-tv.sh
```

---

### **🎉 THAT'S IT! YOUR WESU TV IS NOW LIVE!**

**Your site will be accessible at:**
- **http://your-vps-ip-address** (script will show the IP)

---

## 📱 **WHAT YOU GET:**

✅ **3582+ IPTV channels**  
✅ **YouTube-style player** with quality selection  
✅ **Zambia category** with local channels  
✅ **Kids category** with 174+ channels  
✅ **English category** with 500+ channels  
✅ **Movies category** with 400+ channels  
✅ **Mobile responsive** design  
✅ **Automatic weekly updates**  

---

## 🔄 **FUTURE UPDATES (When You Push Changes to GitHub):**

### **📥 Update Your Site:**
```bash
# SSH into your server and run:
/home/update-wesu-tv.sh
```

---

## 🌐 **ADDING DOMAIN LATER (When You Buy One):**

```bash
# SSH into server and run:
nano /etc/nginx/sites-available/wesu-tv

# Find this line:
server_name YOUR_IP_ADDRESS;

# Change to:
server_name your-domain.com www.your-domain.com YOUR_IP_ADDRESS;

# Save (Ctrl+X, Y, Enter) and run:
nginx -t
systemctl reload nginx

# Add SSL (optional):
certbot --nginx -d your-domain.com -d www.your-domain.com --email your-email@example.com --agree-tos --non-interactive
```

---

## 🎯 **SUCCESS!**

**🚀 Just copy & paste that one command block - everything else is automatic!**

**Your WESU TV will be live in minutes!** 🎬📺🌟

---

## 📞 **IF YOU NEED HELP:**

**🔧 Check Status:**
```bash
systemctl status nginx
```

**📋 View Logs:**
```bash
tail -f /var/log/nginx/wesu-tv.error.log
```

**🔄 Restart:**
```bash
systemctl restart nginx
```

**🎊 Happy Streaming!** 🇿🇲🌟
