from codecarbon import EmissionsTracker
import numpy as np
from PIL import Image, ImageFilter
import time
import os

def process_images():
    """Simulate processing multiple images"""
    print("Starting image processing...")
    
    # Create a temporary directory for images
    if not os.path.exists('temp_images'):
        os.makedirs('temp_images')
    
    # Process 20 sample images
    for i in range(1, 21):
        # Create a random image
        img_array = np.random.rand(1024, 1024, 3) * 255
        img = Image.fromarray(img_array.astype('uint8')).convert('RGB')
        
        # Apply various filters
        img = img.filter(ImageFilter.GaussianBlur(radius=2))
        img = img.filter(ImageFilter.SHARPEN)
        img = img.filter(ImageFilter.EDGE_ENHANCE)
        
        # Save the image
        img.save(f'temp_images/processed_{i}.jpg')
        time.sleep(0.2)
    
    return 20  # Number of images processed

if __name__ == "__main__":
    tracker = EmissionsTracker(
        project_name="image_processing",
        output_file="emissions.csv",
        log_level="error"
    )
    tracker.start()
    
    try:
        num_images = process_images()
        print(f"Processed {num_images} images")
    finally:
        emissions = tracker.stop()
        print(f"Image processing emissions: {emissions:.6f} kg CO2")