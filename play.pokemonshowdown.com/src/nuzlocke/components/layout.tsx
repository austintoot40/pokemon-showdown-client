/**
 * Nuzlocke UI — Layout & Structure Components
 *
 * Root wrapper, screen/section containers, panel variants.
 */

import preact from "../../../js/lib/preact";
import type { NuzlockePanelPayload } from "../types";

function nzToID(str: string): string {
	if (!str || typeof str !== 'string') return '';
	return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function NzRoot({ children, class: cls }: { children?: preact.ComponentChildren; class?: string }) {
	return <div class={`nz-root${cls ? ` ${cls}` : ''}`}>{children}</div>;
}

export function NzScreen({ children }: { children?: preact.ComponentChildren }) {
	return <div class="nz-screen">{children}</div>;
}

export function NzScreenHeader({
	title,
	meta,
}: {
	title: string;
	meta?: Array<{ label: string; value: string }>;
}) {
	return <div class="nz-screen-header">
		<div class="nz-screen-title">{title}</div>
		{meta && meta.length > 0 && <div class="nz-screen-meta">
			{meta.map((m, i) => <span key={i}>{m.label}: <strong style="color:var(--nz-text)">{m.value}</strong></span>)}
		</div>}
	</div>;
}

export function NzSection({ title, children }: { title: string; children?: preact.ComponentChildren }) {
	return <div class="nz-section">
		<div class="nz-section-title">{title}</div>
		{children}
	</div>;
}

export function NzPanel({ children, class: cls }: { children?: preact.ComponentChildren; class?: string }) {
	return <div class={`nz-panel${cls ? ` ${cls}` : ''}`}>{children}</div>;
}

export function NzPanelFlat({ children, class: cls }: { children?: preact.ComponentChildren; class?: string }) {
	return <div class={`nz-panel-flat${cls ? ` ${cls}` : ''}`}>{children}</div>;
}

// Compact timeline strip — replaces NzScreenHeader on game screens.
// Shows all segments as nodes; current node is auto-scrolled into view.
export class NzTimeline extends preact.Component<{ game: NuzlockePanelPayload }> {
	private stripRef: HTMLElement | null = null;

	override componentDidMount() { this.scrollToCurrent(); }
	override componentDidUpdate() { this.scrollToCurrent(); }

	scrollToCurrent() {
		const el = this.stripRef;
		if (!el) return;
		const cur = el.querySelector('.nz-timeline-node--current') as HTMLElement | null;
		if (cur) {
			const left = cur.offsetLeft;
			const w = cur.offsetWidth;
			el.scrollLeft = left - el.offsetWidth / 2 + w / 2;
		}
	}

	render() {
		const { game } = this.props;
		const summaries = game.segmentSummaries ?? [];

		// Mobile: show prev + current + next window
		const curIdx = summaries.findIndex(s => s.status === 'current');
		const windowStart = Math.max(0, curIdx - 1);
		const windowEnd = Math.min(summaries.length - 1, curIdx + 1);

		return <div class="nz-timeline-strip" ref={(el: HTMLElement | null) => { this.stripRef = el; }}>
			<div class="nz-timeline-nodes">
				{summaries.map((s, i) => {
					const isDone = s.status === 'completed';
					const isCurrent = s.status === 'current';
					const inWindow = i >= windowStart && i <= windowEnd;
					// On mobile (handled via CSS), only nodes in window are visible
					return <preact.Fragment key={s.id}>
						{i > 0 && <div class={`nz-timeline-line${isDone || (i <= curIdx) ? ' nz-timeline-line--done' : ''} nz-timeline-line--idx-${i}`} />}
						<div class={`nz-timeline-node nz-timeline-node--${s.status}${inWindow ? ' nz-timeline-in-window' : ''}`}>
							<div class={`nz-timeline-pip${isCurrent ? ' nz-timeline-pip--current' : isDone ? ' nz-timeline-pip--done' : ''}`}>
								{isCurrent ? '▶' : i + 1}
							</div>
							<div class="nz-timeline-label">{isCurrent ? s.name : ''}</div>
						</div>
					</preact.Fragment>;
				})}
			</div>
		</div>;
	}
}
