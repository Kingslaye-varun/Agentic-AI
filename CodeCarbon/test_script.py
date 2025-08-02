from codecarbon import EmissionsTracker
import time
import os

# Ensure results directory exists
results_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'results')
if not os.path.exists(results_dir):
    os.makedirs(results_dir)

if __name__ == "__main__":
    # Initialize the tracker
    tracker = EmissionsTracker(
        project_name="test_run",
        output_file="results/emissions.csv",
        log_level="error"
    )
    tracker.start()
    
    try:
        print("Running test...")
        time.sleep(2)  # Just sleep for 2 seconds
        print("Completed test in 2 seconds")
    finally:
        emissions = tracker.stop()
        print("\nTotal emissions for test: " + "{:.6f}".format(emissions) + " kg CO2")