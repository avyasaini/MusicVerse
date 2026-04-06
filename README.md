# MusicVerse

This repository contains the MusicVerse Django backend and a React/Vite frontend in `frontend/musicverse-frontend`.

What I added for you automatically
- `.gitignore` — common ignores for Python/Django and Node
- `.gitattributes` — prepared for tracking large audio files with Git LFS (if you choose)
- `LICENSE` — MIT license
- `scripts/push_to_github.ps1` — PowerShell script to initialize git, handle identity, optionally set up Git LFS for large audio files, commit and push to GitHub.

How to run the automated push script (Windows PowerShell)

1. Open PowerShell and change to the project root:

```powershell
cd "C:\Users\AVYA\Downloads\musicverse-main\musicverse-main"
```

2. If you haven't previously allowed running local scripts, run (this only applies to this session):

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

3. Run the automation script:

```powershell
.\scripts\push_to_github.ps1
```

The script will prompt for your GitHub repo URL (e.g. `https://github.com/avyasaini/MusicVerse.git` or `git@github.com:avyasaini/MusicVerse.git`), optionally configure your git user.name and user.email if not set, warn about large files (>100 MB) and help you track them with Git LFS, then add, commit, and push the code.

If you prefer manual steps, follow the earlier instructions I gave you. If you run the script and get any errors, paste the output here and I'll guide you.
