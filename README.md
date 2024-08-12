# 🏨 Hotel Booking & Recommendation Platform

Welcome to the **Hotel Booking & Recommendation Platform**! This application allows users to search, view, and book hotels seamlessly, with dynamic listings, detailed information, and an intuitive booking process.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Installation Instructions](#installation-instructions)
4. [Backend Configuration](#backend-configuration)
5. [API Endpoints](#api-endpoints)
6. [Frontend Structure](#frontend-structure)
7. [Usage](#usage)
8. [Developer's Note](#developers-note)
9. [License](#license)

## 📜 Project Overview

The Hotel Booking & Recommendation Platform is designed to manage hotel bookings and provide personalized recommendations based on user activities. It features user registration and login, hotel browsing, booking functionalities, and a recommendation engine.

## 💻 Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript
- **API Testing**: Postman

## 🚀 Installation Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/hotel-booking-platform.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd hotel-booking-platform
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Set Up the Database**

   Create a MySQL database named `hotel_booking_platform` and import the provided SQL schema.

5. **Set Up Environment Variables**

   Create a `.env` file in the root directory with the following configuration:

   ```plaintext
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=hotel_booking_platform
   JWT_SECRET=your-jwt-secret
   BACKEND_PORT=5000
   ```

6. **Run the Application**

   Start the backend server:

   ```bash
   npm start
   ```

   Open your browser and visit [http://localhost:5000](http://localhost:5000).

## 🛠️ Backend Configuration

1. **Database Configuration**
   - **MySQL**: The project uses a MySQL database to store user and hotel data. Ensure MySQL server is running and properly configured.
   - **Database Schema**: Import the provided SQL schema to set up tables.

2. **Dependencies**
   - **Node.js**: Ensure Node.js is installed. Dependencies are managed using `npm`.
   - **Express.js**: For building the RESTful API.
   - **Body-Parser**: Middleware for parsing request bodies.
   - **dotenv**: Loads environment variables from the `.env` file.
   - **MySQL2**: For MySQL database connectivity.

3. **API Documentation**
   - Use Postman for testing and documenting API endpoints.

## 📡 API Endpoints

### User Endpoints

- **Register User**
  - **Endpoint**: `POST /register`
  - **Request Body**:
    ```json
    {
      "name": "User Name",
      "email": "user@example.com",
      "password": "password123"
    }
    ```
  - **Response**: `200 OK` on success, `400 Bad Request` on failure

- **Login User**
  - **Endpoint**: `POST /login`
  - **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
  - **Response**: `200 OK` on success, `401 Unauthorized` on failure

### Hotel Endpoints

- **Get Hotels**
  - **Endpoint**: `GET /hotels?page=1&limit=10`
  - **Response**: Array of hotels with pagination

- **Get Hotel Details**
  - **Endpoint**: `GET /hotels/:id`
  - **Response**: Detailed information about a specific hotel

### Booking Endpoints

- **Create Booking**
  - **Endpoint**: `POST /bookings`
  - **Request Body**:
    ```json
    {
      "userId": 1,
      "hotelId": 1,
      "checkinDate": "2024-08-15",
      "checkoutDate": "2024-08-20"
    }
    ```
  - **Response**: `200 OK` on success, `400 Bad Request` on failure

## 🖼️ Frontend Structure

### `index.html`

- **Purpose**: Entry point of the application. Contains navigation menu and footer.
- **Features**: Links to other pages.

### `register.html`

- **Purpose**: User registration page.
- **Features**: Form for user details, link to the login page.

### `login.html`

- **Purpose**: User login page.
- **Features**: Form for login credentials, link to the registration page.

### `hotel.html`

- **Purpose**: Displays a list of hotels.
- **Features**: Pagination controls, links to the hotel details page.

### `hoteldetail.html`

- **Purpose**: Shows detailed information about a selected hotel.
- **Features**: Hotel details, link to the booking page.

### `booking.html`

- **Purpose**: Displays booking confirmation details.
- **Features**: Booking summary, link back to hotel listings.

## 🏗️ Usage

1. **Register**: Use `register.html` to create a new account.
2. **Login**: Access your account via `login.html`.
3. **Browse Hotels**: View available options on `hotel.html`.
4. **View Details**: Click on a hotel for more info on `hoteldetail.html`.
5. **Book Hotel**: Confirm your reservation on `booking.html`.

## 🛠️ Developer's Note

As a developer with a strong background in backend development, I've focused on creating a robust backend for this platform using Node.js and MySQL. 
My experience with frontend development is growing, and while the frontend is functional and user-friendly, I am continuously learning and improving 
my skills in this area. Feedback and suggestions for further refinement are appreciated.

