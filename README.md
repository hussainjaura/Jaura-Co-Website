# Jaura-Co-Website - Internship Project!

## Deployed App:

My Jaura & Co Clothing Website is deployed under the 'Render' platform, feel free to visit the following url and check my internship project out:
https://jaura-co-website.onrender.com

## How to open Project at your Local Machine:

1. First step is to clone this repository to your local folder in any Integrated Development Environment.
2. write down cd "desired repository" in your terminal.
3. Install the required npm packages/dependencies by typing 'npm install' in terminal.
4. If package.json is not already present, create one by typing 'npm init -y', then install the dependencies listed.
5. Copy the dependencies to your package.json file and then download your node_modules file.
6. After dependencies are installed properly, from root directory type 'node src/server.js' to run the Clothing Website locally.
7. Open your browser and type 'http://localhost:3000' to run the Website.

## Technologies used in Jaura & Co Website:

- Javascript
- Node JS
- Express
- MySQL
- EJS
- HTML
- CSS
- Winston
- Stripe Payments
- Cookies and Sessions
- Sequelize
- Bcrypt.js
- Helmet
- Jest
- AJAX
- JSON
- Logger
- Express Session
- Git & Github

# Project Features and Functionalities

## User Accessibility:

To enhance the overall user experience and ensure a production-ready web application, several features were implemented to manage user access, data persistence, and secure interactions.

1. User Authentication & Session Management
   The website incorporates user authentication mechanisms to ensure both usability and security. Key technologies used include:

   Sessions for maintaining user state across different routes.

   Bcrypt.js for hashing passwords before storing them in the database, ensuring sensitive data is never saved in plain text.

   Express-Session and Cookies to manage persistent logins and remember user actions such as items added to the cart.

   Users can securely sign up, log in, and log out. The system maintains their session data, ensuring that actions taken (like adding items to the cart) are preserved even after logout. Upon re-login, previously selected cart items are retrieved from the MySQL relational database, allowing users to continue shopping without losing progress.

2. Cart Functionality
   The cart system has been designed for real-world usability. Users can:

   Add items to the cart.

   Update quantities or details.

   Delete unwanted items.

   All changes are reflected in the backend database, enabling persistent cart behavior across sessions. This is similar to the behavior of modern e-commerce platforms and adds to the site's professional feel.

3. Payment Integration
   A production-grade payment system was integrated using Stripe.js, a secure JavaScript library that handles online transactions. This allows users to pay for items directly through the website, giving the project real commercial feel.

4. Contact Form & Customer Trust
   A responsive Contact Us form was included to facilitate communication with potential customers. This feature not only improves the user interface but also builds trust by showing users that support is available (Database Integration is not included).

5. Enhanced Navigation & UI Design
   A dynamic Navigation Bar allows users to easily move across different sections of the site, simulating the structure of a professional online store.

   Individual webpages were created for different product categories and features to improve clarity and organization.

6. Search Functionality
   To enhance product discovery, a real-time search feature was developed using AJAX (Asynchronous JavaScript and XML) with the Fetch API. This allows users to filter and find products without needing to refresh the page, improving performance and user engagement.

7. Interactive Feedback & Popups
   Interactive popups are used throughout the site to notify users of key actions (e.g., item added to cart, contact form submitted, payment successful). These visuals enhance usability by providing immediate feedback on user interactions.

8. UI/UX & Styling
   Clean and responsive design achieved using HTML5 and CSS.

   Emphasis was placed on reducing redundancy and maintaining modular code structure to follow high coding standards.

   The UI is styled to ensure readability, aesthetic and a professional look suitable for production environments.

## Code Quality and Best Practices:

Throughout the development of the Jaura & Co Clothing Website, strong idea was placed on writing clean, efficient, and maintainable code. The goal was to follow industry-standard best practices to ensure scalability, readability, and long-term supportability.

1.  Code Structure
    The codebase is organized into logical, reusable modules following separation of concerns.

    Folder Structure:
    Routers, Auth, Structure, Styling, Database, Images, Models, Test and view templates etc, are all separated into dedicated directories.

    This well structured and defined architecture allows for easier debugging, testing, and future expansion.

2.  Clean & Readable Syntax
    All code follows consistent formatting conventions, such as meaningful, straightforward variable and function names, consistent indentation, and proper comments.

    Code has been written in a way that comments are not repeated again and again

    Functions and handlers are written with single-responsibility in mind, making them easier to maintain and test.

3.  Error Handling & Logging
    Proper try/catch blocks and middleware-based error handling are implemented to gracefully manage unexpected issues and prevent crashes.

    The Winston logging library is used to log HTTP requests, errors, and important runtime information, supporting both development and production monitoring.

4.  Security Best Practices
    User data is protected through input validation, password hashing (bcrypt.js), and secure session management.

    Helmet.js is used to set appropriate HTTP headers and mitigate common web vulnerabilities like cross-site scripting (XSS) and clickjacking.

    Additionally, all JavaScript logic has been separated from the browser inspect html layer: no JavaScript is written directly in EJS or HTML files. Instead, all client-side scripts are organized and maintained within the dedicated /scripts directory. This separation improves both security and maintainability, reducing the risk of XSS attacks and promoting clean architecture.

5.  Testing & Validation
    The project includes test coverage using Jest, focusing on critical functionalities and server-side logic.

    Manual testing was also conducted across various user flows to ensure that all routes, and components function correctly under real-world conditions.

6.  Source Control & Collaboration
    Git has been used for version control, following standard commit practices and branching models.

    Each new feature or bug fix is developed in a separate branch and merged via pull requests to maintain a clean and trackable development history.

7.  API & Database Interaction
    Database operations are handled through Sequelize , ensuring structured and secure communication with the MySQL database.

    All API endpoints follow RESTful design principles, making backend interactions intuitive and scalable.

## Contribute to my Website:

- Fork the repo
- Create a new branch ('git checkout -b feature-branch')
- Make your changes
- Push to the branch ('git push origin feature-branch')
- Open a pull request

## Contact:

- Email: [hussainjaura10@gmail.com]
- LinkedIn: [https://www.linkedin.com/in/muhammad-hussain-jaura-b303482b1/]
