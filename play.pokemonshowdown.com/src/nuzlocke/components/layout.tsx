/**
 * Nuzlocke UI — Layout & Structure Components
 *
 * Root wrapper, screen/section containers, panel variants.
 */

import preact from "../../../js/lib/preact";

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

export function NzLoadingScreen() {
	return (
		<NzRoot>
			<NzScreen>
				<div class="nz-loading-screen">
					<div class="nz-loading-timeline">
						{[0,1,2,3,4].map(i => (
							<div key={i} class="nz-loading-timeline-node">
								<div class="nz-loading-skel nz-loading-skel-pip" style={i === 2 ? 'opacity:1' : `opacity:${0.35 + i * 0.1}`} />
								{i < 4 && <div class="nz-loading-skel nz-loading-skel-connector" />}
							</div>
						))}
					</div>
					<div class="nz-loading-body">
						<div class="nz-loading-skel nz-loading-skel-title" />
						<div class="nz-loading-skel nz-loading-skel-meta" style="margin-top:6px;" />
						<div class="nz-loading-skel nz-loading-skel-bar" style="margin-top:20px;" />
						<div class="nz-loading-cards">
							{[0,1,2].map(i => (
								<div key={i} class="nz-loading-card">
									<div class="nz-loading-skel nz-loading-skel-sprite" />
									<div class="nz-loading-card-lines">
										<div class="nz-loading-skel nz-loading-skel-name" />
										<div class="nz-loading-skel nz-loading-skel-type" />
									</div>
								</div>
							))}
						</div>
					</div>
					<div class="nz-connecting-dots" style="margin-top:auto;padding-top:24px;">
						<span /><span /><span />
					</div>
				</div>
			</NzScreen>
		</NzRoot>
	);
}
