import plotly.graph_objects as go
from plotly.subplots import make_subplots
import numpy as np
from typing import Dict, List
import pandas as pd

class AttentionVisualizer:
    def __init__(self, predictor):
        self.predictor = predictor

    def plot_attention_weights(self, df: pd.DataFrame) -> go.Figure:
        """Create interactive plot of attention weights"""
        raw_preds, x = self.predictor.predict(df, mode="raw")
        attention_data = self.predictor.get_attention_weights(raw_preds)

        fig = make_subplots(
            rows=2, cols=1,
            subplot_titles=("Attention Weights Over Time", "Feature Importance")
        )

        # Attention weights
        attention = attention_data.get('attention', [])
        fig.add_trace(
            go.Scatter(
                x=list(range(len(attention))),
                y=attention,
                mode='lines+markers',
                name='Attention'
            ),
            row=1, col=1
        )

        # Feature importance (Top 10)
        feature_importance = self.predictor.get_feature_importance(raw_preds, x)
        dynamic_features = sorted(
            feature_importance.get('dynamic_features', {}).items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )[:10]

        if dynamic_features:
            features, importance = zip(*dynamic_features)
            fig.add_trace(
                go.Bar(
                    x=features,
                    y=importance,
                    name='Feature Importance'
                ),
                row=2, col=1
            )

        # Layout
        fig.update_layout(
            height=800,
            title_text="Model Attention and Feature Importance Analysis",
            showlegend=False
        )

        fig.update_xaxes(title_text="Time Step", row=1, col=1)
        fig.update_yaxes(title_text="Attention Weight", row=1, col=1)
        fig.update_xaxes(title_text="Feature", row=2, col=1)
        fig.update_yaxes(title_text="Importance Score", row=2, col=1)

        return fig

    def plot_what_if_scenario(self, scenario_results: Dict) -> go.Figure:
        """Visualize what-if scenario results"""
        fig = go.Figure()

        # Confidence intervals
        for key, color in zip(['low_98', 'low_90', 'median', 'high_90', 'high_98'],
                              ['rgba(255,0,0,0.1)', 'rgba(255,0,0,0.3)', 'red',
                               'rgba(0,255,0,0.3)', 'rgba(0,255,0,0.1)']):

            y_vals = [
                scenario_results.get('baseline', {}).get(key, None),
                scenario_results.get('modified', {}).get(key, None)
            ]

            fig.add_trace(go.Scatter(
                x=['Baseline', 'Modified'],
                y=y_vals,
                fill=None if key == 'median' else 'tonexty',
                mode='lines+markers',
                line=dict(color=color),
                name=key.replace('_', ' ').title()
            ))

        # Delta marker (median)
        fig.add_trace(go.Scatter(
            x=['Modified'],
            y=[scenario_results['modified'].get('median', None)],
            mode='markers+text',
            text=[f"Δ {scenario_results['delta'].get('median', 0):.2f}"],
            textposition="top center",
            marker=dict(size=15, color='gold')
        ))

        fig.update_layout(
            title="What-If Scenario Analysis",
            yaxis_title="Predicted Yield",
            hovermode="x unified"
        )

        return fig
