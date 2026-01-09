# 📋 Task Tracker

A beautiful, modern, and mobile-friendly full-stack Task Tracker application built with Node.js, Express, and vanilla JavaScript.

![Task Tracker](https://img.shields.io/badge/Task-Tracker-667eea?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)

## ✨ Features

- ✅ **Add Tasks** - Quickly add new tasks with a beautiful input interface
- 📋 **View All Tasks** - See all your tasks in a clean, organized list
- ✔️ **Mark as Completed** - Toggle tasks between pending and completed states
- 🗑️ **Delete Tasks** - Remove tasks you no longer need
- 📊 **Task Statistics** - Real-time stats showing total, pending, and completed tasks
- 🔍 **Filter Tasks** - Filter by All, Pending, or Completed tasks
- 📱 **Mobile Responsive** - Fully optimized for all screen sizes
- 🎨 **Modern UI** - Beautiful glassmorphism design with smooth animations
- ⚡ **Fast & Lightweight** - No heavy frameworks, just vanilla JavaScript

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/task-tracker.git
   cd task-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
task-tracker/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # CSS styles with modern design
│   └── app.js          # Frontend JavaScript
├── data/
│   └── tasks.json      # JSON file for data persistence
├── server.js           # Express server & API routes
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **UUID** - Unique ID generation
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, Flexbox, Grid
- **JavaScript (ES6+)** - Vanilla JS with async/await

### Design Features
- Glassmorphism effects
- Gradient backgrounds
- Smooth animations
- Custom checkboxes
- Toast notifications
- Responsive design

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create a new task |
| PATCH | `/api/tasks/:id/toggle` | Toggle task completion |
| DELETE | `/api/tasks/:id` | Delete a task |

### Request/Response Examples

**Create Task**
```json
POST /api/tasks
Body: { "title": "Complete the assignment" }
Response: { "success": true, "task": { "id": "...", "title": "...", "completed": false, "createdAt": "..." } }
```

**Toggle Task**
```json
PATCH /api/tasks/:id/toggle
Response: { "success": true, "task": { ... } }
```

## 🎨 Screenshots

### Desktop View
- Clean, modern interface with glassmorphism design
- Real-time statistics cards
- Smooth hover animations

### Mobile View
- Fully responsive layout
- Touch-friendly buttons
- Optimized for small screens

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus on input field |
| `Escape` | Blur input field |
| `Enter` | Add task (when input focused) |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Made with ❤️ for productivity

---

⭐ Star this repository if you found it helpful!
