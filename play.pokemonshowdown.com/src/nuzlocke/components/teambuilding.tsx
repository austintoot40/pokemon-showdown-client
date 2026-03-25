/**
 * Nuzlocke UI — Teambuilding Components
 *
 * Stat bars, IV bars, move info, party slot, opponent slot.
 */

import preact from "../../../js/lib/preact";
import { Dex, toID } from "../../battle-dex";
import { NzTypeBadges } from "./primitives";
import type { OwnedPokemon, TrainerPokemon, StatsTable } from "../types";

export function NzStatBars({ species }: { species: string }) {
	const sp = Dex.species.get(species);
	const s = sp.baseStats;
	const MAX = 255;
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
			const tier = val >= 100 ? 'high' : val >= 70 ? 'mid' : val >= 50 ? 'low' : 'poor';
			return <div key={key} class="nz-stat-row">
				<div class="nz-stat-label">{label}</div>
				<div class="nz-stat-bar-track">
					<div class={`nz-stat-bar-fill nz-stat-${tier}`} style={`width:${pct}%`} />
				</div>
				<div class="nz-stat-value">{val}</div>
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
			const tier = val >= 28 ? 'high' : val >= 20 ? 'mid' : val >= 10 ? 'low' : 'poor';
			return <div key={key} class="nz-stat-row">
				<div class="nz-stat-label">{label}</div>
				<div class="nz-stat-bar-track">
					<div class={`nz-stat-bar-fill nz-stat-${tier}`} style={`width:${pct}%`} />
				</div>
				<div class="nz-stat-value">{val}</div>
			</div>;
		})}
	</div>;
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
				{pokemon.shiny && <span style="color:var(--nz-warning);margin-left:3px;">★</span>}
			</div>
			<div class="nz-party-slot-sub">
				{pokemon.nickname !== pokemon.species ? `${pokemon.species} · ` : ''}Lv.{levelCap}
			</div>
			<div class="nz-party-slot-types"><NzTypeBadges species={pokemon.species} /></div>
		</div>
		<div class="nz-party-slot-arrows" onClick={e => e.stopPropagation()}>
			<button class="nz-party-arrow" onClick={onMoveUp} disabled={isFirst}>▲</button>
			<button class="nz-party-arrow" onClick={onMoveDown} disabled={isLast}>▼</button>
		</div>
	</div>;
}

export function NzOpponentSlot({
	pokemon,
	selected,
	onSelect,
}: {
	pokemon: TrainerPokemon;
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
			<div class="nz-party-slot-types"><NzTypeBadges species={pokemon.species} /></div>
		</div>
	</div>;
}
