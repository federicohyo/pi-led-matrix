#!/bin/bash

LIB_DIR="/home/pi/led/WS2801-PI/lib"
SNN_SCRIPT="$LIB_DIR/spiking_neural_network.js"
SNN_DURATION=1800        # 30 minutes
ROTATION_DURATION=300    # 5 minutes of rotating other animations
ROTATION_INTERVAL=30     # switch animation every 30 seconds during rotation

while true; do
    # --- Phase 1: Spiking Neural Network for 30 minutes ---
    echo "$(date): Starting Spiking Neural Network for ${SNN_DURATION}s"
    node "$SNN_SCRIPT" &
    PID=$!
    sleep $SNN_DURATION
    kill $PID 2>/dev/null
    wait $PID 2>/dev/null
    echo "$(date): Stopping Spiking Neural Network"
    sleep 2

    # --- Phase 2: Rotate other animations for 5 minutes ---
    echo "$(date): Starting rotation for ${ROTATION_DURATION}s"
    ROTATION_END=$((SECONDS + ROTATION_DURATION))

    # Get all animations except SNN
    files=()
    for f in "$LIB_DIR"/*.js; do
        [ "$f" != "$SNN_SCRIPT" ] && files+=("$f")
    done

    if [ ${#files[@]} -eq 0 ]; then
        echo "No other animations found, skipping rotation"
        continue
    fi

    while [ $SECONDS -lt $ROTATION_END ]; do
        random_file="${files[RANDOM % ${#files[@]}]}"
        echo "$(date): Running: $random_file"

        node "$random_file" &
        PID=$!
        sleep $ROTATION_INTERVAL
        kill $PID 2>/dev/null
        wait $PID 2>/dev/null

        echo "$(date): Stopping: $random_file"
        sleep 2
    done
done

