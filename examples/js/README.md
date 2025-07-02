# @hiphops/hook Docker Example

Simple TypeScript example showing how to use `@hiphops/hook` in Docker and Docker Compose environments.

## Quick Start with Docker Compose

1. **Clone and setup:**

   ```bash
   git clone <repo-url>
   cd examples/js
   ```

2. **Set your license token:**

   ```bash
   echo "LICENSE_TOKEN=your_actual_token_here" > .env
   ```

3. **Run with Docker Compose:**

   ```bash
   npm install
   npm run docker:up
   ```

4. **Test the application:**

   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/license
   ```

You should see something like:

```json
{
  "success": true,
  "license": {
    "verified": true,
    "verify_failures": [],
    "license": {
      "seats": 10
    },
    "hiphops": {
      "identity": "c_01jz3b9bz4ka7stedds7g3fjb7",
      "project_id": "my-project-1234"
    }
  }
}
```

## Alternative Docker Commands

**Build and run manually:**

```bash
npm run docker:build
npm run docker:run
```

**Stop services:**

```bash
npm run docker:down
```

## Local Development

**Install dependencies:**

```bash
npm install
```

**Run locally:**

```bash
npm run dev
```

## API Endpoints

- `GET /health` - Health check
- `GET /license` - License verification using @hiphops/hook

## Key Files

- `src/index.ts` - Main application code showing @hiphops/hook integration
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Multi-service setup
- `.env` - Environment variables (create this file with your LICENSE_TOKEN)
