import { useEffect, useState } from 'react'
import Card, { type LearnerTest } from './Card'
import learnerTestApi from './api/learners_test_api.json'

const test = learnerTestApi as LearnerTest
const quizDuration = 60 * 60
const questionLimit = Math.min(68, test.questions.length)
const storageKey = 'learner-driver-quiz-state'

type QuizPhase = 'name' | 'quiz' | 'results'

type PersistedQuizState = {
	phase: QuizPhase
	name: string
	questionIndex: number
	questionOrder: number[]
	remainingSeconds: number
	answers: Record<number, string>
	deadline: number | null
}

const getSavedState = (): PersistedQuizState => {
	const defaultState: PersistedQuizState = {
		phase: 'name',
		name: '',
		questionIndex: 0,
		questionOrder: test.questions.slice(0, questionLimit).map((question) => question.id),
		remainingSeconds: quizDuration,
		answers: {},
		deadline: null,
	}

	try {
		const saved = localStorage.getItem(storageKey)
		if (!saved) return defaultState

		const parsed = JSON.parse(saved) as Partial<PersistedQuizState>
		const deadline = typeof parsed.deadline === 'number' ? parsed.deadline : null
		const remainingSeconds = deadline
			? Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
			: typeof parsed.remainingSeconds === 'number' ? parsed.remainingSeconds : quizDuration

		return {
			...defaultState,
			...parsed,
			questionOrder: Array.isArray(parsed.questionOrder) && parsed.questionOrder.length > 0
				? parsed.questionOrder.slice(0, questionLimit)
				: defaultState.questionOrder,
			phase: remainingSeconds === 0 && parsed.phase === 'quiz' ? 'results' : parsed.phase ?? 'name',
			remainingSeconds,
			deadline,
		}
	} catch {
		return defaultState
	}
}

const shuffleQuestionIds = () => {
	const questionIds = test.questions.map((question) => question.id)

	for (let index = questionIds.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1))
		;[questionIds[index], questionIds[randomIndex]] = [questionIds[randomIndex], questionIds[index]]
	}

	return questionIds.slice(0, questionLimit)
}

const formatTime = (seconds: number) => {
	const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
	const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
	return `${minutes}:${remainingSeconds}`
}

