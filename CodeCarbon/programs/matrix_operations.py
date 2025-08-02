from codecarbon import EmissionsTracker
import numpy as np
import time

def perform_matrix_operations():
    """Perform intensive matrix operations"""
    print("Starting matrix operations...")
    
    # Create large matrices
    size = 2000
    A = np.random.rand(size, size)
    B = np.random.rand(size, size)
    
    # Perform various operations
    start_time = time.time()
    
    # Matrix multiplication
    C = np.dot(A, B)
    
    # Eigenvalue decomposition
    eigenvalues = np.linalg.eigvals(C)
    
    # Singular value decomposition
    U, s, V = np.linalg.svd(C)
    
    computation_time = time.time() - start_time
    
    return computation_time

if __name__ == "__main__":
    tracker = EmissionsTracker(
        project_name="matrix_operations",
        output_file="emissions.csv",
        log_level="error"
    )
    tracker.start()
    
    try:
        duration = perform_matrix_operations()
        print(f"Matrix operations completed in {duration:.2f} seconds")
    finally:
        emissions = tracker.stop()
        print(f"Matrix operations emissions: {emissions:.6f} kg CO2")