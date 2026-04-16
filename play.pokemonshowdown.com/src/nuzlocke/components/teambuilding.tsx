/**
 * Nuzlocke UI — Teambuilding Components
 *
 * Stat bars, IV bars, move info, party slot, opponent slot.
 */

import preact from "../../../js/lib/preact";
import { Dex, toID } from "../../battle-dex";
import { BattleNatures } from "../../battle-dex-data";
import { NzTypeBadges } from "./primitives";
import type { OwnedPokemon, TrainerPokemon, StatsTable } from "../types";

// ---------------------------------------------------------------------------
// Stat view preference
// ---------------------------------------------------------------------------

const STAT_VIEW_KEY = 'nuzlocke_stat_view';

function getStatViewPref(): boolean {
	try { return localStorage.getItem(STAT_VIEW_KEY) === 'radar'; } catch { return false; }
}

function setStatViewPref(radar: boolean): void {
	try { localStorage.setItem(STAT_VIEW_KEY, radar ? 'radar' : 'bars'); } catch {}
	window.dispatchEvent(new CustomEvent('nzstatview'));
}

// ---------------------------------------------------------------------------
// Shared radar geometry constants
// ---------------------------------------------------------------------------

const CX = 80, CY = 80, MAX_R = 54, LABEL_R = 67;
const STAT_LABELS = ['HP', 'Atk', 'Def', 'Spe', 'SpD', 'SpA'];
const STAT_KEYS_ORDERED = ['hp', 'atk', 'def', 'spe', 'spd', 'spa'];

