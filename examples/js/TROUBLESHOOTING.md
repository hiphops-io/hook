# Docker Troubleshooting

## Common Docker Issues

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solutions:**

```bash
# Restart the Docker Compose service
docker-compose restart

# Or stop and start cleanly
docker-compose down
docker-compose up --build
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

### Build Issues

**Solution:**

```bash
# Clean build
docker-compose down
docker system prune -f
docker-compose up --build
```

### Container Health Check

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs

# Test endpoints
curl http://localhost:3000/health
curl http://localhost:3000/license
```
