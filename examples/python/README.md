# HipHops Hook Python Example

Simple example showing `hiphops-hook` Python client integration with Docker/Docker Compose.

## Features

- **Flask web server** with Hook integration
- **Health check endpoint** (`/health`)
- **License verification endpoint** (`/license`)
- **Docker support** with health checks
- **Environment variable configuration**

## Quick Start

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your LICENSE_TOKEN

# Run the application
python src/main.py
```

### Docker Development

```bash
# Set up environment
cp .env.example .env
echo "LICENSE_TOKEN=your_token_here" > .env

# Build and run with Docker Compose
docker-compose up --build

# Or build and run with Docker directly
docker build -t hook-python-example .
docker run -p 3000:3000 --env-file .env hook-python-example
```

## Testing the Endpoints

Once running, you can test the endpoints:

```bash
# Health check
curl http://localhost:3000/health

# License information
curl http://localhost:3000/license
```

## Expected Responses

### Health Check (`/health`)
```json
{
  "status": "ok",
  "timestamp": "2025-07-03T23:30:00.000000"
}
```

### License Info (`/license`)

**Without License Token:**
```json
{
  "verified": false,
  "verify_failures": ["missing_license_token"],
  "license": null,
  "hiphops": {
    "identity": "",
    "project_id": ""
  }
}
```

**With Valid License Token:**
```json
{
  "verified": true,
  "verify_failures": [],
  "license": {
    "expires_at": "2025-12-31T23:59:59Z",
    "features": ["feature1", "feature2"]
  },
  "hiphops": {
    "identity": "your_identity",
    "project_id": "your_project_id"
  }
}
```

## Environment Variables

- `LICENSE_TOKEN`: Your HipHops license token (required for license verification)
- `PORT`: Server port (default: 3000)

## Docker Commands

```bash
# Build image
docker build -t hook-python-example .

# Run container
docker run -p 3000:3000 --env-file .env hook-python-example

# Docker Compose
docker-compose up --build    # Build and start
docker-compose down          # Stop and remove
docker-compose logs          # View logs
```

## Requirements

- Python 3.8+
- Flask 2.3+
- hiphops-hook package

## Project Structure

```
python/
├── src/
│   └── main.py              # Main Flask application
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── .env.example            # Environment variables template
└── README.md               # This file
```

## Troubleshooting

### Binary Download Issues

If you encounter issues with Hook binary download:

```bash
# Skip binary download and use custom binary
export SKIP_HOOK_DOWNLOAD=true
export HIPHOPS_HOOK_BIN=/path/to/your/hook/binary
pip install hiphops-hook
```

### Container Issues

```bash
# View container logs
docker-compose logs hook-python-example

# Debug container
docker run -it --entrypoint /bin/bash hook-python-example

# Check health status
docker-compose ps
```

### License Issues

- Ensure `LICENSE_TOKEN` is set in your `.env` file
- Verify your license token is valid
- Check the `/license` endpoint response for error details

## Development

This example demonstrates:

1. **Basic Hook Integration**: Import and use `hiphops-hook` package
2. **Error Handling**: Proper exception handling for Hook operations  
3. **Web API**: REST endpoints for health and license information
4. **Containerization**: Docker setup with health checks
5. **Environment Configuration**: Using environment variables for configuration

For more information about the HipHops Hook Python client, see the [main documentation](../../clients/python/README.md).