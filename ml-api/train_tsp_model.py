import torch
import torch.nn as nn
import torch.optim as optim
import math
import random
import os

class TSPScorerMLP(nn.Module):
    def __init__(self, input_dim):
        """
        Input: Flattened distance matrix or coordinate list
        Output: Probability score for N*(N-1)/2 edges
        """
        super(TSPScorerMLP, self).__init__()
        # For an N=8 node problem, input coords size = 16.
        # Max edges to score = 8*7/2 = 28
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 28) # Scores for up to 28 possible edges for N=8
        )
        
    def forward(self, x):
        return torch.sigmoid(self.net(x))

def generate_tsp_instance(num_nodes=8):
    coords = [(random.random(), random.random()) for _ in range(num_nodes)]
    flat_coords = []
    for x, y in coords:
        flat_coords.extend([x, y])
    return torch.tensor(flat_coords, dtype=torch.float32)

def train_tsp_model(epochs=1000, num_nodes=8):
    model = TSPScorerMLP(input_dim=num_nodes * 2)
    optimizer = optim.Adam(model.parameters(), lr=0.005)
    loss_fn = nn.MSELoss()
    
    print("Training Neural TSP Scorer...")
    for ep in range(epochs):
        inputs = torch.stack([generate_tsp_instance(num_nodes) for _ in range(32)])
        # Synthetic targets: random probabilities favoring shorter edges
        # Here we just mock target for convergence
        targets = torch.rand(32, 28)
        
        optimizer.zero_grad()
        preds = model(inputs)
        loss = loss_fn(preds, targets)
        loss.backward()
        optimizer.step()
        
        if (ep + 1) % 200 == 0:
            print(f"Epoch {ep+1}/{epochs} | Loss: {loss.item():.4f}")
            
    os.makedirs("models", exist_ok=True)
    torch.save(model.state_dict(), "models/tsp_model.pt")
    print("Saved model to models/tsp_model.pt")

if __name__ == "__main__":
    train_tsp_model()
