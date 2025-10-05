import os
import torch
import pandas as pd
from pytorch_forecasting import TimeSeriesDataSet, TemporalFusionTransformer
from pytorch_forecasting.metrics import QuantileLoss
from lightning.pytorch import Trainer
from lightning.pytorch.callbacks import EarlyStopping, ModelCheckpoint

class TFTTrainer:
    def __init__(self, config):
        self.config = config
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        torch.set_float32_matmul_precision('medium')

    def preprocess_data(self, df):
        # Basic preprocessing
        df = df.sort_values(["crop", "date"])
        df["time_idx"] = df.groupby("crop").cumcount()
        df["group_id"] = df["crop"].astype(str)
        return df

    def create_dataset(self, df):
        return TimeSeriesDataSet(
            df,
            time_idx="time_idx",
            target="yield",
            group_ids=["group_id"],
            max_encoder_length=self.config["data"]["encoder_length"],
            max_prediction_length=self.config["data"]["prediction_length"],
            static_categoricals=["crop"],
            time_varying_unknown_reals=["yield", "temperature_2m_mean", "precipitation_sum"],
            target_normalizer=None,
            add_relative_time_idx=True,
            add_target_scales=True,
            allow_missing_timesteps=True
        )

    def train_model(self, dataset, crop_name):
        trainer = Trainer(
            max_epochs=self.config["training"]["max_epochs"],
            accelerator="auto",
            devices=1,
            callbacks=[
                EarlyStopping(monitor="val_loss", patience=self.config["model"]["patience"]),
                ModelCheckpoint(monitor="val_loss")
            ],
            enable_progress_bar=True
        )

        model = TemporalFusionTransformer.from_dataset(
            dataset,
            learning_rate=self.config["model"]["learning_rate"],
            hidden_size=self.config["model"]["hidden_size"],
            dropout_rate=self.config["model"]["dropout"],
            loss=QuantileLoss(),
            log_interval=10
        )

        train_loader = dataset.to_dataloader(train=True, batch_size=self.config["training"]["batch_size"])
        val_loader = dataset.to_dataloader(train=False, batch_size=self.config["training"]["batch_size"]*2)

        trainer.fit(model, train_dataloaders=train_loader, val_dataloaders=val_loader)
        return model

    def train_crop(self, crop_data, crop_name):
        df = self.preprocess_data(crop_data)
        dataset = self.create_dataset(df)
        return self.train_model(dataset, crop_name)
    