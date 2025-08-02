from codecarbon import EmissionsTracker
from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import time

def train_ml_model():
    """Train a machine learning model"""
    print("Training ML model...")
    
    # Generate synthetic data
    X, y = make_classification(
        n_samples=100000,
        n_features=30,
        n_informative=15,
        random_state=42
    )
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    # Train model
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=10,
        random_state=42
    )
    
    start_time = time.time()
    model.fit(X_train, y_train)
    training_time = time.time() - start_time
    
    # Evaluate
    accuracy = model.score(X_test, y_test)
    
    return accuracy, training_time

if __name__ == "__main__":
    tracker = EmissionsTracker(
        project_name="ml_training",
        output_file="emissions.csv",
        log_level="error"
    )
    tracker.start()
    
    try:
        accuracy, duration = train_ml_model()
        print(f"Model accuracy: {accuracy:.4f}, Training time: {duration:.2f}s")
    finally:
        emissions = tracker.stop()
        print(f"ML training emissions: {emissions:.6f} kg CO2")