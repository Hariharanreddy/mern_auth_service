# Docker Build Process Explanation

## Overview
This document explains the step-by-step process of building a Docker image for a Node.js (TypeScript) application using a multi-stage build.

## Build Steps

### 1. **Set the Base Node.js Version**
```dockerfile
ARG NODE_VERSION=21.7.1
```
This sets a variable `NODE_VERSION`, which is later used to define the Node.js version for the image.

### 2. **Builder Stage** (Compiling TypeScript)
```dockerfile
FROM node:${NODE_VERSION}-alpine as builder
```
- Creates a lightweight Alpine-based Node.js environment for building the application.

#### **2.1 Set Working Directory**
```dockerfile
WORKDIR /home/node/app
```
- This is where the application files will be placed inside the container.

#### **2.2 Install Dependencies (First `npm ci`)**
```dockerfile
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
```
- **Uses mount-based caching** to speed up installs.
- Installs **all dependencies** (including `devDependencies`), which are needed for building the TypeScript code.

#### **2.3 Copy Project Files**
```dockerfile
COPY . .
```
- Copies the entire project into the container.

#### **2.4 Build TypeScript Code**
```dockerfile
RUN npm run build
```
- Compiles TypeScript into JavaScript and outputs it in the `dist/` folder.

---

### 3. **Runner Stage** (Optimized for Production)
```dockerfile
FROM node:${NODE_VERSION}-alpine as runner
```
- A fresh, clean Node.js environment for running the application.

#### **3.1 Set User and Working Directory**
```dockerfile
USER node
WORKDIR /home/node/app
```
- Runs the container as a non-root user for security.

#### **3.2 Set Environment Variable**
```dockerfile
ENV NODE_ENV=production
```
- Ensures that the app runs in production mode.

#### **3.3 Install Production Dependencies (Second `npm ci`)**
```dockerfile
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts
```
- Installs **only production dependencies** (`--omit=dev`).
- Ensures `node_modules/` in the final image contains only what's needed for running the app.

#### **3.4 Copy Compiled Code from Builder**
```dockerfile
COPY --from=builder --chown=node:node /home/node/app/dist ./
```
- Copies only the `dist/` folder from the `builder` stage.
- The source TypeScript files are **not copied**, reducing the final image size.

#### **3.5 Expose Application Port**
```dockerfile
EXPOSE 5501
```
- Opens port `5501` for the application to listen on.

#### **3.6 Start the Application**
```dockerfile
CMD ["node", "src/server.js"]
```
- Runs the server when the container starts.

---

## Final Image Contents
The final image **only contains**:
✅ `dist/` → Compiled JavaScript files.  
✅ `node_modules/` → Only production dependencies.  
✅ Necessary environment settings.  

It **does not include**:
❌ TypeScript source files.  
❌ Dev dependencies.  
❌ Extra unnecessary files.  

This results in a **small, optimized, and production-ready Docker image**. 🚀

