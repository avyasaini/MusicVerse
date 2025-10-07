# Song Recommender (Django + React)

A song recommendation system built with **Django** (backend) and **React** (frontend). Enter a song name, and it’ll suggest similar tunes based on clustering from a dataset (`clustered_df.csv`). This is the base version—more features like user management, community recommendations, and 3D visuals with React Three Fiber are in the pipeline!

## Features
- Backend: Django REST API serving song recommendations.
- Frontend: React with Bootstrap for a clean, responsive UI.
- Recommendation logic: Cosine similarity on song features (valence, danceability, etc.).

## Prerequisites
Before you start, make sure you’ve got these installed:
- **Python 3.10+**: [Download here](https://www.python.org/downloads/)
- **Node.js (LTS)**: [Download here](https://nodejs.org/)
- A code editor (e.g., VSCode).

## Project Structure
song_recommender_django_react/
├── song_recommender/   # Django backend
│   ├── recommender/    # Django app
│   └── ...            # Other Django files
├── frontend/          # React frontend
└── README.md          # This file

## Setup Instructions

### Step 1: Clone the Repo
1. Clone this repository:
   ```bash
   git clone https://github.com/gautam-chitti/Project-I.git
   cd song_recommender_django_react'
### Step 2: Create a Virtual Environment
1. Python -m venv venv 
  Activate the env
2. Install Dependencies
pip install django djangorestframework pandas scikit-learn numpy django-cors-headers
3. Navigate to the Django Project
cd song_recommender
4. Add Your Dataset
-Place your clustered_df.csv file in the recommender/ folder. It should have columns like name, year, artists, Cluster, and numerical features (valence, danceability, etc.).
5. Run the Django Server:
-python manage.py runserver

### Step 3: Set Up the Frontend (React)
1. Open a New Terminal and navigate to the frontend folder:
- cd Frontend
2. Install Node Dependencies:
- npm install
- npm install axios
3. Start the React App:
- npm start
