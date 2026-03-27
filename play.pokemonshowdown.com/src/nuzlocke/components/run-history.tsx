/**
 * Nuzlocke UI — Run History & Progress Components
 *
 * Battle result banner, segment progress chain, past run entry, active run widget.
 */

import preact from "../../../js/lib/preact";
import { toID } from "../../battle-dex";
import { NzBadge, NzBtn } from "./primitives";
import type { DeadPokemon } from "../types";

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
				{date} · {run.deathCount} death{run.deathCount !== 1 ? 's' : ''} · {run.ai ?? 'game-accurate'}
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
