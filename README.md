# MineNepal v1

> **Note**: MineNepal v1 is now open source on GitHub. Support for older versions of MineNepal has officially been discontinued.

A comprehensive platform for MineNepal, built with a modern full-stack architecture featuring a separate frontend and backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Contributing](#contributing)
- [Contributors](#contributors)
- [License](#license)
- [Support](#support)

## 🌟 Overview

MineNepal is a full-stack application built as a monorepo containing both frontend and backend components, allowing for streamlined development and deployment.

## 🛠 Technology Stack

### Frontend
- **Languages**: JavaScript (40.1%), TypeScript (39.5%), EJS (19.5%), CSS (0.9%)

### Backend
- **Runtime**: Node.js

## 📁 Project Structure

```
minenepal-v1/
├── backend/          # Backend API and server logic
│   ├── src/         # Source code
│   ├── config/      # Configuration files
│   └── ...
├── frontend/         # Frontend application
│   ├── src/         # Source code
│   ├── public/      # Static assets
│   └── ...
├── LICENSE          # MIT License
└── README.md        # This file
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/minenepal/minenepal-v1.git
cd minenepal-v1
```

2. **Install Backend Dependencies**

```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**

```bash
cd ../frontend
npm install
```

4. **Environment Configuration**

Create `.env` files in both backend and frontend directories as needed.

### Running the Application

#### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

The frontend will typically run on `http://localhost:3000` and the backend on `http://localhost:5000` (adjust based on your configuration).

## 🤝 Contributing

We welcome contributions to MineNepal! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to:
- Update tests as appropriate
- Follow the existing code style
- Update documentation as needed
- Write clear commit messages

## 👥 Contributors

- [birajrai](https://github.com/birajrai)
- [samita77](https://github.com/samita77)
- [gaurav87565](https://github.com/gaurav87565)
- [GTMSudarshan](https://github.com/GTMSudarshan)
- [nabaraj-rai](https://github.com/nabaraj-rai)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- **Discord**: [https://discord.minenepal.xyz/](https://discord.minenepal.xyz/)
- **Repository**: [https://github.com/minenepal/minenepal-v1](https://github.com/minenepal/minenepal-v1)
- **Issues**: [https://github.com/minenepal/minenepal-v1/issues](https://github.com/minenepal/minenepal-v1/issues)

---

Made with ❤️ by the MineNepal Team
