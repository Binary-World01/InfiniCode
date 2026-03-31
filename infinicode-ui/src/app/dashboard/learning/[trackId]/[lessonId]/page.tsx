"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    LayoutTemplate, BrainCircuit, Network, Code2, Sparkles, Cpu, Cloud,
    ChevronRight, Play, CheckCircle2, Lock, ArrowLeft, GraduationCap,
    Clock, Star, Users, Layout, FileCode, Workflow, Send, Bookmark,
    MessageSquare, Zap, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const lessonsData: Record<string, any> = {
    "les_1_1": {
        chapter: "Foundations",
        subchapter: "HTML5 & Semantic Architecture",
        title: "Semantic HTML & ARIA: The Accessibility Tree",
        videoUrl: "https://www.youtube.com/embed/YOsMJQfwqow", // Kevin Powell - Semantic HTML Verified
        description: "Moving beyond <div> soup into engineering accessible, screen-reader optimized web structures.",
        content: `
# Semantic HTML & ARIA: Advanced Deep Dive

In this lesson, we will deconstruct the "Accessibility Tree" and learn why semantic HTML is the foundation of $100k+ engineering roles.

## 1. The Accessibility Object Model (AOM)
Just as the browser parses HTML into a DOM, it also creates an **Accessibility Tree**. This tree is what screen readers like NVDA or VoiceOver "see".

### Key Properties in the AOM:
- **Role**: Describes what the element is (e.g., \`button\`, \`banner\`, \`main\`).
- **Name**: The label for the element (e.g., "Submit Order").
- **State**: Dynamic properties (e.g., \`aria-busy\`, \`aria-expanded\`).

## 2. Exhaustive Semantic Tag Dictionary
| Tag | Purpose | SEO/A11y Impact |
| :--- | :--- | :--- |
| \`<main>\` | Identifies the unique primary content of the body. | High (Skip-to-Content target) |
| \`<nav>\` | Defines a block of navigation. | High (Screen reader shortcut) |
| \`<header>\` | Contains site-wide introductory content. | Medium |
| \`<article>\` | Self-contained content (Blog post, card). | High (Search engine indexing) |
| \`<section>\` | Grouping of related content within a page. | Low |
| \`<aside>\` | Sidebar content not critical to main flow. | Medium |
| \`<footer>\` | Copyright, links, and contact info. | Low |
| \`<time>\` | Machine-readable date/time. | High (Browser scheduling) |
| \`<figure>\` | Self-contained graphic/media. | Medium |

## 3. The ARIA "First Rule" & WCAG Compliance
WCAG (Web Content Accessibility Guidelines) mandates that we must not rely solely on visual cues.
- **BAD**: \`<div onclick="submit()">Submit</div>\`
- **GOOD**: \`<button onClick={submit}>Submit</button>\`

### Advanced ARIA Usage:
- \`aria-label\`: Provides a string label for elements without visible text (e.g., a search icon).
- \`aria-labelledby\`: Points to another element's ID to use as a label.
- \`aria-describedby\`: Points to extra information (like a password requirement).

## 4. Real-World Case Study: Code Refactoring
### Before (Div Soup):
\`\`\`html
<div class="header">
  <div class="logo">InfiniCode</div>
  <div class="nav-links"><a>Home</a><a>Courses</a></div>
</div>
\`\`\`

### After (Elite Semantic):
\`\`\`html
<header role="banner">
  <h1 class="logo">InfiniCode</h1>
  <nav aria-label="Primary Navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/courses">Courses</a></li>
    </ul>
  </nav>
</header>
\`\`\`

## 5. Summary & Key Objectives
- Use landmarks (\`<main>\`, \`<nav>\`) to structure your page.
- Never use a positive \`tabindex\`.
- Always provide \`alt\` text for images, or \`alt=""\` for decorative ones.

### Pro-Tip:
Verify your work by turning on a screen reader and navigating your app using **only the keyboard**. If you can't access every feature, you haven't finished the job.
        `,
        duration: "45 min",
        nextLessonId: "les_1_2",
    },
    "les_1_2": {
        chapter: "Foundations",
        subchapter: "HTML5 & Semantic Architecture",
        title: "Forms, Validation & User Input",
        videoUrl: "https://www.youtube.com/embed/fNcJuPIZ2WE", // Learn HTML Forms in 25 Minutes
        description: "Building production-grade forms with native validation and custom UI patterns.",
        content: `
# Forms, Validation & User Input: The Complete Guide

In this lesson, we will master the absolute "Best Practices" for data entry, from accessible labels to custom validation logic.

## 1. The Anatomy of a Professional Form
A perfect form is more than just inputs—it's about the Relationship between labels, inputs, and error messages.

### The Five Commandments of Form UX:
1. **Always use \`<label>\`**: Never use a \`<span>\` or \`div\` as a label.
2. **Link with \`for\` / \`id\`**: The label **must** be programmatically linked.
3. **Group with \`<fieldset>\`**: Use this for groups like "Shipping Address" or "Payment Method".
4. **Use \`<legend>\`**: The legend provides the title for a fieldset.
5. **Autosave / LocalStorage**: For long forms, always cache user progress.

## 2. Native Constraint Validation API
Stop writing heavy JS for simple validation. Browser-native attributes are faster and more accessible.
- \`required\`: Field cannot be empty.
- \`pattern\`: Validates against a Regex (e.g., \`[0-9]{5}\` for Zip code).
- \`minlength\` / \`maxlength\`: Character limits.
- \`min\` / \`max\`: Range limits for numbers/dates.

### Custom Error Messages:
\`\`\`javascript
const email = document.getElementById("email");
email.oninvalid = (e) => {
  e.target.setCustomValidity("We need a valid enterprise email address!");
};
\`\`\`

## 3. Accessible Error Handling (The "Focus" Method)
When a form is submitted incorrectly:
1. Prevent default.
2. Update \`aria-invalid="true"\` for the broken fields.
3. Use \`aria-describedby\` to link the error message ID to the input.
4. Move focus to the first error using \`element.focus()\`.

## 4. Input Types & When to Use Them
| Input Type | Best Use Case | Native Feature |
| :--- | :--- | :--- |
| \`email\` | Email addresses | Auto-keyboard on mobile (@ sym) |
| \`tel\` | Phone numbers | Numeric keypad on mobile |
| \`search\` | Search bars | Includes a "clear" (X) button |
| \`range\` | Sliders | Native accessibility drag support |
| \`date\` | Birthdays/Events | Native date picker calendar |

## 5. Summary & Key Objectives
- Master the UI relationship between Label, Input, and Error.
- Leverage browser-native validation before reaching for a library.
- Ensure 100% keyboard accessibility.

### Pro-Tip:
Always use \`autocomplete\` attributes (e.g., \`autocomplete="cc-number"\`). It allows browsers to "Autofill" data, which increases conversion rates by up to 25%.
        `,
        duration: "1h 10m",
        nextLessonId: "les_1_3",
    },
    "les_1_3": {
        chapter: "Foundations",
        subchapter: "Modern CSS Mastery",
        title: "Flexbox & Grid Deep Dive",
        videoUrl: "https://www.youtube.com/embed/aEj6k-gi9-s", // Coding2GO - Flexbox vs Grid Verified
        description: "Mastering complex layouts with low-code, high-performance CSS logic.",
        content: `
# Flexbox & Grid Deep Dive: The Layout Engine

Move beyond "centering a div" into engineering complex, scalable 2D and 1D layouts.

## 1. CSS Grid: The 2D Structural Powerhouse
Grid is designed for the **Overall Page Shell** and complex internal components.

### Grid Cheat Sheet:
- \`grid-template-areas\`: The most readable way to define layout regions.
- \`repeat(auto-fit, minmax(...))\`: Creating responsive grids without media queries.
- \`fr\` units: Flexible length units that represent a fraction of free space.

\`\`\`css
.dashboard {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas: 
    "sidebar header"
    "sidebar main";
}
\`\`\`

## 2. Flexbox: The 1D Alignment Specialist
Flexbox is for **Flow and Alignment** within a single dimension.

### Flexbox Mastery:
- \`flex-grow\`: How much the item will grow relative to others.
- \`flex-basis\`: The default size before free space is distributed.
- \`gap\`: (Now supported in Flex!) The cleanest way to add spacing.

## 3. The "Holy Grail" of Alignment
To center everything perfectly:
\`\`\`css
.center-box {
  display: grid;
  place-items: center; /* Centers both horizontally and vertically */
}
\`\`\`

## 4. Performance: Layout vs. Paint
Heavy use of complex layouts can cause "Layout Thrashing".
- **Avoid**: Absolute positioning for structural layout.
- **Prefer**: Grid and Flex, as they are optimized by the browser's C++ rendering engine.

### Pro-Tip:
Use the **Browser Inspector's Grid Overlay**. It's the only way to "see" the lines and tracks you are creating in real-time.
        `,
        duration: "1h 20m",
        nextLessonId: "les_1_4",
    },
    "les_2_1": {
        chapter: "JavaScript Infinity",
        subchapter: "Engine Internals",
        title: "Execution Context & Event Loop",
        videoUrl: "https://www.youtube.com/embed/8aGhZQkoFbQ", // What the heck is the event loop anyway?
        description: "Understanding how V8 executes code: Call Stacks, Web APIs, and the Task Queue.",
        content: `
# Execution Context & The Event Loop: V8 Internals

To write high-performance JavaScript, you must understand how the engine (V8, SpiderMonkey) actually handles your code.

## 1. The Call Stack (Synchronous)
JavaScript is single-threaded. When a function is called, a new **Execution Context** is pushed onto the **Call Stack**.
- **Stack Overflow**: This happens when you have infinite recursion.

## 2. The Task Queue (Asynchronous)
Tasks like \`setTimeout\` or \`fetch\` are handed off to the **Web APIs**. Once they finish, they are pushed into the **Task Queue**.

## 3. The Microtask Queue (High Priority)
Promises and \`queueMicrotask\` go here. **The Microtask Queue is always emptied before the next Task in the Task Queue is processed.**

## 4. The Event Loop Algorithm
1. Is the **Call Stack** empty?
2. If yes, process ALL items in the **Microtask Queue**.
3. Process ONE item from the **Task Queue**.
4. Does the browser need to **Render**? (Usually 60fps / 16.6ms).
5. Go back to step 1.

### Example Code:
\`\`\`javascript
console.log('1'); // Sync
setTimeout(() => console.log('2'), 0); // Task
Promise.resolve().then(() => console.log('3')); // Microtask
console.log('4'); // Sync
// Output: 1, 4, 3, 2
\`\`\`

## 5. Summary & Key Objectives
- Understand the single-threaded nature of JS.
- Distinguish between Tasks and Microtasks.
- Learn why "Blocking the Main Thread" makes your UI unresponsive.

### Pro-Tip:
Never put calculation-heavy logic in your main thread. Use a **Web Worker** to move that logic to a separate thread, keeping your UI buttery smooth.
        `,
        duration: "1h 10m",
        nextLessonId: "les_2_2",
    },
    "les_2_2": {
        chapter: "JavaScript Infinity",
        subchapter: "Engine Internals",
        title: "Memory Management & Profiling",
        videoUrl: "https://www.youtube.com/embed/H0XScE08hy8", // JavaScript Memory Management
        description: "Identifying memory leaks and optimizing garbage collection.",
        content: `
# Memory Management & Profiling: Writing Leak-Free Code

Every byte of memory you waste is a second of battery life you steal from your users.

## 1. Memory Lifecycle
1. **Allocation**: Variable declaration.
2. **Use**: Reading/Writing.
3. **Release**: The Garbage Collector (GC) deletes it when no longer referenced.

## 2. Mark-and-Sweep Algorithm
V8 starts from the "Root" (Window/Global) and "marks" everything reachable. Anything not marked is "swept" away.

## 3. Common Memory Leaks
- **Dangling Timers**: Forgetting to \`clearInterval\`.
- **Clustered Closures**: Keeping large variables in a closure scope that is never destroyed.
- **Detached DOM Nodes**: Keeping a JS reference to a node that was removed from the HTML.

## 4. Profiling with Chrome DevTools
Take a **Heap Snapshot**. This shows you exactly which objects are taking up space. Look for "Detached HTMLHeadingElement" — those are your leaks.

## 5. Summary & Key Objectives
- Master the Mark-and-Sweep logic.
- Learn to identify leaks using Snapshots.
- Implement cleanup logic in \`useEffect\` or \`componentWillUnmount\`.

### Pro-Tip:
In React, always return a cleanup function from your \`useEffect\` hooks to remove event listeners and clear intervals.
        `,
        duration: "45m",
        nextLessonId: "les_2_3",
    },
    "les_2_3": {
        chapter: "JavaScript Infinity",
        subchapter: "Modern JS Patterns",
        title: "Async Mastery & Generators",
        videoUrl: "https://www.youtube.com/embed/vn3tm0quoqE", // JavaScript Async/Await Tutorial - Fireship
        description: "Handling complex async flows, cancellation, and streaming data.",
        content: `
# Async Mastery: Generators & AbortControllers

Modern Async JS is more than just \`.then()\`. It's about Orchestration.

## 1. AbortController: The Power of No
Stop a long-running fetch request if the user navigates away.
\`\`\`javascript
const controller = new AbortController();
const signal = controller.signal;
fetch(url, { signal }).catch(e => console.log('Aborted!'));
controller.abort();
\`\`\`

## 2. Generators & Yield
Generators (\`function*\`) allow you to "Pause" a function and resume it later. This is perfect for custom iterators or handling large data sets without blocking the thread.

## 3. Async Generators
Yielding over a stream of data (e.g., reading a 1GB file line-by-line).

## 4. Summary & Key Objectives
- Master request cancellation.
- Understand the stateful nature of Generators.
- Use \`Promise.allSettled\` for parallel execution.

### Pro-Tip:
Use **Top-Level Await** in your modern JS modules to simplify entry-point logic.
        `,
        duration: "1h 30m",
        nextLessonId: "les_2_4",
    },
    "les_2_4": {
        chapter: "JavaScript Infinity",
        subchapter: "Modern JS Patterns",
        title: "Functional Programming Patterns",
        videoUrl: "https://www.youtube.com/embed/e-5obm1G_FY", // Functional Programming in JavaScript
        description: "Immutability, Pure Functions, and Higher-Order Patterns for robust logic.",
        content: `
# Functional Programming (FP) for Frontend Engineers

FP makes your code predictable, testable, and beautiful.

## 1. Pure Functions
A function that given the same input, always returns the same output and has **Zero Side Effects**.

## 2. Immutability
Never mutate data. Always return a new copy. Use \`map\`, \`filter\`, and \`reduce\` instead of \`for\` loops with \`push\`.

## 3. Composition
Combining small, single-purpose functions into a complex pipeline.
\`\`\`javascript
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const result = pipe(toUpperCase, addExclamation)(name);
\`\`\`

## 4. Summary & Key Objectives
- Transition from Imperative to Declarative code.
- Master the "Immutable" mindset.
- Build reusable utility pipelines using Composition.

### Pro-Tip:
React is built on FP principles. The more "Pure" your components and logic are, the easier they are to debug.
        `,
        duration: "55m",
        nextLessonId: "les_3_1",
    },
    "les_3_1": {
        chapter: "React Engineering",
        subchapter: "React Core Deep Dive",
        title: "Hooks Architecture & Refs",
        videoUrl: "https://www.youtube.com/embed/LlvBzyy-558", // React Hooks Course - PedroTech
        description: "Master the internal mechanics of Hooks and how to escape the virtual DOM with Refs.",
        content: `
# Hooks Architecture & Refs: Under the Hood

React Hooks are not magic; they are a clever use of arrays and call indices. In this lesson, we will deconstruct how React "remembers" your state.

## 1. The Rules of Hooks & Why They Exist
- **Top Level Only**: Hooks must be called in the same order every render. React tracks hooks based on their **position** in an internal array.
- **Only Call from React Functions**: Ensures the Component's state object is available.

## 2. useState vs. useReducer
- **useState**: Best for independent snippets of state (e.g., \`isModalOpen\`).
- **useReducer**: Best for complex state logic where the next state depends on the previous one.

\`\`\`javascript
const [state, dispatch] = useReducer(reducer, initialState);
// Pattern: State Machines (Idle -> Loading -> Success)
\`\`\`

## 3. useRef: The Escape Hatch
Refs allow you to maintain a value that **does not trigger a re-render** when changed.
- **Accessing the DOM**: Focus a text input on mount.
- **Storing Instance Variables**: Storing a timer ID for \`clearInterval\`.

## 4. Custom Hooks: Encapsulating Logic
If you find yourself writing the same \`useEffect\` logic in two places, it's time for a Custom Hook.
### Case Study: \`useWindowSize\`
\`\`\`javascript
function useWindowSize() {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
}
\`\`\`

## 5. Summary & Key Objectives
- Understand the positional nature of Hooks.
- Master the use-case for \`useRef\` as a non-reactive storage.
- Learn to build reusable complex logic with Custom Hooks.

### Pro-Tip:
Avoid **"Effect Soup"**. If your component has 5+ \`useEffect\` calls, you are likely mixing side effects. Split the component or move the logic into a custom hook.
        `,
        duration: "1h 05m",
        nextLessonId: "les_3_2",
    },
    "les_3_2": {
        chapter: "React Engineering",
        subchapter: "React Core Deep Dive",
        title: "State Machines & XState",
        videoUrl: "https://www.youtube.com/embed/avv_p6p3pWk", // Finite State Machines - XState
        description: "Moving from messy state to predictable, finite state logic.",
        content: `
# State Machines & XState: Predictable UI Logic

As your UI grows, \`useState\` often leads to "Impossible States" (e.g., being both 'loading' and 'error' at once). State Machines solve this by defining specific states and transitions.

## 1. What is a Finite State Machine (FSM)?
An FSM is a mathematical model of computation. It can be in exactly **one** of a finite number of states at any given time.

### The Anatomy of a Machine:
- **States**: The possible conditions (e.g., \`idle\`, \`fetching\`, \`resolved\`, \`rejected\`).
- **Events**: Actions that trigger a state change (e.g., \`FETCH\`, \`RESOLVE\`).
- **Transitions**: The movement from one state to another.

## 2. Why XState in React?
XState allows you to move your logic **outside** of the component. This makes your logic 100% testable and reusable.

\`\`\`javascript
const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active: { on: { TOGGLE: 'inactive' } }
  }
});
\`\`\`

## 3. The useMachine Hook
By using \`useMachine\`, React handles the rendering based on the machine's current state.

## 4. Visualizing Your Logic
XState comes with a **Visualizer**. You can paste your machine code and "see" the flowchart of your app's logic. This is a game-changer for complex dashboards and multi-step forms.

## 5. Summary & Key Objectives
- Identify "Impossible States" in your current code.
- Learn the basics of Nodes and Transitions.
- Use XState to decouple logic from presentation.

### Pro-Tip:
If your component has more than 3 boolean flags (e.g., \`isLoading\`, \`hasError\`, \`isFirstTime\`), replace them with a single \`status\` string or an XState machine.
        `,
        duration: "1h 20m",
        nextLessonId: "les_3_3",
    },
    "les_3_3": {
        chapter: "React Engineering",
        subchapter: "Server Components & Hydration",
        title: "RSC Architecture & Actions",
        videoUrl: "https://www.youtube.com/embed/T8WRE0p6S_0", // React Server Components Explained
        description: "The complete architecture of Next.js: Scaling from CSR to SSR and RSC.",
        content: `
# RSC Architecture & Server Actions: The New React

React Server Components (RSC) represent the biggest shift in web development since AJAX. They allow us to render components on the server without sending JS to the client.

## 1. Client vs. Server Components
| Feature | Server Component (Default) | Client Component (\`"use client"\`) |
| :--- | :--- | :--- |
| **Data Fetching** | Direct DB access (No APIs needed) | Must use \`fetch\` or \`swr\` |
| **JS Bundle Size** | 0kb added to client | Adds component code to bundle |
| **Interactivity** | No hooks or event listeners | Full React features (State, Effects) |
| **Security** | Secrets stay on server | Secrets can be exposed |

## 2. Server Actions: Form Handling Redefined
Instead of creating an API endpoint and a \`handleSubmit\` function, you can define a server-side function and pass it directly to the \`action\` attribute of a form.

\`\`\`javascript
async function createPost(formData) {
  'use server';
  const title = formData.get('title');
  await db.posts.create({ title });
  revalidatePath('/blog');
}
\`\`\`

## 3. Streaming & Suspense
Break your page into "Chunks". Send the static header immediately, and "stream" the slow data-heavy components as they resolve on the server.

## 4. The Hydration Gap
Hydration is the process of attaching event listeners to the static HTML sent by the server. **Selective Hydration** allows React to prioritize parts of the page based on user interaction.

## 5. Summary & Key Objectives
- Distinguish between Server and Client boundaries.
- Leverage Server Actions for Type-safe mutations.
- Master \`<Suspense>\` for progressive loading.

### Performance Tip:
Always keep your "Client" boundary as low in the component tree as possible. Don't mark your whole page as \`"use client"\` just because one button needs a click handler.
        `,
        duration: "1h 40m",
        nextLessonId: "les_3_4",
    },
    "les_1_4": {
        chapter: "Foundations",
        subchapter: "Modern CSS Mastery",
        title: "Container Queries & Logical Props",
        videoUrl: "https://www.youtube.com/embed/YOsMJQfwqow", // Kevin Powell - You are using the wrong tags
        description: "Building truly responsive components that adapt to their surroundings.",
        content: `
# Container Queries & Logical Properties: The New Responsive

Responsive design is no longer just about the viewport. It's about how a component fits into its **Parent**.

## 1. Container Queries: The Breakthrough
Unlike Media Queries, Container Queries react to the container's size.
\`\`\`css
.card-container { container-type: inline-size; }
@container (min-width: 400px) {
  .card { display: flex; gap: 2rem; }
  .card__image { width: 40%; }
}
\`\`\`

## 2. Logical Properties for Global Scale
Stop using \`margin-left\`. Use \`margin-inline-start\`. This ensures your layout works for BOTH Left-to-Right (English) and Right-to-Left (Arabic) languages without changing a single line of CSS.

## 3. Subgrid: Inheriting Layout Logic
Subgrid allows a child element to use the same grid definition as its parent.
\`\`\`css
.card-content {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3; /* Align title, desc, and footer across cards */
}
\`\`\`

## 4. Summary & Key Objectives
- Move from Viewport-first to Component-first thinking.
- Implement Logical Properties as a default coding standard.
- Use Subgrid to solve "Uneven Card Heights" forever.

### Pro-Tip:
Container Queries enable "Self-Reliant Components" that look good whether they are in a sidebar or a main 3-column grid.
        `,
        duration: "50m",
        nextLessonId: "les_2_1",
    },
    "les_3_4": {
        chapter: "React Engineering",
        subchapter: "Server Components & Hydration",
        title: "Streaming & Selective Hydration",
        videoUrl: "https://www.youtube.com/embed/Z9v68-xP7E8", // React 18 Streaming SSR
        description: "Optimizing the user experience with React 18's next-gen hydration logic.",
        content: `
# Streaming & Selective Hydration: Speed at Scale

React 18 introduced architectural changes that allow us to break the "All-or-Nothing" waterfall of SSR.

## 1. The SSR "Waterfall" Problem
In traditional SSR:
1. Fetch all data on server.
2. Render HTML on server.
3. Send HTML to browser.
4. Download all JS.
5. Hydrate the whole app.
**If one API is slow, the user sees a blank screen.**

## 2. Streaming with Suspense
With \`<Suspense>\`, we send the static "Shell" immediately. As the slow data resolves, the server "streams" the HTML for those specific components into the page.

## 3. Selective Hydration
React now hydrates components based on **User Intent**. If the user clicks a button in a footer while the sidebar is still hydrating, React will pause the sidebar and hydrate the footer immediately.

## 4. Summary & Key Objectives
- Use \`<Suspense>\` to wrap data-heavy components.
- Understand how React 18 handles non-blocking hydration.
- Optimize for "Interaction to Next Paint" (INP).

### Elite Practice:
Combine **Partial Prerendering (PPR)** with Streaming to have a static entry-point and dynamic streamable islands.
        `,
        duration: "1h 15m",
        nextLessonId: "les_4_1",
    },
    "les_4_1": {
        chapter: "Industry Standards & Scale",
        subchapter: "Advanced Testing",
        title: "TDD with Vitest & Playwright",
        videoUrl: "https://www.youtube.com/embed/7V6A6N0qTfM", // TDD in React
        description: "Architecting a test suite that balances speed (Unit) with confidence (E2E).",
        content: `
# Advanced TDD: Vitest & Playwright

Test-Driven Development (TDD) is not about catching bugs—it's about **Designing Software**. In this lesson, we build a "Confidence Suite" for our app.

## 1. The Testing Trophy
- **Unit Tests (Vitest)**: Fast, small, testing individual functions. (70%)
- **Integration Tests (React Testing Library)**: Testing how components work together. (20%)
- **E2E Tests (Playwright)**: Testing the full user journey in a real browser. (10%)

## 2. Vitest: The Speed Demon
Vitest is a Vite-native testing framework that is 10x faster than Jest.
\`\`\`javascript
test('adds two numbers', () => {
  expect(sum(1, 2)).toBe(3);
});
\`\`\`

## 3. Playwright: Modern E2E
Playwright is the industry leader for browser automation. It handles parallelization and auto-waiting natively.
### Playwright Trace Viewer:
When a test fails in CI, Playwright records a full "Trace" (Video, Network, Console) so you can debug without needing to reproduce it locally.

## 4. Mocking with MSW (Mock Service Worker)
Instead of mocking the \`fetch\` function, MSW intercepts network requests at the browser level. This means your tests use the **same code** as your production app.

## 5. Summary & Key Objectives
- Implement the "Red-Green-Refactor" cycle.
- Balance your test suite using the Testing Trophy model.
- Master auto-waiting and retry strategies in Playwright.

### Pro-Tip:
Only test **Behavior**, not **Implementation**. If you rename a variable but the feature still works, your tests should still pass.
        `,
        duration: "2h 10m",
        nextLessonId: "les_4_2",
    },
    "les_4_2": {
        chapter: "Industry Standards & Scale",
        subchapter: "Advanced Testing",
        title: "Visual Regression Testing",
        videoUrl: "https://www.youtube.com/embed/L-AAb74t3i0", // Visual Regression Testing
        description: "Ensuring pixel-perfect UI consistency across changes using image diffing.",
        content: `
# Visual Regression Testing: The Pixel Guard

Logic tests (Unit/Integration) don't see what the user sees. Visual tests ensure your CSS changes don't cause "Collateral Damage".

## 1. How Image Diffing Works
A "Baseline" screenshot is compared against a "New" screenshot. The test highlights the exact pixels that changed.

## 2. The Tooling Stack
- **Playwright**: Native \`toHaveScreenshot()\` support.
- **Chromatic**: The gold standard for Storybook-based visual testing.
- **Percy**: Cross-browser visual diffing as a service.

## 3. Real-World Workflow
- Dev pushes a PR.
- CI runs visual tests across Chrome, Firefox, and Webkit.
- Dev reviews "Diffs" in a web UI to approve intentional UI changes.

## 4. Summary & Key Objectives
- Establish a visual baseline for your component library.
- Automate cross-browser UI verification.
- Reduce "CSS Fear" during large refactors.

### Pro-Tip:
Visual regression is the only way to catch bugs like "A z-index change broke the dropdown menu on mobile viewports".
        `,
        duration: "45m",
        nextLessonId: "les_4_3",
    },
    "les_4_3": {
        chapter: "Industry Standards & Scale",
        subchapter: "Performance & Ops",
        title: "Core Web Vitals & RUM",
        videoUrl: "https://www.youtube.com/embed/0fONenaASpQ", // Core Web Vitals Explained
        description: "Measuring and improving LCP, FID, and CLS in production environments.",
        content: `
# Core Web Vitals & Real User Monitoring (RUM)

Performance is a feature. If your site is slow, users leave. In this lesson, we learn how Google measures your site and how to optimize for it.

## 1. The Three Golden Metrics
- **LCP (Largest Contentful Paint)**: How fast the main content loads. (Goal: < 2.5s)
- **FID (First Input Delay)**: How fast the page responds to a click. (Goal: < 100ms)
- **CLS (Cumulative Layout Shift)**: Does the layout jump? (Goal: < 0.1)

## 2. Finding the Bottlenecks
Use the **Lighthouse** and **Performance** tabs in Chrome DevTools to records a trace.
- **Flame Charts**: Zoom in to see which JS function is blocking the main thread.
- **Network Waterfall**: See which images are blocking the LCP.

## 3. RUM (Real User Monitoring) vs. Lab Data
Lab data (Lighthouse) is fake. RUM is data from **real users** on real devices (3G, low-end Androids). Tools like **Vercel Analytics** or **Datadog** give you this insight.

## 4. Optimization Strategies
- **Images**: Use \`next/image\` for automatic WebP conversion and lazy loading.
- **Fonts**: Preload critical fonts and use \`font-display: swap\`.
- **Scripts**: Use \`defer\` or \`async\` to prevent script execution from blocking HTML parsing.

## 5. Summary & Key Objectives
- Understand the business impact of performance.
- Master the "Golden Metrics" targets.
- Implement a Real User Monitoring strategy.

### Pro-Tip:
Measure twice, cut once. Always record a baseline performance score before you start "optimizing" so you can prove your fix actually worked.
        `,
        duration: "55m",
        nextLessonId: "les_4_4",
    },
    "les_4_4": {
        chapter: "Industry Standards & Scale",
        subchapter: "Performance & Ops",
        title: "CI/CD & Observability: Production Grade",
        videoUrl: "https://www.youtube.com/embed/Bv_5Zv5c-6g", // Sentry Observability
        description: "Real-time error boundaries, Sentry integration, and user-behavior logging.",
        content: `
# CI/CD & Frontend Observability: Production Grade

Shipping code is only 50% of the job. Monitoring it in production is the other 50%.

## 1. CI/CD: The Quality Gate
Use **GitHub Actions** to automate:
- **Linting**: \`npm run lint\` ensures code style consistency.
- **Unit Testing**: \`npm run test\` catches logic regressions.
- **Security Audit**: \`npm audit\` checks for vulnerable dependencies.

## 2. Error Observability (Sentry)
Don't wait for user emails. Sentry captures source-mapped stack traces and breadcrumbs (the sequence of user clicks) before a crash.

## 3. Real User Monitoring (RUM)
Track how fast your app is for actual users. Observe the correlation between **Performance** and **Conversion Rates**.

## 4. Summary & Key Objectives
- Build a "Bulletproof" CI pipeline.
- Implement Global Error Boundaries.
- Monitor Core Web Vitals in the wild.

### Pro-Tip:
Use **Feature Flags** (e.g., LaunchDarkly) to roll out risky features to 1% of users first. "Blast radius" control is the mark of a Senior Engineer.
        `,
        duration: "1h 15m",
        nextLessonId: "les_5_1",
    },
    "les_5_1": {
        chapter: "Advanced Architecture & Systems",
        subchapter: "Micro-frontends & Scale",
        title: "Module Federation & MFEs",
        videoUrl: "https://www.youtube.com/embed/s_Fs4AXsTnA", // Jack Herrington - Module Federation
        description: "Breaking the monolith: Designing scalable micro-frontend architectures with Webpack 5.",
        content: `
# Module Federation & Micro-frontends (MFEs)

As teams grow, the "Monolith" becomes a bottleneck. MFEs allow teams to deploy independently.

## 1. What is Module Federation?
A Webpack 5 feature that allows a JavaScript application to dynamically load code from another application at runtime.

### Key Concepts:
- **Host**: The container app that consumes remote modules.
- **Remote**: The standalone app that "exposes" modules.
- **Shared**: Common dependencies (like React) that are only loaded once.

## 2. Orchestration Strategies
- **Client-Side**: Loading scripts in the browser.
- **Server-Side**: Stitching HTML on the server (faster LCP).

## 3. The "Gotchas" of MFEs
- **Version Mismatch**: Ensure 'Shared' dependencies are compatible.
- **CSS Contamination**: Use Scoped CSS or Tailwind to avoid global leakage.

### Summary:
- Decouple teams, not just code.
- Use Module Federation for runtime integration.
- Standardize your shared design system first.
        `,
        duration: "1h 30m",
        nextLessonId: "les_5_2",
    },
    "les_5_2": {
        chapter: "Advanced Architecture & Systems",
        subchapter: "Micro-frontends & Scale",
        title: "Monorepos with Turborepo",
        videoUrl: "https://www.youtube.com/embed/62-mvF2WJ3w", // Turborepo
        description: "Managing multi-package systems with blazing fast caching and build orchestration.",
        content: `
# Monorepos with Turborepo: High-Performance Workspaces

Managing 10 separate repos is a nightmare. A Monorepo puts them all in one place, but it needs a "Smart" build system.

## 1. Why Monorepos?
- **Code Sharing**: Share types and UI components instantly.
- **Atomic Commits**: Change an API and its Client in one PR.

## 2. Turborepo's Secret: Remote Caching
Turborepo never performs the same work twice. If you haven't changed a package, it "Replays" the previous build from the cache.

## 3. Dependency Graph
Turborepo understands which packages depend on others and executes tasks (build, test, lint) in the optimal parallel order.

### Summary:
- Use pnpm workspaces for linking.
- Let Turborepo handle the build orchestration.
- Leverage Caching to save hours in CI.
        `,
        duration: "1h 10m",
        nextLessonId: "les_5_3",
    },
    "les_5_3": {
        chapter: "Advanced Architecture & Systems",
        subchapter: "Advanced Auth & Security",
        title: "OAuth3 & OIDC Architecture",
        videoUrl: "https://www.youtube.com/embed/PMeX2Me_vUE", // OIDC Explained
        description: "Deep dive into secure authentication flows: Authorization Code vs. Implicit.",
        content: `
# OAuth3 & OIDC: The Security Backbone

Authentication is more than a login form. It's about secure token exchange.

## 1. The OAuth2/OIDC Flow
1. **User** clicks Login.
2. **Client** redirects to Auth Server.
3. **User** authenticates.
4. **Auth Server** returns an Authorization Code.
5. **Client** exchanges Code for an ID Token and Access Token.

## 2. JWT Security
- **Claims**: The data inside the token (sub, iat, exp).
- **Signing**: Using RS256 (Asymmetric) to verify the token came from the real server.

## 3. PKCE (Proof Key for Code Exchange)
The modern standard for SPAs (React) to prevent "Code Interception" attacks.

### Summary:
- Never store tokens in LocalStorage (use HttpOnly Cookies).
- Always use PKCE for frontend apps.
- Implement Refresh Token Rotation.
        `,
        duration: "1h 40m",
        nextLessonId: "les_5_4",
    },
    "les_5_4": {
        chapter: "Advanced Architecture & Systems",
        subchapter: "Advanced Auth & Security",
        title: "Web Cryptography API Deep Dive",
        videoUrl: "https://www.youtube.com/embed/8vR_S_C4l0Y", // Web Cryptography API (Google I/O)
        description: "Native browser encryption: Hashing, signing, and encrypting data on the client.",
        content: `
# Web Cryptography API: Client-Side Security

Don't rely on third-party JS for crypto. Use the browser-native \`window.crypto\`.

## 1. Hashing with subtle.digest
Creating a fingerprint of a file or password locally.

## 2. Symmetric Encryption (AES-GCM)
Encrypting data with a key that is never sent to the server. Perfect for "Zero-Knowledge" apps.

## 3. Asymmetric Keys (RSA/ECDSA)
Generating key pairs in the browser to sign requests and prove identity.

### Summary:
- Use \`crypto.subtle\` for all cryptographic operations.
- Understand the difference between Exportable and Non-Exportable keys.
- Web Crypto is much faster than Node-based JS libraries.
        `,
        duration: "55m",
        nextLessonId: "les_6_1",
    },
    "les_6_1": {
        chapter: "High-Fidelity UI & Motion",
        subchapter: "Design Systems & Tokens",
        title: "Shadcn UI & Component Architecture",
        videoUrl: "https://www.youtube.com/embed/wcTzlJi2Oz4", // Net Ninja - Shadcn UI Verified
        description: "Building a premium component library by composing Radix UI and Tailwind CSS.",
        content: `
# Shadcn UI & Component Composition

Shadcn is not a library; it's a **Design Pattern**. It advocates for "Lowering the Abstraction" by giving you the source code.

## 1. The Radix Foundation
Radix provides the **Accessibility** and **Logic** (Keyboard navigation, Focus traps).

## 2. The Tailwind Skin
Tailwind provides the **Styles**. By putting them together, you get a premium component that you 100% own.

## 3. Pattern: The "Compound Component"
Using \`Card\`, \`CardHeader\`, \`CardContent\` to allow users to compose their own UI structures without rigid props.

### Summary:
- Own your UI components, don't just "import" them.
- Prioritize A11y with Radix.
- Use \`clx\` and \`tailwind-merge\` for dynamic styling.
        `,
        duration: "1h 20m",
        nextLessonId: "les_6_2",
    },
    "les_6_2": {
        chapter: "High-Fidelity UI & Motion",
        subchapter: "Design Systems & Tokens",
        title: "Tailwind Engineering & JIT",
        videoUrl: "https://www.youtube.com/embed/mr15Xzb1Ook", // Tailwind JIT
        description: "Optimizing Tailwind for scale: Custom configurations, plugins, and the JIT engine.",
        content: `
# Tailwind Engineering: Design at Scale

Tailwind is more than utility classes. It's a design-system engine.

## 1. The JIT (Just-In-Time) Engine
Tailwind generates only the CSS you actually use, instantly. This means your CSS bundle size stays tiny even if your HTML grows.

## 2. Theme Configuration
Customizing colors, spacing, and fonts in \`tailwind.config.js\` to enforce brand consistency.

## 3. Writing Custom Plugins
Add your own utilities (like \`text-gradient\`) that maintain the "Tailwind Way".

### Summary:
- Use \`@apply\` sparingly.
- Master the \`config\` file.
- Leverage the JIT for arbitrary values (e.g., \`top-[123px]\`).
        `,
        duration: "45m",
        nextLessonId: "les_6_3",
    },
    "les_6_3": {
        chapter: "High-Fidelity UI & Motion",
        subchapter: "Motion & Animation",
        title: "Framer Motion: Layout & Orchestration",
        videoUrl: "https://www.youtube.com/embed/v9CAnAnIIdU", // Framer Motion
        description: "Bringing your UI to life: Shared layout transitions and staggered orchestrations.",
        content: `
# Framer Motion: The Animation Engine

Static UIs feel like 2010. Framer Motion makes your app feel alive.

## 1. Layout Transitions (layoutId)
The magic pill of UI. Animate a shared element as it moves from one part of the screen to another (e.g., an active tab indicator).

## 2. Staggered Animations
Using \`variants\` to animate a list of items one after another with unique timing.

## 3. AnimatePresence
Handling the "Exit" animation for elements when they are removed from the DOM.

### Summary:
- Keep animations subtle (200-300ms).
- Use \`layout\` for fluid transitions.
- Always use \`AnimatePresence\` for modals and dropdowns.
        `,
        duration: "1h 45m",
        nextLessonId: "les_6_4",
    },
    "les_6_4": {
        chapter: "High-Fidelity UI & Motion",
        subchapter: "Motion & Animation",
        title: "SVG Animations & GSAP",
        videoUrl: "https://www.youtube.com/embed/6Lp9S_0W1p4", // GSAP ScrollTrigger
        description: "Mastering the scroll: Complex timelines, SVG morphing, and high-performance GSAP logic.",
        content: `
# GSAP & SVG: Beyond the DOM

For complex, timeline-based animations (like interactive landing pages), GSAP is the undisputed heavyweight champion.

## 1. GSAP Timelines
Chaining multiple animations together with pixel-perfect control over overlap and delays.

## 2. ScrollTrigger
Binding animations to the user's scroll position. Creating Apple-style scrolling experiences.

## 3. SVG Morphing
Changing the path of an SVG smoothly from one shape to another.

### Summary:
- Use Framer Motion for UI, GSAP for "Experiences".
- ScrollTrigger is the secret to high-end landing pages.
- Keep SVG code clean to optimize for morphing.
        `,
        duration: "2h 00m",
        nextLessonId: "les_ai_1_1",
    },
    // AI/ML Track
    "les_ai_1_1": {
        chapter: "Mathematics & Python Foundations",
        subchapter: "Linear Algebra & Calculus",
        title: "Vectors, Matrices & Eigenspaces",
        videoUrl: "https://www.youtube.com/embed/fNkLxfKbt5E", // 3Blue1Brown Linear Algebra
        description: "Deconstructing the geometry of data: From dot products to eigen-decompositions.",
        content: `
# Vectors, Matrices & Eigenspaces: The Geometry of Data

Machine Learning is essentially **applied linear algebra**. In this lesson, we move from high-school math to the engine that powers neural networks.

## 1. The Vector Space
A vector is not just a list of numbers; it's a **point in a high-dimensional space**.
- **Dimension**: The number of features in your dataset.
- **Dot Product**: Measures the "alignment" between two vectors (Critical for Attention mechanisms).
- **Norm**: The "length" or "magnitude" of the vector.

## 2. Matrix Transformations
A matrix is a function that transforms space. 
- **Linear Transformation**: Moving points while keeping the origin (0,0) fixed and lines straight.
- **Matrix Multiplication**: Composing multiple transformations into one.

## 3. The "Big Idea": Eigenspaces
An **Eigenvector** is a vector that does not change its direction during a specific transformation—it only gets scaled.
- **Eigenvalue**: The scaling factor.
- **SVD (Singular Value Decomposition)**: The foundation of Principal Component Analysis (PCA) and image compression.

## 4. Why This Matters for AI
Every weight matrix in a Neural Network is a transformation. Eigen-decomposition helps us understand which "directions" in the data contain the most information.

### Summary:
- Master the dot product for similarity.
- Understand matrices as spatial transformations.
- Recognize eigenvectors as the "stable" axes of data.
        `,
        duration: "1h 30m",
        nextLessonId: "les_ai_1_2",
    },
    "les_ai_1_2": {
        chapter: "Mathematics & Python Foundations",
        subchapter: "Linear Algebra & Calculus",
        title: "Derivatives & Gradient Descent",
        videoUrl: "https://www.youtube.com/embed/IHZwWFHWa-w", // 3Blue1Brown Calculus
        description: "Optimizing the objective function: Calculating gradients and learning rates.",
        content: `
# Derivatives & Gradient Descent: The Engine of Learning

How does a model "learn"? It calculates how to change its weights to reduce error. This is **Optimization**.

## 1. The Derivative
The derivative measures the **rate of change**. In ML, we care about the **Partial Derivative**—how does the error change if I only move *one* weight?

## 2. Gradient Descent Algorithm
1. Start with random weights.
2. Calculate the **Gradient** (the direction of steepest increase in error).
3. Move in the **opposite** direction of the gradient.
4. Repeat.

## 3. The Learning Rate (Alpha)
- **Too small**: The model takes forever to learn.
- **Too large**: The model overshoots the minimum and fails to converge.

## 4. Stochastic Gradient Descent (SGD)
Calculating the gradient for millions of data points is slow. SGD uses a "mini-batch" of data to approximate the gradient, making training feasible for modern LLMs.

### Real-World Tip:
Most modern frameworks (PyTorch/TensorFlow) use **Automatic Differentiation**, so you don't have to derive the calculus by hand, but understanding the "Chain Rule" is vital for debugging vanishing gradients.
        `,
        duration: "1h 15m",
        nextLessonId: "les_ai_1_3",
    },
    "les_ai_1_3": {
        chapter: "Mathematics & Python Foundations",
        subchapter: "Python for Data Science",
        title: "NumPy & Tensor Manipulation",
        videoUrl: "https://www.youtube.com/embed/QUT1VHiLmmI", // NumPy Tutorial
        description: "Vectorized operations and efficient numerical computing in Python.",
        content: `
# NumPy & Tensor Manipulation: Thinking in Blocks

Python is slow, but NumPy is fast because it's written in C. In AI, we never use \`for\` loops; we use **Vectorized Operations**.

## 1. The N-Dimensional Array (ndarray)
Everything in ML is a tensor (a multi-dimensional array).
- Scalar: 0-D
- Vector: 1-D
- Matrix: 2-D
- Tensor: 3-D+ (e.g., an RGB image is a 3D tensor).

## 2. Broadcasting
NumPy's ability to perform operations on arrays of different shapes. For example, adding a scalar to an entire matrix works instantly without loops.

## 3. Reshaping & Slicing
Neural network layers require specific input shapes.
- \`reshape(-1, 1)\`: Adding a ghost dimension.
- \`transpose()\`: Flipping the axes.

## 4. Computational Efficiency
Vectorized operations use **SIMD** (Single Instruction, Multiple Data) on your CPU, which can be 100x faster than standard Python loops.

### Pro-Tip:
Mastering \`np.einsum\` (Einstein Summation) is the mark of a senior ML engineer—it allows you to represent complex tensor operations in a single string.
        `,
        duration: "1h 45m",
        nextLessonId: "les_ai_1_4",
    },
    "les_ai_1_4": {
        chapter: "Mathematics & Python Foundations",
        subchapter: "Python for Data Science",
        title: "Pandas: Data Wrangling at Scale",
        videoUrl: "https://www.youtube.com/embed/dcqPhpLi7ws", // Pandas for Data Science
        description: "Efficiently cleaning, transforming, and analyzing tabular data.",
        content: `
# Pandas: Data Wrangling at Scale

80% of an ML engineer's time is spent cleaning data. Pandas is the industry-standard tool for this structural work.

## 1. Series vs. DataFrames
- **Series**: A single column (1D labels).
- **DataFrame**: High-performance tabular data structure (2D labels).

## 2. Vectorized String & Date Operations
Pandas allows you to perform operations on millions of rows at once using \`.str\` or \`.dt\` accessors.

## 3. Handling Missing Data
Real-world data is messy. Master the art of:
- \`dropna()\`: Removing corrupted rows.
- \`fillna()\`: Imputing missing values with mean/median.
- **Interpolation**: Predicting missing values based on trends.

## 4. GroupBy & Aggregation
The "Split-Apply-Combine" pattern. Essential for feature engineering (e.g., "What is the average purchase price per user city?").

### Summary:
- Clean data is better than a complex model.
- Master indexing with \`.loc\` and \`.iloc\`.
- Use \`pd.to_datetime\` for temporal analysis.
        `,
        duration: "1h 20m",
        nextLessonId: "les_ai_2_1",
    },
    "les_ai_2_1": {
        chapter: "Machine Learning Fundamentals",
        subchapter: "Supervised Learning",
        title: "Regression & Logistic Models",
        videoUrl: "https://www.youtube.com/embed/PaFPbb66DxQ", // Regression StatQuest
        description: "Predicting numbers and categories: The first step in supervised learning.",
        content: `
# Regression & Logistic Models: Prediction Engines

Supervised learning starts with the most fundamental question: "Can we predict Y based on X?"

## 1. Linear Regression
Predicting a continuous value (e.g., "What will the stock price be tomorrow?").
- **Equation**: y = mx + b
- **Loss Function**: Mean Squared Error (MSE).

## 2. Logistic Regression
Despite the name, this is for **Classification** (e.g., "Is this email Spam or Not Spam?").
- **The Sigmoid Function**: Squashes the output between 0 and 1.
- **Loss Function**: Log-Loss (Cross-Entropy).

## 3. Regularization (L1 & L2)
Preventing "Overfitting" (where the model memorizes the data instead of learning it).
- **Lasso (L1)**: Can zero out unimportant features (Feature selection).
- **Ridge (L2)**: Penalizes large weights.

## 4. Evaluation Metrics
- **Regression**: R2 Score, RMSE.
- **Classification**: Accuracy, Precision, Recall, F1-Score.

### Summary:
- Linear = Numbers, Logistic = Categories.
- Use regularization to keep models simple.
- Always check the F1-Score for imbalanced datasets.
        `,
        duration: "1h 10m",
        nextLessonId: "les_ai_2_2",
    },
    "les_ai_2_2": {
        chapter: "Machine Learning Fundamentals",
        subchapter: "Supervised Learning",
        title: "Support Vector Machines (SVM)",
        videoUrl: "https://www.youtube.com/embed/efR1C6CvhmE", // SVM StatQuest
        description: "Maximizing the margin: Intelligent classification in high dimensions.",
        content: `
# Support Vector Machines (SVM): The Maximum Margin Classifiers

SVMs go beyond "drawing a line"—they try to find the "Widest Street" that separates two classes.

## 1. The Decision Boundary
The line (or hyperplane) that separates the data points.

## 2. The Kernel Trick
What if the data isn't linearly separable? SVMs پروژه relevant high-dimensional spaces where a linear separation *is* possible.
- **RBF (Radial Basis Function)**: The most popular kernel.

## 3. Support Vectors
These are the data points closest to the decision boundary. Only these points matter for the model's structure.

## 4. Summary:
- SVMs are powerful for small, high-dimensional datasets.
- Use kernels for non-linear logic.
- Regularizer \`C\` controls the trade-off between margin width and error.
        `,
        duration: "55m",
        nextLessonId: "les_ai_2_3",
    },
    "les_ai_2_3": {
        chapter: "Machine Learning Fundamentals",
        subchapter: "Ensemble Methods",
        title: "Random Forests & XGBoost",
        videoUrl: "https://www.youtube.com/embed/J4Wdy0Wc_xQ", // Random Forest StatQuest
        description: "Combining weak learners into a powerful ensemble: Bagging and Boosting.",
        content: `
# Ensemble Methods: Random Forests & XGBoost

Why use one model when you can use a thousand? Ensembles are the champions of Kaggle competitions.

## 1. Bagging (Random Forest)
Train many shallow decision trees on random subsets of data and average their votes.
- **The Power**: Reduces variance (overfitting).

## 2. Boosting (XGBoost / Gradient Boosting)
Train trees sequentially. Each new tree corrects the errors of the previous one.
- **The Power**: High accuracy, but prone to overfitting if not tuned.

## 3. Feature Importance
Ensembles tell you exactly which features (columns) were the most useful in making decisions.

### Summary:
- Random Forest = Parallel trees.
- XGBoost = Sequential trees.
- Use \`GridSearchCV\` to find the best hyperparameters.
        `,
        duration: "1h 30m",
        nextLessonId: "les_ai_3_1",
    },
    "les_ai_3_1": {
        chapter: "Deep Learning & Neural Networks",
        subchapter: "Neural Network Architecture",
        title: "Backpropagation Deep Dive",
        videoUrl: "https://www.youtube.com/embed/Ilg3gGewQ5U", // 3Blue1Brown Backprop
        description: "The calculus of learning: How gradients flow backward through network layers.",
        content: `
# Backpropagation: The Heart of Deep Learning

Backpropagation is simply the application of the **Chain Rule** from calculus to a massive network of weights.

## 1. Fixed Forward Pass
We send inputs through the weights and activations to get a prediction and calculate the final **Loss**.

## 2. The Backward Pass
We move from the output layer back to the input, calculating how much each weight contributed to the loss.

## 3. Vanishing Gradients
In very deep networks, the gradient can become so small as it moves backward that the first layers never "learn".
- **Solution**: ReLU activations and ResNet-style skip connections.

### Summary:
- Training = Forward pass + Backward pass.
- Gradients tell you the direction to "steer" the weights.
- Backprop is just efficient multi-variable calculus.
        `,
        duration: "2h 00m",
        nextLessonId: "les_ai_3_2",
    },
    "les_ai_3_2": {
        chapter: "Deep Learning & Neural Networks",
        subchapter: "Neural Network Architecture",
        title: "CNNs for Computer Vision",
        videoUrl: "https://www.youtube.com/embed/YRhxdVk_sIs", // CNNs Explained
        description: "Convolutional layers, pooling, and feature extraction for image recognition.",
        content: `
# CNNs (Convolutional Neural Networks): Digital Eyes

How do computers "see"? CNNs use a mathematical operation called **Convolution** to scan images for patterns.

## 1. The Kernel (Filter)
A small matrix that slides over the image, detecting edges, textures, and eventually complex objects like eyes or wheels.

## 2. Pooling Layers
Reducing the spatial size of the representation to reduce the number of parameters and computation in the network.
- **Max Pooling**: Taking the maximum value in a window.

## 3. Transfer Learning
Why train from scratch? Use a pre-trained model (like ResNet or VGG) and "fine-tune" the last layers for your specific task.

### Summary:
- Convolutions = Feature detection.
- Pooling = Downsampling.
- Transfer Learning = The industry shortcut.
        `,
        duration: "1h 45m",
        nextLessonId: "les_ai_3_3",
    },
    "les_ai_3_3": {
        chapter: "Deep Learning & Neural Networks",
        subchapter: "Sequence Modeling",
        title: "RNNs, LSTMs & GRUs",
        videoUrl: "https://www.youtube.com/embed/AsNTP8Kwu80", // RNNs & LSTMs
        description: "Handling temporal data: Processing text, audio, and time-series information.",
        content: `
# Sequence Modeling: RNNs & LSTMs

Standard neural networks have no memory. RNNs (Recurrent Neural Networks) have "loops" that allow information to persist.

## 1. The Hidden State
As the network processes a sequence (like a sentence), it maintains a "Hidden State" that acts as a memory of what it has seen so far.

## 2. LSTMs (Long Short-Term Memory)
Standard RNNs forget things quickly. LSTMs use "Gates" to decide what to remember and what to forget.
- **Forget Gate**: Throws away irrelevant info.
- **Input Gate**: Stores new useful info.

## 3. GRUs (Gated Recurrent Units)
A simpler, faster version of LSTMs that often performs just as well.

### Summary:
- Use RNNs for sequences (Text/Audio).
- LSTMs solve the "Short-term Memory" problem.
- GRUs are the modern efficiency pick.
        `,
        duration: "1h 15m",
        nextLessonId: "les_ai_4_1",
    },
    "les_ai_4_1": {
        chapter: "Modern AI: LLMs & Generative Tech",
        subchapter: "Attention & Transformers",
        title: "Attention is All You Need",
        videoUrl: "https://www.youtube.com/embed/kCc8FmEb1nY", // Andrej Karpathy Transformers
        description: "Inside the Transformer architecture: Scaled dot-product attention and multi-head logic.",
        content: `
# Transformers: The Architecture of the Giants

In 2017, the paper *"Attention is All You Need"* changed the world. It replaced sequential RNNs with parallel **Self-Attention**.

## 1. Self-Attention
Every word in a sentence "looks at" every other word to understand context.
- **Query, Key, Value**: The mathematical mechanism for finding relevant connections.

## 2. Multi-Head Attention
Instead of one focus, the model has multiple "Heads" to track different relationships (e.g., one head for grammar, one for subject-verb agreement).

## 3. Positional Encoding
Since Transformers process all words at once (Parallel), we add a "Positional Encoding" so the model knows the order of words.

### Summary:
- Transformers = Pure Attention + Feed Forward.
- Parallel processing = Fast training on GPUs.
- This is what powers GPT-4 and Gemini.
        `,
        duration: "2h 30m",
        nextLessonId: "les_ai_4_2",
    },
    "les_ai_4_2": {
        chapter: "Modern AI: LLMs & Generative Tech",
        subchapter: "Attention & Transformers",
        title: "Fine-tuning LLMs (LoRA/QLoRA)",
        videoUrl: "https://www.youtube.com/embed/tS_pYvOis-M", // LoRA Explained
        description: "Efficiently adapting massive models to specific domains with parameter-efficient techniques.",
        content: `
# Fine-tuning LLMs: Parameter-Efficient Adaptation

You don't need to rebuild GPT-4. You just need to "nudge" it toward your domain using **PEFT (Parameter-Efficient Fine-Tuning)**.

## 1. LoRA (Low-Rank Adaptation)
Instead of updating billions of parameters, LoRA adds a tiny "Adaptation Layer" next to the original weights. It's 10,000x more efficient.

## 2. QLoRA
LoRA plus **4-bit Quantization**. This allows you to fine-tune a massive model on a single consumer GPU (like a laptop 3060).

## 3. Supervised Fine-tuning (SFT)
Training the model on specific (Prompt, Completion) pairs to teach it a specific tone or format.

### Summary:
- Never train from scratch.
- Use LoRA for surgical precision.
- Quantization is your best friend.
        `,
        duration: "1h 50m",
        nextLessonId: "les_ai_4_3",
    },
    "les_ai_4_3": {
        chapter: "Modern AI: LLMs & Generative Tech",
        subchapter: "Production AI",
        title: "RAG: Vector DBs & LangChain",
        videoUrl: "https://www.youtube.com/embed/LhnCsygAvzY", // RAG Explained
        description: "Building production-ready AI apps using Retrieval Augmented Generation and semantic search.",
        content: `
# RAG (Retrieval Augmented Generation): Giving AI a Brain

LLMs have a "Knowledge Cutoff". RAG allows them to look up **your** private data in real-time.

## 1. The RAG Pipeline
1. **Load**: Read PDFs, Docs, or SQL.
2. **Chunk**: Split text into small blocks.
3. **Embed**: Convert text into vectors.
4. **Retrieve**: Find the most relevant chunks based on a user query.
5. **Augment**: Pass the chunks to the LLM as "Context".

## 2. Vector Databases
Tools like **Pinecone**, **Milvus**, or **Chroma** store your embeddings and perform high-speed "Nearest Neighbor" searches.

## 3. LangChain & LlamaIndex
Orchestration frameworks that "glue" the LLM to the Vector DB and handle complex AI workflows.

### Summary:
- RAG = Context + LLM.
- Vector DBs enable semantic search.
- LangChain simplifies the orchestration.
        `,
        duration: "1h 40m",
        nextLessonId: "les_w3_1_1",
    },
    // Web3 Track
    "les_w3_1_1": {
        chapter: "Blockchain Foundations",
        subchapter: "Core Cryptography",
        title: "Hashing & Digital Signatures",
        videoUrl: "https://www.youtube.com/embed/S9JGmA5_unY", // Hashing Explained
        description: "The math of immutability: SHA-256, Elliptic Curve Cryptography (ECC), and keys.",
        content: `
# Hashing & Digital Signatures: The Code of Trust

Blockchain is not about "money"—it's about **mathematical proof**. In this lesson, we explore the cryptographic primitives that make decentralization possible.

## 1. Cryptographic Hashing (SHA-256)
A hash function takes any input and returns a fixed-length string.
- **One-way**: You can't reverse the hash to find the input.
- **Deterministic**: Same input always gives the same hash.
- **Avalanche Effect**: Change one bit, and the entire hash changes.

## 2. Public Key Cryptography (ECC)
Blockchain uses Elliptic Curve Cryptography for identity.
- **Private Key**: Your "Secret Password" (Never share).
- **Public Key**: Your "Username" (Derived from the private key).
- **Address**: A hashed version of your public key.

## 3. Digital Signatures (ECDSA)
How do you prove you own a wallet without revealing your private key? You "Sign" a transaction. Anyone with your public key can verify the signature is valid.

### Summary:
- Hash = Fingerprint of data.
- Private Key = Control.
- Public Key = Identity.
        `,
        duration: "1h 10m",
        nextLessonId: "les_w3_1_2",
    },
    "les_w3_1_2": {
        chapter: "Blockchain Foundations",
        subchapter: "Core Cryptography",
        title: "Merkle Trees & State Roots",
        videoUrl: "https://www.youtube.com/embed/YIc6P_idbz0", // Merkle Trees Explained
        description: "Efficient data verification: How thin clients verify transactions across the network.",
        content: `
# Merkle Trees & State Roots: Verified Efficiency

A blockchain can grow to terabytes. How does a mobile phone verify a single transaction? **Merkle Trees**.

## 1. What is a Merkle Tree?
A tree of hashes where the "Leaves" are transactions and the "Root" is the hash of all hashes below it.

## 2. Merkle Proofs
To prove a transaction exists in a block, you only need the transaction itself and a few internal hashes from the tree—not the whole block.

## 3. The State Root
In Ethereum, the entire state (account balances, smart contract data) is stored in a complex trie (Merkle Patricia Tree). The **State Root** is the fingerprint of the entire world state at a given block.

### Summary:
- Merkle Root = Summary of all transactions.
- Merkle Proof = Efficient path to verification.
- State Root = Digital twin of the blockchain's current status.
        `,
        duration: "55m",
        nextLessonId: "les_w3_1_3",
    },
    "les_w3_1_3": {
        chapter: "Blockchain Foundations",
        subchapter: "Consensus Mechanisms",
        title: "PoW vs PoS vs PoH",
        videoUrl: "https://www.youtube.com/embed/ncPy08mEq7Y", // PoW vs PoS
        description: "Solving the Byzantine Generals Problem: Comparing Ethereum and Solana consensus.",
        content: `
# Consensus Mechanisms: How Nodes Agree

In a decentralized system, there is no leader. How do thousands of nodes agree on the next block?

## 1. Proof of Work (PoW) - Bitcoin
Nodes (Miners) compete to solve a difficult math puzzle.
- **Pros**: Most secure, battle-tested.
- **Cons**: High energy consumption, slow.

## 2. Proof of Stake (PoS) - Ethereum 2.0
Nodes (Validators) "Stake" their coins to participate. The network chooses validators based on their stake.
- **Pros**: 99% more energy-efficient, fast.
- **Cons**: Risk of centralization.

## 3. Proof of History (PoH) - Solana
Adding a "Timestamp" to the ledger using a recursive hash function. This allows nodes to agree on the passage of time without constant communication.

### Summary:
- PoW = Energy + Hardware.
- PoS = Capital + Uptime.
- PoH = Cryptographic clock.
        `,
        duration: "1h 20m",
        nextLessonId: "les_w3_2_1",
    },
    "les_w3_2_1": {
        chapter: "Smart Contract Engineering",
        subchapter: "Solidity Deep Dive",
        title: "Solidity Syntax & Data Types",
        videoUrl: "https://www.youtube.com/embed/ipwxYa-ny1M", // Solidity Tutorial
        description: "Writing your first smart contract: Understanding the EVM memory model and types.",
        content: `
# Solidity Syntax & Data Types: Coding for the EVM

Solidity is an object-oriented, high-level language for implementing smart contracts on the Ethereum Virtual Machine (EVM).

## 1. The EVM Memory Model
- **Storage**: Persistent data (expensive, stored on-chain).
- **Memory**: Temporary data (cheap, wiped after transaction).
- **Stack**: Very cheap, used for local calculations.

## 2. Dynamic Types
- **Mappings**: Similar to HashMaps, but you can't iterate over them.
- **Structs**: Custom data structures.
- **Arrays**: Fixed or dynamic size.

## 3. Visibility & Modifiers
- \`public\`, \`private\`, \`internal\`, \`external\`.
- **Modifiers**: Reusable logic that checks conditions before a function runs (e.g., \`onlyOwner\`).

### Summary:
- Storage is expensive—minimize state changes.
- Mappings are the backbone of token tracking.
- Visibility controls who can call your code.
        `,
        duration: "1h 45m",
        nextLessonId: "les_w3_2_2",
    },
    "les_w3_2_2": {
        chapter: "Smart Contract Engineering",
        subchapter: "Solidity Deep Dive",
        title: "Security: Reentrancy & Overflow",
        videoUrl: "https://www.youtube.com/embed/qFj-947G8tY", // Smart Contract Programmer - Reentrancy
        description: "Securing millions of dollars: Preventing common exploits in smart contracts.",
        content: `
# Smart Contract Security: Bulletproofing your Logic

In Web2, a bug is a patch. In Web3, a bug is a **Heist**.

## 1. Reentrancy (The DAO Hack)
The most famous exploit. A malicious contract calls back into your function before the first call finishes, allowing them to withdraw funds multiple times.
- **Solution**: Use the "Checks-Effects-Interactions" pattern or \`nonReentrant\` modifiers.

## 2. Integer Overflows (SafeMath)
Doing math that goes beyond the data type's limit (e.g., \`255 + 1 = 0\` in \`uint8\`).
- **Solution**: Solidity 0.8.x handles this natively, but understanding it is critical for legacy audits.

## 3. DelegateCall Exploits
Understanding how one contract can execute code in the context of another. 

### Best Practices:
1. **Audits**: Always get a second (and third) set of eyes.
2. **Timelocks**: Prevent instant changes to critical logic.
3. **Emergency Stops**: A "Pause" button for your contract.
        `,
        duration: "1h 30m",
        nextLessonId: "les_w3_2_3",
    },
    "les_w3_2_3": {
        chapter: "Smart Contract Engineering",
        subchapter: "Toolchain Mastery",
        title: "Hardhat vs Foundry Workflows",
        videoUrl: "https://www.youtube.com/embed/fD_f8uT0_0A", // Hardhat vs Foundry
        description: "Deploying and testing: Comparing the JS-based and Rust-based toolchains.",
        content: `
# Hardhat vs Foundry: The Developer's Sandbox

How do you test code that costs $20 per deployment? Local simulation.

## 1. Hardhat (JavaScript/TypeScript)
The most popular toolchain. It uses a local Ethereum node and allows you to write tests in Mocha/Chai.
- **Pros**: Massive ecosystem, easy debugging with \`console.log\`.

## 2. Foundry (Rust/Solidity)
The new speed king. You write your tests in **Solidity**, not JS.
- **Pros**: Blazing fast, native Fuzzing (testing with random inputs).

## 3. The Deployment Workflow
1. Write Contract.
2. Unit Test locally.
3. Deploy to Testnet (Sepolia/Goerli).
4. Verify source code on Etherscan.
5. Deploy to Mainnet.

### Summary:
- Hardhat is great for beginners and integration tests.
- Foundry is for power users who want maximum speed.
- Always verify your code on Etherscan!
        `,
        duration: "1h 15m",
        nextLessonId: "les_w3_3_1",
    },
    "les_w3_3_1": {
        chapter: "dApp Architecture",
        subchapter: "Provider Integration",
        title: "Ethers.js & Viem Patterns",
        videoUrl: "https://www.youtube.com/embed/sJ0hK1jXg-g", // Dapp University - Master Ethers.js
        description: "Connecting the frontend to the blockchain: Mastering the JSON-RPC provider logic.",
        content: `
# Ethers.js & Viem: The Blockchain Bridge

How does a web app talk to a blockchain? It uses a library to format JSON-RPC requests to a node.

## 1. Providers vs. Signers
- **Provider**: A read-only connection to the blockchain (like a specialized \`fetch\`).
- **Signer**: A connection that has access to a private key and can "Sign" transactions (e.g., MetaMask).

## 2. Viem: The Type-Safe Champion
Viem is a modern alternative to Ethers.js that is 10x smaller and 100% type-safe. It's the engine inside **Wagmi**.

## 3. Contract Interaction
To talk to a smart contract, you need two things:
1. **The Address**: Where it lives.
2. **The ABI (Application Binary Interface)**: The list of its functions (the "JSON schema" of the contract).

### Summary:
- Provider = Read.
- Signer = Write.
- ABI = The contract's manual.
        `,
        duration: "1h 10m",
        nextLessonId: "les_w3_3_2",
    },
    "les_w3_3_2": {
        chapter: "dApp Architecture",
        subchapter: "Provider Integration",
        title: "WalletConnect Integration",
        videoUrl: "https://www.youtube.com/embed/5U7zB1q86qE", // WalletConnect v2
        description: "Enabling multi-wallet support: Connecting Rainbow, MetaMask, and Coinbase Wallet.",
        content: `
# WalletConnect: The Universal Connector

Users shouldn't be forced to use one wallet. WalletConnect provides a standard protocol to link any mobile or browser wallet to your dApp.

## 1. RainbowKit & Wagmi
The "Standard Stack" for React dApps. RainbowKit provides the beautiful UI, and Wagmi provides the hooks logic.

## 2. Session Management
Handling wallet disconnects, chain switching (e.g., from Ethereum to Polygon), and account changes.

## 3. SIWE (Sign-In With Ethereum)
Using a wallet signature as a secure, decentralized alternative to passwords.

### Summary:
- Support multi-wallets for 2x user retention.
- Use RainbowKit for an elite UI.
- SIWE is the future of authentication.
        `,
        duration: "50m",
        nextLessonId: "les_w3_3_3",
    },
    "les_w3_3_3": {
        chapter: "dApp Architecture",
        subchapter: "Decentralized Storage",
        title: "IPFS, Arweave & Filecoin",
        videoUrl: "https://www.youtube.com/embed/5Uj6uB2hB-c", // IPFS Explained
        description: "Storing assets off-chain: Content Addressing and Permanent Data storage.",
        content: `
# Decentralized Storage: Beyond AWS

Storing a 1MB image on the Ethereum blockchain costs thousands of dollars. We use decentralized storage instead.

## 1. IPFS (InterPlanetary File System)
Data is identified by its **Content Hash (CID)**, not its location.
- **The Catch**: If no one is "pinning" your file, it can disappear.

## 2. Arweave: The Permanent Web
A "Permaweb" where you pay once and your data is theoretically stored for 200+ years using a specialized consensus mechanism.

## 3. Filecoin
An incentive layer for IPFS. You pay providers to ensure your data is stored securely.

### Summary:
- IPFS = Content Addressing.
- Arweave = Permanence.
- PINNING = Keeping your data alive.
        `,
        duration: "1h 10m",
        nextLessonId: "les_w3_4_1",
    },
    "les_w3_4_1": {
        chapter: "DeFi & Protocol Design",
        subchapter: "Financial Primitives",
        title: "DEXs, AMMs & Liquidity Pools",
        videoUrl: "https://www.youtube.com/embed/cizLhxSKrAc", // Uniswap V3 Explained
        description: "The math of Decentralized Exchanges: Constant Product Formulas and Swaps.",
        content: `
# AMMs (Automated Market Makers): Trading Without a Middleman

How does Uniswap work without an order book? Math.

## 1. The Constant Product Formula (x * y = k)
The core of Uniswap V2. As the amount of one token (\`x\`) changes, the amount of the other (\`y\`) must change to keep the constant (\`k\`) the same. This automatically sets the price.

## 2. Liquidity Providers (LPs)
Users who "Deposit" pairs of tokens into a pool so others can trade against them. In return, they earn a portion of the trading fees.

## 3. Impermanent Loss
The risk LPs take. If the price of the tokens deviates significantly from when they deposited, they might have been better off just "HODLing".

### Summary:
- AMM = Algorithm as a Market Maker.
- Liquidity = The lifeblood of DeFi.
- Swap = Solving for X in the formula.
        `,
        duration: "1h 40m",
        nextLessonId: "les_w3_4_2",
    },
    "les_w3_4_2": {
        chapter: "DeFi & Protocol Design",
        subchapter: "Financial Primitives",
        title: "Yield Farming & Flash Loans",
        videoUrl: "https://www.youtube.com/embed/yUjW7M5yQxQ", // Whiteboard Crypto Flash Loans
        description: "Advanced DeFi logic: Uncollateralized loans and liquidity mining strategies.",
        content: `
# Flash Loans & Yield Farming: Advanced DeFi

Web3 enables financial transactions that are impossible in the physical world.

## 1. Flash Loans
Borrowing millions of dollars with **Zero Collateral**, as long as you pay it back within the *same transaction*. If you don't pay it back, the entire transaction reverts as if it never happened.
- **Use Case**: Arbitrage and Liquidations.

## 2. Yield Farming
Moving liquidity between different protocols to find the highest APY (Annual Percentage Yield).

## 3. Staking & Liquid Staking (LSDs)
Locking your tokens to secure a network and receiving a "Receipt Token" (like stETH) that you can still use in other DeFi protocols.

### Summary:
- Flash Loans = Atomic Arbitrage.
- Yield Farming = Optimized ROI.
- Liquid Staking = Capital Efficiency.
        `,
        duration: "1h 30m",
        nextLessonId: "les_w3_4_3",
    },
    "les_w3_4_3": {
        chapter: "DeFi & Protocol Design",
        subchapter: "DAO Governance",
        title: "Tokenomics & On-chain Voting",
        videoUrl: "https://www.youtube.com/embed/gT_S1w_D_D0", // Whiteboard Crypto DAOs
        description: "Structuring incentivized communities: Governance tokens, Quorums, and Tally.",
        content: `
# Tokenomics & DAO Governance: Decentralized Power

A DAO (Decentralized Autonomous Organization) is a community-led entity with no central authority.

## 1. Tokenomics Design
- **Supply**: Total, Circulating, and Max Supply.
- **Utility**: What does the token actually *do*? (Fees, Voting, Access).
- **Inflation/Deflation**: Burning mechanisms vs. Emission schedules.

## 2. On-chain Voting (Governor Alpha/Bravo)
Using your tokens as "Ballots" to vote on proposals. Once a vote passes, the smart contract automatically executes the change.

## 3. Snapshot (Off-chain Voting)
A "Gasless" way to vote where users sign a message instead of sending a transaction. It's used for signaling before an on-chain vote.

### Summary:
- Tokenomics = Economic Incentives.
- DAO = Code-governed community.
- Voting = Direct Democracy on-chain.
        `,
        duration: "1h 10m",
        nextLessonId: "les_do_1_1",
    },
    // DevOps Track
    "les_do_1_1": {
        chapter: "Core Infrastructure",
        subchapter: "Linux & Networking",
        title: "Bash Scripting & Automation",
        videoUrl: "https://www.youtube.com/embed/e7BufAVwGyM", // Linux Command Line
        description: "Mastering the shell: From basic piping to complex automation scripts.",
        content: `
# Bash Scripting: The DevOps Swiss Army Knife

Automation is the soul of DevOps. If you do it more than twice, script it.

## 1. The Shebang and Execution
Every script starts with \`#!/bin/bash\`. This tells the system which interpreter to use.

## 2. Variables and Logic
Bash variables are untyped. Logic uses square brackets for tests.
\`\`\`bash
if [ "$USER" == "root" ]; then
  echo "You have the power!"
fi
\`\`\`

## 3. Piping & Redirection
- **Pipe (\`|\`)**: Pass the output of one command as the input to another.
- **Redirect (\`>\`, \`>>\`)**: Write output to a file.

## 4. Loops & Functions
Iterating over files or executing reusable blocks of logic.

### Summary:
- Bash = System glue.
- Use pipes to chain simple tools into complex ones.
- Always check exit codes (\`$?\`).
        `,
        duration: "1h 20m",
        nextLessonId: "les_do_1_2",
    },
    "les_do_1_2": {
        chapter: "Core Infrastructure",
        subchapter: "Linux & Networking",
        title: "TCP/IP, DNS & Load Balancing",
        videoUrl: "https://www.youtube.com/embed/H8W9S7yWhdw", // Networking Explained
        description: "The plumbing of the internet: Understanding how packets flow through the cloud.",
        content: `
# Networking Foundations: The Cloud Plumbing

To build resilient infrastructure, you must understand how data moves.

## 1. The TCP/IP Model
- **IP (Internet Protocol)**: Addressing and routing.
- **TCP (Transmission Control Protocol)**: Ensuring data arrives correctly and in order.

## 2. DNS (Domain Name System)
The phonebook of the internet. Converting \`google.com\` into an IP address.
- **A Record**: Points to an IPv4.
- **CNAME**: Points to another domain name.

## 3. Load Balancing
Distributing incoming traffic across multiple servers to ensure high availability and prevent any single server from becoming a bottleneck.

### Summary:
- TCP = Reliable delivery.
- DNS = Human-to-Machine mapping.
- Load Balancing = Redundancy.
        `,
        duration: "1h 10m",
        nextLessonId: "les_do_1_3",
    },
    "les_do_1_3": {
        chapter: "Core Infrastructure",
        subchapter: "Security & IAM",
        title: "SSH, SSL & Least Privilege",
        videoUrl: "https://www.youtube.com/embed/v7vV3S1v7S4", // SSH Explained
        description: "Securing the cloud: Encrypted access and identity management.",
        content: `
# Security Foundations: SSH & SSL

Security is not a feature; it's a prerequisite.

## 1. SSH (Secure Shell)
The standard for remote server management. Always use **Key-based authentication** instead of passwords.

## 2. SSL/TLS (HTTPS)
Encrypting data in transit. Certificates ensure that you are actually talking to the intended server.

## 3. Principle of Least Privilege (PoLP)
Never give a user (or a service) more power than they precisely need. If a script only needs to read a file, don't give it write access.

### Summary:
- SSH Keys = Modern security.
- SSL = Traffic privacy.
- PoLP = Damage control.
        `,
        duration: "1h 00m",
        nextLessonId: "les_do_2_1",
    },
    "les_do_2_1": {
        chapter: "Containerization & Orchestration",
        subchapter: "Docker Essentials",
        title: "Dockerfiles & Image Optimization",
        videoUrl: "https://www.youtube.com/embed/gAkwW2tuIqE", // Docker for Beginners
        description: "Packaging your application: Writing efficient, secure, and small Docker images.",
        content: `
# Docker: Standardizing the Environment

"It works on my machine" is a phrase of the past. Docker ensures it works everywhere.

## 1. Images vs. Containers
- **Image**: The read-only blueprint (The class).
- **Container**: The running instance of an image (The object).

## 2. The Dockerfile
A simple text file with instructions on how to build the image (\`FROM\`, \`RUN\`, \`COPY\`, \`CMD\`).

## 3. Image Optimization
- Use **Alpine Linux** for tiny base images.
- Each instruction in a Dockerfile adds a **Layer**. Combine commands (\`&&\`) to keep layers small.

### Summary:
- Dockerfile = Automated setup.
- Layers cache = Fast builds.
- Alpine = Security through simplicity.
        `,
        duration: "1h 15m",
        nextLessonId: "les_do_2_2",
    },
    "les_do_2_2": {
        chapter: "Containerization & Orchestration",
        subchapter: "Docker Essentials",
        title: "Multi-stage Builds",
        videoUrl: "https://www.youtube.com/embed/SceSREv1q-k", // TechWorld with Nana - Multi-stage
        description: "Advanced Docker patterns: Separating build-time dependencies from the runtime image.",
        content: `
# Multi-stage Builds: Professional Packaging

Why send your whole source code and build tools (\`npm\`, \`maven\`, \`gcc\`) to the production server? You shouldn't.

## 1. The Build Phase
A stage where you compile your code, download dependencies, and run tests.

## 2. The Production Phase
A stage where you start with a clean image and only copy the **Final Artifact** (e.g., a \`.jar\` or a \`dist/\` folder) from the build stage.

## 3. Benefits
- **Security**: The source code is not in the final container.
- **Size**: Images can be 90% smaller.
- **Speed**: Faster deployments and pulls.

### Summary:
- Multi-stage = Clean separating of concerns.
- Small images = Secure images.
        `,
        duration: "50m",
        nextLessonId: "les_do_2_3",
    },
    "les_do_2_3": {
        chapter: "Containerization & Orchestration",
        subchapter: "Kubernetes Deep Dive",
        title: "Pods, Services & Ingress",
        videoUrl: "https://www.youtube.com/embed/X48VuDVv0do", // TechWorld with Nana - K8s Explained
        description: "The operating system of the cloud: Understanding the K8s object model.",
        content: `
# Kubernetes (K8s): The Cloud Orchestrator

If Docker is a single musician, Kubernetes is the **Conductor**.

## 1. Pods
The smallest deployable unit in K8s. A pod wraps one or more containers.

## 2. Services
Pods are ephemeral (they die and restart with different IPs). A **Service** provides a stable IP and DNS name to access a group of pods.

## 3. Ingress
The "Front Door" of the cluster. It routes external HTTP/S traffic to your internal services based on hostnames or paths.

### Summary:
- Pod = Execution.
- Service = Network stability.
- Ingress = Routing.
        `,
        duration: "2h 30m",
        nextLessonId: "les_do_2_4",
    },
    "les_do_2_4": {
        chapter: "Containerization & Orchestration",
        subchapter: "Kubernetes Deep Dive",
        title: "Helm & Kustomize Patterns",
        videoUrl: "https://www.youtube.com/embed/5_Jq_7E_76Q", // Helm Explained
        description: "Managing YAML at scale: Package management and environment-specific overlays.",
        content: `
# Helm & Kustomize: Taming the YAML Monster

Managing hundreds of K8s YAML files is impossible. We need templating.

## 1. Helm (The Package Manager)
Uses a **Chart** to package your K8s resources with variables (\`values.yaml\`).
- **Pros**: Versioning, easy rollbacks.

## 2. Kustomize (Native K8s Tool)
Uses **Overlays** to modify base YAML files without changing them. Perfect for "Patching" a production image tag onto a base file.
- **Pros**: No templating logic, pure YAML.

### Summary:
- Helm = Templates.
- Kustomize = Overlays.
- Use both based on complexity.
        `,
        duration: "1h 20m",
        nextLessonId: "les_do_3_1",
    },
    "les_do_3_1": {
        chapter: "CI/CD & Automation",
        subchapter: "GitHub Actions",
        title: "GitHub Actions & Workflows",
        videoUrl: "https://www.youtube.com/embed/R8_veQiYBjI", // GitHub Actions
        description: "Automating the software lifecycle: Building, testing, and pushing images automatically.",
        content: `
# GitHub Actions: Automation at the Source

Your code repository is not just for storage; it's the engine of your automation.

## 1. Workflows, Jobs, and Steps
- **Workflow**: The top-level process (The \`.yml\` file).
- **Job**: A set of steps that run on the same runner (e.g., "Build" or "Test").
- **Step**: An individual task (e.g., \`npm install\`).

## 2. Secrets Management
Never hardcode API keys. Use **GitHub Secrets** to inject sensitive data into your environment at runtime.

## 3. Self-hosted Runners
If your builds need massive RAM or access to internal resources, you can run the GitHub Actions agent on your own servers.

### Summary:
- Workflow = Automation definition.
- Secrets = Security.
- Matrix builds = Testing multiple versions at once.
        `,
        duration: "1h 30m",
        nextLessonId: "les_do_3_2",
    },
    "les_do_3_2": {
        chapter: "CI/CD & Automation",
        subchapter: "Continuous Delivery",
        title: "GitOps with ArgoCD",
        videoUrl: "https://www.youtube.com/embed/MeU5_uy7ubE", // ArgoCD Explained
        description: "The modern way to deploy: Synchronizing your K8s cluster state with your Git repo.",
        content: `
# GitOps & ArgoCD: Git as the Source of Truth

In GitOps, you don't use \`kubectl apply\`. You push to Git, and the cluster **pulls** the changes.

## 1. The Reconciliation Loop
ArgoCD constantly compares the state of your Git repo with the state of your K8s cluster. If they differ, it "Heals" the cluster to match Git.

## 2. Benefits of GitOps
- **Auditability**: Every change is a Commit.
- **Rollbacks**: Reverting a deployment is as simple as \`git revert\`.
- **Security**: No human needs \`write\` access to the production cluster.

### Summary:
- Git = The desired state.
- ArgoCD = The synchronization engine.
- No more manual shell commands for deployment.
        `,
        duration: "1h 20m",
        nextLessonId: "les_do_3_3",
    },
    "les_do_3_3": {
        chapter: "CI/CD & Automation",
        subchapter: "Infrastructure as Code",
        title: "Terraform: State & Modules",
        videoUrl: "https://www.youtube.com/embed/7xNGQRfqw9c", // Terraform Tutorial
        description: "Coding your cloud: Managing AWS, Azure, or GCP resources with HCL.",
        content: `
# Terraform: Infrastructure as Code (IaC)

Stop clicking in the AWS Console. Write your infrastructure as code.

## 1. HCL (HashiCorp Configuration Language)
A declarative language where you describe the **End State** (e.g., "I want 3 servers and a database"), and Terraform figures out how to make it happen.

## 2. The State File
Terraform keeps a record of what it built in a \`terraform.tfstate\` file. **Never lose this file.** In teams, we store it in a remote S3 bucket with locking.

## 3. Modules
Reusable components for infrastructure. Instead of writing VPC code 10 times, write a "VPC Module" and call it with different parameters.

### Summary:
- Plan before you Apply (\`terraform plan\`).
- Remote state for teams.
- Modules for scalability.
        `,
        duration: "2h 45m",
        nextLessonId: "les_do_4_1",
    },
    "les_do_4_1": {
        chapter: "Observability & SRE",
        subchapter: "Monitoring & Metrics",
        title: "Prometheus & Grafana",
        videoUrl: "https://www.youtube.com/embed/kAVBNgsrtik", // Prometheus & Grafana Setup
        description: "Visualizing system health: Scraping metrics and building real-time dashboards.",
        content: `
# Prometheus & Grafana: The Pulse of your System

You can't fix what you can't measure.

## 1. Prometheus (The Metrics Store)
A time-series database that "Scrapes" metrics from your applications every few seconds.
- **PromQL**: The powerful query language used to calculate things like "Average CPU usage over 5 minutes".

## 2. Grafana (The Visualization)
A dashboarding tool that connects to Prometheus to create beautiful, real-time graphs and alerts.

## 3. Alertmanager
Sending notifications (Slack, PagerDuty) when a metric crosses a critical threshold (e.g., "Disk Space > 90%").

### Summary:
- Metrics = Numbers over time.
- Grafana = The UI for SREs.
- Alerts = Sleep peacefully (until they fire).
        `,
        duration: "1h 50m",
        nextLessonId: "les_do_4_2",
    },
    "les_do_4_2": {
        chapter: "Observability & SRE",
        subchapter: "Logging & Tracing",
        title: "Logging with ELK / Loki",
        videoUrl: "https://www.youtube.com/embed/K9V7h7v83kE", // ELK Stack Explained
        description: "Centralized logging: Searching through millions of logs across a distributed system.",
        content: `
# Centralized Logging: Searching the Needle in the Haystack

Logging into 50 servers to find an error is a waste of time. We centralize logs.

## 1. The ELK Stack (Elasticsearch, Logstash, Kibana)
- **Elasticsearch**: The search engine.
- **Logstash/Fluentd**: The log collector and processor.
- **Kibana**: The search UI.

## 2. Grafana Loki
A "Prometheus-like" logging system that is much cheaper to run than ELK because it only indexes labels, not the full log text.

## 3. Structured Logging
Always log in **JSON**. It makes it 100x easier for machines to parse and filter your logs.

### Summary:
- Don't SSH into servers for logs.
- Use JSON for all logs.
- Index on what matters (TraceID, UserID).
        `,
        duration: "1h 30m",
        nextLessonId: "les_do_4_3",
    },
    "les_do_4_3": {
        chapter: "Observability & SRE",
        subchapter: "SRE Principles",
        title: "SLIs, SLOs & Error Budgets",
        videoUrl: "https://www.youtube.com/embed/S0T00o-oW24", // SRE Deep Dive
        description: "The business of reliability: Defining what 'Working' actually means and how to measure it.",
        content: `
# SRE Principles: SLIs, SLOs & Error Budgets

Reliability is the most important feature of any product.

## 1. SLI (Service Level Indicator)
A specific metric you measure (e.g., "Successful Request Rate").

## 2. SLO (Service Level Objective)
The target value for an SLI (e.g., "99.9% of requests must succeed").

## 3. Error Budget
The difference between 100% and your SLO. If your SLO is 99.9%, you have an "Error Budget" of 0.1% downtime.
- **The Rule**: If you run out of Error Budget, you stop pushing new features and focus 100% on stability.

### Summary:
- SLI = What we measure.
- SLO = What we promise.
- Error Budget = The balance between Speed and Stability.
        `,
        duration: "1h 10m",
        nextLessonId: null,
    },
};

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const { trackId, lessonId } = params;
    
    // Simulate finding the lesson (fallback for lessons not yet detailed)
    const lesson = lessonsData[lessonId as string] || {
        title: "Advanced Module Content",
        description: "This lesson covers industry-standard patterns and implementation strategies.",
        content: `# Industry-Level Content\n\nThis lesson is currently being processed by the InfiniCode Curriculum Engine. Please check back shortly for a deep-dive exploration of this topic.\n\n### Key Learning Objectives:\n- Master advanced architectural patterns\n- Implement industry best practices\n- Optimize for performance and scale`,
        duration: "1h 15m",
        nextLessonId: null
    };

    const handleStartExercise = () => {
        // Redirect to editor with a "learning" template or dummy project
        router.push(`/editor?template=frontend_advanced&lesson_id=${lessonId}`);
    };

    return (
        <div className="flex-1 flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
            {/* Top Navigation */}
            <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-xl shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.push(`/dashboard/learning/${trackId}`)}
                        className="text-neutral-500 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-blue-400" />
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-500">{lesson.chapter || "Course"}</span>
                            <ChevronRight className="w-3 h-3 text-neutral-700" />
                            <span className="text-neutral-300 font-medium">{lesson.subchapter || "Module"}</span>
                            <ChevronRight className="w-3 h-3 text-neutral-700" />
                            <span className="text-white font-semibold truncate max-w-[200px]">{lesson.title}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="border-white/10 text-neutral-400 hover:text-white">
                        <Bookmark className="w-4 h-4 mr-2" /> Save
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push(`/dashboard/learning/${trackId}/${lesson.nextLessonId}`)}>
                        Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto px-8 py-12">
                    {/* Video Player Section */}
                    {lesson.videoUrl && (
                        <div className="mb-12 aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl relative group">
                            <iframe 
                                src={lesson.videoUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                referrerPolicy="strict-origin-when-cross-origin"
                            />
                            <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl" />
                        </div>
                    )}

                    {/* Lesson Hero Section */}
                    <div className="mb-12 pb-12 border-b border-white/5">
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-4 px-3 py-1">
                            {lesson.chapter} • {lesson.subchapter}
                        </Badge>
                        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
                            {lesson.title}
                        </h1>
                        <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed italic border-l-2 border-blue-500/30 pl-6 my-6">
                            "{lesson.description}"
                        </p>
                        
                        <div className="flex items-center gap-6 mt-8">
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <Clock className="w-4 h-4" /> {lesson.duration}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <Users className="w-4 h-4" /> 8,402 Completed
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <Star className="w-4 h-4 text-yellow-500" /> 4.8 Rating
                            </div>
                        </div>
                    </div>

                    {/* Lesson Body */}
                    <article className="prose prose-invert prose-blue max-w-none text-neutral-300 leading-8">
                        {/* We use a simple markdown-like renderer with standard components */}
                        {lesson.content.split('\n').map((line: string, i: number) => {
                            if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-white mt-12 mb-6">{line.replace('# ', '')}</h1>;
                            if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-white mt-10 mb-5">{line.replace('## ', '')}</h2>;
                            if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-white mt-8 mb-4">{line.replace('### ', '')}</h3>;
                            if (line.startsWith('- ')) return <li key={i} className="ml-6 mb-2 list-disc marker:text-blue-500">{line.replace('- ', '')}</li>;
                            if (line.startsWith('`')) return <pre key={i} className="bg-black/60 p-4 rounded-xl border border-white/5 my-6 overflow-x-auto text-blue-300 font-mono text-sm">{line.replace(/`/g, '')}</pre>;
                            return <p key={i} className="mb-4">{line}</p>;
                        })}
                    </article>

                    {/* Interactive Section */}
                    <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-900/10 border border-blue-500/20">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-2">
                                    <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    Hands-on Practice
                                </h3>
                                <p className="text-neutral-400 text-sm">
                                    Ready to apply these concepts? Open the InfiniCode IDE with a pre-configured workspace for this lesson.
                                </p>
                            </div>
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl" onClick={handleStartExercise}>
                                Launch Practice Lab <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Footer Progress */}
                    <div className="mt-20 pt-12 border-t border-white/5 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-all">
                                <MessageSquare className="w-5 h-5" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-12 w-12 rounded-full border-white/10 text-neutral-500 hover:text-white transition-all">
                                <Star className="w-5 h-5" />
                            </Button>
                        </div>
                        <Button className="h-14 px-12 bg-green-500 hover:bg-green-600 text-black font-bold text-lg rounded-full">
                            Mark as Complete <CheckCircle2 className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { LayoutTemplate as LayoutIcon, BrainCircuit as BrainIcon, Network as NetworkIcon, Code2 as CodeIcon, Sparkles as SparkleIcon, Cpu as CpuIcon, Cloud as CloudIcon, ChevronRight as ChevronRightIcon, Play as PlayIcon, CheckCircle2 as CheckCircleIcon, Lock as LockIcon, ArrowLeft as ArrowLeftIcon, GraduationCap as GraduationIcon, Clock as ClockIcon, Star as StarIcon, Users as UsersIcon, Layout as LayoutBase, FileCode as FileCodeIcon, Workflow as WorkflowIcon, Send as SendIcon, Bookmark as BookmarkIcon, MessageSquare as MessageSquareIcon, Zap as ZapIcon, ExternalLink as ExternalLinkIcon, Trophy } from "lucide-react";

// (Note: Icons re-imported or alias to avoid duplicate identifier issues if I add many more later)
