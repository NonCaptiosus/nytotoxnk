// Fallback posts for development and testing
export const FALLBACK_POSTS = [
  {
    title: 'Getting Started with Next.js',
    slug: 'getting-started-with-nextjs',
    content: `
# Getting Started with Next.js

Next.js is a powerful React framework that provides a great developer experience with all the features you need for production.

## Why Next.js?

- **Server-side rendering**
- **Static site generation**
- **API routes**
- **File-based routing**
- **Built-in CSS and Sass support**

## Installation

\`\`\`bash
npx create-next-app@latest
\`\`\`

## Pages Directory

Next.js uses a file-system based router. Files in the \`pages\` directory automatically become routes.

\`\`\`jsx
// pages/index.js
export default function Home() {
  return <h1>Welcome to Next.js!</h1>
}
\`\`\`

## App Directory (Next.js 13+)

Next.js 13 introduced a new \`app\` directory with new features like:

- **Layouts**
- **Server Components**
- **Streaming**

\`\`\`jsx
// app/page.js
export default function Page() {
  return <h1>Welcome to Next.js App Directory!</h1>
}
\`\`\`

## Learn More

Check out the [Next.js documentation](https://nextjs.org/docs) to learn more.
    `,
    author: 'John Doe',
    tags: ['nextjs', 'react', 'frontend'],
    created: new Date('2023-01-15').toISOString(),
    updated: new Date('2023-01-20').toISOString()
  },
  {
    title: 'Working with React Hooks',
    slug: 'working-with-react-hooks',
    content: `
# Working with React Hooks

React Hooks were introduced in React 16.8 as a way to use state and other React features without writing a class.

## Basic Hooks

### useState

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

### useEffect

\`\`\`jsx
import { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## Advanced Hooks

- **useContext** - For consuming context
- **useReducer** - An alternative to useState for complex state logic
- **useCallback** - Memoize callbacks to optimize child components
- **useMemo** - Memoize expensive calculations
- **useRef** - Persist values without causing rerenders
- **useLayoutEffect** - Similar to useEffect but fires synchronously
- **useDebugValue** - Display custom labels in React DevTools

## Custom Hooks

You can create your own hooks to reuse stateful logic between components.

\`\`\`jsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return width;
}

function MyComponent() {
  const width = useWindowWidth();
  return <div>Window width: {width}</div>;
}
\`\`\`

React Hooks are a powerful addition to React that simplify state management and side effects in functional components.
    `,
    author: 'Jane Smith',
    tags: ['react', 'hooks', 'javascript'],
    created: new Date('2023-02-10').toISOString(),
    updated: new Date('2023-02-15').toISOString()
  },
  {
    title: 'CSS-in-JS Solutions for React',
    slug: 'css-in-js-for-react',
    content: `
# CSS-in-JS Solutions for React

CSS-in-JS libraries allow you to write CSS directly in your JavaScript code, enabling component-scoped styling.

## Popular CSS-in-JS Libraries

### Styled Components

\`\`\`jsx
import styled from 'styled-components';

const Button = styled.button\`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background-color: #45a049;
  }
\`;

function App() {
  return <Button>Click Me</Button>;
}
\`\`\`

### Emotion

\`\`\`jsx
/** @jsx jsx */
import { css, jsx } from '@emotion/react';

const buttonStyle = css\`
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background-color: #45a049;
  }
\`;

function App() {
  return <button css={buttonStyle}>Click Me</button>;
}
\`\`\`

## Advantages of CSS-in-JS

1. **Component-scoped styles** - No more CSS conflicts
2. **Dynamic styling** - Styles can change based on props and state
3. **Dead code elimination** - Unused styles are automatically removed
4. **Full power of JavaScript** - Use variables, functions, and more
5. **Automatic vendor prefixing** - No need to worry about browser compatibility

## When to Use CSS-in-JS

CSS-in-JS is great for component libraries and applications where component isolation is important. However, it may not be the best choice for all projects, especially those with strict performance requirements or large teams with varied CSS expertise.

## Alternatives

- **CSS Modules**
- **Utility-first CSS (like Tailwind CSS)**
- **Sass/SCSS**
- **CSS Custom Properties (CSS Variables)**

Choose the styling approach that best fits your project's needs and your team's preferences.
    `,
    author: 'Alex Johnson',
    tags: ['css', 'react', 'styling', 'javascript'],
    created: new Date('2023-03-05').toISOString(),
    updated: new Date('2023-03-10').toISOString()
  }
]; 