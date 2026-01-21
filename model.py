import torch
import torch.nn as nn

class DualHeadNet(nn.Module):
    def __init__(self):
        super().__init__()
        # Shared Layers (Sensing -> Perception)
        self.shared_net = nn.Sequential(
            nn.Linear(4, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU()
        )
        
        # Head A: Glyph Selection (3 Classes)
        # 0: Jagged, 1: Fluid, 2: Granular
        self.head_glyph = nn.Sequential(
            nn.Linear(32, 3), 
            nn.Softmax(dim=1) 
        )
        
        # Head B: Parameter Modulation (4 Params)
        # Output: [Scale, Opacity, Spikiness, Grain] (Range: 0.0 ~ 1.0)
        self.head_params = nn.Sequential(
            nn.Linear(32, 4),
            nn.Sigmoid() 
        )

    def forward(self, x):
        features = self.shared_net(x)
        glyph_probs = self.head_glyph(features)
        params = self.head_params(features)
        return glyph_probs, params