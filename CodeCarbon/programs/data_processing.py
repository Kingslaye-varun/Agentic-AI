from codecarbon import EmissionsTracker
import pandas as pd
import numpy as np
import time

def process_large_dataset():
    """Simulate processing a large dataset"""
    print("Starting data processing...")
    
    # Create a large DataFrame
    df = pd.DataFrame(np.random.rand(100000, 50))
    
    # Perform various operations
    df = df * df
    df['sum'] = df.sum(axis=1)
    df['mean'] = df.mean(axis=1)
    df['std'] = df.std(axis=1)
    
    # Simulate processing time
    time.sleep(3)
    
    return df.shape

if __name__ == "__main__":
    tracker = EmissionsTracker(
        project_name="data_processing",
        output_file="emissions.csv",
        log_level="error"
    )
    tracker.start()
    
    try:
        rows, cols = process_large_dataset()
        print(f"Processed {rows} rows with {cols} columns")
    finally:
        emissions = tracker.stop()
        print(f"Data processing emissions: {emissions:.6f} kg CO2")