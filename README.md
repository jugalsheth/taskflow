# TaskFlow - Interactive Checklist Management System

A modern, full-stack checklist management application built with Next.js, TypeScript, and Drizzle ORM. TaskFlow allows users to create checklist templates and run interactive checklist sessions with real-time progress tracking.

## Features

### ✅ Core Functionality
- **User Authentication**: Secure login/signup with NextAuth.js
- **Checklist Templates**: Create and manage reusable checklist templates
- **Interactive Checklists**: Start checklist instances from templates and track progress in real-time
- **Progress Tracking**: Visual progress bars and completion status
- **Real-time Updates**: Immediate saving of step completion status
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🎯 Key Features
- **Template Management**: Create, edit, and delete checklist templates
- **Step Management**: Add, reorder, and manage steps within templates
- **Interactive Player**: Beautiful, intuitive interface for running checklists
- **Progress Persistence**: Your progress is saved automatically and persists across sessions
- **Active Checklists**: View and continue in-progress checklists from the dashboard
- **Completion Tracking**: Mark individual steps and entire checklists as complete

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **Deployment**: Ready for Vercel, AWS, or DigitalOcean

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your database credentials:
   ```env
   POSTGRES_URL="postgres://username:password@host:port/database"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-nextauth-key"
   AUTH_SECRET="your-super-secret-auth-key"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Tables
- **users**: User accounts and authentication
- **checklist_templates**: Reusable checklist templates
- **checklist_steps**: Individual steps within templates
- **checklist_instances**: Active checklist sessions
- **checklist_instance_steps**: Progress tracking for individual steps

### Key Relationships
- Users can create multiple templates
- Templates contain multiple ordered steps
- Instances are created from templates
- Instance steps track completion status

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Templates
- `GET /api/templates` - Get user's templates
- `POST /api/templates` - Create new template
- `GET /api/templates/[id]` - Get specific template
- `PUT /api/templates/[id]` - Update template
- `DELETE /api/templates/[id]` - Delete template

### Checklists
- `POST /api/checklists` - Start new checklist instance
- `GET /api/checklists` - Get user's active checklists
- `GET /api/checklists/[id]` - Get specific checklist instance
- `PUT /api/checklists/[id]/steps/[stepId]` - Mark step as complete/incomplete
- `PUT /api/checklists/[id]/complete` - Mark entire checklist as complete

## Usage Guide

### Creating a Template
1. Navigate to the dashboard
2. Click "Create New Template"
3. Enter a title for your template
4. Add steps using the step builder
5. Save your template

### Running a Checklist
1. From the dashboard, click "Start Checklist" on any template
2. You'll be taken to the interactive checklist player
3. Click checkboxes to mark steps as complete
4. Your progress is saved automatically
5. Complete all steps to finish the checklist

### Managing Active Checklists
- View all active checklists on the dashboard
- Click "Continue" to resume any in-progress checklist
- Progress is preserved when you leave and return

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema changes to database

### Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── templates/         # Template management
│   └── checklists/        # Interactive checklist player
├── components/            # Reusable React components
├── lib/                   # Database, auth, and utilities
├── services/              # Business logic services
└── types/                 # TypeScript type definitions
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **AWS**: Deploy using AWS Amplify or Elastic Beanstalk
- **DigitalOcean**: Use App Platform or deploy to Droplet
- **Docker**: Build and run with Docker containers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub or contact the development team.
# Trigger CI/CD with new environment variables
