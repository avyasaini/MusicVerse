# MusicVerse

👉 **Live Demo:** [https://music-verse-bd6p.vercel.app](https://music-verse-bd6p.vercel.app)

MusicVerse is a web app with a Django backend and a React + Vite frontend.

This README gives a short, practical guide to run the project locally, handle large files, and basic CI notes.

Requirements
- Python 3.11+
- Node.js (v18+) and npm
- Git

Quick start — Backend (Windows PowerShell)
1. Open PowerShell and change to the project root:

```powershell
cd "C:\Users\AVYA\Downloads\musicverse-main\musicverse-main"
```

2. Create and activate a virtual environment (use Python 3.11):

```powershell
py -3.11 -m venv .venv
. .venv\Scripts\Activate.ps1
```

3. Install Python dependencies:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

4. Apply migrations and start the dev server:

```powershell
python manage.py migrate --noinput
python manage.py runserver 127.0.0.1:8000
```

Open http://127.0.0.1:8000/ in your browser.

Quick start — Frontend
1. Open a second terminal and go to the frontend folder:

```powershell
cd frontend\musicverse-frontend
```

2. Install dependencies and start Vite:

```powershell
npm install
npm run dev
```

Vite usually serves at http://localhost:5173/.

Environment & configuration
- Use environment variables or a local `.env` file for secrets. Do not commit secrets to the repository.
- For CI we use `musicverse/settings_ci.py` (checked into repo) so workflows can run without local-only secrets. For production, provide a separate settings file and secure secrets via environment variables.

Large files (audio)
- GitHub rejects files larger than 100 MB. For audio and large binaries use Git LFS. Basic steps:

```powershell
# Install Git LFS: https://git-lfs.github.com/
git lfs install
git lfs track "*.mp3"
git add .gitattributes
git add path\to\your-large-file.mp3
git commit -m "Track large audio with Git LFS"
git push origin main
```

CI & tests
- The repository includes a GitHub Actions workflow that runs the Django migrations and tests on push to `main`. If you want linting, frontend builds, or caching added, I can extend the workflow.

License
- MIT — see the `LICENSE` file in this repository.


