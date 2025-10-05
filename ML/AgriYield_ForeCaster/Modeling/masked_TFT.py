import torch
from pytorch_forecasting.models.temporal_fusion_transformer import TemporalFusionTransformer


class MaskedLossTFT(TemporalFusionTransformer):
    def training_step(self, batch, batch_idx):
        x, y = batch
        y_pred = self(x)

        # Mask invalid targets (NaNs)
        # ''' Ensure y is a tensor and mask NaN values'''
        
        mask = torch.isfinite(y)
        y_masked = y[mask]
        y_pred_masked = y_pred[mask]

        if y_masked.numel() == 0:
            loss = torch.tensor(0.0, requires_grad=True, device=self.device)
        else:
            loss = self.loss(y_pred_masked, y_masked)

        self.log("train_loss", loss, on_step=False, on_epoch=True, prog_bar=True)
        return loss
