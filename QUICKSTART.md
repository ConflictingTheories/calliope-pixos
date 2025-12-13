# PixoSpritz Quick Start Guide

Welcome to PixoSpritz! This guide will get you up and running as quickly as possible. We'll cover setting up your environment and creating a "Hello, World!" style project.

## 1. Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js**: Version 18.0.0 or higher.
- **npm**: Version 9.0.0 or higher (usually comes with Node.js).
- **Git**: For cloning the repository.

## 2. Clone the Repository

Start by cloning the main PixoSpritz repository from GitHub. This will give you access to the engine, editor, and all examples.

```bash
git clone https://github.com/ConflictingTheories/calliope-pixos.git
cd calliope-pixos
```

## 3. Install Dependencies

The project is a monorepo managed with npm workspaces. Run the installation command from the root of the project.

```bash
npm install
```

This will install all dependencies for all the packages (`core`, `editor`, `console`, etc.).

## 4. Launch the Editor

The PixoSpritz Editor is the primary tool for creating games. It's a web-based application that you can run locally.

```bash
npm run dev:editor
```

This command will start a local development server. Open your web browser and navigate to the URL provided in your terminal (usually `http://localhost:3000`).

You should now see the PixoSpritz Editor interface.

## 5. What's Next?

You are now ready to start creating! The best next step is to follow the **"Your First Game"** tutorial, which will guide you through the process of building a complete, simple game from scratch using the editor.

You can find it in the **Tutorials** section of the documentation. This hands-on experience is the fastest way to learn the PixoSpritz workflow.

- **Browse Tutorials**
- **Explore the API Reference**
- **Check the FAQ**