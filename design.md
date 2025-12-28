# Interactive Portfolio Website Design Document

## 1. ภาพรวมระบบ (System Overview)

### 1.1 วัตถุประสงค์ของระบบ
เว็บไซต์ Portfolio แบบ Interactive ที่แสดงผลงาน ทักษะ และประวัติของเจ้าของ portfolio พร้อมระบบจัดการเนื้อหาแบบ real-time และการแสดงผลแบบ responsive design

### 1.2 คุณสมบัติหลักของระบบ
- **Frontend**: Next.js 14+ with TypeScript, React Server Components
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Cloudinary สำหรับจัดการรูปภาพและไฟล์
- **Real-time Communication**: Socket.io สำหรับการอัพเดทแบบ real-time
- **Authentication**: NextAuth.js สำหรับระบบจัดการผู้ใช้
- **Deployment**: Vercel

### 1.3 สถาปัตยกรรมระบบ
```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router │ React Components │ Shadcn/ui │        │
├─────────────────────────────────────────────────────────────┤
│                    API Layer                                │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes │ Socket.io │ Middleware │            │
├─────────────────────────────────────────────────────────────┤
│                  Business Logic                             │
├─────────────────────────────────────────────────────────────┤
│  Services │ Validation │ Error Handling │                  │
├─────────────────────────────────────────────────────────────┤
│                  Data Access Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Prisma ORM │ PostgreSQL │ Cloudinary SDK │               │
└─────────────────────────────────────────────────────────────┘
```

## 2. ผู้ใช้งานและสิทธิ์ (Users & Permissions)

### 2.1 ประเภทผู้ใช้งาน

#### 2.1.1 Visitor (ผู้เยี่ยมชมทั่วไป)
- **สิทธิ์**: ดูเนื้อหาทั้งหมดบน portfolio
- **การกระทำที่อนุญาต**:
  - ดูหน้า Home, About, Projects, Skills, Contact
  - ดูรายละเอียดโปรเจ็ค
  - ส่งข้อความติดต่อผ่านแบบฟอร์ม
  - ดาวน์โหลด Resume
  - ดูสถิติการเข้าชม (แบบจำกัด)

#### 2.1.2 Admin (เจ้าของ portfolio)
- **สิทธิ์**: จัดการเนื้อหาทั้งหมด
- **การกระทำที่อนุญาต**:
  - ทุกสิทธิ์ของ Visitor
  - เพิ่ม/แก้ไข/ลบ โปรเจ็ค
  - เพิ่ม/แก้ไข/ลบ ทักษะ
  - จัดการข้อมูลส่วนตัว
  - ตอบกลับข้อความติดต่อ
  - ดูสถิติการเข้าชมแบบละเอียด
  - จัดการหมวดหมู่โปรเจ็ค
  - อัพโหลด/จัดการไฟล์ใน Cloudinary

### 2.2 ระบบ Authentication & Authorization
```typescript
// User Schema
interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'VISITOR'
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Session Management
interface Session {
  user: User
  expires: Date
  accessToken: string
}
```

## 3. โครงสร้างฐานข้อมูล (Database Schema)

### 3.1 Entity Relationship Diagram
```
User (1) ─────┐
              │
Project (N) <─┤
              │
Skill (N) <───┤
              │
Category (1) ─┤
              │
Contact (N) <─┘
```

### 3.2 Database Tables

#### 3.2.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'VISITOR',
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2.2 Projects Table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  image_url TEXT,
  project_url TEXT,
  github_url TEXT,
  technologies TEXT[], -- Array of technology names
  category_id UUID REFERENCES categories(id),
  featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'published',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2.3 Skills Table
```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100), -- 'frontend', 'backend', 'database', 'tools'
  proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 100),
  icon TEXT, -- Icon URL or icon name
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2.4 Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2.5 Contacts Table
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'read', 'replied'
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  replied_at TIMESTAMP
);
```

