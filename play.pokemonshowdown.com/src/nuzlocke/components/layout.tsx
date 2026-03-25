/**
 * Nuzlocke UI — Layout & Structure Components
 *
 * Root wrapper, screen/section containers, panel variants.
 */

import preact from "../../../js/lib/preact";

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
