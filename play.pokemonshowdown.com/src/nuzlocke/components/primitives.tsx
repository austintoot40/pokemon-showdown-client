/**
 * Nuzlocke UI — Primitive Components
 *
 * Atomic UI elements: type badges, HP bar, badge, button, sprite.
 */

import preact from "../../../js/lib/preact";
import { Dex, toID } from "../../battle-dex";

export function NzTypeBadges({ species }: { species: string }) {
	const sp = Dex.species.get(species);
	return <>{sp.types.map(t =>
		<span key={t} class={`nz-type nz-type-${t.toLowerCase()}`}>{t}</span>
	)}</>;
}

export function NzHpBar({ current, max, label }: { current: number; max: number; label?: string }) {
	const pct = max > 0 ? Math.round((current / max) * 100) : 0;
	const stateClass = pct > 50 ? 'nz-hp-high' : pct > 20 ? 'nz-hp-mid' : 'nz-hp-low';
	return <div class={`nz-hp-bar ${stateClass}`}>
		{label && <div class="nz-hp-bar-meta"><span>{label}</span><span>{current}/{max}</span></div>}
		<div class="nz-hp-bar-track">
			<div class="nz-hp-bar-fill" style={`width:${pct}%`}></div>
		</div>
	</div>;
}

export function NzBadge({
	children,
	variant = 'muted',
}: {
	children: preact.ComponentChildren;
	variant?: 'active' | 'danger' | 'accent' | 'warning' | 'muted';
}) {
	return <span class={`nz-badge nz-badge-${variant}`}>{children}</span>;
}

export function NzBtn({
	children,
	onClick,
	disabled,
	variant = 'primary',
	size,
	title,
}: {
	children: preact.ComponentChildren;
	onClick?: () => void;
	disabled?: boolean;
	variant?: 'primary' | 'secondary' | 'danger' | 'evolve';
	size?: 'sm';
	title?: string;
}) {
	const cls = [
		'nz-btn',
		`nz-btn-${variant}`,
		size === 'sm' ? 'nz-btn-sm' : '',
	].filter(Boolean).join(' ');
	return <button class={cls} onClick={onClick} disabled={disabled} title={title}>{children}</button>;
}

export function NzSprite({ species, shiny, size = 60 }: { species: string; shiny?: boolean; size?: number }) {
	const id = toID(species);
	const src = `https://play.pokemonshowdown.com/sprites/gen5/${id}.png`;
	return <img
		class="nz-card-sprite"
		src={src}
		alt={species}
		style={`width:${size}px;height:${size}px;${shiny ? 'filter:hue-rotate(30deg) saturate(1.4)' : ''}`}
	/>;
}