#### 3.2.6 Analytics Table
```sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path VARCHAR(255) NOT NULL,
  page_title VARCHAR(255),
  referrer TEXT,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  duration INTEGER, -- Time spent in seconds
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. รายการหน้าจอทั้งหมด (Screen List)

### 4.1 Public Pages (สำหรับผู้เยี่ยมชม)

#### 4.1.1 Home Page (`/`)
- **Components**:
  - Hero Section with animated text
  - Featured Projects carousel
  - Skills showcase
  - Contact CTA section
  - Social links
- **Features**: Typewriter effect, smooth scrolling, responsive design

#### 4.1.2 About Page (`/about`)
- **Components**:
  - Personal introduction
  - Experience timeline
  - Education background
  - Download resume button
  - Skills visualization

#### 4.1.3 Projects Page (`/projects`)
- **Components**:
  - Project grid/list view toggle
  - Category filter
  - Search functionality
  - Sort options (newest, oldest, featured)
  - Pagination/infinite scroll
- **Features**: Filter by category, search by title/technology

#### 4.1.4 Project Detail Page (`/projects/[slug]`)
- **Components**:
  - Project images gallery
  - Project description
  - Technology stack badges
  - Live demo button
  - GitHub repository link
  - Related projects section
- **Features**: Image zoom, share buttons, view counter

#### 4.1.5 Skills Page (`/skills`)
- **Components**:
  - Skills organized by category
  - Proficiency level indicators
  - Interactive skill cards
  - Filter by category

#### 4.1.6 Contact Page (`/contact`)
- **Components**:
  - Contact form
  - Social media links
  - Email/phone display
  - Location map (embedded)
  - Response time indicator

### 4.2 Admin Dashboard (`/admin`)

#### 4.2.1 Admin Login (`/admin/login`)
- **Components**:
  - Login form with NextAuth
  - OAuth providers (Google, GitHub)
  - Remember me functionality
  - Password reset link

#### 4.2.2 Dashboard Overview (`/admin/dashboard`)
- **Components**:
  - Statistics cards (visits, projects, contacts)
  - Recent activities feed
  - Quick actions panel
  - Chart.js graphs for analytics

#### 4.2.3 Project Management (`/admin/projects`)
- **Components**:
  - Project list with CRUD operations
  - Bulk actions (delete multiple)
  - Advanced filtering
  - Image upload with Cloudinary
  - Markdown editor for description
  - SEO metadata fields

#### 4.2.4 Skill Management (`/admin/skills`)
- **Components**:
  - Drag-and-drop skill ordering
  - Bulk import/export
  - Category management
  - Icon picker integration

#### 4.2.5 Contact Management (`/admin/contacts`)
- **Components**:
  - Contact messages inbox
  - Reply functionality
  - Mark as read/unread
  - Spam detection
  - Export to CSV

#### 4.2.6 Analytics (`/admin/analytics`)
- **Components**:
  - Real-time visitor counter
  - Page view statistics
  - Traffic sources analysis
  - Popular content report
  - Custom date range picker

### 4.3 Utility Pages

#### 4.3.1 Error Pages
- 404 Not Found (`/404`)
- 500 Server Error (`/500`)
- Maintenance Mode (`/maintenance`)

#### 4.3.2 Legal Pages
- Privacy Policy (`/privacy`)
- Terms of Service (`/terms`)

## 5. API Endpoints + API Specification

### 5.1 Authentication Endpoints

#### POST /api/auth/signin
```typescript
// Request
{
  "email": "string",
  "password": "string",
  "rememberMe": boolean
}

// Response
{
  "user": User,
  "accessToken": "string",
  "expiresIn": number
}
```

#### POST /api/auth/signout
```typescript
// Response
{
  "message": "Signed out successfully"
}
```

#### GET /api/auth/session
```typescript
// Response
{
  "user": User | null,
  "expires": Date
}
```

### 5.2 Projects API

#### GET /api/projects
```typescript
// Query Parameters
{
  "page": number,
  "limit": number,
  "category": string,
  "search": string,
  "sort": 'newest' | 'oldest' | 'featured'
}

// Response
{
  "projects": Project[],
  "total": number,
  "page": number,
  "totalPages": number
}
```

#### GET /api/projects/:id
```typescript
// Response
{
  "project": Project,
  "relatedProjects": Project[]
}
```

#### POST /api/projects (Admin only)
```typescript
// Request
{
  "title": "string",
  "description": "string",
  "shortDescription": "string",
  "imageUrl": "string",
  "projectUrl": "string",
  "githubUrl": "string",
  "technologies": string[],
  "categoryId": "string",
  "featured": boolean
}

// Response
{
  "project": Project,
  "message": "Project created successfully"
}
```

#### PUT /api/projects/:id (Admin only)
```typescript
// Request: Same as POST with optional fields

// Response
{
  "project": Project,
  "message": "Project updated successfully"
}
```

#### DELETE /api/projects/:id (Admin only)
```typescript
// Response
{
  "message": "Project deleted successfully"
}
```

### 5.3 Skills API

#### GET /api/skills
```typescript
// Query Parameters
{
  "category": string
}

// Response
{
  "skills": Skill[],
  "categories": string[]
}
```

#### POST /api/skills (Admin only)
```typescript
// Request
{
  "name": "string",
  "category": "string",
  "proficiency": number,
  "icon": "string",
  "orderIndex": number
}

