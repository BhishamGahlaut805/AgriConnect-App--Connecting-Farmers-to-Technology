import os
import tensorflow as tf
import numpy as np
from PIL import Image
from werkzeug.utils import secure_filename
from tensorflow.keras.preprocessing.image import img_to_array

class CropDiseasePredictor:
    def __init__(self):
        self.ModelPathPotato = os.getenv('MODEL_PATH_POTATO')
        self.ModelPathCotton = os.getenv('MODEL_PATH_COTTON')
        self.ModelPathAll = os.getenv('MODEL_PATH_ALL')
        self.IMAGE_SIZE = tuple(map(int, os.getenv('IMAGE_SIZE').split(',')))

        # Class label mappings
        self.CLASS_NAMES_POTATO = ['Early blight', 'Late blight', 'Healthy']
        self.CLASS_NAMES_COTTON = ['Aphids', 'Army Worm', 'Bacterial Blight', 'Healthy', 'Powdery Mildew', 'Target Spot']
        self.CLASS_NAMES_ALL = [
            ('Apple', 'Apple_scab'), ('Apple', 'Black_rot'), ('Apple', 'Cedar_apple_rust'), ('Apple', 'healthy'),
            ('Blueberry', 'healthy'),
            ('Cherry_(including_sour)', 'Powdery_mildew'), ('Cherry_(including_sour)', 'healthy'),
            ('Corn_(maize)', 'Cercospora_leaf_spot Gray_leaf_spot'), ('Corn_(maize)', 'Common_rust'),
            ('Corn_(maize)', 'Northern_Leaf_Blight'), ('Corn_(maize)', 'healthy'),
            ('Grape', 'Black_rot'), ('Grape', 'Esca_(Black_Measles)'),
            ('Grape', 'Leaf_blight_(Isariopsis_Leaf_Spot)'), ('Grape', 'healthy'),
            ('Orange', 'Haunglongbing_(Citrus_greening)'),
            ('Peach', 'Bacterial_spot'), ('Peach', 'healthy'),
            ('Pepper,_bell', 'Bacterial_spot'), ('Pepper,_bell', 'healthy'),
            ('Potato', 'Early_blight'), ('Potato', 'Late_blight'), ('Potato', 'healthy'),
            ('Raspberry', 'healthy'),
            ('Soybean', 'healthy'),
            ('Squash', 'Powdery_mildew'),
            ('Strawberry', 'Leaf_scorch'), ('Strawberry', 'healthy'),
            ('Tomato', 'Bacterial_spot'), ('Tomato', 'Early_blight'), ('Tomato', 'Late_blight'),
            ('Tomato', 'Leaf_Mold'), ('Tomato', 'Septoria_leaf_spot'),
            ('Tomato', 'Spider_mites Two-spotted_spider_mite'), ('Tomato', 'Target_Spot'),
            ('Tomato', 'Tomato_mosaic_virus'), ('Tomato', 'Tomato_Yellow_Leaf_Curl_Virus'),
            ('Tomato', 'healthy')
        ]

        self.__load_models()
        self.predict_crop_disease = self.predict_crop_disease

    def __load_models(self):
        self.model_potato = tf.keras.models.load_model(self.ModelPathPotato)
        self.model_cotton = tf.keras.models.load_model(self.ModelPathCotton)
        self.model_all = tf.keras.models.load_model(self.ModelPathAll)
        print("Models loaded successfully.")

    def preprocess_image(self, image_path):
        """Preprocess the image for model prediction."""
        img = Image.open(image_path).convert("RGB")
        img = img.resize(self.IMAGE_SIZE)
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def preprocess_all_model_image(self, image_path):
        img = Image.open(image_path).convert("RGB")
        img = img.resize(self.IMAGE_SIZE)
        img_array = img_to_array(img) / 255.0  # Normalize as in ImageDataGenerator
        img_array = np.expand_dims(img_array, axis=0)
        return img_array

    def predict_crop_disease(self, image_path, model_type):
        if model_type == 'all':
            img_array = self.preprocess_all_model_image(image_path)
            model = self.model_all
            class_labels = self.CLASS_NAMES_ALL
        elif model_type == 'potato':
            img_array = self.preprocess_image(image_path)
            model = self.model_potato
            class_labels = self.CLASS_NAMES_POTATO
        elif model_type == 'cotton':
            img_array = self.preprocess_image(image_path)
            model = self.model_cotton
            class_labels = self.CLASS_NAMES_COTTON
        else:
            raise ValueError(f"Unsupported model type: {model_type}")

        predictions = model.predict(img_array)
        predicted_index = int(np.argmax(predictions, axis=1)[0])
        confidence = float(predictions[0][predicted_index])

        # Format output
        if model_type == 'all':
            crop_name, disease = class_labels[predicted_index]
        else:
            crop_name = model_type.capitalize()
            disease = class_labels[predicted_index]

        return {
            "crop": crop_name,
            "disease": disease,
            "confidence": round(confidence, 4)
        }

