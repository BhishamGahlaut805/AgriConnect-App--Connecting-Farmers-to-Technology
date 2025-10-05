# app.py — Weed Detection Dashboard
# Run with: streamlit run app.py

import streamlit as st
from ultralytics import YOLO
import cv2
import tempfile
import os
import numpy as np
import pandas as pd
import plotly.express as px

# -----------------------------
# Load YOLO model
# -----------------------------
model_path = r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\TrainModel\runs\detect\weed_detection2\weights\best.pt"
model = YOLO(model_path)

st.title("🌱 Weed Detection Dashboard")

# -----------------------------
# Video Upload
# -----------------------------
uploaded_video = st.file_uploader("Upload a video for weed detection", type=["mp4", "avi", "mov"])

if uploaded_video:
    # Save uploaded video to a temp file
    tfile = tempfile.NamedTemporaryFile(delete=False)
    tfile.write(uploaded_video.read())
    video_path = tfile.name

    # Open video
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    weed_counts = []
    frame_nums = []

    stframe = st.empty()
    progress_bar = st.progress(0)

    frame_idx = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Run YOLO detection
        results = model.predict(frame, verbose=False)

        # Count weeds (detections)
        boxes = results[0].boxes
        count = len(boxes)
        weed_counts.append(count)
        frame_nums.append(frame_idx)

        # Annotated frame
        annotated_frame = results[0].plot()

        # Convert BGR to RGB for display
        stframe.image(cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB), caption=f"Frame {frame_idx}", channels="RGB")

        frame_idx += 1
        progress_bar.progress(min(frame_idx / total_frames, 1.0))

    cap.release()

    # -----------------------------
    # Data Analysis
    # -----------------------------
    df = pd.DataFrame({"Frame": frame_nums, "Weed_Count": weed_counts})

    avg_density = np.mean(weed_counts)

    st.subheader("📊 Weed Detection Analysis")
    st.write(f"**Average Weed Count per Frame:** {avg_density:.2f}")

    fig = px.line(df, x="Frame", y="Weed_Count", title="Weed Density per Frame", markers=True)
    st.plotly_chart(fig)

    hist_fig = px.histogram(df, x="Weed_Count", nbins=20, title="Distribution of Weed Detections")
    st.plotly_chart(hist_fig)