// Response
{
  "skill": Skill,
  "message": "Skill created successfully"
}
```

### 5.4 Contact API

#### POST /api/contact
```typescript
// Request
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string"
}

// Response
{
  "message": "Contact message sent successfully",
  "contactId": "string"
}
```

#### GET /api/contact (Admin only)
```typescript
// Query Parameters
{
  "page": number,
  "limit": number,
  "status": 'pending' | 'read' | 'replied'
}

// Response
{
  "contacts": Contact[],
  "total": number,
  "unreadCount": number
}
```

### 5.5 Analytics API

#### GET /api/analytics/overview (Admin only)
```typescript
// Response
{
  "totalVisits": number,
  "uniqueVisitors": number,
  "pageViews": number,
  "avgSessionDuration": number,
  "bounceRate": number,
  "topPages": PageView[]
}
```

#### POST /api/analytics/track
```typescript
// Request (automatically tracked)
{
  "pagePath": "string",
  "pageTitle": "string",
  "referrer": "string",
  "sessionId": "string",
  "duration": number
}
```

### 5.6 Upload API

#### POST /api/upload
```typescript
// Request (multipart/form-data)
// file: File

// Response
{
  "url": "string",
  "publicId": "string",
  "format": "string",
  "size": number
}
```

## 6. Workflow ทั้งหมด (Workflows)

### 6.1 User Visit Workflow
```
User visits site → Analytics tracking → Load page content → Cache check → 
Database query → Render page → Update view count → Store session
```

### 6.2 Project Creation Workflow (Admin)
```
Admin login → Access admin panel → Click "New Project" → 
Fill project details → Upload images → Validate data → 
Save to database → Invalidate cache → Broadcast update via Socket.io → 
Show success notification
```

### 6.3 Contact Form Workflow
```
Visitor fills form → Client-side validation → Rate limiting check → 
Spam detection → Save to database → Send email notification → 
Show success message → Admin dashboard update (real-time)
```

### 6.4 Image Upload Workflow
```
Select image → Client-side validation → Upload to Cloudinary → 
Get public URL → Save URL in database → Optimize image → 
Generate responsive sizes → Cache CDN URLs
```

### 6.5 Real-time Update Workflow
```
Admin makes changes → Database update → Socket.io broadcast → 
Connected clients receive update → UI updates automatically → 
Cache invalidation → Analytics logging
```

### 6.6 Search and Filter Workflow
```
User types search → Debounce input → API request → 
Database query with indexes → Return filtered results → 
Update UI → Update URL params → Cache results
```

## 7. เทคโนโลยีที่ใช้ (Technology Stack)

### 7.1 Frontend Technologies
- **Next.js 14+**: React framework with App Router
- **React 18**: UI library with Server Components
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Modern React components
- **Framer Motion**: Animation library
- **React Hook Form**: Form validation
- **Zod**: Schema validation
- **TanStack Query**: Data fetching and caching

### 7.2 Backend Technologies
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Primary database
- **NextAuth.js**: Authentication solution
- **Socket.io**: Real-time communication
- **Cloudinary**: Media storage and optimization
- **Nodemailer**: Email service
- **bcrypt**: Password hashing

### 7.3 Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **Docker**: Containerization
- **Git**: Version control

### 7.4 Free Services & Tools
- **Vercel**: Frontend hosting (Hobby plan)
- **Railway/Supabase**: PostgreSQL hosting (Free tier)
- **Cloudinary**: Image storage (Free tier)
- **GitHub**: Code repository
- **Google Analytics**: Analytics (Free)
- **Let's Encrypt**: SSL certificates
- **Cloudflare**: CDN and DNS (Free plan)

### 7.5 Performance Optimization
- **Next.js Image Optimization**: Automatic image optimization
- **Static Generation**: Pre-render pages at build time
- **Incremental Static Regeneration**: Update static content
- **Code Splitting**: Automatic code splitting
- **Tree Shaking**: Remove unused code
- **Compression**: Gzip/Brotli compression
- **Caching**: Redis for session caching (optional)

## 8. โครงสร้างไฟล์ (File Structure)

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes group
│   │   ├── page.tsx       # Home page
│   │   ├── about/
│   │   │   └── page.tsx   # About page
│   │   ├── projects/
│   │   │   ├── page.tsx   # Projects list
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Project detail
│   │   ├── skills/
│   │   │   └── page.tsx   # Skills page
│   │   ├── contact/
│   │   │   └── page.tsx   # Contact page
│   │   └── layout.tsx     # Public layout
│   ├── (admin)/           # Admin routes group
│   │   ├── login/
│   │   │   └── page.tsx   # Admin login
│   │   ├── dashboard/
│   │   │   ├── page.tsx   # Dashboard overview
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── skills/
│   │   │   │   └── page.tsx
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx
│   │   │   └── analytics/
│   │   │       └── page.tsx
│   │   └── layout.tsx     # Admin layout
│   ├── api/               # API routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── skills/
│   │   │   └── route.ts
│   │   ├── contact/
│   │   │   └── route.ts
│   │   ├── analytics/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── shared/           # Shared components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── Loading.tsx
│   ├── home/             # Home page components
│   │   ├── Hero.tsx
│   │   ├── FeaturedProjects.tsx
│   │   └── SkillsShowcase.tsx
│   ├── projects/         # Project components
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   └── ProjectFilter.tsx
│   └── admin/            # Admin components
│       ├── DashboardStats.tsx
│       ├── ProjectForm.tsx
│       └── ...
├── lib/                   # Utility libraries
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # NextAuth configuration
│   ├── cloudinary.ts      # Cloudinary client
│   ├── socket.ts          # Socket.io setup
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
│   ├── useSocket.ts
│   ├── useAnalytics.ts
│   └── useProjects.ts
├── services/              # Business logic
│   ├── project.service.ts
│   ├── skill.service.ts
│   ├── contact.service.ts
│   └── analytics.service.ts
├── types/                 # TypeScript types
│   ├── project.ts
│   ├── skill.ts
│   └── contact.ts
├── middleware.ts          # Next.js middleware
└── socket/               # Socket.io handlers
    └── server.ts

public/                    # Static assets
├── images/               # Local images
├── favicon.ico
└── robots.txt

prisma/                    # Database schema
├── schema.prisma
└── migrations/

tests/                     # Test files
├── unit/
├── integration/
└── e2e/

docs/                      # Documentation
├── api.md
├── deployment.md
└── contributing.md

.env.local                 # Environment variables
next.config.ts            # Next.js configuration
tsconfig.json             # TypeScript configuration
tailwind.config.ts        # Tailwind CSS configuration
package.json              # Dependencies
```

