<#
PowerShell helper to initialize local git, optionally set git identity,
warn about large files and offer Git LFS tracking, commit and push to GitHub.

Run from project root:
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  .\scripts\push_to_github.ps1
#>

function Exec($cmd) {
    Write-Host "> $cmd"
    $proc = Start-Process -FilePath "pwsh" -ArgumentList "-NoProfile","-Command","$cmd" -NoNewWindow -Wait -PassThru -ErrorAction SilentlyContinue
    if ($proc.ExitCode -ne 0) { Write-Host "Command failed with exit code $($proc.ExitCode)" -ForegroundColor Red }
}

Write-Host "== MusicVerse: Git push helper =="

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "git not found in PATH. Please install Git first: https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Project root
$root = Get-Location
Write-Host "Project root: $root"

# Ask for repo URL
$repoUrl = Read-Host "Enter your GitHub repo URL (HTTPS or SSH). Example: https://github.com/avyasaini/MusicVerse.git"
if ([string]::IsNullOrWhiteSpace($repoUrl)) { Write-Host "Repo URL required." -ForegroundColor Red; exit 1 }

# Init git if needed
if (-not (Test-Path -Path (Join-Path $root '.git'))) {
    Write-Host "Initializing git repository..."
    git init
} else {
    Write-Host "Git repository already initialized."
}

# Ensure git identity
$currentName = git config user.name 2>$null
if (-not $currentName) {
    $name = Read-Host "Enter git user.name (e.g. Your Name)"
    if (-not [string]::IsNullOrWhiteSpace($name)) { git config user.name $name }
}
$currentEmail = git config user.email 2>$null
if (-not $currentEmail) {
    $email = Read-Host "Enter git user.email (e.g. you@example.com)"
    if (-not [string]::IsNullOrWhiteSpace($email)) { git config user.email $email }
}

# Check for large files (>100 MB)
$largeThreshold = 104857600
$largeFiles = Get-ChildItem -Recurse -File | Where-Object { $_.Length -gt $largeThreshold } | Select-Object FullName,Length
if ($largeFiles.Count -gt 0) {
    Write-Host "Warning: Found files > 100 MB. GitHub will reject files bigger than 100 MB." -ForegroundColor Yellow
    $largeFiles | ForEach-Object { Write-Host " - $($_.FullName) ($([math]::Round($_.Length/1MB,2)) MB)" }
    $choice = Read-Host "Do you want to track these file types with Git LFS? (y/n)"
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        if (-not (Get-Command git-lfs -ErrorAction SilentlyContinue)) {
            Write-Host "git-lfs not found. Please install Git LFS first: https://git-lfs.github.com/" -ForegroundColor Yellow
            Write-Host "After installing git-lfs, re-run this script to automatically track and push large files." -ForegroundColor Yellow
        } else {
            Write-Host "Setting up Git LFS and tracking common audio file types..."
            git lfs install
            git lfs track "*.mp3"
            git lfs track "*.wav"
            git lfs track "*.flac"
            git lfs track "*.ogg"
            git add .gitattributes
        }
    } else {
        Write-Host "You chose not to use Git LFS. Large files will cause push failures. Consider removing them or using LFS." -ForegroundColor Yellow
    }
}

# Ensure .gitignore exists (we added one in this repo)
if (-not (Test-Path -Path (Join-Path $root '.gitignore'))) {
    Write-Host "Creating default .gitignore..."
    @"
# Python
__pycache__/
*.py[cod]
env/
venv/
*.sqlite3

# Node
node_modules/
dist/
"@ > .gitignore
    git add .gitignore
}

Write-Host "Staging files..."
git add .

Write-Host "Committing..."
$commitResult = git commit -m "Initial commit: add project files" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit returned non-zero exit code. Output:" -ForegroundColor Yellow
    $commitResult | ForEach-Object { Write-Host $_ }
    Write-Host "If there are no changes to commit, that's fine. Continuing..."
}

# Configure remote
$existing = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote 'origin' already exists: $existing"
    $repChoice = Read-Host "Replace existing origin with the provided URL? (y/n)"
    if ($repChoice -eq 'y' -or $repChoice -eq 'Y') {
        git remote remove origin
        git remote add origin $repoUrl
    } else {
        Write-Host "Keeping existing origin. Will attempt to push to it." -ForegroundColor Yellow
    }
} else {
    git remote add origin $repoUrl
}

Write-Host "Setting branch name to 'main' and pushing to origin..."
git branch -M main

# Attempt push
try {
    git push -u origin main
} catch {
    Write-Host "git push failed. Check authentication (HTTPS requires PAT; SSH requires key)." -ForegroundColor Red
    Write-Host "If you used HTTPS, provide a Personal Access Token when prompted for password. If you want to use SSH, generate a key and add it to GitHub." -ForegroundColor Yellow
    Write-Host "To generate an SSH key (example): ssh-keygen -t ed25519 -C \"you@example.com\"" -ForegroundColor Yellow
}

Write-Host "Done. If push succeeded, open your repository page on GitHub to verify the files." -ForegroundColor Green
