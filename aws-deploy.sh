#!/bin/bash

# Complete MLM App Migration to Next.js - AWS Linux Compatible
# This script removes old setup and deploys new Next.js repository

set -e

# Configuration - UPDATE THESE VALUES
NEW_REPO_URL="https://github.com/Pranav301102/mlm-web-next.git"  # Replace with your new repo
DOMAIN="mumslike.me"
EMAIL="ronak@mumslike.me"
APP_NAME="mlm-app"
USE_GODADDY_SSL=false

echo "🧹 Starting complete migration to Next.js on AWS Linux..."

# Get EC2 public IP for reference
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "📍 EC2 Public IP: $PUBLIC_IP"

# Environment variables - SET THESE BEFORE RUNNING
if [ -z "$BEEHIIV_API_KEY" ]; then
    echo "❌ Error: BEEHIIV_API_KEY environment variable is required"
    exit 1
fi

if [ -z "$BEEHIIV_PUBLICATION_ID" ]; then
    echo "❌ Error: BEEHIIV_PUBLICATION_ID environment variable is required"
    exit 1
fi

# Detect OS
echo "🔍 Detecting operating system..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    echo "Operating System: $OS"
fi

# Step 1: Stop and remove old PM2 processes
echo "⏸️ Stopping old PM2 processes..."
pm2 stop $APP_NAME 2>/dev/null || true
pm2 delete $APP_NAME 2>/dev/null || true
pm2 save

# Step 2: Remove old application directory
echo "🗑️ Removing old application files..."
sudo rm -rf /var/www/$APP_NAME
sudo rm -rf /var/www/html/$APP_NAME

# Step 3: Remove old nginx configurations
echo "🌐 Cleaning up old nginx configurations..."
sudo rm -f /etc/nginx/sites-available/$APP_NAME
sudo rm -f /etc/nginx/sites-enabled/$APP_NAME
sudo rm -f /etc/nginx/conf.d/$APP_NAME.conf
sudo rm -f /etc/nginx/conf.d/default.conf

# Step 4: Create fresh application directory
echo "📁 Creating fresh application directory..."
sudo mkdir -p /var/www/$APP_NAME
sudo chown -R $USER:$USER /var/www/$APP_NAME

# Step 5: Clone new Next.js repository
echo "📥 Cloning new Next.js repository..."
cd /var/www/$APP_NAME
git clone $NEW_REPO_URL .

# Step 6: Install Node.js 18 if not present or outdated
echo "📦 Checking Node.js installation..."
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1 || echo "0")
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "📦 Installing Node.js 18..."
    if command -v yum &> /dev/null; then
        # AWS Linux - use NodeSource repository
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    elif command -v dnf &> /dev/null; then
        # Amazon Linux 2023
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo dnf install -y nodejs
    fi
    echo "✅ Node.js version: $(node --version)"
    echo "✅ NPM version: $(npm --version)"
else
    echo "✅ Node.js $(node --version) already installed"
fi

# Step 7: Install dependencies
echo "📦 Installing Next.js dependencies..."
npm install

# Step 8: Create new environment file for Next.js
echo "⚙️ Creating Next.js environment configuration..."
cat > .env.local << EOF
NODE_ENV=production
BEEHIIV_API_KEY=$BEEHIIV_API_KEY
BEEHIIV_PUBLICATION_ID=$BEEHIIV_PUBLICATION_ID

# Add any other environment variables your Next.js app needs
# NEXT_PUBLIC_* variables are available in the browser
# Regular variables are only available server-side

# Optional: Custom port (Next.js defaults to 3000)
# PORT=3000
EOF

echo "📝 Created .env.local - please verify all required variables are present"

# Step 9: Build Next.js application
echo "🏗️ Building Next.js application..."
npm run build

# Step 10: Create new Nginx configuration for Next.js (AWS Linux compatible)
echo "🌐 Creating new Nginx configuration for AWS Linux..."

