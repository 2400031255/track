# DhanaTrack

> Lending. Collateral. Savings. Simplified.

A premium financial management web application built with React + Vite + Firebase.

## Live App

🔗 https://2400031255.github.io/track/

## Login

| Username | Password | Role  |
|----------|----------|-------|
| nikhil   | nikhil2006 | Admin |

## Tech Stack

- React + Vite
- Firebase Auth, Firestore, Storage
- Recharts
- Deployed on GitHub Pages

## Features

- Money lending & interest tracking
- Late payment fee calculation
- Collateral / Thakkatu management with photo uploads
- Payment collection system
- Personal savings tracker with monthly targets
- Employee management & approval workflow
- Activity logs & reports

## Local Development

```bash
npm install
npm run dev
```

Open: http://localhost:5173/track/

## Deploy

Push to `main` branch — GitHub Actions auto-deploys to GitHub Pages.

## Firebase Setup

Enable in Firebase Console:
- Authentication (Email/Password)
- Cloud Firestore
- Storage

Apply security rules from `firestore.rules` and `storage.rules`.
