# Salveeya Medicine: Project Information & GitHub Deployment

## Where is the Backend located?
The backend API code, models, and database schemas are entirely located in the following folder on your computer:
```
C:\Users\Ani-Bibek_Karki\OneDrive - ING Impact Pvt. Ltd\Documents\Salveeya Medicine\backend\
```
To run the backend, you usually navigate to this directory in your terminal and activate your virtual environment, then start it via `uvicorn`.

---

## How to push this project to GitHub
Before you begin, ensure you have a GitHub account and have installed [Git](https://git-scm.com/) on your computer.

### Step 1: Create a Repository on GitHub
1. Go to [github.com/new](https://github.com/new) and log in.
2. Name your repository (e.g., `salveeya-medicine`).
3. Set the repository to **Private** or **Public**.
4. **Do NOT** check the boxes to add a README, `.gitignore`, or license just yet.
5. Click **Create repository**.

### Step 2: Initialize Git Locally
Open your terminal (PowerShell or Command Prompt) and run the following commands to initialize your project:

```powershell
# 1. Navigate to your root project directory
cd "C:\Users\Ani-Bibek_Karki\OneDrive - ING Impact Pvt. Ltd\Documents\Salveeya Medicine"

# 2. Add a .gitignore file (to prevent uploading large folders like node_modules or venv)
echo "node_modules/" > .gitignore
echo "backend/venv/" >> .gitignore
echo "backend/__pycache__/" >> .gitignore
echo ".next/" >> .gitignore

# 3. Initialize git
git init

# 4. Add all your files to the staging area
git add .

# 5. Commit your files with a message
git commit -m "Initial commit with Out Of Stock, POS VAT, and Invoice updates"
```

### Step 3: Link to your GitHub Repo and Push
Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` below with the actual ones from your newly created GitHub repository.

```powershell
# 1. Ensure you are on the main branch
git branch -M main

# 2. Add the remote URL of your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 3. Push the code!
git push -u origin main
```

That's it! Your front-end Next.js and back-end FastAPI code will now be backed up safely on GitHub.
