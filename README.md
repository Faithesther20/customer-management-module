# Customer Manager App

A full-stack **Customer Management System** built with **React (Vite)** for the frontend and **Laravel** for the backend. This application enables users to efficiently manage customers, perform CRUD operations, and handle data import/export in CSV or Excel formats.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Developer](#developer)
- [License](#license)

---

## Overview

The **Customer Manager App** is designed to simplify customer management for small businesses and startups. Users can:  

- Add, edit, and delete customer records.  
- Search and filter customers by name, email, or company.  
- Import customer data from CSV or Excel files.  
- Export customer data to CSV or Excel for reporting.  
- Interact seamlessly with a secure Laravel backend using Sanctum authentication.  

The frontend uses **React** and **Vite**, providing a fast development experience with hot module replacement (HMR).

---

## Features

- Interface styled with **Tailwind CSS**.  
- Authentication system (Login, Register, Logout) using **Laravel Sanctum**.  
- Full customer CRUD functionality.  
- Import and export customers in **CSV & Excel** formats.  
- Pagination and filtering of customer data.  
- User-friendly notifications and feedback messages.

---

## Tech Stack

**Frontend:**  
- React 18 + Vite  
- Tailwind CSS  
- Axios for API requests  
- React Router for navigation  

**Backend:**  
- Laravel 10  
- MySQL Database  
- Sanctum for API authentication  
- Eloquent ORM for database management  

---

## Installation

### Backend (Laravel)

1. Clone the repository:
   ```bash
   git clone <repo-url>
2. Install dependencies:
   composer install
3. Copy .env.example to .env and configure your database:
   cp .env.example .env
4. Generate application key:
   php artisan key:generate
5. Run migrations and seeders:
   php artisan migrate --seed
6. Start the backend server:
   php artisan serve

### Frontend (React + Vite)

1. Navigate to the frontend folder:
   cd frontend
2. Install dependencies:
   npm install
3. Start the development server:
    npm run dev
4. Open your browser at http://localhost:5173 (or the port Vite specifies).

---

## Usage

- Register or login to access the dashboard.

- Manage customers by adding, editing, or deleting entries.

- Use the import/export feature to handle customer data files.

- Use the search and filter functionality to quickly find customers.

---

## Developer

Esther J. Iyege – Software Developer

Experienced in React, Laravel, Mobile App Development, and Digital Skills Training.

You can reach out for collaboration or project inquiries.

## License

This project is licensed under the MIT License. 
