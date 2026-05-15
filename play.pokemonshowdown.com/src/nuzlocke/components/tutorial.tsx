/**
 * Nuzlocke — First-time tutorial overlay
 *
 * Renders a spotlight + tooltip card for each step, via a portal on document.body.
 * Steps with a selector that matches no element are skipped automatically.
 */

import preact from "../../../js/lib/preact";

export interface TutorialStep {
	selector?: string;   // CSS selector for spotlight target; omit for a centered card
	title: string;
	body: string;
}

interface NzTutorialProps {
	steps: TutorialStep[];
	onDone: () => void;
}

interface NzTutorialState {
	stepIndex: number;
	spotlightRect: DOMRect | null;
}

const CARD_W = 300;
const CARD_H = 240;
const GAP = 10;    // gap between spotlight and card
const MARGIN = 12; // minimum distance from viewport edge
const PAD = 8;     // spotlight padding around target element

type CSSProp = preact.JSX.CSSProperties;

function measureSpotlight(step: TutorialStep): DOMRect | null {
	if (!step.selector) return null;
	const el = document.querySelector(step.selector);
	return el ? (el.getBoundingClientRect() as DOMRect) : null;
}

function computeCardStyle(rect: DOMRect | null): CSSProp {
	if (!rect) {
		return { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
	}
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const sTop = rect.top - PAD;
	const sLeft = rect.left - PAD;
	const sRight = rect.right + PAD;
	const sBottom = rect.bottom + PAD;

	// below
	if (sBottom + GAP + CARD_H + MARGIN <= vh) {
		const left = Math.max(MARGIN, Math.min(sLeft, vw - CARD_W - MARGIN));
		return { top: sBottom + GAP, left };
	}
	// right
	if (sRight + GAP + CARD_W + MARGIN <= vw) {
		const top = Math.max(MARGIN, Math.min(sTop, vh - CARD_H - MARGIN));
		return { top, left: sRight + GAP };
	}
	// above
	if (sTop - GAP - CARD_H >= MARGIN) {
		const left = Math.max(MARGIN, Math.min(sLeft, vw - CARD_W - MARGIN));
		return { top: sTop - GAP - CARD_H, left };
	}
	// left
	if (sLeft - GAP - CARD_W >= MARGIN) {
		const top = Math.max(MARGIN, Math.min(sTop, vh - CARD_H - MARGIN));
		return { top, left: sLeft - GAP - CARD_W };
	}
	// fallback: center
	return { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
}

export class NzTutorial extends preact.Component<NzTutorialProps, NzTutorialState> {
	override state: NzTutorialState = { stepIndex: 0, spotlightRect: null };
	portalEl: HTMLDivElement | null = null;

	override componentDidMount() {
		this.portalEl = document.createElement('div');
		document.body.appendChild(this.portalEl);
		window.addEventListener('resize', this.onResize);
		this.goTo(0);
	}

	override componentDidUpdate() {
		this.syncPortal();
	}

	override componentWillUnmount() {
		window.removeEventListener('resize', this.onResize);
		if (this.portalEl) {
			preact.render('' as any, this.portalEl);
			document.body.removeChild(this.portalEl);
			this.portalEl = null;
		}
	}

	onResize = () => {
		const { steps } = this.props;
		const step = steps[this.state.stepIndex];
		if (step) this.setState({ spotlightRect: measureSpotlight(step) });
	};

	/** Move to the first valid step at or after `from`, skipping selector misses. */
	goTo(from: number, direction: 1 | -1 = 1) {
		const { steps, onDone } = this.props;
		let idx = from;
		while (idx >= 0 && idx < steps.length) {
			const step = steps[idx];
			if (!step.selector || document.querySelector(step.selector)) break;
			idx += direction;
		}
		if (idx < 0 || idx >= steps.length) {
			onDone();
			return;
		}
		this.setState({ stepIndex: idx, spotlightRect: measureSpotlight(steps[idx]) });
	}

	next = () => this.goTo(this.state.stepIndex + 1, 1);
	prev = () => this.goTo(this.state.stepIndex - 1, -1);
	skip = () => this.props.onDone();

	hasNext(from: number): boolean {
		const { steps } = this.props;
		for (let i = from + 1; i < steps.length; i++) {
			const s = steps[i];
			if (!s.selector || document.querySelector(s.selector)) return true;
		}
		return false;
	}

	countVisibleSteps(): number {
		return this.props.steps.filter(s => !s.selector || !!document.querySelector(s.selector)).length;
	}

	visibleIndexOf(stepIndex: number): number {
		let count = 0;
		for (let i = 0; i <= stepIndex; i++) {
			const s = this.props.steps[i];
			if (!s.selector || document.querySelector(s.selector)) count++;
		}
		return count;
	}

	syncPortal() {
		if (!this.portalEl) return;
		preact.render(this.renderOverlay(), this.portalEl);
	}

	renderOverlay(): preact.VNode {
		const { steps } = this.props;
		const { stepIndex, spotlightRect } = this.state;
		const step = steps[stepIndex];
		if (!step) return <></>;

		const isFirst = stepIndex === 0;
		const isLast = !this.hasNext(stepIndex);
		const visNum = this.visibleIndexOf(stepIndex);
		const visTotal = this.countVisibleSteps();
		const cardStyle = computeCardStyle(spotlightRect);

		const spotlightStyle: CSSProp = spotlightRect ? {
			top: spotlightRect.top - PAD,
			left: spotlightRect.left - PAD,
			width: spotlightRect.width + PAD * 2,
			height: spotlightRect.height + PAD * 2,
			boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
		} : undefined as any;

		return <>
			<div class="nz-tutorial-backdrop" />
			{spotlightRect
				? <div class="nz-tutorial-spotlight" style={spotlightStyle} />
				: <div class="nz-tutorial-dim" />
			}
			<div class="nz-tutorial-card" style={cardStyle}>
				<div class="nz-tutorial-step-count">Step {visNum} of {visTotal}</div>
				<div class="nz-tutorial-title">{step.title}</div>
				<div class="nz-tutorial-body">{step.body}</div>
				<div class="nz-tutorial-actions">
					{!isFirst && (
						<button class="nz-btn nz-btn-secondary" onClick={this.prev}>← Prev</button>
					)}
					{isLast
						? <button class="nz-btn nz-btn-primary" onClick={this.skip}>Done</button>
						: <button class="nz-btn nz-btn-primary" onClick={this.next}>Next →</button>
					}
					{isFirst
						? <button class="nz-btn nz-btn-secondary nz-tutorial-skip" onClick={this.skip}>Skip Tutorial</button>
						: <button class="nz-btn nz-btn-secondary nz-tutorial-skip" onClick={this.skip}>✕ Skip</button>
					}
				</div>
			</div>
		</>;
	}

	override render(): preact.VNode | null {
		return null;
	}
}
