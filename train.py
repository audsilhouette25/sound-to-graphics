import json
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from model import DualHeadNet

class SoundDataset(Dataset):
    def __init__(self, path):
        with open(path, 'r') as f:
            data = json.load(f)
        
        self.inputs = np.array([d['input'] for d in data], dtype=np.float32)
        self.glyphs = np.array([d['label_glyph'] for d in data], dtype=np.longlong)
        self.params = np.array([d['label_params'] for d in data], dtype=np.float32)

    def __len__(self): return len(self.inputs)
    def __getitem__(self, idx):
        return (torch.from_numpy(self.inputs[idx]), 
                torch.tensor(self.glyphs[idx]), 
                torch.from_numpy(self.params[idx]))

if __name__ == "__main__":
    if not os.path.exists('data/training_data.json'):
        print("No training data found.")
        exit()

    dataset = SoundDataset('data/training_data.json')
    loader = DataLoader(dataset, batch_size=16, shuffle=True)
    
    model = DualHeadNet()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Loss Functions
    criterion_glyph = nn.CrossEntropyLoss()
    criterion_param = nn.MSELoss()
    
    print("🚀 Training Started...")
    model.train()
    
    for epoch in range(100):
        total_loss = 0
        for x, y_glyph, y_param in loader:
            optimizer.zero_grad()
            pred_glyph, pred_param = model(x)
            
            loss_g = criterion_glyph(pred_glyph, y_glyph)
            loss_p = criterion_param(pred_param, y_param)
            
            loss = loss_g + loss_p
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
            
        if epoch % 10 == 0:
            print(f"Epoch {epoch} | Loss: {total_loss:.4f}")
            
    torch.save(model.state_dict(), 'best_model.pth')
    print("✅ Model Updated & Saved!")