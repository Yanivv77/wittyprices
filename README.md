# WittyPrices

WittyPrices is a web application built with [Next.js](https://nextjs.org/) that allows users to track product prices on Amazon. Users can receive notifications when prices drop or when products are back in stock.

## Features

- **Product Tracking**: Track Amazon products and receive notifications for price changes.
- **Email Notifications**: Get notified via email for various product updates.
- **Price History**: View historical price data for tracked products.
- **Automated Cron Jobs**: Regularly update product information and send notifications.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/wittyprices.git
   cd wittyprices
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add the following:

   ```plaintext
   MONGODB_URI=your_mongodb_uri
   ZOHO_APP_PASSWORD=your_zoho_app_password
   BRIGHT_DATA_USERNAME=your_bright_data_username
   BRIGHT_DATA_PASSWORD=your_bright_data_password
   ```

### Running the Application

To start the development server, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

To build the application for production, run:

```bash
npm run build
```

To start the production server, run:

```bash
npm start
```

## Code Structure

- **Components**: Reusable UI components are located in the `components` directory.
- **Lib**: Contains utility functions, database connections, and email handling logic.
- **Pages**: Next.js pages are located in the `pages` directory.
- **Styles**: Global styles are defined in `app/globals.css`.

## Key Files

- **Email Handling**: Email notifications are managed in `lib/nodemailer/index.ts`.
- **Product Actions**: Functions for product operations are in `lib/actions/index.ts`.
- **Cron Jobs**: Scheduled tasks are defined in `app/api/cron/route.ts`.

## Cron Jobs

The application uses cron jobs to automate the process of updating product information and sending notifications. These jobs are configured to run at regular intervals to ensure that users receive timely updates about the products they are tracking.

- **Location**: The cron job logic is implemented in `app/api/cron/route.ts`.
- **Functionality**: The cron jobs scrape product data from Amazon, update the database with the latest prices, and send email notifications if there are significant changes.
- **Configuration**: Ensure your server environment supports running scheduled tasks. You may need to set up a cron job on your server to hit the endpoint at regular intervals.


## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.

