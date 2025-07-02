# HipHops Hook - Client Libraries

Official client libraries for HipHops Hook, making it easy to integrate Hook into your applications across different programming languages and platforms.

## 🚀 Quick Start

### JavaScript/TypeScript

```bash
npm install @hiphops/hook
```

```javascript
import { Hook } from '@hiphops/hook';

const hook = new Hook();
// Your hook integration code here
```

## 📚 Available Clients

### JavaScript/TypeScript Client

The JavaScript client provides a robust interface for working with Hook in Node.js and browser environments.

- **TypeScript Support**: Full TypeScript definitions included
- **Cross-Platform**: Works on macOS, Linux, and Windows
- **Automatic Binary Management**: Handles Hook binary lifecycle automatically
- **Promise-Based**: Modern async/await support

📖 [JavaScript Client Documentation](./clients/js/README.md)

### Coming Soon

- **Python Client**: Python bindings for Hook integration
- **Go Client**: Native Go SDK for Hook services
- **REST API**: Direct HTTP interface for any language

## 🛠 Development

### Architecture

This repository contains only the client libraries and public-facing documentation. The core Hook binary is built from a separate private repository and automatically packaged with these clients during the release process.

### Contributing

We welcome contributions to the client libraries! Please:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Local Development

```bash
# Clone the repository
git clone https://github.com/hiphops/hook.git
cd hook

# JavaScript client development
cd clients/js
npm install
npm run build
npm test
```

## 📦 Release Process

Client libraries are automatically built and published when new versions of Hook are released. The release process:

1. Core Hook binary is built and signed
2. Client libraries are updated with new binaries
3. Packages are published to respective package managers (npm, PyPI, etc.)
4. GitHub releases are created with binaries and changelogs

## 🔧 System Requirements

- **Node.js**: 18+ (for JavaScript client)
- **Python**: 3.8+ (for Python client, when available)
- **Operating Systems**: macOS, Linux, Windows

## 📄 License

[Add your license information here]

## 🆘 Support

- **Documentation**: Check the client-specific README files
- **Issues**: Report bugs and feature requests in this repository
- **Discussions**: Join community discussions in the GitHub Discussions tab

---

**Note**: This is the public repository for Hook client libraries. For enterprise licensing and private deployments, contact the HipHops team.
