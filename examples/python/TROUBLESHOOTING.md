# Python Example Troubleshooting

## Common Issues

### Port Already in Use

**Error**: `OSError: [Errno 48] Address already in use`

**Solutions:**

```bash
# Restart the Docker Compose service
docker-compose restart

# Or stop and start cleanly
docker-compose down
docker-compose up --build

# Check what's using the port
lsof -i :3000
kill -9 <PID>
```

### License Token Issues

**Error**: `missing_license_token` in response

**Solution:**

```bash
# Create .env file with your token
echo "LICENSE_TOKEN=your_actual_token_here" > .env

# Rebuild and restart
docker-compose down
docker-compose up --build
```

### Python Package Installation Issues

**Error**: SSL/Network issues during pip install

**Solutions:**

```bash
# Use different index
pip install --index-url https://pypi.org/simple/ hiphops-hook

# Skip binary download in development
export SKIP_HOOK_DOWNLOAD=true
pip install hiphops-hook

# Use custom binary
export HIPHOPS_HOOK_BIN=/path/to/hook/binary
pip install hiphops-hook
```

### Binary Download Issues

**Error**: `Hook binary not found` or download failures

**Solutions:**

```bash
# Option 1: Skip download and provide binary
export SKIP_HOOK_DOWNLOAD=true
export HIPHOPS_HOOK_BIN=/path/to/hook/binary

# Option 2: Manual binary placement
mkdir -p ~/.local/lib/python3.10/site-packages/hiphops_hook/bin/
cp /path/to/hook-darwin-arm64 ~/.local/lib/python3.10/site-packages/hiphops_hook/bin/

# Option 3: Clean install
pip uninstall hiphops-hook
pip install hiphops-hook
```

### Docker Build Issues

**Error**: Build failures or dependency issues

**Solutions:**

```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose up --build

# Build without cache
docker-compose build --no-cache
docker-compose up

# Debug build
docker build --no-cache -t hook-python-example .
docker run -it --entrypoint /bin/bash hook-python-example
```

### Flask Development Issues

**Error**: Flask not starting or crashing

**Solutions:**

```bash
# Run with verbose debugging
export FLASK_DEBUG=1
python src/main.py

# Check Python path
python -c "import hiphops_hook; print('Import successful')"

# Manual test
python -c "from hiphops_hook import license; print(license())"
```

### Container Health Check

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs hook-python-example

# Follow logs
docker-compose logs -f hook-python-example

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/license

# Debug inside container
docker-compose exec hook-python-example /bin/bash
```

### Permission Issues

**Error**: Permission denied in container

**Solutions:**

```bash
# Fix file permissions
chmod -R 755 .

# Check user in container
docker-compose exec hook-python-example whoami
docker-compose exec hook-python-example id

# Run as root for debugging
docker run -it --user root --entrypoint /bin/bash hook-python-example
```

### Environment Variable Issues

**Error**: Environment variables not loaded

**Solutions:**

```bash
# Check .env file exists
ls -la .env

# Verify environment in container
docker-compose exec hook-python-example env | grep LICENSE_TOKEN

# Test with direct environment
LICENSE_TOKEN=test docker-compose up

# Debug environment loading
python -c "import os; print('LICENSE_TOKEN:', os.getenv('LICENSE_TOKEN'))"
```

### Network Issues

**Error**: Can't connect to endpoints

**Solutions:**

```bash
# Check port mapping
docker-compose ps

# Test host networking
docker run --network host -e LICENSE_TOKEN=test hook-python-example

# Check firewall/proxy settings
curl -v http://localhost:3000/health

# Test from inside container
docker-compose exec hook-python-example curl http://localhost:3000/health
```

## Getting Help

If you're still experiencing issues:

1. **Check logs**: `docker-compose logs hook-python-example`
2. **Verify environment**: Ensure `.env` file is properly configured
3. **Test manually**: Run `python src/main.py` outside Docker
4. **Check binary**: Verify Hook binary downloaded correctly
5. **Update packages**: `pip install --upgrade hiphops-hook flask`

For more help, see the [main Python client documentation](../../clients/python/README.md).