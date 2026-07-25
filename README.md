# 🔗 LinkForge - Full Stack URL Shortener Platform

A modern, full-stack URL shortening platform built with the **MERN Stack** and **TypeScript**, featuring secure authentication, real-time analytics, QR code generation, and a responsive dashboard.

Designed as a portfolio project to demonstrate full-stack development, REST API design, authentication, database management, and modern UI/UX practices.

---

## 🚀 Live Demo

🌐 **Frontend:** https://url-shortener-2nk1-three.vercel.app

⚙️ **Backend API:** https://url-shortener-8gr3.onrender.com

---

## 📸 Preview

> Add screenshots or a GIF of your application here.

```
assets/
 ├── dashboard.png
 ├── analytics.png
 ├── create-link.png
 └── qr-code.png
```

---

# ✨ Features

## 🔐 Authentication & Security

* JWT Authentication
* Access & Refresh Tokens
* HttpOnly Cookie Authentication
* Email Verification
* Forgot & Reset Password
* Protected Routes
* Role-based Authorization (User/Admin)

---

## 🔗 URL Management

* Shorten Long URLs
* Custom URL Aliases
* Random Alias Generation
* Link Expiration
* One-Time (Self-Destruct) Links
* Password Protected Links
* Public & Private Links
* Favourite Links
* Tags & Folder Organisation

---

## 📊 Analytics Dashboard

Track link performance with interactive analytics.

* Real-time Click Tracking
* Unique vs Returning Visitors
* Country & City Analytics
* Device Analytics
* Browser Analytics
* Operating System Analytics
* Referral Sources
* Interactive Charts
* Daily / Weekly / Monthly / Yearly Statistics

---

## 📱 QR Code Generator

* Generate QR Codes
* Customise QR Codes
* Download as PNG
* Download as SVG

---

## 🛠 Developer API

* API Key Management
* REST API
* API Authentication
* Easy Integration

---

## 👨‍💼 Admin Dashboard

* Manage Users
* Suspend Accounts
* Promote Users
* Delete Users
* Platform Statistics
* Top Performing Links

---

## 🎨 User Interface

* Responsive Design
* Dark Mode
* Light Mode
* Glassmorphism UI
* Smooth Animations
* Mobile Friendly
* Modern Dashboard

---

# 🛠 Tech Stack

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* React Router
* Axios
* Zustand
* Recharts

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt
* Nodemailer
* NanoID

### Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas

---

# 📁 Project Structure

```
LinkForge
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.ts
│
├── backend
│   ├── src
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Sparsh88/URL-Shortener.git
cd URL-Shortener
```

---

## Backend Setup

```bash
cd backend

npm install

cp .env.example .env

npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend

npm install

cp .env.example .env

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000

MONGODB_URI=

JWT_ACCESS_SECRET=

JWT_REFRESH_SECRET=

EMAIL_USER=

EMAIL_PASS=

CLIENT_URL=http://localhost:5173
```

---

# 📌 API Highlights

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| POST   | /api/v1/auth/register | Register User            |
| POST   | /api/v1/auth/login    | Login User               |
| POST   | /api/v1/links         | Create Short Link        |
| GET    | /api/v1/links         | Get User Links           |
| GET    | /:shortCode           | Redirect to Original URL |
| GET    | /api/v1/analytics/:id | Link Analytics           |
| POST   | /api/v1/api-keys      | Generate API Key         |

---

# 🚀 Deployment

### Frontend

Deploy using **Vercel**

```bash
npm run build
```

---

### Backend

Deploy using **Render**

```bash
npm run build
npm start
```

---

# 📚 What I Learned

Through this project I gained hands-on experience with:

* Full Stack MERN Development
* TypeScript
* REST API Design
* JWT Authentication
* Secure Cookie-based Authentication
* MongoDB Data Modelling
* Dashboard UI Development
* State Management
* Data Visualisation
* Deployment using Vercel & Render

---

# 🤝 Contributing

Contributions, suggestions, and feedback are always welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Sparsh Chauhan**

🔗 GitHub
https://github.com/Sparsh88

💼 LinkedIn
https://linkedin.com/in/sparshchauhan08

---

⭐ If you found this project useful, consider giving it a **Star** on GitHub!