## 9. Security Considerations

### 9.1 Authentication & Authorization
- JWT tokens with secure HTTP-only cookies
- Rate limiting on API endpoints
- CSRF protection on forms
- Input validation with Zod schemas
- Role-based access control (RBAC)

### 9.2 Data Protection
- HTTPS enforcement
- SQL injection prevention via Prisma ORM
- XSS protection with React's built-in escaping
- File upload validation and sanitization
- Database connection encryption

### 9.3 Privacy
- GDPR compliance for EU visitors
- Cookie consent banner
- Privacy policy and terms of service
- Data retention policies
- User data export functionality

## 10. Performance Optimization

### 10.1 Frontend Optimization
- Image lazy loading with Next.js Image component
- Code splitting and dynamic imports
- Progressive Web App (PWA) features
- Service worker for offline functionality
- Critical CSS inlining

### 10.2 Backend Optimization
- Database indexing on frequently queried fields
- Query optimization with Prisma
- Redis caching for session management
- CDN integration with Cloudinary
- API response compression

### 10.3 Monitoring
- Error tracking with Sentry (free tier)
- Performance monitoring with Vercel Analytics
- Uptime monitoring with UptimeRobot
- Real User Monitoring (RUM)

## 11. Deployment Strategy

### 11.1 Development Environment
- Local PostgreSQL with Docker
- Cloudinary development account
- GitHub repository with branch protection

### 11.2 Production Deployment
- **Frontend**: Vercel with GitHub integration
- **Database**: Railway PostgreSQL or Supabase
- **Storage**: Cloudinary with automatic optimization
- **Domain**: Custom domain with Cloudflare DNS
- **SSL**: Free SSL from Cloudflare/Let's Encrypt

### 11.3 CI/CD Pipeline
- GitHub Actions for automated testing
- Automatic deployment on main branch
- Database migration automation
- Environment variable management

## 12. Maintenance & Updates

### 12.1 Regular Maintenance
- Weekly dependency updates
- Security patch monitoring
- Database backup automation
- Performance monitoring
- Broken link checking

### 12.2 Content Management
- Regular content updates
- SEO optimization
- Analytics review
- User feedback collection
- Feature enhancement based on usage

---

**หมายเหตุ**: เอกสารนี้เป็นแบบร่างสำหรับการพัฒนาเว็บไซต์ Portfolio แบบ Interactive โดยใช้เทคโนโลยีฟรีและ open-source ทั้งหมด เพื่อให้สามารถ deploy ได้ใน production โดยไม่มีค่าใช้จ่ายหรือมีค่าใช้จ่ายต่ำที่สุด