# Identity Reconciliation Dashboard ✨

This is the frontend client for the **Identity Reconciliation Service**. It provides a sleek, futuristic interface to interact with the reconciliation API and visualize how customer records are linked.

## 🎨 Design Philosophy

The dashboard utilizes a **Futuristic Glassmorphism** aesthetic:
- **Neon Accents**: High-contrast colors to draw attention to key data.
- **Translucent Surfaces**: Layered backgrounds for a depth-heavy, premium feel.
- **Dynamic Interactions**: Micro-animations and hover effects for an engaging UX.

## 🚀 Key Features

- **Real-time API Testing**: Input email and phone numbers to see how the reconciliation engine behaves.
- **Visual Result Decomposition**: Clear breakdown of Primary IDs, linked emails, and secondary contacts.
- **Responsive Layout**: Optimized for both desktop and mobile viewing.
- **Error Handling**: Graceful handling of network issues or invalid inputs.

## 🛠️ Built With

- **React 18** (Functional Components & Hooks)
- **Vite** (Optimized Build Tooling)
- **Vanilla CSS** (Custom Design System)
- **Lucide React** (Premium Iconography)

## 🔧 Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Ensure the backend server is running on `http://localhost:3000`. The frontend is configured to communicate with this endpoint by default in `App.tsx`.

### 3. Run Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` to view the app.

## 📁 Structure

- `src/App.tsx`: The main focal point containing the dashboard logic and API integration.
- `src/index.css`: Implementation of the custom Glassmorphism design system.
- `src/assets/`: Visual assets and icons.

---
*Part of the Identity Reconciliation Project.*

