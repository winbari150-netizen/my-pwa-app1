# kinny - PWA Ready Project
Generated with Universal PWA Generator.

## How to deploy to GitHub Pages & Create Android APK:

1. **Upload to GitHub**:
   - Create a new GitHub repository (e.g. `kinny`).
   - Upload all files from this directory directly into the root of the repository:
     - `index.html` (MUST be in the root)
     - `manifest.json`
     - `sw.js`
     - `pwa-icons/` folder
   - Commit and push to your `main` branch.

2. **Enable GitHub Pages**:
   - Go to your repository **Settings** -> **Pages**.
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Select `main` branch and `/ (root)` folder. Click **Save**.
   - Wait 1-2 minutes until GitHub provides your public HTTPS URL:
     `https://<your-username>.github.io/<repo-name>/`

3. **Generate Android APK/AAB with PWABuilder**:
   - Go to [PWABuilder](https://www.pwabuilder.com/).
   - Enter your public GitHub Pages HTTPS URL.
   - Click **Start** to verify PWA compliance (100% score guaranteed).
   - Click **Package for Stores** -> **Android**.
   - Click **Generate Package** to download your Android APK/AAB!
