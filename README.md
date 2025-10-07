# Project-One
Project I , Submitted in Partial fulfillment of the requirements for the degree of BACHELOR OF TECHNOLOGY in Computer Science and Engineering 
### Team 
- [Gautam Sharma](https://github.com/gautam-chitti)
- [Dhruv Bana]( https://github.com/banadhruva )
- [Avya Saini](https://github.com/avyasaini)
## Project Title: **Recommendation System Using Machine Learning**

### Overview
This project aims to develop a music recommendation system using machine learning, which will gradually expand to include features like friend/date matching based on music taste, community recommendations, and real-time interactions.

---

## Development Roadmap

### Phase 1: Backend Development (ML Recommendation System)
- [X] **Set up project repository**
- [X] **Develop the ML model for music recommendation**
  - [X] Collect dataset (Spotify API, Last.fm, or local dataset)
  - [X] Preprocess and clean data
  - [X] Select ML model (Collaborative Filtering, Content-Based Filtering, Hybrid)
  - [X] Train and test model
  - [X] Save trained model for integration
- [ ] **Create backend API for recommendation**
  - [X] Choose backend framework (Flask/FastAPI/Django)
  - [X] Implement endpoints to fetch recommendations
  - [X] Connect with ML model
  - [X] Test API with sample requests

### Phase 2: Frontend MVP (Minimal UI)
- [x] **Setup React project**
- [x] **Create basic UI for recommendation system**
  - [X] Search bar for song input
  - [X] Display recommended songs
- [x] **Integrate backend API with frontend**
  - [X] Connect React with Python backend
  - [X] Display ML recommendations on UI
  - [X] Test with real data  - Phase 2 Completed on 18/3

---

## Future Expansion Plans
### Phase 3: User Profiles & Data Collection
- [ ] Implement user authentication (JWT/OAuth)
- [ ] Store user preferences and music history
- [ ] Collect real-time listening habits

### Phase 4: Friend & Date Matching Based on Music Taste
- [ ] Develop algorithm for similarity matching
- [ ] Create UI for friend/date recommendations
- [ ] Implement matching filters and preferences

### Phase 5: Community Recommendations & Social Features
- [ ] Develop a community-based recommendation system
- [ ] Implement chat rooms and music-sharing features
- [ ] Allow users to create and join music-based communities

---

## Technology Stack
| Component        | Technology    |
|-----------------|--------------|
| Frontend        | React.js, Tailwind CSS |
| Backend         | Python (Flask/FastAPI/Django) |
| Database        | PostgreSQL/MongoDB |
| ML Model        | TensorFlow/PyTorch/Scikit-Learn |
| Authentication  | OAuth, JWT |
| Additional      | WebSockets (for real-time chat) |

---

## Development Cycle
```mermaid
graph TD
    A[Start Project] --> B[Develop ML Model]
    B --> C[Build Backend API]
    C --> D[Develop Basic Frontend]
    D --> E[Test & Deploy MVP]
    E --> F[Expand Features]
    F --> G[User Profiles]
    G --> H[Friend/Date Matching]
    H --> I[Community Features]
    I --> J[Final Deployment]
