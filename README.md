# Chat with GitHub

![Chat with GitHub](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-orange?logo=shadcnui)

An AI-powered GitHub repository analysis tool that helps you understand any repository through natural conversation. Built with Next.js, TypeScript, and shadcn/ui.

## ✨ Features

- **🤖 AI-Powered Analysis**: Ask questions about any GitHub repository and get instant, context-aware answers
- **📁 Code Understanding**: Navigate through complex codebases with ease
- **💬 Discussion Insights**: Access information from issues and discussions
- **🎨 Beautiful UI**: Clean, modern interface built with shadcn/ui and Tailwind CSS
- **🌙 Dark Mode Ready**: Seamless dark mode support
- **📱 Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **⚡ Fast & Modern**: Built with Next.js 14 and the App Router

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd GitHub-Chat-Frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
pnpm dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

\`\`\`
├── app/
│   ├── chat/              # Chat interface page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles with theme
├── components/
│   ├── chat/              # Chat-related components
│   │   ├── chat-area.tsx
│   │   ├── chat-header.tsx
│   │   ├── chat-message.tsx
│   │   ├── code-block.tsx
│   │   ├── empty-state.tsx
│   │   ├── repository-info.tsx
│   │   ├── repository-sidebar.tsx
│   │   └── suggested-questions.tsx
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── store.ts           # Zustand state management
│   └── utils.ts           # Utility functions
└── public/                # Static assets
\`\`\`

## 🎨 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🎯 Usage

1. **Enter a GitHub URL**: On the landing page, enter any public GitHub repository URL
2. **Wait for Analysis**: The system will process the repository structure
3. **Start Chatting**: Ask questions about the codebase, architecture, or specific implementations
4. **Explore Sources**: Click on source citations to see referenced code and discussions

### Example Questions

- "What's the main architecture of this project?"
- "How do I get started contributing?"
- "What are the key components and their purposes?"
- "Explain the authentication flow"
- "What dependencies does this project use?"

## 🔧 Configuration

### Theme Customization

The project uses an orange theme by default. You can customize colors in `app/globals.css`:

\`\`\`css
:root {
  --primary: oklch(0.646 0.222 41.116); /* Orange theme */
  /* Modify other color variables as needed */
}
\`\`\`

### Backend Integration

This is a frontend-only demo. To connect to a real backend:

1. Update the API calls in `components/chat/chat-area.tsx`
2. Replace mock data in `components/chat/repository-info.tsx`
3. Add your backend endpoint configuration

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Components

Use shadcn/ui CLI to add components:

\`\`\`bash
npx shadcn@latest add [component-name]
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for hosting and deployment

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Built with ❤️ using Next.js and shadcn/ui
