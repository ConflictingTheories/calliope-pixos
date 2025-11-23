# PixoSpritz Website - Deployment Guide

Quick guide to deploy your PixoSpritz website to various platforms.

## 🌐 GitHub Pages (Free)

### Method 1: Settings
1. Push the `website` folder to your GitHub repository
2. Go to repository Settings → Pages
3. Select your branch (e.g., `main`)
4. Set folder to `/website` or root (if website is at root)
5. Save and wait a few minutes
6. Visit: `https://YOUR_USERNAME.github.io/calliope-pixos/website/`

### Method 2: GitHub Actions (Automated)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Website
on:
  push:
    branches: [ main ]
    paths:
      - 'website/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./website
```

## 🎨 Netlify (Free)

### Method 1: Drag & Drop
1. Go to https://app.netlify.com
2. Drag and drop the `website` folder
3. Done! Gets a URL like `https://random-name.netlify.app`

### Method 2: Git Integration
1. Connect your GitHub repository
2. Build settings:
   - Base directory: `website`
   - Publish directory: `website` or `.`
   - Build command: (leave empty, no build needed)
3. Deploy!

### Custom Domain (Optional)
1. Domain settings → Add custom domain
2. Update your DNS records as instructed
3. Enable HTTPS (automatic)

## ⚡ Vercel (Free)

1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - Root Directory: `website`
   - Build Command: (leave empty)
   - Output Directory: `.`
4. Deploy!

## 🔥 Firebase Hosting (Free)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
cd website
firebase init hosting
```

3. Configure `firebase.json`:
```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

4. Deploy:
```bash
firebase deploy
```

## 🌊 Cloudflare Pages (Free)

1. Go to https://pages.cloudflare.com
2. Connect your GitHub repository
3. Build settings:
   - Build command: (leave empty)
   - Build output directory: `website`
4. Deploy!

## 🐳 Docker (Self-Hosted)

Create `Dockerfile` in website directory:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t pixospritz-website .
docker run -d -p 80:80 pixospritz-website
```

## 📦 Traditional Web Hosting

### Via FTP/SFTP
1. Connect to your web host via FTP client (FileZilla, Cyberduck, etc.)
2. Upload entire `website` folder contents to `public_html` or `www`
3. Visit your domain

### Via cPanel
1. Log into cPanel
2. Go to File Manager
3. Navigate to `public_html`
4. Upload website files
5. Extract if uploaded as ZIP

## 🔧 Custom Server (VPS)

### Using Nginx

1. Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

2. Copy files:
```bash
sudo cp -r website/* /var/www/html/
```

3. Configure Nginx (`/etc/nginx/sites-available/default`):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

4. Restart Nginx:
```bash
sudo systemctl restart nginx
```

### Using Apache

1. Install Apache:
```bash
sudo apt update
sudo apt install apache2
```

2. Copy files:
```bash
sudo cp -r website/* /var/www/html/
```

3. Enable mod_rewrite (optional):
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## 🔒 HTTPS/SSL Setup

### Let's Encrypt (Free)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
```

### Cloudflare (Free SSL + CDN)

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL in Cloudflare dashboard
4. Done! Free SSL + CDN

## 📊 Analytics Setup (Optional)

### Google Analytics

Add before `</head>` in `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
```

### Plausible (Privacy-Friendly)

Add before `</head>`:

```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## ✅ Pre-Deployment Checklist

- [ ] Test website locally
- [ ] Update all placeholder URLs (donation links, etc.)
- [ ] Add real game screenshots to `assets/games/`
- [ ] Update `games.json` with real game data
- [ ] Replace placeholder video with real video embed
- [ ] Test on mobile devices
- [ ] Check all links work
- [ ] Optimize images (compress, resize)
- [ ] Update favicon
- [ ] Set up custom domain (if applicable)
- [ ] Add analytics (if desired)
- [ ] Test HTTPS working
- [ ] Submit sitemap to Google Search Console

## 🎯 Performance Tips

1. **Compress Images**: Use TinyPNG, Squoosh, or ImageOptim
2. **Enable Gzip**: Most hosts enable this by default
3. **Use CDN**: Cloudflare, Netlify CDN, or similar
4. **Lazy Load Images**: Already implemented via onerror fallback
5. **Minify CSS/JS**: Optional for production (tools: cssnano, terser)

## 🐛 Troubleshooting

**404 errors on deployed site?**
- Check that index.html is in the root of deployed folder
- Verify file paths are relative, not absolute

**Styles not loading?**
- Check that css/styles.css path is correct
- Verify MIME types are set correctly on server

**Images not showing?**
- Use relative paths: `assets/image.png` not `/assets/image.png`
- Check file extensions match (case-sensitive on Linux)

**CORS errors?**
- Ensure games.json is served from same domain
- Check server CORS headers if loading external resources

## 📝 Post-Deployment

1. Test on multiple devices/browsers
2. Check page load speed (PageSpeed Insights)
3. Submit to Google Search Console
4. Share on social media
5. Add to your GitHub profile README
6. Monitor analytics

## 🆘 Need Help?

- GitHub Issues: https://github.com/ConflictingTheories/calliope-pixos/issues
- GitHub Discussions: https://github.com/ConflictingTheories/calliope-pixos/discussions

---

Good luck with your deployment! 🚀
