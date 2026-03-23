/**
 * Nuzlocke UI — Shared Component Library
 *
 * All reusable components for the Nuzlocke simulator UI.
 * Uses the .nz-* CSS classes from nuzlocke.css.
 * Import from panel-nuzlocke.tsx and panel-mainmenu.tsx.
 */

import preact from "../js/lib/preact";
import { Dex, toID } from "./battle-dex";

// ---------------------------------------------------------------------------
// Re-exported types (used by both panel files)
// ---------------------------------------------------------------------------

export interface OwnedPokemon {
	uid: string;
	species: string;
	baseSpecies: string;
	nickname: string;
	level: number;
	nature: string;
	ability: string;
	moves: string[];
	item: string;
	gender: string;
	shiny: boolean;
	caughtRoute: string;
	alive: boolean;
}

export interface DeadPokemon {
	uid: string;
	species: string;
	nickname: string;
	caughtRoute: string;
	killedBy: string;
	segment: string;
}

export interface LegalMove {
	name: string;
	fromTM: boolean;
}

export interface EvoOption {
	species: string;
	item: string | null;
	type: 'level' | 'trade' | 'item';
}

export interface TrainerPokemon {
	species: string;
	level: number;
	ability: string;
	moves: string[];
	item: string | null;
}

// ---------------------------------------------------------------------------
// Root wrapper — applies .nz-root to scope all CSS tokens
// ---------------------------------------------------------------------------

