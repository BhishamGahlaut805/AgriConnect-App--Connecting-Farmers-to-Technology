import pandas as pd

# Step 1: Read all tables from the HTML `.xls` file
xls_path = "C:\\Users\\bhish\\Downloads\\horizontal_crop_vertical_year_report (6).xls"
all_tables = pd.read_html(xls_path, header=0)  # try to use first row as header

# Step 2: Combine all tables into one
df = pd.concat(all_tables, ignore_index=True)

# Step 3: Flatten MultiIndex if exists
if isinstance(df.columns, pd.MultiIndex):
    df.columns = [' '.join(col).strip() for col in df.columns.values]

# Step 4: Remove unnamed columns (which are usually index placeholders)
df = df.loc[:, ~df.columns.astype(str).str.contains('^Unnamed', case=False)]

# Step 5: Try to guess ID columns (adjust as needed)
id_candidates = ["State", "District", "Crop", "Season", "Year", "Variety", "Irrigation"]
id_columns = [col for col in df.columns if any(key.lower() in col.lower() for key in id_candidates)]

# Step 6: Value columns = All columns except ID columns
value_columns = [col for col in df.columns if col not in id_columns]

# Step 7: Melt (wide to long format)
df_long = pd.melt(df, id_vars=id_columns, value_vars=value_columns,
                  var_name="Parameter", value_name="Value")

# Step 8: Drop rows with missing values (optional)
df_long = df_long.dropna(subset=["Value"])

# Step 9: Save to CSV
df_long.to_csv("vertical_crop_data.csv", index=False)
print(f"✅ CSV saved: vertical_crop_data.csv with {len(df_long)} rows and {df_long.shape[1]} columns.")
