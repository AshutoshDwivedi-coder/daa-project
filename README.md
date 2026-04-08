# AI Algorithm Visualizer

A full-stack AI-powered web application demonstrating advanced reinforcement learning and neural network techniques on standard Computer Science structures.

## System Requirements
- Node.js 18+
- Python 3.9+
- `pip`, `npm`

## Setup & Running Locally

The application is divided into three parts. You need three separate terminal windows to run them concurrently.

### 1. Machine Learning API (FastAPI)
This handles the heavy predictive logic and simulates the environments.
```bash
cd ml-api
pip install -r requirements.txt
python train_rl_tree.py    # Generates RL model
python train_tsp_model.py  # Generates TSP model
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*API will run on http://localhost:8000*

### 2. Backend Server (Node.js + Express)
This acts as a proxy/middleman to securely contact the ML API.
```bash
cd backend
npm install
npm start
```
*Server will run on http://localhost:5000*

### 3. Frontend Web App (React + Vite)
This provides the interactive visualization dashboard.
```bash
cd frontend
npm install
npm run dev
```
*Open http://localhost:5173 in your browser*

---

## Features
- **RL Tree Optimizer**: Watch a simulated Agent restructure a BST for minimal search depth using animated D3.js trees.
- **Neural B&B TSP**: Watch a Neural Network guide a standard Branch & Bound graph traversal, forecasting dead branches in real-time.
