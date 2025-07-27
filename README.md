# Daily Weather Stylist 🌤️👔

https://weatherstylist.com
A beautiful, full-featured web application that provides personalized daily weather updates and clothing recommendations delivered via email at 5am local time.

## ✨ Features

- **Interactive Location Selection**: Leaflet.js map with auto-detection and manual selection
- **Beautiful Responsive Design**: Modern UI with smooth animations and micro-interactions
- **Smart Weather Integration**: Real-time weather data from Open-Meteo API
- **Personalized Recommendations**: AI-powered clothing suggestions based on weather conditions
- **Daily Email Automation**: Scheduled emails at 5am in user's local timezone
- **Production-Ready Backend**: Supabase database with edge functions for email automation

---

<img width="1919" height="1072" alt="Screenshot 2025-07-27 103849" src="https://github.com/user-attachments/assets/1e02b216-7a37-4ca0-98c7-8a4372bfcc4e" />

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Email service account (Resend recommended)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project
   - Click "Connect to Supabase" in the top right of this interface
   - Run the migration to create the users table:
     ```sql
     -- This will be automatically created from supabase/migrations/create_users_table.sql
     ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Add your Supabase URL and keys
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Leaflet.js** for interactive maps
- **Lucide React** for beautiful icons

### Backend
- **Supabase** for database and authentication
- **Edge Functions** for email automation
- **Row Level Security** for data protection
- **Open-Meteo API** for weather data

### Email Automation
- Supabase Edge Functions with cron triggers
- Processes users in their local timezone
- Smart clothing recommendations based on weather conditions
- Beautiful HTML email templates

## 📊 Database Schema

```sql
-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  email text UNIQUE NOT NULL,
  latitude decimal NOT NULL,
  longitude decimal NOT NULL,
  timezone text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 🔧 Configuration

### Supabase Setup

1. **Database**: Run the migration in `supabase/migrations/create_users_table.sql`
2. **Edge Functions**: Deploy the daily email function
3. **Cron Jobs**: Set up scheduled triggers for 5am daily execution

### Email Service Setup

The app is configured to work with Resend (recommended) but can be adapted for other email services:

```typescript
// In edge function
const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Daily Weather Stylist <hello@yourdomain.com>',
    to: [user.email],
    subject: `Good Morning, ${user.first_name}! ☀️`,
    html: emailTemplate,
  }),
});
```

## 🌟 Key Features Explained

### Smart Location Detection
- Automatic geolocation with fallback to manual selection
- Beautiful map interface with custom markers
- Timezone auto-detection for accurate email timing

### Weather Intelligence
- Real-time weather data from Open-Meteo API
- Comprehensive weather condition analysis
- Temperature-based clothing recommendations

### Email Automation
- Runs daily at 5am in each user's local timezone
- Beautiful HTML email templates
- Personalized recommendations based on weather data

### Production-Ready Design
- Responsive design for all devices
- Smooth animations and micro-interactions
- Comprehensive form validation
- Error handling and loading states

## 🚀 Deployment

### Frontend (Vercel - Recommended)
```bash
npm run build
# Deploy to Vercel via Git integration
```

### Backend (Supabase)
- Database and edge functions are automatically hosted
- Set up cron triggers for daily email automation

## 🔒 Security & Privacy

- Row Level Security (RLS) enabled on all tables
- Email validation and duplicate prevention
- Secure API key management
- GDPR-compliant data handling

## 📈 Scaling Considerations

- Database indexing for optimal query performance
- Edge function optimization for handling large user bases
- Rate limiting and email quota management
- Monitoring and error tracking

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/         # React components
├── services/          # API and external service integrations
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── config/            # Configuration files

supabase/
├── migrations/        # Database migrations
└── functions/         # Edge functions
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for better mornings and perfect outfits! 🌅👕

## Author

Alexander Mueller

- GitHub: [alexmueller07](https://github.com/alexmueller07)
- LinkedIn: [Alexander Mueller](https://www.linkedin.com/in/alexander-mueller-021658307/)
- Email: amueller.code@gmail.com
