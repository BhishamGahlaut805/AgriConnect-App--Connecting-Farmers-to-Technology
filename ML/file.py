import pandas as pd
df=pd.read_csv(r"C:\Users\bhish\OneDrive\Desktop\AgriSupport\ML\TrainingReports\AgriSupportFarmSample\Yield_data.csv")

#print all the unique crop names with their seasons and types
unique_crops = df[['crop', 'season', 'crop_type']].drop_duplicates()
print(unique_crops)