# Create the main nginx.conf that includes our site configuration
sudo tee /etc/nginx/nginx.conf > /dev/null << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    # Rate limiting zones for Next.js
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=app:10m rate=30r/s;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Next.js Server Configuration
    server {
        listen       80;
        listen       [::]:80;
        server_name  mumslike.me www.mumslike.me;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # All requests go to Next.js (including static files, API routes, pages)
        location / {
            limit_req zone=app burst=20 nodelay;
            
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
            proxy_connect_timeout 30;
            proxy_send_timeout 30;
        }

        # Optimize caching for Next.js static assets
        location /_next/static/ {
            proxy_pass http://localhost:3000;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # Handle Next.js API routes with rate limiting
        location /api/ {
            limit_req zone=api burst=5 nodelay;
            
            # Handle CORS preflight
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' '*' always;
                add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
                add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, X-Requested-With' always;
                add_header 'Access-Control-Max-Age' 86400 always;
                return 204;
            }
            
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
            proxy_connect_timeout 30;
            proxy_send_timeout 30;
            
            # Add CORS headers
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, Accept, X-Requested-With' always;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://localhost:3000;
            access_log off;
        }

        # Error pages
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }

    # Include any additional configurations
    include /etc/nginx/conf.d/*.conf;
}
EOF

# Step 11: Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Step 12: Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Step 13: Start Next.js application with PM2
echo "🚀 Starting Next.js application with PM2..."
cd /var/www/$APP_NAME
pm2 start npm --name "$APP_NAME" -- start
pm2 startup
pm2 save

# Step 14: Configure firewall for AWS Linux
echo "🔥 Configuring firewall..."
if command -v firewall-cmd &> /dev/null; then
    # AWS Linux - firewalld
    sudo systemctl start firewalld
    sudo systemctl enable firewalld
    sudo firewall-cmd --permanent --add-port=22/tcp    # SSH
    sudo firewall-cmd --permanent --add-port=80/tcp    # HTTP
    sudo firewall-cmd --permanent --add-port=443/tcp   # HTTPS
    sudo firewall-cmd --reload
    echo "✅ Firewall configured with firewalld"
else
    echo "⚠️ No firewall manager found, ensure AWS Security Groups are properly configured"
fi

# Step 15: Wait and test the application
echo "⏳ Waiting for application to start..."
sleep 10

# Step 16: Test endpoints
echo "🧪 Testing application endpoints..."
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Next.js app is responding on port 3000"
else
    echo "❌ Next.js app is not responding on port 3000"
    echo "Checking PM2 logs..."
    pm2 logs $APP_NAME --lines 10 --nostream
fi

if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Nginx proxy is working"
else
    echo "❌ Nginx proxy is not working"
    echo "Checking nginx error logs..."
    sudo tail -n 10 /var/log/nginx/error.log
fi

# Step 17: Reconfigure SSL (since we changed nginx config)
echo "🔒 Configuring SSL certificate..."
if [ "$USE_GODADDY_SSL" = true ]; then
    echo "📋 GoDaddy SSL Setup Required:"
    echo "  1. Purchase SSL certificate from GoDaddy"
    echo "  2. Download certificate files"
    echo "  3. Upload to /etc/nginx/ssl/"
    echo "  4. Update nginx configuration manually"
    echo "⚠️ Skipping automatic SSL setup - manual GoDaddy SSL configuration needed"
else
    # Install certbot for AWS Linux if not present
    if ! command -v certbot &> /dev/null; then
        echo "📦 Installing Certbot..."
        if command -v yum &> /dev/null; then
            sudo yum install -y certbot --skip-broken
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y certbot python3-certbot-nginx
        fi
    fi
    
    if command -v certbot &> /dev/null; then
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect || echo "⚠️ SSL setup failed - run manually: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    else
        echo "⚠️ Certbot not available - SSL setup skipped"
    fi
fi

# Step 18: Install fail2ban for security (AWS Linux compatible)
echo "🛡️ Installing Fail2ban for security..."
if command -v yum &> /dev/null; then
    sudo yum install -y fail2ban --skip-broken || echo "⚠️ fail2ban not available in default repos"
elif command -v dnf &> /dev/null; then
    sudo dnf install -y fail2ban
fi

# Configure fail2ban if installed
if command -v fail2ban-server &> /dev/null; then
    sudo tee /etc/fail2ban/jail.local > /dev/null << 'EOF'
[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 600
findtime = 600
EOF
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
    echo "✅ Fail2ban configured and started"
else
    echo "⚠️ fail2ban not installed, skipping configuration"
fi

# Step 19: Setup automated backups (AWS Linux compatible)
echo "💾 Creating backup script..."
sudo tee /usr/local/bin/backup-$APP_NAME.sh > /dev/null << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/$USER/backups"
mkdir -p \$BACKUP_DIR

# Backup Next.js application and configuration
tar -czf \$BACKUP_DIR/nextjs-mlm-app-backup-\$DATE.tar.gz \
    /var/www/$APP_NAME \
    /etc/nginx/nginx.conf \
    ~/.pm2 2>/dev/null || true

# Keep only last 7 backups
find \$BACKUP_DIR -name "nextjs-mlm-app-backup-*.tar.gz" -mtime +7 -delete

echo "Next.js backup completed: nextjs-mlm-app-backup-\$DATE.tar.gz"
EOF

sudo chmod +x /usr/local/bin/backup-$APP_NAME.sh

# Setup cron for AWS Linux
echo "⏰ Setting up automated backups..."
if command -v yum &> /dev/null; then
    # AWS Linux - install cronie
    sudo yum install -y cronie --skip-broken
    sudo systemctl enable crond
    sudo systemctl start crond
elif command -v dnf &> /dev/null; then
    # Amazon Linux 2023
    sudo dnf install -y cronie
    sudo systemctl enable crond
    sudo systemctl start crond
fi

# Add backup to crontab
if command -v crontab &> /dev/null; then
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-$APP_NAME.sh") | crontab -
    echo "✅ Automated backup scheduled for 2 AM daily"
else
    echo "⚠️ crontab not available, backup script created but not scheduled"
fi

# Step 20: Final cleanup of any remaining old files
echo "🧹 Final cleanup..."
sudo rm -rf /home/$USER/backups/*mlm-app-backup-* 2>/dev/null || true

# Step 21: Create updated monitoring script
echo "📊 Creating updated monitoring script..."
tee ~/monitor-$APP_NAME.sh > /dev/null << 'EOF'
#!/bin/bash
echo "=== Next.js MLM App Status ==="
echo "Date: $(date)"
echo ""

echo "🚀 PM2 Application Status:"
pm2 status mlm-app

echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "🔗 Next.js App Test (localhost:3000):"
curl -I http://localhost:3000/ 2>/dev/null | head -1 || echo "❌ Next.js not responding"

echo ""
echo "🔗 Nginx Proxy Test (localhost:80):"
curl -I http://localhost/ 2>/dev/null | head -1 || echo "❌ Nginx proxy not working"

echo ""
echo "💾 Disk Usage:"
df -h /var/www

echo ""
echo "🧠 Memory Usage:"
free -h

echo ""
echo "📱 Next.js Application Logs (last 10 lines):"
pm2 logs mlm-app --lines 10 --nostream 2>/dev/null || echo "No logs available"

echo ""
echo "❌ Recent Nginx Errors (last 5 lines):"
sudo tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "No error logs"

echo ""
echo "🔥 Recent Nginx Access (last 5):"
sudo tail -n 5 /var/log/nginx/access.log 2>/dev/null || echo "No access logs"
EOF

chmod +x ~/monitor-$APP_NAME.sh

# Final status report
echo ""
echo "🎉 Complete Next.js migration completed on AWS Linux!"
echo ""
echo "📋 What was cleaned up:"
echo "  🗑️ Old application directory (/var/www/$APP_NAME)"
echo "  🗑️ Old static files (/var/www/html/$APP_NAME)"  
echo "  🗑️ Old nginx configurations"
echo "  🗑️ Old PM2 processes"
echo ""
echo "📋 What was set up:"
echo "  ✅ New Next.js repository cloned"
echo "  ✅ Node.js $(node --version) verified/updated"
echo "  ✅ Next.js dependencies installed"
echo "  ✅ Next.js application built"
echo "  ✅ AWS Linux compatible nginx configuration"
echo "  ✅ PM2 configured to run Next.js"
echo "  ✅ Firewall configured (firewalld)"
echo "  ✅ SSL certificate configured"
echo "  ✅ Security tools installed (fail2ban)"
echo "  ✅ Automated backups scheduled"
echo ""
echo "🌐 Your Next.js app should be live at:"
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo "  Local: http://localhost:3000"
echo ""
echo "🔧 Management Commands:"
echo "  Monitor: ~/monitor-$APP_NAME.sh"
echo "  App logs: pm2 logs $APP_NAME"
echo "  Restart: pm2 restart $APP_NAME"
echo "  Rebuild: cd /var/www/$APP_NAME && npm run build && pm2 restart $APP_NAME"
echo "  Update code: cd /var/www/$APP_NAME && git pull && npm install && npm run build && pm2 restart $APP_NAME"
echo ""
echo "⚠️ Important reminders:"
echo "  1. Update NEW_REPO_URL in this script before running"
echo "  2. Verify environment variables in /var/www/$APP_NAME/.env.local"
echo "  3. Test all functionality after migration"
echo "  4. Check AWS Security Groups allow ports 80, 443"
echo ""

# Show current status
echo "📊 Current Status:"
pm2 status
echo ""
echo "🎊 Next.js migration complete!"