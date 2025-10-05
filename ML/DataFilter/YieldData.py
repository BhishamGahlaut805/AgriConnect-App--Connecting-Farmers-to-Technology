import pandas as pd

# Step 1: Load the original dataset
df = pd.read_csv(r"C:\Users\bhish\Downloads\crop-wise-area-production-yield.csv")

# Step 2: Clean column names
df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

# Step 3: Strip whitespaces from all string columns (like season, year)
df = df.apply(lambda col: col.str.strip() if col.dtype == "object" else col)

# Step 4: Filter only target years
target_years = ["2015-16", "2016-17", "2017-18", "2018-19", "2019-20"]
filtered_df = df[df["year"].isin(target_years)].copy()

# Step 5: Map those years to actual calendar years
year_mapping = {
    "2015-16": "2020",
    "2016-17": "2021",
    "2017-18": "2022",
    "2018-19": "2023",
    "2019-20": "2024"
}
filtered_df["year"] = filtered_df["year"].map(year_mapping)

# Step 6: Save the clean filtered dataset
filtered_df.to_csv("FinalYieldData.csv", index=False)

print("[✓] 'FinalYieldData.csv' saved with cleaned columns and mapped years.")