// CSS `d` path string for <path> elements — animatable via CSS transition: d
function radarPathD(vals: number[], max: number): string {
	const pts = vals.map((v, i) => {
		const a = -Math.PI / 2 + i * (2 * Math.PI / 6);
		const r = (v / max) * MAX_R;
		return `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
	});
	return `M ${pts.join(' L ')} Z`;
}

function gridPoly(frac: number): string {
	return STAT_KEYS_ORDERED.map((_, i) => {
		const a = -Math.PI / 2 + i * (2 * Math.PI / 6);
		const r = frac * MAX_R;
		return `${(CX + r * Math.cos(a)).toFixed(2)},${(CY + r * Math.sin(a)).toFixed(2)}`;
	}).join(' ');
}

// ---------------------------------------------------------------------------
// Bar variants (internal)
// ---------------------------------------------------------------------------

function StatBarsInner({ species, nature, generation }: { species: string; nature?: string; generation?: number }) {
	const sp = (generation ? Dex.forGen(generation) : Dex).species.get(species);
	const s = sp.baseStats;
	const MAX = 255;
	const nat = nature ? (BattleNatures[nature as keyof typeof BattleNatures] ?? {}) : {};
	const boosted = (nat as any).plus as string | undefined;
	const reduced = (nat as any).minus as string | undefined;
	const stats: Array<{ label: string; key: keyof typeof s }> = [
		{ label: 'HP',  key: 'hp'  },
		{ label: 'Atk', key: 'atk' },
		{ label: 'Def', key: 'def' },
		{ label: 'SpA', key: 'spa' },
		{ label: 'SpD', key: 'spd' },
		{ label: 'Spe', key: 'spe' },
	];
	return <div class="nz-stat-bars">
		{stats.map(({ label, key }) => {
			const val = s[key];
			const pct = Math.round((val / MAX) * 100);
			const hue = Math.min(Math.floor(val * 120 / MAX), 120);
			const mod = key === boosted ? ' nz-stat-nature-up' : key === reduced ? ' nz-stat-nature-down' : '';
			return <div key={key} class="nz-stat-row">
				<div class={`nz-stat-label${mod}`}>{label}</div>
				<div class="nz-stat-bar-track">
					<div class="nz-stat-bar-fill" style={`width:${pct}%;background:hsl(${hue},85%,45%);box-shadow:0 0 4px hsla(${hue},85%,45%,0.4)`} />
				</div>
				<div class={`nz-stat-value${mod}`}>{val}</div>
			</div>;
		})}
	</div>;
}

export function NzIvBars({ ivs }: { ivs: StatsTable }) {
	const MAX = 31;
	const stats: Array<{ label: string; key: keyof StatsTable }> = [
		{ label: 'HP',  key: 'hp'  },
		{ label: 'Atk', key: 'atk' },
		{ label: 'Def', key: 'def' },
		{ label: 'SpA', key: 'spa' },
		{ label: 'SpD', key: 'spd' },
		{ label: 'Spe', key: 'spe' },
	];
	return <div class="nz-stat-bars">
		{stats.map(({ label, key }) => {
			const val = ivs[key];
			const pct = Math.round((val / MAX) * 100);
			const hue = Math.min(Math.floor(val * 120 / MAX), 120);
			return <div key={key} class="nz-stat-row">
				<div class="nz-stat-label">{label}</div>
				<div class="nz-stat-bar-track">
					<div class="nz-stat-bar-fill" style={`width:${pct}%;background:hsl(${hue},85%,45%);box-shadow:0 0 4px hsla(${hue},85%,45%,0.4)`} />
				</div>
				<div class="nz-stat-value">{val}</div>
			</div>;
		})}
	</div>;
}

// ---------------------------------------------------------------------------
// Radar variants (internal)
// ---------------------------------------------------------------------------

function StatRadarInner({ species, nature, generation }: { species: string; nature?: string; generation?: number }) {
	const sp = (generation ? Dex.forGen(generation) : Dex).species.get(species);
	const s = sp.baseStats;
	const nat = nature ? (BattleNatures[nature as keyof typeof BattleNatures] ?? {}) : {};
	const boosted = (nat as any).plus as string | undefined;
	const reduced = (nat as any).minus as string | undefined;
	const vals = STAT_KEYS_ORDERED.map(k => s[k as keyof typeof s]);
	const pathD = radarPathD(vals, 255);
	return <svg class="nz-stat-radar" viewBox="0 0 160 160">
		{[0.25, 0.5, 0.75, 1].map(f =>
			<polygon key={f} points={gridPoly(f)} class="nz-radar-grid" />
		)}
		{STAT_KEYS_ORDERED.map((_, i) => {
			const a = -Math.PI / 2 + i * (2 * Math.PI / 6);
			return <line key={i} x1={CX} y1={CY}
				x2={(CX + MAX_R * Math.cos(a)).toFixed(2)}
				y2={(CY + MAX_R * Math.sin(a)).toFixed(2)}
				class="nz-radar-axis" />;
		})}
		<path style={`d:path("${pathD}")`} class="nz-radar-fill" />
		<path style={`d:path("${pathD}")`} class="nz-radar-stroke" />
		{vals.map((v, i) => {
			const a = -Math.PI / 2 + i * (2 * Math.PI / 6);
			const r = (v / 255) * MAX_R;
			return <circle key={i}
				cx={(CX + r * Math.cos(a)).toFixed(2)}
				cy={(CY + r * Math.sin(a)).toFixed(2)}
				r="2.5" class="nz-radar-dot" />;
		})}
		{STAT_LABELS.map((label, i) => {
			const key = STAT_KEYS_ORDERED[i];
			const a = -Math.PI / 2 + i * (2 * Math.PI / 6);
			const x = CX + LABEL_R * Math.cos(a);
			const y = CY + LABEL_R * Math.sin(a);
			const anchor = Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle';
			const dy = Math.sin(a) < -0.3 ? '-0.3em' : Math.sin(a) > 0.3 ? '0.3em' : '0';
			const mod = key === boosted ? ' nz-stat-nature-up' : key === reduced ? ' nz-stat-nature-down' : '';
			return <text key={i}
				x={x.toFixed(2)} y={y.toFixed(2)}
				text-anchor={anchor} dominant-baseline="middle" dy={dy}
				class={`nz-radar-label${mod}`}>{label}</text>;
		})}
	</svg>;
}

function IvRadarInner({ ivs }: { ivs: StatsTable }) {
	const vals = STAT_KEYS_ORDERED.map(k => ivs[k as keyof StatsTable]);
	const pathD = radarPathD(vals, 31);
	return <svg class="nz-stat-radar" viewBox="0 0 160 160">
		{[0.25, 0.5, 0.75, 1].map(f =>
			<polygon key={f} points={gridPoly(f)} class="nz-radar-grid" />
		)}
		{STAT_KEYS_ORDERED.map((_, i) => {
			const a = -Math.PI / 2 + i * (2 * Math.PI / 6);
			return <line key={i} x1={CX} y1={CY}
				x2={(CX + MAX_R * Math.cos(a)).toFixed(2)}
				y2={(CY + MAX_R * Math.sin(a)).toFixed(2)}
				class="nz-radar-axis" />;
		})}
		<path style={`d:path("${pathD}")`} class="nz-radar-fill" />
		<path style={`d:path("${pathD}")`} class="nz-radar-stroke" />
		{vals.map((v, i) => {
			const a = -Math.PI / 2 + i * (2 * Math.PI / 6);
			const r = (v / 31) * MAX_R;
			return <circle key={i}
				cx={(CX + r * Math.cos(a)).toFixed(2)}
				cy={(CY + r * Math.sin(a)).toFixed(2)}
				r="2.5" class="nz-radar-dot" />;
		})}
		{STAT_LABELS.map((label, i) => {
			const a = -Math.PI / 2 + i * (2 * Math.PI / 6);
			const x = CX + LABEL_R * Math.cos(a);
			const y = CY + LABEL_R * Math.sin(a);
			const anchor = Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle';
			const dy = Math.sin(a) < -0.3 ? '-0.3em' : Math.sin(a) > 0.3 ? '0.3em' : '0';
			return <text key={i}
				x={x.toFixed(2)} y={y.toFixed(2)}
				text-anchor={anchor} dominant-baseline="middle" dy={dy}
				class="nz-radar-label">{label}</text>;
		})}
	</svg>;
}

// ---------------------------------------------------------------------------
// NzStatPair — combined Base + IVs view with toggle
//
// Bars mode: two-column split grid (same as the old nz-stat-split).
// Radar mode: two radar charts side by side in a flex row.
// The toggle lives here; all instances sync via the nzstatview window event.
// ---------------------------------------------------------------------------

export class NzStatPair extends preact.Component<{
	species: string;
	nature?: string;
	generation?: number;
	ivs?: StatsTable;
	ivsExtra?: preact.ComponentChildren;
}, { radar: boolean }> {
	override state = { radar: getStatViewPref() };
	_onSync = () => this.setState({ radar: getStatViewPref() });
	override componentDidMount() { window.addEventListener('nzstatview', this._onSync); }
	override componentWillUnmount() { window.removeEventListener('nzstatview', this._onSync); }
	toggle = () => setStatViewPref(!this.state.radar);

	render() {
		const { radar } = this.state;
		const { species, nature, generation, ivs, ivsExtra } = this.props;

		const ivsLabel = <div class="nz-label" style="margin-bottom:4px;display:flex;align-items:center;gap:6px">
			IVs {ivsExtra}
		</div>;

		if (radar) {
			return <div class="nz-stat-view">
				<button class="nz-stat-view-toggle" onClick={this.toggle}>≡ Bars</button>
				<div class="nz-stat-radar-row">
					<div class="nz-stat-radar-col">
						<div class="nz-label" style="margin-bottom:4px">Base</div>
						<StatRadarInner species={species} nature={nature} generation={generation} />
					</div>
					{ivs && <div class="nz-stat-radar-col">
						{ivsLabel}
						<IvRadarInner ivs={ivs} />
					</div>}
				</div>
			</div>;
		}

		return <div class="nz-stat-view">
			<button class="nz-stat-view-toggle" onClick={this.toggle}>⬡ Radar</button>
			<div class="nz-stat-split">
				<div>
					<div class="nz-label" style="margin-bottom:4px">Base</div>
					<StatBarsInner species={species} nature={nature} generation={generation} />
				</div>
				<div>
					{ivsLabel}
					{ivs
						? <NzIvBars ivs={ivs} />
						: <div class="nz-stat-no-ivs">Enemy Pokémon don't have IVs.</div>
					}
				</div>
			</div>
		</div>;
	}
}

export function NzMoveInfo({ moveId }: { moveId: string }) {
	if (!moveId) return null;
	const move = Dex.moves.get(moveId);
	if (!move.exists) return null;
	const catLabel = move.category === 'Physical' ? 'Phys' : move.category === 'Special' ? 'Spec' : 'Status';
	const power = move.basePower > 0 ? `${move.basePower} BP` : '—';
	const acc = move.accuracy === true ? '—' : `${move.accuracy}%`;
	return <div>
		<div class="nz-move-info">
			<span class={`nz-type nz-type-${move.type.toLowerCase()}`}>{move.type}</span>
			<span class={`nz-move-cat nz-move-cat-${move.category.toLowerCase()}`}>{catLabel}</span>
			<span class="nz-move-stat">{power}</span>
			<span class="nz-move-stat">{acc}</span>
		</div>
		{move.shortDesc && <div class="nz-item-desc">{move.shortDesc}</div>}
	</div>;
}

export function NzPartySlot({
	pokemon,
	levelCap,
	generation,
	selected,
	isFirst,
	isLast,
	onSelect,
	onDoubleClick,
	onMoveUp,
	onMoveDown,
	hasError,
	canEvolve,
}: {
	pokemon: OwnedPokemon;
	levelCap: number;
	generation?: number;
	selected: boolean;
	isFirst: boolean;
	isLast: boolean;
	onSelect: () => void;
	onDoubleClick?: () => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	hasError?: boolean;
	canEvolve?: boolean;
}) {
	const cls = [
		'nz-party-slot',
		selected ? 'nz-party-slot-selected' : '',
		hasError ? 'nz-party-slot-error' : '',
		canEvolve ? 'nz-party-slot-evolve' : '',
	].filter(Boolean).join(' ');
	return <div class={cls} onClick={onSelect} onDblClick={onDoubleClick}>
		<img
			src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(pokemon.species)}.png`}
			alt={pokemon.species}
		/>
		<div class="nz-party-slot-info">
			<div class="nz-party-slot-name">
				{pokemon.nickname}
			</div>
			<div class="nz-party-slot-sub">
				{pokemon.nickname !== pokemon.species ? `${pokemon.species} · ` : ''}Lv.{levelCap}
			</div>
			<div class="nz-party-slot-types"><NzTypeBadges species={pokemon.species} generation={generation} /></div>
		</div>
		<div class="nz-party-slot-arrows" onClick={e => e.stopPropagation()}>
			<button class="nz-party-arrow" onClick={onMoveUp} disabled={isFirst}>▲</button>
			<button class="nz-party-arrow" onClick={onMoveDown} disabled={isLast}>▼</button>
		</div>
	</div>;
}

export function NzOpponentSlot({
	pokemon,
	generation,
	selected,
	onSelect,
}: {
	pokemon: TrainerPokemon;
	generation?: number;
	selected: boolean;
	onSelect: () => void;
}) {
	const cls = [
		'nz-opponent-slot',
		selected ? 'nz-opponent-slot-selected' : '',
	].filter(Boolean).join(' ');
	return <div class={cls} onClick={onSelect}>
		<img
			src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(pokemon.species)}.png`}
			alt={pokemon.species}
		/>
		<div class="nz-party-slot-info">
			<div class="nz-party-slot-name">{pokemon.species}</div>
			<div class="nz-party-slot-sub">Lv. {pokemon.level}</div>
			<div class="nz-party-slot-types"><NzTypeBadges species={pokemon.species} generation={generation} /></div>
		</div>
	</div>;
}
