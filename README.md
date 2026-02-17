# ACADEX  
Campus Academic Resource Sharing Platform  

Built by Team Syntriq  
St. Claret College Autonomous  

---

## What is ACADEX?

ACADEX is a modern, frontend-based campus academic resource sharing platform built for hackathon demonstration.

It allows students to upload, discover, search, rate, and manage academic study materials in a structured and organized way.

The platform simulates a real SaaS product experience using React, TypeScript, Tailwind CSS, and local state management. All features are interactive and demo-ready without using a real backend.

The goal of ACADEX is to transform scattered academic materials into a centralized, searchable, and collaborative campus knowledge hub.

---

## Core Features

### 1. Authentication System (Mock)
- Student registration and login
- Demo login option
- Profile details (name, college, branch, semester)
- Session persistence using localStorage
- Auth state managed using React Context

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
- Private resources accessible only to same-college users
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

ACADEX is designed to feel like a real academic startup product, with smooth animations, responsive design, clean architecture, and a professional user experience suitable for hackathon demonstration.
