import type { HTMLAttributes, ReactNode } from 'react'

const questionImages = import.meta.glob('./api/question_images/*', {
	eager: true,
	import: 'default',
	query: '?url',
}) as Record<string, string>

export type QuestionOption = {
	id: string
	text: string
	is_correct: boolean
}

export type LearnerQuestion = {
	id: number
	question: string
	has_image?: boolean
	image_url?: string
	sub_items?: string[]
	options: QuestionOption[]
	correct_answer_id: string
	correct_answer_text: string
	note?: string
}

export type LearnerTest = {
	title: string
	source: string
	note: string
	total_questions: number
	questions: LearnerQuestion[]
}

type CardProps = HTMLAttributes<HTMLElement> & {
	children: ReactNode
	title?: string
	question?: LearnerQuestion
	questionNumber?: number
	totalQuestions?: number
	userName?: string
	timeRemaining?: string
	selectedOptionId?: string
	onSelectOption?: (optionId: string) => void
	onQuit?: () => void
	onBack?: () => void
	backDisabled?: boolean
	onNext?: () => void
	nextDisabled?: boolean
}

const Card = ({
	children,
	title,
	question,
	questionNumber,
	totalQuestions,
	userName,
	timeRemaining = '00:11',
	selectedOptionId,
	onSelectOption,
	onQuit,
	onBack,
	backDisabled = false,
	onNext,
	nextDisabled = false,
	className,
	...props
}: CardProps) => {
	const cardClassName = [
		'box-border h-fit max-h-[calc(100svh-1rem)] w-full max-w-4xl min-w-0 overflow-y-auto overscroll-contain rounded-lg border border-[#344154] bg-[#202c3f] p-3 text-left text-[#f7f8fb] shadow-xl sm:max-h-[calc(100svh-3rem)] sm:p-6',
		className,
	].filter(Boolean).join(' ')
	const imageSource = question?.image_url
		? questionImages[`./api/${question.image_url}`]
		: undefined
	const hasAnswered = selectedOptionId !== undefined

	return (
		<article className={cardClassName} {...props}>
			{question && (
				<header className="mb-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 font-sans sm:mb-5 sm:gap-4">
					<p className="text-2xl font-semibold leading-none text-[#35bdf5] sm:text-4xl">
						{String(questionNumber ?? question.id).padStart(2, '0')}
						<span className="text-lg text-[#8791a4] sm:text-2xl">/{String(totalQuestions ?? 4).padStart(2, '0')}</span>
					</p>
					{userName && <p className="min-w-0 truncate text-center font-sans text-sm font-semibold text-[#f7f8fb] sm:text-base">{userName}</p>}
					<p className="flex items-center gap-2 text-lg font-semibold text-[#35bdf5] sm:text-2xl">
						<span aria-hidden="true" className="relative inline-block size-4 rounded-full border-2 border-[#35bdf5] after:absolute after:left-1/2 after:top-1/2 after:h-1.5 after:w-0.5 after:-translate-x-1/2 after:-translate-y-full after:bg-[#35bdf5] sm:size-5" />
						{timeRemaining}
					</p>
				</header>
			)}
			{title && !question && <h2 className="mb-3 text-2xl font-medium leading-tight text-white">{title}</h2>}
			{question && (
				<div className="grid gap-3 sm:gap-4">
					{title && <h2 className="sr-only">{title}</h2>}
					<p className="font-sans text-lg font-semibold leading-tight text-[#f7f8fb] sm:text-2xl">{question.question}</p>
					{imageSource && (
						<img alt="" className="max-h-[28svh] w-full rounded-lg border border-[#344154] object-contain" src={imageSource} />
					)}
					{question.sub_items && (
						<ul className="list-inside list-disc space-y-1 font-sans text-[#c5ccda]">
							{question.sub_items.map((item) => <li key={item}>{item}</li>)}
						</ul>
					)}
					<ul className="grid gap-2 sm:gap-3" aria-label="Answer options">
						{question.options.map((option) => (
							<li key={option.id}>
								<button
									aria-pressed={selectedOptionId === option.id}
									className={`w-full rounded-lg border px-3 py-2 text-left font-sans text-sm transition-colors sm:px-4 sm:py-3 sm:text-lg ${hasAnswered && option.is_correct ? 'border-green-400 bg-green-900/60 text-green-100' : hasAnswered && selectedOptionId === option.id ? 'border-red-300 bg-red-900/60 text-red-100' : 'border-[#344154] bg-[#101a2e] text-[#f7f8fb] hover:border-[#708096]'}`}
									disabled={hasAnswered}
									onClick={() => onSelectOption?.(option.id)}
									type="button"
								>
									{option.text}
									{hasAnswered && option.is_correct && (
										<span aria-label="Correct answer" className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-green-300 font-bold text-green-950" role="img">
											<span aria-hidden="true">✓</span>
										</span>
									)}
								</button>
							</li>
						))}
					</ul>
					{(onBack || onNext) && (
						<div className="mt-3 flex flex-wrap justify-between gap-3">
							{onQuit && (
								<button
									className="min-w-0 flex-1 rounded-lg border border-red-300/70 px-3 py-2 font-sans text-sm font-semibold text-red-200 transition-colors hover:border-red-200 hover:bg-red-950/40 sm:min-w-32 sm:flex-none sm:px-5 sm:text-base"
									onClick={onQuit}
									type="button"
								>
									Quit test
								</button>
							)}
							{onBack && (
								<button
									className="min-w-0 flex-1 rounded-lg border border-[#708096] px-3 py-2 font-sans text-sm font-semibold text-[#8791a4] transition-colors hover:border-[#35bdf5] hover:text-[#35bdf5] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-32 sm:flex-none sm:px-5 sm:text-base"
									disabled={backDisabled}
									onClick={onBack}
									type="button"
								>
									Back
								</button>
							)}
							{onNext && (
								<button
									className="min-w-0 flex-1 rounded-lg border border-[#708096] px-3 py-2 font-sans text-sm font-semibold text-[#8791a4] transition-colors hover:border-[#35bdf5] hover:text-[#35bdf5] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-32 sm:flex-none sm:px-5 sm:text-base"
									disabled={nextDisabled || !hasAnswered}
									onClick={onNext}
									type="button"
								>
									Next
								</button>
							)}
						</div>
					)}
				</div>
			)}
			{children && <div className="mt-4 grid gap-4">{children}</div>}
		</article>
	)
}

export default Card