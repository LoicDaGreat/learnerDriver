# Learner Driver Quiz

A React and TypeScript learner-driver practice quiz powered by a local JSON question set. Each attempt serves up to 68 randomized questions, runs for 60 minutes, provides answer feedback, and persists progress across page refreshes.

## Architecture

The application is a client-side Vite React app with three main layers:

```text
src/
|-- App.tsx                         Application state and quiz workflow
|-- Card.tsx                        Reusable quiz question component
|-- main.tsx                        React entry point
|-- index.css                       Global styles and Tailwind import
|-- api/
|   |-- learners_test_api.json       Question and answer data
|   `-- question_images/             Images referenced by image_url
`-- vite-env.d.ts                   Vite type declarations
```

### Application shell: `src/main.tsx`

`main.tsx` is the browser entry point. It imports the global stylesheet, finds the `root` element, and renders `App` inside React `StrictMode`.

### Quiz workflow: `src/App.tsx`

`App` owns the complete quiz session and controls which screen is visible:

- `name`: collects and validates the learner's name.
- `quiz`: displays the current question and manages the attempt.
- `results`: displays the learner's name, score, and remaining time.

`App` is responsible for:

- Loading and typing the local JSON test data.
- Selecting and shuffling up to 68 question IDs for a new attempt.
- Navigating through the randomized question list.
- Storing selected answers by question ID.
- Deriving the score from the stored answers.
- Running the 60-minute countdown.
- Handling Back, Next, Quit, timeout, and restart actions.
- Persisting and restoring the session from browser `localStorage`.

The persisted record is stored under `learner-driver-quiz-state` and contains the current phase, learner name, question index, randomized question order, answers, remaining time, and timer deadline. The deadline is used so refreshing the page does not reset the timer.

### Reusable question UI: `src/Card.tsx`

`Card` is a controlled, reusable component. It receives the current question and interaction state from `App` rather than owning the selected answer itself.

The component handles presentation for:

- Question number and total question count.
- Learner name and countdown display.
- Optional question images and sub-items.
- Answer buttons and selected-answer feedback.
- Green highlighting for the correct answer.
- Red highlighting for a selected incorrect answer.
- Back, Next, and Quit controls.

When an answer is selected, the answer buttons become disabled and the correct answer receives a check symbol. Navigation remains controlled by `App`, which prevents score duplication when a learner moves backward and revisits a question.

### Local question data: `src/api`

`learners_test_api.json` contains the test metadata and question records. Each question includes an ID, prompt, answer options, and correct-answer fields. Questions that require an image reference a local path such as `question_images/q05.png`.

`Card.tsx` uses Vite's `import.meta.glob` to resolve the images in `src/api/question_images` as bundled assets.

## Multilingual roadmap

The long-term goal is to provide the learner-driver test in all eleven official South African languages. English is currently the source language; the next ten language editions are:

- Afrikaans
- isiNdebele
- isiXhosa
- isiZulu
- Sesotho
- Sesotho sa Leboa (Sepedi)
- Setswana
- siSwati
- Tshivenda
- Xitsonga

Planned implementation phases:

1. **Language-ready data model**: separate translatable question content from stable question IDs, answer IDs, image references, and correctness metadata.
2. **Localized question files**: add one validated JSON dataset per language while keeping the same schema as the English source.
3. **Language selection**: add a language selector before the name-entry screen and persist the selected language with the quiz session.
4. **Localized interface text**: translate navigation, timer labels, feedback, score messages, name-entry text, and results messaging.
5. **Content review**: have each translation reviewed by qualified native speakers familiar with South African road rules and learner-test terminology.
6. **Automated validation**: verify that every language contains the same question IDs, option IDs, correct-answer IDs, and image references as the source dataset.
7. **Accessibility and rollout**: test text expansion, pronunciation and screen-reader behavior, mobile layouts, and release languages incrementally.

The English dataset remains the canonical structural reference. Translations should preserve the meaning of the official road-safety content rather than translate generated distractors without review.

## Technology

- React 19
- TypeScript
- Vite
- Tailwind CSS 4 through `@tailwindcss/vite`
- ESLint with React Hooks and TypeScript rules

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run the checks:

```bash
npx tsc -b
npm run lint
npm run build
```

Preview the production build:

```bash
npm run preview
```

## State and persistence notes

The quiz is intentionally client-side. There is no server API or database yet; the JSON file acts as the local data source, and `localStorage` provides browser-level session persistence.

Choosing **Quit test** clears the saved session and returns to the name-entry screen. Choosing **Try again** also starts a fresh attempt with a new randomized question order.