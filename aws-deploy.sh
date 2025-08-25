#!/bin/bash

# Complete MLM App Migration to Next.js
# This script removes old setup and deploys new Next.js repository

set -e

# Configuration - UPDATE THESE VALUES
NEW_REPO_URL="https://github.com/YOUR_USERNAME/YOUR_NEW_NEXTJS_REPO.git"  # Replace with your new repo
DOMAIN="mumslike.me"
EMAIL="ronak@mumslike.me"
APP_NAME="mlm-app"

echo "🧹 Starting complete migration to Next.js..."

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

# Step 6: Install dependencies
echo "📦 Installing Next.js dependencies..."
npm install

# Step 7: Create new environment file
echo "⚙️ Creating Next.js environment configuration..."
cat > .env.local << EOF
NODE_ENV=production
BEEHIIV_API_KEY=$BEEHIIV_API_KEY
BEEHIIV_PUBLICATION_ID=$BEEHIIV_PUBLICATION_ID

# Add any other environment variables your Next.js app needs
# NEXT_PUBLIC_* variables are available in the browser
# Regular variables are only available server-side
EOF

echo "📝 Created .env.local - please update with your actual values"

# Step 8: Build Next.js application
echo "🏗️ Building Next.js application..."
npm run build

# Step 9: Create new Nginx configuration for Next.js
echo "🌐 Creating new Nginx configuration..."
sudo tee /etc/nginx/nginx.conf > /dev/null << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    # multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=app:10m rate=30r/s;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Logging Settings
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Next.js Server Configuration
    server {
        listen 80;
        server_name mumslike.me www.mumslike.me;
        
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
    }

    # Include additional configurations
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Step 10: Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Step 11: Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

# Step 12: Start Next.js application with PM2
echo "🚀 Starting Next.js application with PM2..."
cd /var/www/$APP_NAME
pm2 start npm --name "$APP_NAME" -- start
pm2 startup
pm2 save

# Step 13: Wait and test the application
echo "⏳ Waiting for application to start..."
sleep 10

# Step 14: Test endpoints
echo "🧪 Testing application endpoints..."
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Next.js app is responding on port 3000"
else
    echo "❌ Next.js app is not responding on port 3000"
fi

if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Nginx proxy is working"
else
    echo "❌ Nginx proxy is not working"
fi

# Step 15: Reconfigure SSL (since we changed nginx config)
echo "🔒 Reconfiguring SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect || echo "⚠️ SSL setup failed - run manually: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"

# Step 16: Final cleanup of any remaining old files
echo "🧹 Final cleanup..."
sudo rm -rf /home/$USER/backups/mlm-app-backup-* 2>/dev/null || true

# Step 17: Create new monitoring script
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
echo "🔗 Next.js App Test:"
curl -I http://localhost:3000/ 2>/dev/null | head -1

echo ""
echo "🔗 Nginx Proxy Test:"
curl -I http://localhost/ 2>/dev/null | head -1

echo ""
echo "💾 Disk Usage:"
df -h /var/www

echo ""
echo "🧠 Memory Usage:"
free -h

echo ""
echo "📱 Application Logs (last 10 lines):"
pm2 logs mlm-app --lines 10 --nostream 2>/dev/null || echo "No logs available"

echo ""
echo "❌ Recent Nginx Errors (last 5 lines):"
sudo tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "No error logs"
EOF

chmod +x ~/monitor-$APP_NAME.sh

# Final status report
echo ""
echo "🎉 Complete migration to Next.js completed!"
echo ""
echo "📋 What was cleaned up:"
echo "  🗑️ Old application directory (/var/www/$APP_NAME)"
echo "  🗑️ Old static files (/var/www/html/$APP_NAME)"
echo "  🗑️ Old nginx configurations"
echo "  🗑️ Old PM2 processes"
echo ""
echo "📋 What was set up:"
echo "  ✅ New Next.js repository cloned"
echo "  ✅ Dependencies installed"
echo "  ✅ Next.js application built"
echo "  ✅ New nginx configuration for Next.js"
echo "  ✅ PM2 configured to run Next.js"
echo "  ✅ SSL certificate reconfigured"
echo ""
echo "🌐 Your Next.js app should be live at:"
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo ""
echo "🔧 Management Commands:"
echo "  Monitor: ~/monitor-$APP_NAME.sh"
echo "  App logs: pm2 logs $APP_NAME"
echo "  Restart: pm2 restart $APP_NAME"
echo "  Rebuild: cd /var/www/$APP_NAME && npm run build && pm2 restart $APP_NAME"
echo ""
echo "⚠️ Don't forget to:"
echo "  1. Update the NEW_REPO_URL at the top of this script"
echo "  2. Set your environment variables in .env.local"
echo "  3. Test your application thoroughly"
echo ""

# Show current status
echo "📊 Current Status:"
pm2 status
EOF