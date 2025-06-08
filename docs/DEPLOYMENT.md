# Deploying AI Literacy Game

This document explains how to deploy the AI Literacy Game to various hosting platforms, with a focus on GitHub Pages.

## Deploying to GitHub Pages

GitHub Pages is a free hosting service that allows you to deploy your React application directly from your GitHub repository.

### Prerequisites

1. A GitHub repository containing your AI Literacy Game code
2. Node.js and npm installed on your local machine
3. The `gh-pages` package (already included in the project)

### Configuration

The project is already configured for GitHub Pages deployment with the following settings:

1. **package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/repository-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

2. **Router Configuration**:
   The app is configured to handle subdirectory routing with a dynamic basename detection in `App.tsx`:
   ```tsx
   const getBasename = () => {
     // For local development
     if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
       // Parse the pathname to extract the base path if it exists
       const pathname = window.location.pathname;
       const basePath = pathname.split('/')[1]; // Get the first part of the path
       return basePath ? `/${basePath}` : '/';
     }
     
     // For production (GitHub Pages)
     return '/repository-name';
   };

   // Using the basename in the Router
   <Router basename={getBasename()}>
     {/* routes */}
   </Router>
   ```

### Deployment Steps

1. **Update Homepage URL**:
   In `package.json`, update the `homepage` field with your actual GitHub username and repository name:
   ```json
   "homepage": "https://yourusername.github.io/repository-name"
   ```

2. **Update Router Basename**:
   In `App.tsx`, update the `getBasename` function to return the correct path for production:
   ```tsx
   // For production (GitHub Pages)
   return '/repository-name';
   ```

3. **Deploy to GitHub Pages**:
   Run the deploy script:
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages in Repository Settings**:
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - For Source, select "gh-pages branch"
   - Click Save

The app will be deployed to `https://yourusername.github.io/repository-name`.

## Router Configuration Details

### The Problem with Subdirectory Deployments

When deploying a React Router app to a subdirectory (like `username.github.io/repository-name`), the router needs to know about this base path. Otherwise, it will incorrectly try to route to paths like:

- `username.github.io/game` (incorrect)
- `username.github.io/repository-name/game` (correct)

### Solution: Dynamic Basename Detection

Our solution uses dynamic basename detection that works for both:
- Local development (where the app may be served from the root or from a subdirectory)
- Production deployment (where the app is served from a subdirectory)

The key parts of the implementation are:

1. **Detecting Environment**:
   ```tsx
   if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
     // Local development logic
   } else {
     // Production logic
   }
   ```

2. **Extracting Base Path in Development**:
   ```tsx
   const pathname = window.location.pathname;
   const basePath = pathname.split('/')[1]; // Get the first part of the path
   return basePath ? `/${basePath}` : '/';
   ```

3. **Hardcoded Base Path for Production**:
   ```tsx
   return '/repository-name';
   ```

## Additional Deployment Options

### Vercel or Netlify

For a simpler deployment without subdirectory issues:

1. Connect your GitHub repository to Vercel or Netlify
2. Configure the build command as `npm run build`
3. Set the publish directory to `build`

Since these platforms serve your app from the root domain, you can simplify the router to:
```tsx
<Router>
  {/* routes */}
</Router>
```

### Custom Domain

If using a custom domain with GitHub Pages or another provider:

1. Update the `homepage` in package.json to your domain:
   ```json
   "homepage": "https://your-domain.com"
   ```

2. Simplify the router configuration since you'll serve from the root:
   ```tsx
   <Router basename="/">
     {/* routes */}
   </Router>
   ``` 