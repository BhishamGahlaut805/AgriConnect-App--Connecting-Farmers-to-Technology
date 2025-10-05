import { GiWheat, GiCorn, GiPlantSeed, GiFarmer } from "react-icons/gi";

// Fallback-based alias assignments for specific crops, using only the 4 allowed icons
export const CropIcons = {
  Bajra: GiPlantSeed, // General seed icon
  Rice: GiPlantSeed, // Using GiPlantSeed for Rice
  Wheat: GiWheat,
  Maize: GiCorn,
  Barley: GiPlantSeed, // Using GiPlantSeed for Barley
  Jowar: GiPlantSeed, // Using GiPlantSeed for Jowar
  Ragi: GiPlantSeed, // Using GiPlantSeed for Ragi
  "Small Millets": GiPlantSeed,
  "Shree Anna /Nutri Cereals": GiPlantSeed,
  "Nutri/Coarse Cereals": GiPlantSeed,
  Cereals: GiWheat, // General cereal icon
  Tur: GiPlantSeed, // General pulse icon
  Gram: GiPlantSeed, // Using GiPlantSeed for Gram
  Urad: GiPlantSeed, // General pulse icon
  Moong: GiPlantSeed, // General pulse icon
  Lentil: GiPlantSeed, // General pulse icon
  "Other Pulses": GiPlantSeed,
  "Total Pulses": GiPlantSeed,
  Groundnut: GiPlantSeed, // Using GiPlantSeed for Groundnut
  Castorseed: GiPlantSeed, // General seed icon
  Sesamum: GiPlantSeed, // Using GiPlantSeed for Sesamum
  Nigerseed: GiPlantSeed, // General seed icon
  Soybean: GiPlantSeed, // Using GiPlantSeed for Soybean
  Sunflower: GiPlantSeed, // Using GiPlantSeed for Sunflower
  "Rapeseed & Mustard": GiPlantSeed, // Using GiPlantSeed for Rapeseed & Mustard
  Linseed: GiPlantSeed, // General seed icon
  Safflower: GiPlantSeed, // Using GiPlantSeed for Safflower
  "Total Oil Seeds": GiPlantSeed,
  Sugarcane: GiPlantSeed, // Using GiPlantSeed for Sugarcane
  Cotton: GiPlantSeed, // Using GiPlantSeed for Cotton
  Jute: GiPlantSeed, // General plant icon
  Mesta: GiPlantSeed, // General plant icon
  "Jute & Mesta": GiPlantSeed,
  Tobacco: GiPlantSeed, // General plant icon
  Sannhemp: GiPlantSeed, // General plant icon
  Guarseed: GiPlantSeed, // Using GiPlantSeed for Guarseed
  // Default fallback icon
  Default: GiPlantSeed, // Default icon using GiPlantSeed
  Farmer: GiFarmer, // Explicitly include Farmer icon for general use
};
