# Multi-stage production build for FastAPI Backend
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system compiler tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final Runtime stage
FROM python:3.11-slim AS runtime

# Security hardening: Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Copy python packages from builder stage
COPY --from=builder /root/.local /home/appuser/.local
COPY . .

# Set environment paths
ENV PATH=/home/appuser/.local/bin:$PATH
ENV PYTHONPATH=/app

# Ensure correct permissions
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

# Start FastAPI Gateway via uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
