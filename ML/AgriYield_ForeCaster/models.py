from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List, Any
from datetime import datetime

# ----------------------------- Request Schemas -----------------------------

class PredictionRequest(BaseModel):
    farm_id: str
    crop: str
    session_id: str
    # forecast_days: Optional[int] = Field(default=30, description="Days to forecast")
    # include_comparison: Optional[bool] = Field(default=True, description="Include historical/similar farm comparison")


class ChatRequest(BaseModel):
    farm_id: str
    session_id: str
    message: str
    crop: Optional[str] = Field(default=None, description="Crop for context-specific chat")
    current_conditions: Optional[Dict[str, Any]] = Field(default=None, description="Optional weather/soil input")


class VisualizationRequest(BaseModel):
    farm_id: str
    crop: str
    session_id: str
    visualization_type: Optional[str] = Field(default="attention", description="attention | importance | what-if")
    time_window: Optional[int] = Field(default=365, description="Days to visualize")


# ----------------------------- Response Schemas -----------------------------

class YieldPrediction(BaseModel):
    value: float = Field(..., description="Predicted yield value")
    unit: str = Field(default="kg/ha", description="Yield unit")
    confidence_interval: Dict[str, float] = Field(..., description="Low/high prediction bounds")
    percentiles: Dict[str, float] = Field(..., description="Quantile predictions (median, etc.)")
    feature_importance: Dict[str, float] = Field(..., description="Feature contribution scores")

    model_config = ConfigDict(arbitrary_types_allowed=True)


class AnalysisReport(BaseModel):
    prediction: YieldPrediction
    temporal_analysis: Dict[str, Any]
    comparative_analysis: Dict[str, Any]
    recommendations: List[str]

    model_config = ConfigDict(arbitrary_types_allowed=True)
