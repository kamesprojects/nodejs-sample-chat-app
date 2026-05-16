# Node.js Sample Chat App

A simple real-time chat application built with Node.js, Express, Socket.IO, and PostgreSQL. The project is fully dockerized for easy database setup and includes Swagger documentation.

## Features
- Real-time bidirectional communication using **Socket.IO**.
- Persistent message storage in a **PostgreSQL** database.
- Auto-generated API documentation using **Swagger**.
- Basic security implementations using **Helmet** and **CORS**.
- Containerized database setup using **Docker Compose**.

## Prerequisites
Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v16+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kamesprojects/nodejs-sample-chat-app.git
   cd nodejs-sample-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add the following configuration:
   ```properties
   NODE_PORT=
   DB_PORT=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   ```

## Running the Application

### Option 1: Start the application in Docker

```bash
# Run in detached mode (background)
docker-compose up -d
```

The application will be accessible at `http://localhost:${NODE_PORT}`.

### Option 2: Run only the database in Docker and start Node.js locally

```bash
   docker-compose up -d postgres-db
```

### 2. Generate Swagger Docs (Optional)
If you made changes to the endpoints, regenerate the `swagger-output.json` file:
```bash
npm run swagger
```

### 3. Start the Node.js Server

```bash
npm start
```
The server will start on `http://localhost:${NODE_PORT}`.

## API Documentation
Once the server is running, you can access the Swagger UI documentation at:
- **Swagger UI:** [http://localhost:${NODE_PORT}/api-docs](http://localhost:${NODE_PORT}/api-docs)

## Useful Docker Commands

- **Stop the containers:**
  ```bash
  docker-compose down
  ```
- **Stop and remove containers, networks, and volumes** (Use this to wipe the database data):

  ```bash
  docker-compose down -v
  ```
  
  *(The `-v` flag removes the `postgres_data` volume, completely resetting the database).*

## Tech Stack
- **Backend:** Node.js, Express.js
- **WebSockets:** Socket.IO
- **Database:** PostgreSQL (via `pg-promise`)
- **Documentation:** Swagger UI Express, Swagger Autogen
- **DevOps:** Docker, Docker Compose