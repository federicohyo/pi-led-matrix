#!/bin/bash

LIB_DIR="/home/pi/led/WS2801-PI/lib"

while true; do
    # Get a list of all .js files
    files=("$LIB_DIR"/*.js)

    # Check if there are files available
    if [ ${#files[@]} -eq 0 ]; then
        echo "No JavaScript files found in $LIB_DIR"
        exit 1
    fi

    # Pick a random file
    random_file="${files[RANDOM % ${#files[@]}]}"
    echo "Running: $random_file"

    # Run the file in the background
    node "$random_file" &
    PID=$!

    # Wait for 30 seconds
    sleep 30

    # Kill the running Node.js process
    kill $PID 2>/dev/null
    wait $PID 2>/dev/null

    echo "Stopping: $random_file"
    
    # Small delay before switching
    sleep 2
done

