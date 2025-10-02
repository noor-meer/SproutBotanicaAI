# Project Setup Instructions

Follow the steps below to set up the project for both the backend and frontend:

## Prerequisites

- Ensure Python 3.11 is installed and properly configured on your system.
- Install the latest LTS (Long Term Support) version of Node.js.

## General

1. Create `.env` files in both the frontend and backend directories based on the provided `env.example` files. Add your keys to these files.

## Backend Setup

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   ```bash
   ./venv/Scripts/activate
   ```
5. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
6. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
7. Create a superuser for the application by following the on-screen prompts:
   ```bash
   python manage.py createsuperuser
   ```
8. Start the backend server:

   ```bash
   python manage.py runserver
   ```

   The server will be live at `http://localhost:8000`.

9. Access the admin portal at `http://localhost:8000/admin` using the superuser credentials you created.

## Frontend Setup

2. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend server will be live at `http://localhost:3000`.

You're all set! Both the backend and frontend servers should now be running.
