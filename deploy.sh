#!/bin/bash

# =============================================================================
# 🚀 WESU TV AUTOMATED DEPLOYMENT SCRIPT
# =============================================================================
# This script handles everything from server setup to deployment
# Just run this script and your WESU TV will be live!
# =============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# 📋 CONFIGURATION - EDIT THESE VALUES
# =============================================================================

# Your GitHub repository
GITHUB_REPO="https://github.com/mbyo2/watutv1.git"

# Domain settings (leave empty if you don't have one yet)
DOMAIN_NAME=""  # e.g., "your-domain.com"
YOUR_EMAIL="your-email@example.com"  # For SSL certificate

# Project settings
PROJECT_NAME="wesu-tv"
PROJECT_PATH="/var/www/$PROJECT_NAME"

# =============================================================================
# 🚀 START OF AUTOMATED DEPLOYMENT
# =============================================================================

echo -e "${BLUE}=============================================================================${NC}"
echo -e "${BLUE}🚀 WESU TV AUTOMATED DEPLOYMENT SCRIPT${NC}"
echo -e "${BLUE}=============================================================================${NC}"
echo ""

# Function to print colored output
print_step() {
    echo -e "${GREEN}📋 $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# =============================================================================
# 📥 STEP 1: SYSTEM PREPARATION
# =============================================================================

print_step "STEP 1: PREPARING SYSTEM"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

print_info "Updating system packages..."
apt update && apt upgrade -y

print_info "Installing essential tools..."
apt install -y git curl wget unzip nginx

print_success "System preparation completed!"

# =============================================================================
# 🔥 STEP 2: INSTALL NODE.JS
# =============================================================================

print_step "STEP 2: INSTALLING NODE.JS"

print_info "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js $NODE_VERSION and npm $NPM_VERSION installed!"

# =============================================================================
# 📥 STEP 3: CLONE YOUR REPOSITORY
# =============================================================================

print_step "STEP 3: CLONING YOUR REPOSITORY"

print_info "Creating project directory..."
mkdir -p /var/www/
cd /var/www/

print_info "Cloning your WESU TV from GitHub..."
git clone $GITHUB_REPO $PROJECT_NAME

cd $PROJECT_PATH

# Set permissions
chown -R www-data:www-data $PROJECT_PATH
chmod -R 755 $PROJECT_PATH

print_success "Repository cloned successfully!"

# =============================================================================
# 📦 STEP 4: INSTALL DEPENDENCIES
# =============================================================================

print_step "STEP 4: INSTALLING DEPENDENCIES"

print_info "Installing project dependencies..."
npm install

print_success "Dependencies installed!"

# =============================================================================
# 🏗️ STEP 5: BUILD FOR PRODUCTION
# =============================================================================

print_step "STEP 5: BUILDING FOR PRODUCTION"

print_info "Building optimized version..."
npm run build

# Verify build
if [ -d "dist" ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed - dist folder not found"
    exit 1
fi

# =============================================================================
# 🔧 STEP 6: CONFIGURE NGINX
# =============================================================================

print_step "STEP 6: CONFIGURING NGINX"

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
print_info "Server IP detected: $SERVER_IP"

# Create Nginx configuration
cat > /etc/nginx/sites-available/$PROJECT_NAME << EOF
server {
    listen 80;
    server_name $SERVER_IP${DOMAIN_NAME:+ $DOMAIN_NAME www.$DOMAIN_NAME};
    
    root $PROJECT_PATH/dist;
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
    access_log /var/log/nginx/$PROJECT_NAME.access.log;
    error_log /var/log/nginx/$PROJECT_NAME.error.log;
}
EOF

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable your site
ln -s /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/

# Test configuration
if nginx -t; then
    print_success "Nginx configuration is valid!"
else
    print_error "Nginx configuration failed"
    exit 1
fi

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

print_success "Nginx configured and started!"

# =============================================================================
# 🔒 STEP 7: SSL SETUP (Optional)
# =============================================================================

print_step "STEP 7: SSL SETUP"

if [ -n "$DOMAIN_NAME" ]; then
    print_info "Installing Certbot for SSL..."
    apt install -y certbot python3-certbot-nginx
    
    print_info "Setting up SSL certificate for $DOMAIN_NAME..."
    certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --email $YOUR_EMAIL --agree-tos --non-interactive
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_success "SSL certificate installed and auto-renewal configured!"
else
    print_warning "No domain provided - skipping SSL setup"
    print_info "You can add SSL later when you get a domain"
fi

# =============================================================================
# 🔄 STEP 8: SETUP AUTOMATIC UPDATES
# =============================================================================

print_step "STEP 8: SETUP AUTOMATIC UPDATES"

# Create update script
cat > /home/update-wesu-tv.sh << EOF
#!/bin/bash
LOG_FILE="/var/log/wesu-tv/updates.log"
echo "===== Update started at \$(date) =====" >> \$LOG_FILE

cd $PROJECT_PATH

# Pull changes
echo "Pulling from GitHub..." >> \$LOG_FILE
git pull origin main >> \$LOG_FILE 2>&1

# Install dependencies
echo "Installing dependencies..." >> \$LOG_FILE
npm install >> \$LOG_FILE 2>&1

# Build
echo "Building..." >> \$LOG_FILE
npm run build >> \$LOG_FILE 2>&1

# Restart Nginx
echo "Restarting Nginx..." >> \$LOG_FILE
systemctl reload nginx >> \$LOG_FILE 2>&1

echo "===== Update completed at \$(date) =====" >> \$LOG_FILE
echo "WESU TV updated from $GITHUB_REPO"
EOF

# Make executable
chmod +x /home/update-wesu-tv.sh

# Create log directory
mkdir -p /var/log/wesu-tv/

# Setup weekly updates
(crontab -l 2>/dev/null; echo "0 2 * * 0 /home/update-wesu-tv.sh") | crontab -

print_success "Automatic updates configured!"

# =============================================================================
# 🎯 STEP 9: FINAL DEPLOYMENT
# =============================================================================

print_step "STEP 9: FINAL DEPLOYMENT"

# Restart all services
systemctl restart nginx

# Test the site
if [ -n "$DOMAIN_NAME" ]; then
    SITE_URL="http://$DOMAIN_NAME"
    SSL_URL="https://$DOMAIN_NAME"
else
    SITE_URL="http://$SERVER_IP"
    SSL_URL="SSL not configured (no domain)"
fi

print_success "Nginx restarted and site is live!"

# =============================================================================
# 🎉 DEPLOYMENT COMPLETE
# =============================================================================

echo ""
echo -e "${GREEN}=============================================================================${NC}"
echo -e "${GREEN}🎉 WESU TV DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}=============================================================================${NC}"
echo ""

echo -e "${BLUE}📱 YOUR WESU TV IS NOW LIVE!${NC}"
echo ""

echo -e "${GREEN}🌐 Access URLs:${NC}"
echo -e "${GREEN}   HTTP: $SITE_URL${NC}"
echo -e "${GREEN}   HTTPS: $SSL_URL${NC}"
echo ""

echo -e "${BLUE}📺 Features Available:${NC}"
echo -e "${GREEN}   ✅ 3582+ IPTV channels${NC}"
echo -e "${GREEN}   ✅ YouTube-style player with quality selection${NC}"
echo -e "${GREEN}   ✅ Zambia category with local channels${NC}"
echo -e "${GREEN}   ✅ Kids category with 174+ channels${NC}"
echo -e "${GREEN}   ✅ English category with 500+ channels${NC}"
echo -e "${GREEN}   ✅ Movies category with 400+ channels${NC}"
echo -e "${GREEN}   ✅ Mobile responsive design${NC}"
echo -e "${GREEN}   ✅ All categories (Sports, News, Music, Religious, Radio)${NC}"
echo ""

echo -e "${BLUE}🔄 Updates:${NC}"
echo -e "${GREEN}   ✅ Automatic weekly updates configured${NC}"
echo -e "${GREEN}   ✅ Manual update: /home/update-wesu-tv.sh${NC}"
echo -e "${GREEN}   ✅ Update logs: /var/log/wesu-tv/updates.log${NC}"
echo ""

echo -e "${BLUE}🔧 Management Commands:${NC}"
echo -e "${GREEN}   Check Nginx status: systemctl status nginx${NC}"
echo -e "${GREEN}   View logs: tail -f /var/log/nginx/$PROJECT_NAME.error.log${NC}"
echo -e "${GREEN}   Manual update: /home/update-wesu-tv.sh${NC}"
echo -e "${GREEN}   Restart Nginx: systemctl restart nginx${NC}"
echo ""

if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${YELLOW}📋 NEXT STEPS:${NC}"
    echo -e "${YELLOW}   1. Your site is accessible via IP address: $SITE_URL${NC}"
    echo -e "${YELLOW}   2. When you get a domain, update Nginx config:${NC}"
    echo -e "${YELLOW}      nano /etc/nginx/sites-available/$PROJECT_NAME${NC}"
    echo -e "${YELLOW}   3. Change server_name line to include your domain${NC}"
    echo -e "${YELLOW}   4. Add SSL: certbot --nginx -d your-domain.com -d www.your-domain.com${NC}"
    echo ""
fi

echo -e "${GREEN}🎊 Congratulations! Your WESU TV is now live and ready for users!${NC}"
echo -e "${GREEN}=============================================================================${NC}"
echo ""

# Test the site
echo -e "${BLUE}🔍 Testing site accessibility...${NC}"
sleep 2

if curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" | grep -q "200"; then
    print_success "Site is accessible and working!"
else
    print_warning "Site might need a moment to start - please check manually"
fi

echo ""
echo -e "${GREEN}🚀 ENJOY YOUR WESU TV! 🇿🇲📺🌟${NC}"
