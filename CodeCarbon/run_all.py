from codecarbon import EmissionsTracker
import subprocess
import time

programs = [
    "data_processing.py",
    "ml_training.py",
    "web_scraping.py",
    "image_processing.py",
    "matrix_operations.py"
]

if __name__ == "__main__":
    tracker = EmissionsTracker(
        project_name="full_suite",
        output_file="/app/results/emissions.csv",
        log_level="error"
    )
    tracker.start()
    
    try:
        for program in programs:
            print(f"\nRunning {program}...")
            start_time = time.time()
            subprocess.run(["python", f"programs/{program}"], check=True)
            duration = time.time() - start_time
            print(f"Completed {program} in {duration:.2f} seconds")
    finally:
        emissions = tracker.stop()
        print(f"\nTotal emissions for all programs: {emissions:.6f} kg CO2")