export function NzRoot({ children, class: cls }: { children?: preact.ComponentChildren; class?: string }) {
	return <div class={`nz-root${cls ? ` ${cls}` : ''}`}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Screen wrapper
// ---------------------------------------------------------------------------

export function NzScreen({ children }: { children?: preact.ComponentChildren }) {
	return <div class="nz-screen">{children}</div>;
}

// ---------------------------------------------------------------------------
// Screen header (title + metadata row)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Section with title bar
// ---------------------------------------------------------------------------

export function NzSection({ title, children }: { title: string; children?: preact.ComponentChildren }) {
	return <div class="nz-section">
		<div class="nz-section-title">{title}</div>
		{children}
	</div>;
}

// ---------------------------------------------------------------------------
// Panel variants
// ---------------------------------------------------------------------------

export function NzPanel({ children, class: cls }: { children?: preact.ComponentChildren; class?: string }) {
	return <div class={`nz-panel${cls ? ` ${cls}` : ''}`}>{children}</div>;
}

export function NzPanelFlat({ children, class: cls }: { children?: preact.ComponentChildren; class?: string }) {
	return <div class={`nz-panel-flat${cls ? ` ${cls}` : ''}`}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Type badges
// ---------------------------------------------------------------------------

export function NzTypeBadges({ species }: { species: string }) {
	const sp = Dex.species.get(species);
	return <>{sp.types.map(t =>
		<span key={t} class={`nz-type nz-type-${t.toLowerCase()}`}>{t}</span>
	)}</>;
}

// ---------------------------------------------------------------------------
// HP bar
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

export function NzBadge({
	children,
	variant = 'muted',
}: {
	children: preact.ComponentChildren;
	variant?: 'active' | 'danger' | 'accent' | 'warning' | 'muted';
}) {
	return <span class={`nz-badge nz-badge-${variant}`}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

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
	variant?: 'primary' | 'secondary' | 'danger';
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

// ---------------------------------------------------------------------------
// Pokemon sprite (with shiny indicator)
// ---------------------------------------------------------------------------

function NzSprite({ species, shiny, size = 60 }: { species: string; shiny?: boolean; size?: number }) {
	const id = toID(species);
	const src = `https://play.pokemonshowdown.com/sprites/gen5/${id}.png`;
	return <img
		class="nz-card-sprite"
		src={src}
		alt={species}
		style={`width:${size}px;height:${size}px;${shiny ? 'filter:hue-rotate(30deg) saturate(1.4)' : ''}`}
	/>;
}

// ---------------------------------------------------------------------------
// Pokemon card (party — full detail)
// ---------------------------------------------------------------------------

export function NzPokemonCard({
	pokemon,
	levelCap,
	actions,
}: {
	pokemon: OwnedPokemon;
	levelCap?: number;
	actions?: preact.ComponentChildren;
}) {
	const sp = Dex.species.get(pokemon.species);
	return <div class="nz-card">
		<NzSprite species={pokemon.species} shiny={pokemon.shiny} />
		<div class="nz-card-nickname">
			{pokemon.nickname}
			{pokemon.shiny && <span style="color:var(--nz-warning);margin-left:4px;">★</span>}
		</div>
		{pokemon.nickname !== pokemon.species && <div class="nz-card-species">{pokemon.species}</div>}
		<div class="nz-card-level">Lv. {levelCap ?? pokemon.level}</div>
		<div class="nz-card-types"><NzTypeBadges species={pokemon.species} /></div>
		<div class="nz-card-nature">{pokemon.nature} · {pokemon.ability}</div>
		{actions && <div class="nz-card-actions">{actions}</div>}
	</div>;
}

// ---------------------------------------------------------------------------
// Pokemon card (compact — box view)
// ---------------------------------------------------------------------------

export function NzBoxCard({
	pokemon,
	levelCap,
	actions,
}: {
	pokemon: OwnedPokemon;
	levelCap?: number;
	actions?: preact.ComponentChildren;
}) {
	return <div class="nz-card nz-card-compact">
		<NzSprite species={pokemon.species} shiny={pokemon.shiny} size={48} />
		<div class="nz-card-nickname">{pokemon.nickname}</div>
		{pokemon.nickname !== pokemon.species && <div class="nz-card-species">{pokemon.species}</div>}
		<div class="nz-card-level">Lv. {levelCap ?? pokemon.level}</div>
		<div class="nz-card-types"><NzTypeBadges species={pokemon.species} /></div>
		{actions && <div style="margin-top:6px;width:100%;">{actions}</div>}
	</div>;
}

// ---------------------------------------------------------------------------
// Graveyard card
// ---------------------------------------------------------------------------

export function NzGraveyardCard({
	dead,
	segmentName,
}: {
	dead: DeadPokemon;
	segmentName: string;
}) {
	return <div class="nz-card nz-card-dead nz-card-compact">
		<NzSprite species={dead.species} size={48} />
		<div class="nz-card-nickname">{dead.nickname}</div>
		{dead.nickname !== dead.species && <div class="nz-card-species">{dead.species}</div>}
		<div class="nz-card-killed-by">{dead.killedBy}</div>
		<div class="nz-card-died-in">{segmentName}</div>
	</div>;
}

// ---------------------------------------------------------------------------
// Opponent scouting card
// ---------------------------------------------------------------------------

export function NzOpponentCard({ pokemon }: { pokemon: TrainerPokemon }) {
	return <div class="nz-card nz-card-opponent">
		<NzSprite species={pokemon.species} size={56} />
		<div class="nz-card-nickname">{pokemon.species}</div>
		<div class="nz-card-level">Lv. {pokemon.level}</div>
		<div class="nz-card-types"><NzTypeBadges species={pokemon.species} /></div>
		<div class="nz-card-opponent nz-card-ability">{pokemon.ability}</div>
		{pokemon.item && <div class="nz-card-item" style="margin-top:2px;padding-top:0;border:none;">
			<span class="nz-card-item-label">{pokemon.item}</span>
		</div>}
		<div class="nz-card-opponent nz-card-move-list">{pokemon.moves.join(' · ')}</div>
	</div>;
}

// ---------------------------------------------------------------------------
// Starter card
// ---------------------------------------------------------------------------

export function NzStarterCard({
	species,
	selected,
	onSelect,
}: {
	species: string;
	selected: boolean;
	onSelect: () => void;
}) {
	const sp = Dex.species.get(species);
	const s = sp.baseStats;
	return <div
		class={`nz-starter-card${selected ? ' nz-starter-card-selected' : ''}`}
		onClick={onSelect}
	>
		<div class="nz-starter-sprite">
			<NzSprite species={species} size={96} />
		</div>
		<div class="nz-card-nickname" style="margin-top:8px;">{sp.name}</div>
		<div class="nz-card-types" style="justify-content:center;margin:4px 0;">
			<NzTypeBadges species={species} />
		</div>
		<div class="nz-starter-stats">
			<div class="nz-starter-stat">HP<span>{s.hp}</span></div>
			<div class="nz-starter-stat">Atk<span>{s.atk}</span></div>
			<div class="nz-starter-stat">Def<span>{s.def}</span></div>
			<div class="nz-starter-stat">SpA<span>{s.spa}</span></div>
			<div class="nz-starter-stat">SpD<span>{s.spd}</span></div>
			<div class="nz-starter-stat">Spe<span>{s.spe}</span></div>
		</div>
	</div>;
}

// ---------------------------------------------------------------------------
// Route card — unresolved
// ---------------------------------------------------------------------------

export function NzRouteCard({
	routeName,
	pool,
	dupeSpecies,
	allDupes,
	onExplore,
}: {
	routeName: string;
	pool: string[];
	dupeSpecies: Set<string>;
	allDupes: boolean;
	onExplore: () => void;
}) {
	const cols = Math.max(1, Math.ceil(pool.length / 2));
	return <div
		class={`nz-route-card${allDupes ? ' nz-route-card-dupe' : ' nz-route-card-clickable'}`}
		onClick={allDupes ? undefined : onExplore}
	>
		<div class="nz-route-name">{routeName}</div>
		<div class="nz-route-pool" style={`grid-template-columns: repeat(${cols}, 80px)`}>
			{pool.map(s => {
				const src = `https://play.pokemonshowdown.com/sprites/gen5/${toID(s)}.png`;
				const dupe = dupeSpecies.has(toID(s));
				return <img key={s} src={src} alt={s} style={dupe ? 'opacity:0.25' : ''} />;
			})}
		</div>
		{allDupes
			? <div class="nz-label">Duplicate clause</div>
			: <div class="nz-route-caught" aria-hidden style="visibility:hidden">_</div>
		}
	</div>;
}

// ---------------------------------------------------------------------------
// Route card — resolved (caught)
// ---------------------------------------------------------------------------

export class NzRouteCardCaught extends preact.Component<{
	pokemon: OwnedPokemon;
	pool?: string[];
	nickname?: string;
	onNickChange?: (uid: string, value: string) => void;
}, { editing: boolean }> {
	state = { editing: false };
	startEdit = () => this.setState({ editing: true });
	stopEdit = () => this.setState({ editing: false });
	override render() {
		const { pokemon, pool, nickname, onNickChange } = this.props;
		const { editing } = this.state;
		const displayName = nickname ?? pokemon.nickname;
		const cols = pool ? Math.max(1, Math.ceil(pool.length / 2)) : 1;
		return <div class="nz-route-card nz-route-card-resolved">
			<div class="nz-route-name">{pokemon.caughtRoute}</div>
			<div class="nz-route-pool" style={`grid-template-columns: repeat(${cols}, 80px)`}>
				{pool
					? pool.map(s => toID(s) === toID(pokemon.species)
						? <div key={s} class="nz-route-caught-aura">
							<NzSprite species={pokemon.species} shiny={pokemon.shiny} size={80} />
						</div>
						: <img key={s} src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(s)}.png`} alt={s} style="opacity:0.25" />
					)
					: <div class="nz-route-caught-aura">
						<NzSprite species={pokemon.species} shiny={pokemon.shiny} size={80} />
					</div>
				}
			</div>
			{onNickChange && editing
				? <input
					class="nz-route-caught nz-route-caught-input"
					type="text"
					value={displayName}
					maxlength={12}
					autoFocus
					onInput={(e) => onNickChange(pokemon.uid, (e.target as HTMLInputElement).value)}
					onBlur={this.stopEdit}
				/>
				: <div
					class={`nz-route-caught${onNickChange ? ' nz-route-caught-editable' : ''}`}
					onClick={onNickChange ? this.startEdit : undefined}
				>
					{displayName}
				</div>
			}
		</div>;
	}
}

// ---------------------------------------------------------------------------
// Battle result banner
// ---------------------------------------------------------------------------

export function NzBattleBanner({
	won,
	perfect,
	trainerName,
	deaths,
}: {
	won: boolean;
	perfect: boolean;
	trainerName: string;
	deaths: DeadPokemon[];
}) {
	const variant = perfect ? 'flawless' : won ? 'win' : 'loss';
	const title = perfect
		? '★ Flawless Victory'
		: won
			? `Victory — ${trainerName}`
			: `Defeated by ${trainerName}`;
	const sub = perfect
		? `You swept ${trainerName} without losing a single Pokémon.`
		: won
			? 'Objective complete. Advance to next segment.'
			: 'All units down. Run over.';

	return <div class={`nz-banner nz-banner-${variant}`}>
		<div class="nz-banner-title">{title}</div>
		<div class="nz-banner-sub">{sub}</div>
		{deaths.length > 0 && <div class="nz-banner-deaths">
			<div class="nz-banner-deaths-label">Units Lost ({deaths.length})</div>
			{deaths.map(d => {
				const src = `https://play.pokemonshowdown.com/sprites/gen5/${toID(d.species)}.png`;
				return <div key={d.uid} class="nz-death-entry">
					<img src={src} alt={d.species} />
					<span><strong>{d.nickname}</strong> — {d.killedBy}</span>
				</div>;
			})}
		</div>}
	</div>;
}

// ---------------------------------------------------------------------------
// Segment progress chain
// ---------------------------------------------------------------------------

export function NzProgress({
	segments,
	currentIndex,
}: {
	segments: string[];
	currentIndex: number;
}) {
	return <div class="nz-progress">
		{segments.map((name, i) => {
			const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'locked';
			const dot = state === 'done' ? '✓' : state === 'current' ? '▸' : String(i + 1);
			return <div key={i} class="nz-progress-node">
				<div class="nz-progress-pip">
					<div class={`nz-progress-dot ${state}`}>{dot}</div>
					<div class={`nz-progress-label ${state}`}>{name}</div>
				</div>
				{i < segments.length - 1 && <div class={`nz-progress-line ${state === 'done' ? 'done' : ''}`}></div>}
			</div>;
		})}
	</div>;
}

// ---------------------------------------------------------------------------
// Past run entry (collapsible)
// ---------------------------------------------------------------------------

export function NzRunEntry({
	run,
	segmentNames,
	expanded,
	onToggle,
}: {
	run: {
		id: string;
		scenarioName: string;
		outcome: 'victory' | 'wipe';
		date: string;
		deathCount: number;
		graveyard: DeadPokemon[];
		survivors: { species: string; nickname: string }[];
		finalBattle: string;
		ai: string;
	};
	segmentNames?: Record<string, string>;
	expanded: boolean;
	onToggle: () => void;
}) {
	const won = run.outcome === 'victory';
	const date = new Date(run.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	return <div class="nz-run-entry">
		<div class="nz-run-entry-header" onClick={onToggle}>
			<NzBadge variant={won ? 'active' : 'danger'}>{won ? 'Victory' : 'Wipe'}</NzBadge>
			<span class="nz-run-entry-name">{run.scenarioName}</span>
			<span class="nz-run-entry-meta">
				{date} · {run.deathCount} death{run.deathCount !== 1 ? 's' : ''} · {run.ai ?? 'random'}
				{run.finalBattle ? ` · ${run.finalBattle}` : ''}
			</span>
			<span class="nz-run-entry-chevron">{expanded ? '▲' : '▼'}</span>
		</div>
		{expanded && <div class="nz-run-entry-body">
			{run.survivors.length > 0 && <div style="margin-bottom:8px;">
				<div class="nz-label" style="margin-bottom:4px;">Survivors</div>
				<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;font-size:12px;color:var(--nz-text-muted);">
					{run.survivors.map((s, i) => {
						const src = `https://play.pokemonshowdown.com/sprites/gen5/${toID(s.species)}.png`;
						return <span key={i} style="display:flex;align-items:center;gap:3px;">
							<img src={src} alt={s.species} style="width:22px;height:22px;image-rendering:pixelated;object-fit:contain;" />
							{s.nickname !== s.species ? `${s.nickname} (${s.species})` : s.species}
						</span>;
					})}
				</div>
			</div>}
			{run.graveyard.length > 0 && <>
				<div class="nz-label" style="margin-bottom:4px;">Graveyard</div>
				<div class="nz-run-grave-chips">
					{run.graveyard.map(d => {
						const src = `https://play.pokemonshowdown.com/sprites/gen5/${toID(d.species)}.png`;
						const seg = segmentNames?.[d.segment] ?? d.segment;
						return <div key={d.uid} class="nz-run-grave-chip">
							<img src={src} alt={d.species} />
							{d.nickname} <em>· {seg}</em>
						</div>;
					})}
				</div>
			</>}
			{run.graveyard.length === 0 && won && <div class="nz-label nz-label-success">Deathless clear</div>}
		</div>}
	</div>;
}

// ---------------------------------------------------------------------------
// Active run widget (for main menu)
// ---------------------------------------------------------------------------

export function NzActiveRunWidget({
	scenarioName,
	segmentName,
	segmentIndex,
	totalSegments,
	deaths,
	partySpecies,
	onResume,
	onAbandon,
}: {
	scenarioName: string;
	segmentName: string;
	segmentIndex: number;
	totalSegments: number;
	deaths: number;
	partySpecies: string[];
	onResume: () => void;
	onAbandon: () => void;
}) {
	return <div class="nz-run-widget">
		<div class="nz-run-widget-header">
			<div>
				<div class="nz-run-widget-name">{scenarioName}</div>
				<div class="nz-run-widget-meta">
					{segmentName} · Segment {segmentIndex + 1}/{totalSegments}
				</div>
			</div>
			<NzBadge variant="active">Active</NzBadge>
		</div>
		<div class="nz-run-widget-party">
			{partySpecies.map(s => {
				const src = `https://play.pokemonshowdown.com/sprites/gen5/${toID(s)}.png`;
				return <img key={s} src={src} alt={s} />;
			})}
		</div>
		{deaths > 0 && <div class="nz-run-widget-deaths">
			{deaths} unit{deaths !== 1 ? 's' : ''} lost
		</div>}
		<div class="nz-btn-group">
			<NzBtn onClick={onResume} size="sm">Resume</NzBtn>
			<NzBtn onClick={onAbandon} variant="danger" size="sm">Abandon</NzBtn>
		</div>
	</div>;
}
