# MusicVerse

MusicVerse is a Django backend with a React + Vite frontend. The backend lives at the repository root and the frontend is in `frontend/musicverse-frontend`.

This README covers quick setup, running the backend and frontend locally, and common Git/GitHub notes.

Prerequisites
- Python 3.11+ (or use the `py` launcher with a 3.11+ interpreter)
- Node.js (v18+ recommended) and npm
- Git

Backend (Django) — Quick start (Windows PowerShell)
1. Open PowerShell and go to the project root:

```powershell
cd "C:\Users\AVYA\Downloads\musicverse-main\musicverse-main"
```

2. Create and activate a virtual environment (uses system `python` — ensure it's 3.11+):

```powershell
py -3.11 -m venv .venv
. .venv\Scripts\Activate.ps1
```

3. Upgrade pip and install dependencies:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

4. Run migrations and start the dev server:

```powershell
python manage.py migrate --noinput
python manage.py runserver 127.0.0.1:8000
```

Open: http://127.0.0.1:8000/

Frontend (React + Vite) — Quick start
1. In a new terminal, go to the frontend folder:

```powershell
cd frontend\musicverse-frontend
```

2. Install deps and start Vite:

```powershell
npm install
npm run dev
```

Vite typically serves at http://127.0.0.1:5173/ — open that in the browser.

Environment and secrets
- The repository does not include production secrets. For local development, add any sensitive values using a `.env` file or set environment variables. The dev `musicverse/settings.py` added in this branch is minimal — replace with your production settings when deploying.

Git & GitHub
- Your GitHub repo: https://github.com/avyasaini/MusicVerse
- I added a helper script `scripts/push_to_github.ps1` that can initialize git, set identity, optionally help with Git LFS tracking for large files, and push. To run it (PowerShell):

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\push_to_github.ps1
```

Large files
- GitHub rejects files >100 MB. If you have audio or other large binaries, either remove them from the repo or use Git LFS. I added a `.gitattributes` prepared to track `*.mp3`, `*.wav`, etc. Set up Git LFS with:

```powershell
# install Git LFS (https://git-lfs.github.com/)
git lfs install
git lfs track "*.mp3"
git add .gitattributes
git add path\to\largefile.mp3
git commit -m "Track large audio with Git LFS"
git push origin main
```

CI and next steps
- If you want, I can add a GitHub Actions workflow to run tests and lint on each push/PR.
- I can also split `settings.py` into `settings_dev.py` / `settings_prod.py` and wire environment-based loading.

License
- This project contains an `LICENSE` file (MIT).

If you want the README tailored further (projects run commands, example `.env` variables, or CI configuration added), tell me what to include and I will update it.
