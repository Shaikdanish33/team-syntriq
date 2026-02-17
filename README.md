# ACADEX  
Campus Academic Resource Sharing Platform  

Built by Team Syntriq  

St. Claret College Autonomous  

---

## What is ACADEX?

ACADEX is a modern, full-stack campus academic resource-sharing platform built to transform how students access and contribute study materials.

It enables students to securely upload, discover, search, and rate academic resources through a structured, intelligent, and collaborative system powered by a scalable backend, real authentication, and role-based access control.

By converting scattered notes and disconnected sharing channels into a centralized knowledge ecosystem, ACADEX creates a smarter, faster, and more collaborative academic experience — turning every student into both a learner and a contributor.

---

## Core Features

### 1. Authentication & User Profile System

- Secure student registration and login using real authentication
- User identity managed through backend authentication service
- Profile creation capturing academic details:
  - Name
  - email
  - password
  - College / Institution
  - Branch / Department
  - Semester / Year
- Persistent authenticated sessions for seamless user experience
- Global authentication state managed via React Context for clean and scalable frontend architecture
- Profile data automatically linked with platform actions (uploads, ratings, access control)

---

### 2. Resource Dashboard
- Responsive grid layout
- Resource cards with:
  - Title
  - Subject
  - Semester
  - Contributor
  - Tags
  - Privacy badge (Public / Private)
  - Average rating
- Smart badges (Top Rated, Trending, Exam Important)
- Smooth hover animations

---

### 3. Search and Filter System
- Search by title, subject, and tags
- Filters for course, branch, semester, resource type, year, and privacy
- Sorting by latest, highest rated, and most popular
- Combined filters working together dynamically

---

### 4. Resource Upload System
- Upload form with detailed metadata
- Public / Private toggle
- Mock file upload with 50MB limit simulation
- Edit and delete own resources
- Instant appearance in feed
- Points added to leaderboard on upload

---

### 5. Access Control Simulation
- Private resources accessible only to the selected users
- Access denied screen for unauthorized users
- Public resources accessible to all

---

### 6. Rating and Review System
- 1–5 star rating
- One review per user per resource
- Editable reviews
- Live average rating updates
- Rating breakdown display

---

### 7. Exam Mode Toggle
- Toggle in navbar
- Shows only top-rated and exam-important resources
- Smooth animated filtering

---

### 8. Leaderboard
- Points system (+10 per upload)
- Ranked list of contributors
- Top 3 highlighted with medals
- Animated entry

---

### 9. User Dashboard
- Profile overview
- Uploaded resources list
- Total contribution points
- Edit profile option

---

### 10. Resource Detail Page
- Full resource information
- Tags and metadata
- Reviews section
- Rating summary
- Mock download button
- Edit/Delete for owner

---

### 11. Urgent Resource Request Feature
- Students can create urgent study requests
- Community request board
- Request status (Open / Fulfilled)
- Ability to link uploads to requests (UI simulation)

---

## 12.Tech Stack

### Frontend
- React (TypeScript)
- Tailwind CSS
- Framer Motion

### Backend
- Supabase (Authentication, Database, Storage)

### Database
- PostgreSQL

### State Management
- React Context + Hooks
---

## 13.System Architecture

ACADEX follows a modern full-stack architecture:

- React frontend handles UI and client-side state
- Supabase provides authentication, database, and storage
- Role-based access control manages private/public resources
- Real-time updates simulated through state synchronization
---

## Impact

- Reduces time spent searching for notes
- Encourages peer-to-peer academic collaboration
- Builds a reusable campus knowledge ecosystem
- Rewards contributors and improves participation

---
