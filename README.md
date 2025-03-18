# BookCafe Frontend

A modern, responsive bookstore frontend built with Next.js and Tailwind CSS.

## Backend Repository

The backend for this project is available at: [BookCafe-Backend](https://github.com/tejaspanchall/BookCafe-Backend)

## Features

- 📚 Book listing and details
- 👤 User authentication
- 🔍 Search and filter capabilities
- 📱 Responsive design for all devices
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast page loads with Next.js

## Technologies Used

- **Framework**: Next.js 15.2.0
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Icons**: React Bootstrap Icons
- **Alerts**: SweetAlert2
- **Font**: Geist

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/tejaspanchall/BookCafe-Frontend.git
cd BookCafe-Frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code linting


## License

This project is licensed under the MIT License - see the LICENSE file for details. 