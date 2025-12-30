# GenEx Frontend

A modern, ultra-minimalist React frontend for GenEx, a SaaS platform that transforms PDF documents into interactive exercises using AI.

## Features

- **Dashboard**: Overview of projects with success indicators and search filters
- **Interactive Workflow**: 4-step stepper for PDF processing (Upload → Configure → Edit → Export)
- **Split-Screen Editor**: Real-time editing with PDF preview
- **Modern UI**: Apple-inspired design with Stripe fluidity
- **Responsive**: Mobile-first design with Tailwind CSS
- **State Management**: Zustand for clean, decoupled state
- **Mock API**: Simulated FastAPI integration with setTimeout

## Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: Zustand
- **Routing**: React Router DOM
- **HTTP**: Axios (prepared for backend integration)

## Project Structure

```
src/
├── components/
│   ├── ui/           # Atomic components (Button, Card, Input, etc.)
│   └── features/     # Business components (FileUploader, ExerciseEditor)
├── layouts/          # Page layouts (MainLayout, Sidebar)
├── pages/            # Route components (Dashboard, Editor)
├── hooks/            # Custom hooks (useExercises, useAuth, useToast)
├── stores/           # Zustand stores (projectStore, exerciseStore)
└── utils/            # Helper functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Creating a New Project

1. Navigate to the Dashboard
2. Click "New Project" or go to "/editor"
3. **Step 1**: Drag & drop a PDF file (up to 10MB)
4. **Step 2**: Configure AI parameters (difficulty, language, exercise type)
5. **Step 3**: Edit generated questions in the split-screen interface
6. **Step 4**: Export as PDF or JSON, or share via link

### Data Types

```javascript
// Project
{
  id: string,
  title: string,
  source_file_url: string,
  created_at: string,
  status: 'processing' | 'completed'
}

// Exercise
{
  id: string,
  type: 'qcm' | 'fill-in-the-blank' | 'open-ended',
  difficulty: 'easy' | 'medium' | 'hard',
  questions: Question[]
}

// Question
{
  id: string,
  prompt: string,
  options: string[], // For QCM
  correct_answer: string,
  explanation: string
}
```

## Design System

- **Primary Color**: Indigo (#4F46E5)
- **Text Color**: Slate (#475569)
- **Surface**: Pure White (#FFFFFF)
- **Border Radius**: 16px (rounded-2xl)
- **Typography**: System fonts with proper hierarchy

## API Integration

The app uses mock API calls with `setTimeout` to simulate FastAPI responses. Replace the mock implementations in the stores with actual Axios calls:

```javascript
// Example: Replace in projectStore.js
fetchProjects: async () => {
  set({ loading: true, error: null });
  try {
    const response = await axios.get('/api/projects');
    set({ projects: response.data, loading: false });
  } catch (error) {
    set({ error: error.message, loading: false });
  }
}
```

## Contributing

1. Follow the component hierarchy and folder structure
2. Use JSDoc for all component documentation
3. Separate business logic into custom hooks
4. Maintain responsive design with Tailwind breakpoints
5. Test components with mock data before integration

## License

This project is part of the GenEx platform.

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
