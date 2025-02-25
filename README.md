# EdNova - Online Education Platform

## 🎯 Overview

EdNova is a modern online education platform built with React, TypeScript, and Supabase, designed to facilitate seamless interaction between teachers and students. The platform supports real-time video sessions, course management, and interactive learning experiences.

## ✨ Features

- **Authentication System**
  - Secure user authentication with Supabase
  - Role-based access control (Teacher/Student)
  - User profile management

- **Dashboard Systems**
  - Dedicated teacher dashboard
  - Student-specific dashboard
  - Intuitive interface with Material-UI components

- **Session Management**
  - Create and schedule teaching sessions
  - Real-time video conferencing capabilities
  - Session history and analytics

- **User Experience**
  - Responsive design for all devices
  - Modern and clean UI with Material-UI
  - Lazy loading for optimal performance

## 🚀 Tech Stack

- **Frontend**
  - React 18.2.0
  - TypeScript
  - Material-UI (MUI) v5
  - React Router v6
  - Formik & Yup for form management
  - Vite as build tool

- **Backend**
  - Supabase for backend services
  - PostgreSQL database
  - Real-time subscriptions

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ednova.git
   cd ednova
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📝 Project Structure

```
ednova/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── data/          # Data management and API calls
│   ├── lib/           # Utility functions and helpers
│   ├── pages/         # Page components
│   └── types/         # TypeScript type definitions
├── supabase/
│   ├── schema.sql     # Database schema
│   └── test_data.sql  # Sample data for testing
└── public/            # Static assets
```

## 🗄️ Database Schema

The application uses a PostgreSQL database with the following main tables:
- Users (Authentication and profiles)
- Sessions (Teaching sessions)
- Enrollments (Student-session relationships)
- Messages (Communication records)

Detailed schema can be found in `supabase/schema.sql`.

## 🔒 Security

- Environment variables for sensitive data
- Role-based access control
- Supabase RLS (Row Level Security) policies
- Protected routes implementation

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

3. Deploy the `dist` folder to your preferred hosting service.

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Udhaya Kumar - Initial work

## 🙏 Acknowledgments

- Material-UI for the component library
- Supabase for backend services
- React team for the amazing framework 