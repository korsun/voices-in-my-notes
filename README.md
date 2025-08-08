# Voices in my notes

## How it was designed

### Paper / mind mapping stage

First of all, we need to understand the overall structure of the application. We take a data-driven approach, and even if we don’t have a backend, we must decide how data will persist. Between IndexedDB and localStorage listed in the task requirements, I chose IndexedDB (with a fallback to LS, though). It provides async access, which is one of the requirements, and it’s organized like a real database, meaning we can store notes by key and retrieve them in O(1) time. With localStorage, we wouldn’t store each note under a unique key; instead, we’d use an array and later find a note by iterating over it.

Now we need to define our models/entities. In this case, we have a Note entity with the following properties:

```
type TNote = {
  id: string;
  text?: string;
	// these two were added later for UX reasons; will be explained below
	title: string;
	updatedAt: string;
}
```

Now, when we know how data will be kept, we can design on paper our endpoints. So we have a basic CRUD here:

```
getNotes()
getNoteById() — we actually don't need it with IndexedDB but let's keep it
createNote()
updateNote()
deleteNote()
```

Time for prototyping. We need:

- a list of notes
- a note viewer/editor with a Delete button and a voice recording button

I tried to create a wireframe of the app using AI tools, but the results were unsatisfactory. Then I looked for inspiration in free Figma community designs. I adopted a layout with a sidebar and a main content area because:

- It’s convenient to see the list and the editor on the same page.
- It looks a bit like Notion, so it’s intuitive to use.
- It eliminates the need for routing.

Now, tooling and architecture. I’ll specify that I built the app as if it were a real-world product that will eventually connect to a backend and gain more features. That influenced some decisions:

- No need for SSR, because such apps are normally auth-based and tied to user data.
- The architecture should support future scalability so that adding features feels like snapping together LEGO pieces. Likewise, when an outdated feature needs to be removed, it should be deletable from a single place.
- The toolset should balance scalability and minimalism. Let’s prepare a solid foundation without turning the app into a multipurpose combine.

### Scaffolding

Time to write code. Building our tech stack.

- Vite + React + TypeScript — the gold standard
- TailwindCSS — I prefer a pure CSS approach without CSS-in-JS
- Vitest — we’re not masochists who use Jest, right?
- react-testing-library — there are two options for writing integration tests on the frontend, and both are imperfect. Using Cypress is the painless approach in a real browser — but it takes more time to write and _much_ more time for test cases to pass on CI. Or use JSDOM and suffer through debugging HTML in the terminal.
- Radix UI — I hoped not to install any component library at all, but I ended up doing so. At least it’s minimalistic.
- react-speech-recognition — React wrapper for the SpeechRecognition API
- GitHub Actions for CI — each time a PR is opened, linting and tests run, and the app is deployed to Vercel.

### Frontend architecture

I prefer domain-driven approaches for their maintainability. A common choice is Feature-Sliced Design, a variant of DDD. I decided that would be overkill here and instead used a frontend-adapted DDD variant with three logic layers and one shared infrastructure layer to tie them together.

```
src/
├── _infrastructure/   # Shared infrastructure code (accessible from all other layers)
├── app/               # Application-level code: pages, providers, global styles, etc.
|												(can use /domains layer)
├── domains/           # Feature modules with domain logic (can use /ui layer)
│   ├── notes/
│   │   ├── api/       # API endpoints
│   │   ├── models/    # Models
│   │   ├── ui/        # Domain-level UI components
│   │   └── helpers/   # Domain-level utils, hooks, etc.
│   └── **/
└── ui/                # Reusable dumb UI components
```

### Features

First, we add general notes functionality.

Then we add voice recording on top of that. Some questions arose. First, SpeechRecognition does not automatically detect the language. I solved this by adding a dropdown of the browser’s languages. Next, continuous recording (when recording continues while the user is silent) isn’t supported in all browsers, but the library provides a flag for it.

### UX decisions

I use the word "note" throughout instead of "memo" to avoid confusion with React memoization.

I aimed for an easy-to-use interface, so I dropped the “Edit” and “Save” buttons and kept Notion-like behavior: when the user starts typing, the note is automatically saved. I’m using a debounce to prevent excessive updates. For the sake of UX, I didn’t strictly follow the “The memo should have a mandatory text description” requirement — the text is actually optional, but I added a mandatory title. In the list, two lines of note text aren’t always enough to distinguish notes that start with the same words—but the title tends to be more or less unique. I also added an “Updated at” field, which helps distinguish notes. Plus, notes are now sorted by date, which is more intuitive.

The app should be keyboard-friendly: use Tab to navigate between elements and Enter to confirm actions. I also added voice recording via Alt/Option, because it works really well in WisprFlow, which I use daily.

When voice recording is on, we restrict all other communication with the app. When the user switches to another tab or closes the app, the voice recording stops.

All actions that cannot be undone should be confirmed by the user.

The app should be mobile-friendly as well—but I deferred this due to time constraints.
