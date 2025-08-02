from codecarbon import EmissionsTracker
import subprocess
import time
import os

# Ensure results directory exists
results_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'results')
if not os.path.exists(results_dir):
    os.makedirs(results_dir)

# List of programs to run
programs = [
    "data_processing"
]

if __name__ == "__main__":
    # Initialize the tracker
    tracker = EmissionsTracker(
        project_name="custom_run",
        output_file="results/emissions.csv",
        log_level="error"
    )
    tracker.start()
    
    try:
        for program in programs:
            print("Running " + program + "...")
            start_time = time.time()
            program_path = os.path.join("programs", program + ".py")
            if os.path.exists(program_path):
                subprocess.run(["python", program_path], check=True)
                duration = time.time() - start_time
                print("Completed " + program + " in " + "{:.2f}".format(duration) + " seconds")
            else:
                print("Error: Program file not found: " + program_path)
    finally:
        emissions = tracker.stop()
        print("\nTotal emissions for selected programs: " + "{:.6f}".format(emissions) + " kg CO2")