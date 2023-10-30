# Hayati Journal

This application allows you to journal your life.

> Hayati means "my life" in arabic

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

Follow these steps to get the Journal Web App up and running on your local machine:

### Prerequisites

- Node.js: Make sure you have Node.js installed on your system.
- NPM (Node Package Manager): This comes bundled with Node.js.
- Angular CLI: Install the Angular CLI globally.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/visiongeist/hayati-journal
    ```
1. Change into the project directory:

   ```bash
    cd hayati-journal
    ```

1. Install the project dependencies:

   ```bash
    npm install
    ```

1. Set up your environment variables:

    Create a environment.ts file in the root directory and configure the following variables:
        DATABASE_URL: The connection URL for your database.
        SECRET_KEY: A secret key for session management and security.

## Technologies Used

    Angular: The front-end framework for building the web application.
    RxDB: A powerful offline-first database for handling data even without an internet connection.
    Supabase: An open source Firebase alternative.