const App = () => {
	const savedState = getSavedState()
	const [phase, setPhase] = useState<QuizPhase>(savedState.phase)
	const [name, setName] = useState(savedState.name)
	const [questionIndex, setQuestionIndex] = useState(savedState.questionIndex)
	const [questionOrder, setQuestionOrder] = useState(savedState.questionOrder)
	const [remainingSeconds, setRemainingSeconds] = useState(savedState.remainingSeconds)
	const [answers, setAnswers] = useState<Record<number, string>>(savedState.answers)
	const [deadline, setDeadline] = useState<number | null>(savedState.deadline)

	const questions = questionOrder
		.map((questionId) => test.questions.find((currentQuestion) => currentQuestion.id === questionId))
		.filter((currentQuestion): currentQuestion is LearnerTest['questions'][number] => currentQuestion !== undefined)
	const question = questions[questionIndex] ?? test.questions[0]
	const score = questions.reduce(
		(total, currentQuestion) => total + (answers[currentQuestion.id] === currentQuestion.correct_answer_id ? 1 : 0),
		0,
	)
	const scorePercentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
	const resultMessage = scorePercentage < 50
		? 'Try again to build your confidence and improve your score.'
		: scorePercentage >= 90
			? 'Congratulations! You are doing very well. Keep attempting tests to stay sharp.'
			: 'Keep practicing. You are almost ready for the test.'

	useEffect(() => {
		localStorage.setItem(storageKey, JSON.stringify({
			phase,
			name,
			questionIndex,
			questionOrder,
			remainingSeconds,
			answers,
			deadline,
		} satisfies PersistedQuizState))
	}, [answers, deadline, name, phase, questionIndex, questionOrder, remainingSeconds])

	useEffect(() => {
		if (phase !== 'quiz') return

		const timer = window.setInterval(() => {
			setRemainingSeconds((current) => {
				if (current <= 1) {
					setPhase('results')
					return 0
				}
				return current - 1
			})
		}, 1000)

		return () => window.clearInterval(timer)
	}, [phase])

	const startQuiz = () => {
		const trimmedName = name.trim()
		if (!trimmedName) return

		setName(trimmedName)
		setQuestionIndex(0)
		setQuestionOrder(shuffleQuestionIds())
		setRemainingSeconds(quizDuration)
		setAnswers({})
		setDeadline(Date.now() + quizDuration * 1000)
		setPhase('quiz')
	}

	const restartQuiz = () => {
		setName('')
		setQuestionIndex(0)
		setQuestionOrder(test.questions.slice(0, questionLimit).map((question) => question.id))
		setRemainingSeconds(quizDuration)
		setAnswers({})
		setDeadline(null)
		setPhase('name')
	}

	const quitQuiz = () => {
		if (!window.confirm('Quit this test? Your progress will be lost.')) return

		localStorage.removeItem(storageKey)
		restartQuiz()
	}

	if (phase === 'name') {
		return (
			<main className="mx-auto grid min-h-screen w-full max-w-2xl place-items-center p-5 sm:p-8">
				<section className="w-full rounded-lg border border-[#344154] bg-[#202c3f] p-6 text-[#f7f8fb] shadow-xl sm:p-10">
					<p className="mb-3 font-sans text-sm uppercase tracking-[0.2em] text-[#35bdf5]">Learner driver test</p>
					<h1 className="mb-3 font-sans text-3xl font-semibold sm:text-4xl">Enter your name</h1>
					<p className="mb-8 text-[#c5ccda]">You have 60 minutes to complete the test.</p>
					<form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); startQuiz() }}>
						<label className="grid gap-2 font-sans text-sm text-[#c5ccda]" htmlFor="candidate-name">
							Name
							<input
								autoComplete="name"
								className="rounded-lg border border-[#344154] bg-[#101a2e] px-4 py-3 text-base text-white outline-none focus:border-[#35bdf5]"
								id="candidate-name"
								onChange={(event) => setName(event.target.value)}
								value={name}
							/>
						</label>
						<button
							className="rounded-lg border border-[#35bdf5] px-5 py-3 font-sans font-semibold text-[#35bdf5] transition-colors hover:bg-[#35bdf5] hover:text-[#101a2e] disabled:cursor-not-allowed disabled:opacity-40"
							disabled={!name.trim()}
							type="submit"
						>
							Start test
						</button>
					</form>
				</section>
			</main>
		)
	}

	if (phase === 'results') {
		return (
			<main className="mx-auto grid min-h-screen w-full max-w-2xl place-items-center p-5 sm:p-8">
				<section className="w-full rounded-lg border border-[#344154] bg-[#202c3f] p-6 text-center text-[#f7f8fb] shadow-xl sm:p-10">
					<p className="mb-3 font-sans text-sm uppercase tracking-[0.2em] text-[#35bdf5]">Test complete</p>
					<h1 className="font-sans text-3xl font-semibold sm:text-4xl">Well done, {name}</h1>
					<p className="mt-5 font-sans text-2xl text-[#c5ccda]">
						Score: <span className="text-[#35bdf5]">{score} / {questions.length}</span>
					</p>
					<p className="mt-2 font-sans text-xl font-semibold text-[#35bdf5]">{scorePercentage}%</p>
					<p className="mt-3 text-[#c5ccda]">{resultMessage}</p>
					<p className="mt-2 text-[#c5ccda]">Time remaining: {formatTime(remainingSeconds)}</p>
					<button
						className="mt-8 rounded-lg border border-[#35bdf5] px-5 py-3 font-sans font-semibold text-[#35bdf5] transition-colors hover:bg-[#35bdf5] hover:text-[#101a2e]"
						onClick={restartQuiz}
						type="button"
					>
						Try again
					</button>
				</section>
			</main>
		)
	}

	return (
		<main className="mx-auto grid min-h-screen w-full max-w-6xl place-items-center p-2 sm:p-5">
			<Card
				key={question.id}
				question={question}
				questionNumber={questionIndex + 1}
				totalQuestions={questions.length}
				userName={name}
				timeRemaining={formatTime(remainingSeconds)}
				selectedOptionId={answers[question.id]}
				onSelectOption={(optionId) => setAnswers((current) => current[question.id] ? current : { ...current, [question.id]: optionId })}
				onQuit={quitQuiz}
				backDisabled={questionIndex === 0}
				nextDisabled={!answers[question.id]}
				onBack={() => setQuestionIndex((current) => Math.max(0, current - 1))}
				onNext={() => {
					if (questionIndex === questions.length - 1) {
						setPhase('results')
						return
					}
					setQuestionIndex((current) => current + 1)
				}}
			>
				{question.note && <p className="text-sm italic text-[#c5ccda]">{question.note}</p>}
			</Card>
		</main>
	)
}

export default App