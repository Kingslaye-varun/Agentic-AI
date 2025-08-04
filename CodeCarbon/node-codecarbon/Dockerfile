FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Python and pip
RUN apk add --no-cache python3 py3-pip gcc python3-dev musl-dev linux-headers

# Create and use a virtual environment for CodeCarbon
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install CodeCarbon in the virtual environment
RUN . /opt/venv/bin/activate && pip install codecarbon

# Create volume mount points
RUN mkdir -p /app/uploads /app/results
VOLUME ["/app/uploads", "/app/results"]

# Create a wrapper script to run Node.js programs with CodeCarbon tracking
RUN echo '#!/bin/sh\n\
PROGRAM_PATH=$1\n\
shift\n\
PROGRAM_NAME=$(basename "$PROGRAM_PATH" .js)\n\
OUTPUT_FILE=${CODECARBON_OUTPUT_DIR:-/app/results}/emissions.csv\n\
python3 -c "\n\
from codecarbon import EmissionsTracker\n\
import subprocess\n\
import time\n\
import os\n\
\n\
# Initialize the tracker\n\
tracker = EmissionsTracker(\n\
    project_name=\"$PROGRAM_NAME\",\n\
    output_file=\"$OUTPUT_FILE\",\n\
    log_level=\"error\"\n\
)\n\
tracker.start()\n\
\n\
try:\n\
    start_time = time.time()\n\
    subprocess.run([\"node\", \"$PROGRAM_PATH\"] + [arg for arg in \"$@\".split() if arg], check=True)\n\
    duration = time.time() - start_time\n\
    print(f\"Completed $PROGRAM_NAME in {duration:.2f} seconds\")\n\
finally:\n\
    emissions = tracker.stop()\n\
    print(f\"\\nTotal emissions for $PROGRAM_NAME: {emissions:.6f} kg CO2\")\n\
"' > /app/run_with_codecarbon.sh

RUN chmod +x /app/run_with_codecarbon.sh

# Set the entrypoint to the wrapper script
ENTRYPOINT ["/app/run_with_codecarbon.sh"]