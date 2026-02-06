# FC Verachtert Tracker

This project is a web application designed to track the match results, scores, goal scorers, and players for the football team FC Verachtert. It provides an overview of the entire season, allowing users to easily access and manage information related to matches and players.

## Features

- Track match results and scores
- View details of goal scorers
- Manage player information
- Overview of the entire season's performance

## Project Structure

```
fc-verachtert-tracker
├── src
│   ├── app.ts                  # Entry point of the application
│   ├── controllers             # Contains controllers for handling requests
│   │   ├── matchController.ts
│   │   ├── playerController.ts
│   │   └── scorerController.ts
│   ├── models                  # Defines data structures
│   │   ├── Match.ts
│   │   ├── Player.ts
│   │   └── GoalScorer.ts
│   ├── routes                  # Defines application routes
│   │   ├── matchRoutes.ts
│   │   ├── playerRoutes.ts
│   │   └── index.ts
│   ├── services                # Contains business logic
│   │   ├── matchService.ts
│   │   └── playerService.ts
│   ├── views                   # HTML views for the application
│   │   ├── index.html
│   │   ├── matches.html
│   │   ├── players.html
│   │   └── season-overview.html
│   ├── public                  # Static files
│   │   ├── css
│   │   │   └── styles.css
│   │   └── js
│   │       └── main.js
│   └── types                   # TypeScript interfaces
│       └── index.ts
├── package.json                # npm configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd fc-verachtert-tracker
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```

Visit `http://localhost:3000` in your web browser to access the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you would like to add.

## License

This project is licensed under the MIT License.