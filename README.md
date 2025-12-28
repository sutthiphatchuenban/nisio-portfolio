# 🚀 PortX - Modern Interactive Portfolio & Blog System

[ภาษาไทยด้านล่าง]

**PortX** is a high-performance, interactive portfolio and blog management system built with the modern web stack. It features a sleek UI, real-time analytics, and a powerful admin dashboard for seamless content management.

---

## 🌟 Features

### 👤 Public (Visitor)
- **Interactive Hero Section**: Dynamic animations and professional branding.
- **Project Showcase**: Filterable project grid with detailed view and image galleries.
- **Full-featured Blog**: Clean reading experience with tags, cover images, and Thai language slug support.
- **Skill Visualization**: Categorized skill bars with proficiency levels.
- **Contact System**: Secure contact form with instant status tracking.
- **Responsive Design**: Flawless experience across mobile, tablet, and desktop.
- **Theme Support**: Elegant Dark/Light mode toggle.

### 🔐 Admin Dashboard
- **Overview Analytics**: Real-time traffic monitoring, page views, and session statistics using Recharts.
- **Content Management (CMS)**:
    - **Projects**: Full CRUD with Cloudinary image integration and multi-image support.
    - **Blog**: Markdown-ready editor for crafting deep-dive technical articles.
    - **Skills**: Manage your technical stack and proficiency levels.
- **Site Settings**: Dynamic control over site name, bio, social links, and SEO metadata.
- **Inbox Management**: View and manage messages from the contact form.

### 🛠 Technical Highlights
- **Server Components**: Optimized performance with Next.js 14/15 RSC.
- **Database**: PostgreSQL with Prisma ORM for type-safe queries.
- **Authentication**: Secure admin access via NextAuth.js.
- **Media**: Integrated Cloudinary for high-performance image hosting.
- **Real-time**: Socket.io integration for instant dashboard updates.

---

## 🇹🇭 เกี่ยวกับ PortX (PortX คืออะไร?)

**PortX** คือแพลตฟอร์ม Portfolio และ Blog ระดับมืออาชีพที่ออกแบบมาเพื่อนักพัฒนาและครีเอทีฟ โดยเน้นความสวยงาม ประสิทธิภาพ และความง่ายในการจัดการเนื้อหา

### คุณสมบัติเด่น:
- **ระบบ Blog สมบูรณ์แบบ**: รองรับการเขียนบทความด้วย Markdown และรองรับ URL ภาษาไทย (Slug) 100%
- **Dashboard จัดการหลังบ้าน**: มาพร้อมกราฟสถิติผู้เข้าชมแบบ Real-time ช่วยให้คุณวิเคราะห์ข้อมูลได้ทันที
- **ปรับแต่งได้อิสระ**: จัดการชื่อเว็บไซต์, ประวัติย่อ, ลิงก์ Social Media และรูปภาพได้โดยไม่ต้องแก้ Code
- **ประสิทธิภาพสูง**: ใช้เทคโนโลยี Next.js ล่าสุด มั่นใจได้ในเรื่องความเร็วและ SEO

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Analytics**: [Recharts](https://recharts.org/)
- **Media**: [Cloudinary](https://cloudinary.com/)
- **Real-time**: [Socket.io](https://socket.io/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd portx
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="your_postgresql_url"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key"

# Cloudinary (Media)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
# Optional: Seed initial data
npm run prisma:seed
```

### 5. Run the development server
```bash
npm run dev
```

---

## 📁 File Structure

```text
├── app/              # Next.js App Router (Public, Admin, API)
├── components/       # UI & Feature components (Hero, ProjectCard, etc.)
├── lib/              # Core utilities (Prisma client, Auth config)
├── prisma/           # Database schema & migrations
├── public/           # Static assets
└── types/            # TypeScript definitions
```

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## ✉️ Contact

Your Name - [@yourusername](https://twitter.com/yourusername) - email@example.com

Project Link: [https://github.com/yourusername/portx](https://github.com/yourusername/portx)
