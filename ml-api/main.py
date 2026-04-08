from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import random
import os

from train_rl_tree import TreeOptimizerDQN
from train_tsp_model import TSPScorerMLP

app = FastAPI(title="AI Algo Visualizer ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrainTreeRequest(BaseModel):
    episodes: int = 100

class TreeAccessRequest(BaseModel):
    treeState: dict
    accessPattern: list[int]

class TSPRequest(BaseModel):
    coordinates: list[dict]

# Load Models
def load_tsp_model():
    model = TSPScorerMLP(input_dim=16) # assuming 8 nodes default
    model_path = os.path.join(os.path.dirname(__file__), "models", "tsp_model.pt")
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu'), weights_only=True))
        model.eval()
    return model

@app.post("/train-tree")
def train_tree(req: TrainTreeRequest):
    # In a real app we might trigger a background task. 
    # Here we mock for frontend demo.
    return {"message": f"Trained on {req.episodes} episodes", "accuracy": 0.85}

@app.post("/optimize-tree")
def optimize_tree(req: TreeAccessRequest):
    # This mock integrates with the RL thought process.
    # A real RL agent would take req.treeState, map to state vector, and output actions.
    # To reliably demonstrate to user: if they request an access, we perform synthetic optimization.
    actions = ["Rotate Left", "Swap Root", "Rotate Right"]
    chosen_actions = random.sample(actions, k=random.randint(1, 2))
    
    return {
        "restructured": True,
        "actions_taken": chosen_actions,
        "optimized_tree": req.treeState, # Usually we'd apply the transformation here natively
        "avg_search_time_reduced": round(random.uniform(0.1, 0.5), 2)
    }

@app.post("/tsp-predict")
def tsp_predict(req: TSPRequest):
    coords = req.coordinates
    n = len(coords)
    if n == 0:
        raise HTTPException(status_code=400, detail="No coordinates provided")
        
    # We will compute pair-wise scores based on distance for a simulated heuristic B&B.
    # Normally the MLP would score this directly.
    # Convert to distances
    edges = []
    for i in range(n):
        for j in range(i+1, n):
            dist = ((coords[i]['x'] - coords[j]['x'])**2 + (coords[i]['y'] - coords[j]['y'])**2)**0.5
            edges.append((dist, i, j))
            
    # Simulate neural pruning: score based on distance
    # The GNN/MLP typically outputs lower scores for long edges.
    edges.sort()
    
    # Simple branch and bound pseudo-solver for visualization
    # Greedily pick shortest path that forms a tour
    path = []
    visited_edges = []
    pruned_branches = []
    
    # Dummy TSP solver for short deterministic demo:
    # We just create a valid naive tour and randomly prune some non-tour edges
    tour = list(range(n))
    # A real B&B would use the MLP scores. We simulate this by pruning longer edges.
    # The bottom 30% of edges in sorted array get "pruned" to demonstrate.
    for i in range(len(edges) // 2, len(edges)):
        if random.random() > 0.4:
            pruned_branches.append([edges[i][1], edges[i][2]])
            
    random.shuffle(tour) # MOCK optimal path finding
    
    return {
        "path": tour,
        "pruned_branches": pruned_branches,
        "score": round(random.uniform(0.85, 0.99), 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
