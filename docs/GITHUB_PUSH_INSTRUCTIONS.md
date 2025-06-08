# GitHub Repository Setup Instructions

After creating your GitHub repository, run these commands to push your code:

```bash
# Add the GitHub repository as a remote
git remote add origin https://github.com/bentseng163/ai_literacy_game.git

# Rename your default branch to main (if not already named main)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

Replace `bentseng163/ai_literacy_game.git` with your actual GitHub username and repository name if different.

## Additional GitHub Features to Consider

Once your repository is set up, you might want to:

1. **Set up GitHub Pages**: To deploy a live demo of your game
2. **Create Issues**: To track bugs and feature requests
3. **Set up GitHub Actions**: For continuous integration/deployment
4. **Add Collaborators**: If you're working with others
5. **Create Project Boards**: To manage development tasks

## Regular Git Workflow

After the initial setup, use this workflow for your changes:

```bash
# Get the latest changes (if collaborating with others)
git pull

# Make your changes to files

# Add changed files to staging
git add .

# Commit your changes
git commit -m "Descriptive message about what you changed"

# Push to GitHub
git push
``` 