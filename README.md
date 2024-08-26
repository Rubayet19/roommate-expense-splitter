# Roommate Expense Splitter

A web application to help roommates track and split shared expenses.

## Features

- User authentication
- Add and manage roommates
- Create and split expenses
- View balances and settle up

## Technologies Used

- Backend: Spring Boot (Java)
- Frontend: Next.js (React)
- Database: PostgreSQL
- Authentication: JWT

## Prerequisites

- Java 11 or higher
- Node.js 14 or higher
- PostgreSQL 12 or higher
- Docker (optional)

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/roommate-expense-splitter.git
   cd roommate-expense-splitter
   ```

2. Set up the database:
   - Create a PostgreSQL database named `roommate-expense-splitter`

3. Configure environment variables:
   - Create and env file to use your own values in 

4. Backend setup:
   ```
   cd server
   ./mvnw spring-boot:run
   ```

5. Frontend setup:
   ```
   cd client
   npm install
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

## Running with Docker

If you prefer using Docker:

1. Ensure Docker and Docker Compose are installed
2. Run `docker-compose up` in the project root directory

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
