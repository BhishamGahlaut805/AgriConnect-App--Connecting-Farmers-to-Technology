import torch
import pandas as pd
from pytorch_forecasting import TimeSeriesDataSet

class TFTPredictor:
    def __init__(self, model, dataset):
        self.model = model.to("cuda" if torch.cuda.is_available() else "cpu")
        self.model.eval()
        self.dataset = dataset

    def predict(self, df):
        # Ensure same preprocessing as training
        df["time_idx"] = df.groupby("crop").cumcount()
        df["group_id"] = df["crop"].astype(str)

        predict_ds = TimeSeriesDataSet.from_dataset(
            self.dataset,
            df,
            stop_randomization=True
        )

        dataloader = predict_ds.to_dataloader(train=False, batch_size=32)
        return self.model.predict(dataloader, mode="quantiles")

    def simulate_what_if(self, df, feature, change_percent):
        # Baseline prediction
        baseline_pred = self.predict(df)

        # Modified prediction
        modified_df = df.copy()
        modified_df[feature] = modified_df[feature] * (1 + change_percent/100)
        modified_pred = self.predict(modified_df)

        return {
            "baseline": baseline_pred.numpy().tolist(),
            "modified": modified_pred.numpy().tolist(),
            "change_percent": change_percent,
            "feature": feature
        }