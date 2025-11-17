# Deployment Guide: Pod Grading System with Firebase

This guide explains how to deploy the Pod Grading System with Firebase for persistent cloud storage and host it on your WordPress website.

## Part 1: Firebase Setup (Free Tier)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "pod-grading-system")
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Realtime Database

1. In Firebase Console, click "Build" > "Realtime Database"
2. Click "Create Database"
3. Choose your location (e.g., United States)
4. Start in **Test Mode** for now (we'll secure it later)
5. Click "Enable"

### Step 3: Get Firebase Configuration

1. Click the gear icon > "Project settings"
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app with a nickname (e.g., "pod-grading-web")
5. Copy the `firebaseConfig` object values

### Step 4: Configure the App

Create a `.env` file in your project root:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase values:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyB...
REACT_APP_FIREBASE_AUTH_DOMAIN=pod-grading-system.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=pod-grading-system
REACT_APP_FIREBASE_STORAGE_BUCKET=pod-grading-system.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
REACT_APP_FIREBASE_DATABASE_URL=https://pod-grading-system-default-rtdb.firebaseio.com
```

### Step 5: Secure Your Database (IMPORTANT!)

In Firebase Console > Realtime Database > Rules, replace with:

```json
{
  "rules": {
    "podGradingData": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Note:** For production, add authentication for better security.

---

## Part 2: Build the Application

### Install Dependencies

```bash
npm install
```

### Build for Production

```bash
npm run build
```

This creates a `build/` folder with optimized static files.

---

## Part 3: WordPress Hosting Options

### Option A: Use WordPress Page with iFrame (Easiest)

1. **Host build files on separate service:**
   - Upload `build/` folder to GitHub Pages, Netlify, or Vercel (all free)
   - Get the URL (e.g., `https://yoursite.netlify.app`)

2. **Embed in WordPress:**
   - Create a new WordPress page
   - Add HTML block with:
   ```html
   <iframe
     src="https://yoursite.netlify.app"
     width="100%"
     height="800px"
     style="border: none;"
   ></iframe>
   ```

### Option B: Deploy to Netlify (Recommended - Free)

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect to GitHub and select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Add environment variables:
   - Go to Site settings > Environment variables
   - Add all `REACT_APP_FIREBASE_*` variables
7. Deploy!

**Add to WordPress:**
```html
<iframe
  src="https://your-app.netlify.app"
  width="100%"
  height="900px"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"
></iframe>
```

### Option C: Deploy to GitHub Pages (Free)

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/Class-Apps",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

4. Embed in WordPress using iframe method above.

### Option D: Upload to WordPress Directly (Advanced)

1. Build the app: `npm run build`
2. Upload `build/` folder contents to your WordPress server
3. Place in a subdirectory like `/wp-content/apps/pod-grading/`
4. Access via `https://yoursite.com/wp-content/apps/pod-grading/`

---

## Part 4: Vercel Deployment (Alternative Free Option)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard
4. Your app will be at `https://your-project.vercel.app`

---

## Part 5: Firebase Security Rules (Production)

For better security, you can add password protection at the Firebase level:

```json
{
  "rules": {
    "podGradingData": {
      ".read": "auth != null || data.child('allowPublicRead').val() === true",
      ".write": "auth != null || root.child('adminPassword').val() === data.child('password').val()"
    }
  }
}
```

---

## Testing Firebase Connection

After deployment:

1. Open browser console (F12)
2. Look for "Firebase initialized successfully" message
3. Make a test change (assign a student to a pod)
4. Check Firebase Console > Realtime Database to see data
5. Open app in different browser/device to confirm sync

---

## WordPress Full-Width Page Template

Add this to your theme's `functions.php` for a better iframe experience:

```php
// Add full-width template for app pages
function add_app_page_template($templates) {
    $templates['template-app.php'] = 'Full Width App';
    return $templates;
}
add_filter('theme_page_templates', 'add_app_page_template');
```

Create `template-app.php` in your theme:

```php
<?php
/*
Template Name: Full Width App
*/
get_header(); ?>
<main style="width: 100%; padding: 0; margin: 0;">
    <?php the_content(); ?>
</main>
<?php get_footer(); ?>
```

---

## Troubleshooting

### Firebase not connecting?
- Check browser console for errors
- Verify all environment variables are set
- Ensure database URL includes `https://`
- Check Firebase rules allow read/write

### Data not persisting?
- Confirm Firebase project is on Blaze plan or within free limits
- Check Realtime Database in Firebase Console
- Look for sync indicator in app header

### App not loading in WordPress?
- Check iframe src URL is correct
- Ensure HTTPS is used
- Test iframe URL directly in browser first
- Check for Content Security Policy issues

---

## Firebase Free Tier Limits

- 1GB storage
- 10GB/month downloads
- 100 simultaneous connections

This is more than enough for a classroom application!

---

## Cost

- **Firebase Spark Plan**: FREE
- **Netlify/Vercel**: FREE for personal/hobby projects
- **GitHub Pages**: FREE
- **Total**: $0/month

---

## Support

- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://react.dev
- Netlify Documentation: https://docs.netlify.com
