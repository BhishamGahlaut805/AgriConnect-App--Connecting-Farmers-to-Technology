import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from datetime import datetime
import os
import logging
from typing import List, Dict
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from .LSTMModel import YieldPredictor
class PaddedSequenceDataset(Dataset):
    def __init__(self, sequences: List[np.ndarray], targets: List[float], scaler_y: MinMaxScaler = None):
        self.sequences = sequences
        self.targets = targets
        self.scaler_y = scaler_y

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        target = self.targets[idx]
        if self.scaler_y:
            target = self.scaler_y.transform([[target]])[0][0]
        return {
            'sequence': self.sequences[idx].astype(np.float32),
            'target': float(target),
            'length': len(self.sequences[idx])
        }

def collate_fn(batch):
    batch.sort(key=lambda x: x['length'], reverse=True)
    sequences = [torch.from_numpy(item['sequence']) for item in batch]
    lengths = torch.tensor([item['length'] for item in batch], dtype=torch.long)
    targets = torch.tensor([item['target'] for item in batch], dtype=torch.float32)
    padded_seqs = nn.utils.rnn.pad_sequence(sequences, batch_first=True)
    return {'sequences': padded_seqs, 'targets': targets, 'lengths': lengths}

class LSTMTrainer:
    def __init__(self, config: Dict):
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.logger = logging.getLogger(__name__)
        self.scaler_y = MinMaxScaler(feature_range=(0, 1))  # Scale targets to [0,1]

    def train(self, sequences: List[np.ndarray], targets: List[float], farm_id: str, crop_name: str):
        try:
            # Scale targets
            targets_scaled = self.scaler_y.fit_transform(np.array(targets).reshape(-1, 1)).flatten()

            # Dataset and DataLoader
            dataset = PaddedSequenceDataset(sequences, targets_scaled, self.scaler_y)
            loader = DataLoader(
                dataset,
                batch_size=self.config['training']['batch_size'],
                shuffle=True,
                collate_fn=collate_fn
            )

            # Model initialization
            input_size = sequences[0].shape[1]
            model = YieldPredictor(input_size, self.config).to(self.device)
            optimizer = optim.AdamW(model.parameters(), lr=self.config['training']['lr'])
            scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min', patience=5)
            criterion = nn.MSELoss()

            best_loss = float('inf')
            early_stop_counter = 0

            for epoch in range(self.config['training']['epochs']):
                model.train()
                epoch_loss = 0.0

                for batch in loader:
                    inputs = batch['sequences'].to(self.device)
                    targets = batch['targets'].to(self.device)
                    lengths = batch['lengths'].to(self.device)

                    optimizer.zero_grad()
                    outputs = model(inputs, lengths)
                    loss = criterion(outputs['yield'], targets)
                    loss.backward()
                    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                    optimizer.step()

                    epoch_loss += loss.item()

                avg_loss = epoch_loss / len(loader)
                scheduler.step(avg_loss)

                # Early stopping and model saving
                if avg_loss < best_loss - self.config['training']['min_delta']:
                    best_loss = avg_loss
                    early_stop_counter = 0
                    self._save_model(model, farm_id, crop_name)
                else:
                    early_stop_counter += 1
                    if early_stop_counter >= self.config['training']['patience']:
                        break

            return os.path.join(self.config['model_dir'], farm_id, "crops", crop_name, "model_best.pt")

        except Exception as e:
            self.logger.error(f"Training failed: {str(e)}", exc_info=True)
            raise

    def _save_model(self, model, farm_id, crop_name):
        save_dir = os.path.join(self.config['model_dir'], farm_id, "crops", crop_name)
        os.makedirs(save_dir, exist_ok=True)

        checkpoint = {
            'model_state': model.state_dict(),
            'config': self.config,
            'scaler_y': self.scaler_y,
            'input_size': model.input_size,
            'timestamp': datetime.now().isoformat()
        }

        torch.save(checkpoint, os.path.join(save_dir, "model_best.pt"))