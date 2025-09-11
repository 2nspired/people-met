# People Met

A comprehensive contact and relationship management application. Track the people you meet, log encounters, manage contact information, and never lose touch with important connections.

## Features

### Core Functionality

- 👥 **People Management** - Add, organize, and track people you meet
- 📝 **Encounter Logging** - Record when and where you met someone
- 📞 **Contact Management** - Store multiple contact methods (email, phone, social media)
- 🏷️ **Tagging System** - Categorize people with custom tags
- 👥 **Grouping** - Organize people into groups (e.g., "Yoga Class", "Bali Trip")
- 📅 **Reminders** - Set follow-up reminders for people or encounters
- 📎 **Attachments** - Add photos, files, and links to people and encounters
- 🔍 **Search & Filter** - Find people quickly with powerful search

### Technical Stack

- ⚡️ Next.js 15 (App Router)
- 🔥 TypeScript
- 🎨 Tailwind CSS v4 + PostCSS
- 🔐 tRPC 11 + React Query 5
- 📦 Prisma 6 with PostgreSQL
- 🔐 Supabase Authentication
- 🧹 ESLint 9 (flat config via ESLint CLI) + Prettier
- 🚀 Turbo dev mode

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/people_met"
DIRECT_URL="postgresql://username:password@localhost:5432/people_met"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Vercel (for deployment)
NEXT_PUBLIC_VERCEL_URL="your-vercel-url"

# Optional secrets
CRON_SECRET="your-cron-secret"
GUARD_SECRET="your-guard-secret"
```

## Project Structure

```
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (main)/            # Main app routes
│   │   ├── (dev)/             # Development tools
│   │   ├── api/               # API routes
│   │   └── auth/              # Authentication pages
│   ├── components/            # Reusable React components
│   ├── server/                # tRPC server & procedures
│   │   └── api/routers/       # tRPC routers
│   ├── trpc/                  # tRPC client configuration
│   ├── utilities/             # Utility functions
│   └── styles/                # Global styles
├── prisma/                    # Database schema & migrations
│   └── data/                  # Seed data
└── public/                    # Static assets
```

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **User** - User accounts and profiles
- **Person** - People you've met with contact info and metadata
- **Encounter** - Logged meetings/interactions with people
- **ContactMethod** - Phone, email, social media contacts
- **SocialProfile** - Social media profiles and handles
- **Tag** - Custom categorization system
- **Group** - Organize people into collections
- **Reminder** - Follow-up reminders for people or encounters
- **Attachment** - Photos, files, and links
- **EventLog** - Audit trail for changes

## Usage

### Adding People

1. Navigate to the people section
2. Click "Add Person" to create a new contact
3. Fill in basic information (name, nickname, phonetic pronunciation)
4. Add contact methods (email, phone, social media)
5. Assign tags and groups for organization

### Logging Encounters

1. Find the person in your contacts
2. Click "Log Encounter"
3. Record when and where you met
4. Add notes about the interaction
5. Set follow-up reminders if needed

### Managing Relationships

- Use tags to categorize people (e.g., "colleague", "friend", "family")
- Create groups for events or contexts (e.g., "conference 2024", "neighborhood")
- Set reminders to follow up with important contacts
- Add attachments like photos or business cards

## License

MIT
