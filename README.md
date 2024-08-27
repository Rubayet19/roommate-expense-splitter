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

Configuration
The application.properties file in server/src/main/resources/ contains the following configurations:
Copy# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/roommate-expense-splitter
SPRING_DATASOURCE_USERNAME=your_username
SPRING_DATASOURCE_PASSWORD=your_password

## JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=86400000

## Server Configuration
SERVER_PORT=8080

## Other Configuration
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=true
How to obtain these values:

Database Configuration:

Install PostgreSQL if you haven't already.
Create a new database named roommate-expense-splitter.
SPRING_DATASOURCE_URL: This should be the URL to your PostgreSQL database. The default URL structure is jdbc:postgresql://localhost:5432/roommate-expense-splitter.
SPRING_DATASOURCE_USERNAME: Your PostgreSQL username (default is often 'postgres').
SPRING_DATASOURCE_PASSWORD: The password for your PostgreSQL user.


JWT Configuration:

JWT_SECRET: This should be a long, random string. You can generate one using a secure random generator or use a UUID. For example:
Copyopenssl rand -base64 32

JWT_EXPIRATION: This is the JWT token expiration time in milliseconds. 86400000 ms equals 24 hours.


Server Configuration:

SERVER_PORT: The port on which you want your server to run. 8080 is a common choice, but you can change it if needed.


Other Configuration:

SPRING_JPA_HIBERNATE_DDL_AUTO: This is set to "update" by default, which means Hibernate will automatically update the database schema. For production, you might want to set this to "validate".
SPRING_JPA_SHOW_SQL: Set to "true" to see SQL queries in the console, which is useful for debugging. For production, you might want to set this to "false".



Remember to keep your application.properties file secure and never commit it to version control if it contains sensitive information. Instead, you can provide an application.properties.example file in your repository with placeholder values.


## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
