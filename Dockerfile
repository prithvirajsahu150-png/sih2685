FROM node:18-bullseye

WORKDIR /app

# Install Python and related dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Set up Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy package files and install frontend dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy Python requirements and install backend dependencies
COPY api/requirements.txt ./api/
RUN pip install --no-cache-dir -r api/requirements.txt

# Copy all the rest of the application files
COPY . .

# Expose Next.js port
EXPOSE 3000

# Make the start script executable
RUN chmod +x ./start.sh

# Start the application using the start script
CMD ["./start.sh"]
