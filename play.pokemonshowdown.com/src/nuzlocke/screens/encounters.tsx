/**
 * Nuzlocke — Encounters Screen
 *
 * Split-panel layout: left = scrollable route list, right = sticky detail panel.
 * Routes with multiple encounter methods show side-by-side pool cards in the detail panel.
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { toID, Dex } from "../../battle-dex";
import { BattleNatures } from "../../battle-dex-data";
import { NzScreen, NzScreenHeader } from "../components/layout";
import { NzBtn, NzTypeBadges } from "../components/primitives";
import { NzStatPair } from "../components/teambuilding";
import type { NuzlockePanelPayload, RouteEncounter, ZoneEncounter, StatsTable } from "../types";


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasZonePrereq(zone: ZoneEncounter, tmMoves: string[], items: string[], ownedSpecies: string[], completedBattles: string[]): boolean {
	const prereq = zone.requires;
	if (!prereq) return true;
	if (prereq.type === 'hm' || prereq.type === 'move') return tmMoves.includes(prereq.name);
	if (prereq.type === 'pokemon') return ownedSpecies.includes(toID(prereq.name));
	if (prereq.type === 'battle') return completedBattles.includes(prereq.name);
	return items.includes(prereq.name);
}

/** Human-readable label for a zone prerequisite. */
function prereqLabel(zone: ZoneEncounter): string | null {
	if (zone.requires?.type === 'pokemon') return `own ${zone.requires.name}`;
	const prereq = zone.requires;
	return prereq ? prereq.name : null;
}

export function calcIvScore(ivs: StatsTable, baseStats: { [k: string]: number }): number {
	const keys: Array<keyof StatsTable> = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
	let weighted = 0;
	let maxWeighted = 0;
	for (const key of keys) {
		weighted += ivs[key] * (baseStats[key] ?? 0);
		maxWeighted += 31 * (baseStats[key] ?? 0);
	}
	return maxWeighted > 0 ? weighted / maxWeighted : 0;
}

export function calcNatureQuality(
	nature: { plus?: string; minus?: string },
	baseStats: { [k: string]: number }
): 'good' | 'neutral' | 'bad' {
	const plus = nature.plus;
	const minus = nature.minus;
	if (!plus || !minus) return 'neutral';
	const boostBase = baseStats[plus] ?? 0;
	const penaltyBase = baseStats[minus] ?? 0;
	if (boostBase >= penaltyBase) return 'good';
	return 'bad';
}

// Abramowitz & Stegun approximation, accurate to ~7 decimal places.
function normalCDF(z: number): number {
	if (z < -8) return 0;
	if (z > 8) return 1;
	const t = 1 / (1 + 0.2316419 * Math.abs(z));
	const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
	const pdf = Math.exp(-0.5 * z * z) / 2.5066282746; // sqrt(2π)
	const p = 1 - pdf * poly;
	return z >= 0 ? p : 1 - p;
}

// Returns the fraction of random rolls at least as good as this pokemon (IVs + nature combined).
// Returns null if not in the top 5%.
export function calcCombinedPercentile(
	ivScore: number,
	natureQuality: 'good' | 'neutral' | 'bad',
	baseStats: { [k: string]: number }
): number | null {
	const keys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
	const weights = keys.map(k => baseStats[k] ?? 0);
	const sumW = weights.reduce((a, b) => a + b, 0);
	if (sumW === 0) return null;

	// Variance of a single IV normalized to [0,1]: Var(uniform 0-31) / 31^2
	const varIvNorm = 1023 / (12 * 31 * 31);
	const sumW2 = weights.reduce((s, w) => s + w * w, 0);
	const stdDev = Math.sqrt(varIvNorm * sumW2) / sumW;

	const pIv = 1 - normalCDF((ivScore - 0.5) / stdDev);

	// Count non-neutral natures that are "good" for this species
	let goodNatures = 0;
	for (const nat of Object.values(BattleNatures)) {
		const n = nat as { plus?: string; minus?: string };
		if (!n.plus || !n.minus) continue;
		if ((baseStats[n.plus] ?? 0) >= (baseStats[n.minus] ?? 0)) goodNatures++;
	}

	const pNature = natureQuality === 'good' ? goodNatures / 25
		: natureQuality === 'neutral' ? (goodNatures + 5) / 25
		: 1;

	return pIv * pNature;
}

function formatTopPct(p: number): string {
	const pct = p * 100;
	return pct < 1 ? `${pct.toFixed(1)}%` : `${Math.round(pct)}%`;
}

function getEvoRoot(speciesName: string, generation?: number): string {
	const dex = generation ? Dex.forGen(generation) : Dex;
	let species = dex.species.get(speciesName);
	while (species.prevo) {
		species = dex.species.get(species.prevo);
	}
	return species.id;
}

function cls(...parts: (string | false | null | undefined)[]): string {
	return (parts.filter(Boolean) as string[]).join(' ');
}


// ---------------------------------------------------------------------------
// Zone card base — shared wrapper for all three zone types
// ---------------------------------------------------------------------------

function ZoneCardBase({
	zone,
	accessible,
	allDupes = false,
	resolvedElsewhere = false,
	selectable = false,
	onClick,
	children,
}: {
	zone: ZoneEncounter;
	accessible: boolean;
	allDupes?: boolean;
	resolvedElsewhere?: boolean;
	selectable?: boolean;
	onClick?: () => void;
	children: preact.ComponentChildren;
}) {
	const locked = !accessible;
	const req = locked ? prereqLabel(zone) : null;
	const zoneLabel = zone.zone || zone.method;
	const showMethodSeparate = zone.zone && zone.zone !== zone.method && zone.method !== 'Standard';

	return <div
		class={cls(
			'nz-zone-card',
			locked && 'nz-zone-card-locked',
			(allDupes || resolvedElsewhere) && 'nz-zone-card-dupe',
			selectable && 'nz-zone-card-selectable',
		)}
		onClick={onClick}
	>
		<div class="nz-zone-label">
			{zoneLabel}
			{showMethodSeparate && <span class="nz-zone-method">{zone.method}</span>}

			{locked && req && <span class="nz-zone-prereq-label">Requires {req}</span>}
		</div>
		{children}
	</div>;
}


// ---------------------------------------------------------------------------
// Zone card types
// ---------------------------------------------------------------------------

/** Wild encounter zone — shows encounter rates, click rolls the encounter. */
function StandardZoneCard({
	zone,
	routeName,
	zoneIndex,
	accessible,
	ownedRoots,
	caughtSpecies,
}: {
	zone: ZoneEncounter;
	routeName: string;
	zoneIndex: number;
	accessible: boolean;
	ownedRoots: Set<string>;
	caughtSpecies?: string;
}) {
	const resolved = caughtSpecies !== undefined;
	const allDupes = accessible && !resolved && zone.pokemon.every(e => ownedRoots.has(getEvoRoot(e.species)));
	const dupeSet = new Set(
		zone.pokemon
			.filter(e => ownedRoots.has(getEvoRoot(e.species)) && !(resolved && toID(e.species) === toID(caughtSpecies ?? '')))
			.map(e => toID(e.species))
	);
	const totalRate = zone.pokemon.reduce((sum, e) => sum + e.rate, 0);
	const activeTotal = zone.pokemon.filter(e => !dupeSet.has(toID(e.species))).reduce((sum, e) => sum + e.rate, 0);
	const clickable = accessible && !resolved && !allDupes;

	return <ZoneCardBase
		zone={zone}
		accessible={accessible}
		allDupes={allDupes}
		selectable={clickable}
		onClick={clickable ? () => PS.send(`/nuzlocke encounter ${routeName} ${zoneIndex}`) : undefined}
	>
		<div class="nz-route-pool">
			{[...zone.pokemon].sort((a, b) => b.rate - a.rate).map(e => {
				const dupe = accessible && dupeSet.has(toID(e.species));
				const isCaught = resolved && toID(e.species) === toID(caughtSpecies!);
				const pct = !accessible ? Math.round(e.rate / (totalRate || 1) * 100)
					: dupe || activeTotal === 0 ? 0 : Math.round(e.rate / activeTotal * 100);
				return <div key={e.species} class={cls(
					'nz-encounter-slot',
					dupe && 'nz-encounter-slot-dupe',
					resolved && !isCaught && 'nz-encounter-slot-dimmed',
					isCaught && 'nz-encounter-slot-caught',
				)}>
					<img src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(e.species)}.png`} alt={e.species} />
					<div class="nz-encounter-rate-bar">
						<div class="nz-encounter-rate-fill" style={`width:${pct}%`} />
					</div>
					<div class="nz-encounter-rate-label">{dupe ? 'dupe' : `${pct}%`}</div>
				</div>;
			})}
		</div>
	</ZoneCardBase>;
}

/**
 * Gift zone — shows each pokemon as a selectable thumbnail.
 * Single-pokemon gifts show one option; multi-pokemon gifts show all choices.
 * Owns its resolved state: caught pokemon glows, others dim.
 */
function GiftZoneCard({
	zone,
	routeName,
	zoneIndex,
	accessible,
	ownedRoots,
	caughtSpecies,
}: {
	zone: ZoneEncounter;
	routeName: string;
	zoneIndex: number;
	accessible: boolean;
	ownedRoots: Set<string>;
	caughtSpecies?: string;
}) {
	const resolvedElsewhere = caughtSpecies === '';
	const caughtHere = caughtSpecies !== undefined && caughtSpecies !== '';
	const resolved = caughtSpecies !== undefined;
	const allDupes = accessible && !resolved && zone.pokemon.every(e => ownedRoots.has(getEvoRoot(e.species)));
	const isMulti = zone.pokemon.length > 1;

	return <ZoneCardBase
		zone={zone}
		accessible={accessible}
		allDupes={allDupes}
		resolvedElsewhere={resolvedElsewhere}
	>
		<div class="nz-gift-zone-options">
			{zone.pokemon.map(e => {
				const isCaught = caughtHere && toID(e.species) === toID(caughtSpecies!);
				const isDupe = accessible && !isCaught && ownedRoots.has(getEvoRoot(e.species));
				const clickable = accessible && !resolvedElsewhere && !caughtHere && !isDupe;
				const dimmed = (caughtHere && !isCaught) || resolvedElsewhere;
				const sendCmd = isMulti
					? () => PS.send(`/nuzlocke encounterchoice ${routeName} ${zoneIndex} ${toID(e.species)}`)
					: () => PS.send(`/nuzlocke encounter ${routeName} ${zoneIndex}`);
				return <div
					key={e.species}
					class={cls(
						'nz-gift-zone-option',
						isDupe && 'nz-gift-zone-option-dupe',
						isCaught && 'nz-gift-zone-option-caught',
						dimmed && !isDupe && 'nz-gift-zone-option-dimmed',
						clickable && 'nz-gift-zone-option-selectable',
					)}
					onClick={clickable ? sendCmd : undefined}
				>
					<img src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(e.species)}.png`} alt={e.species} />
				</div>;
			})}
		</div>
	</ZoneCardBase>;
}

/**
 * Trade zone — shows the required pokemon → new pokemon exchange.
 * Disabled until the player owns the required species.
 * When resolved, the traded-away pokemon dims and the received pokemon glows.
 */
function TradeZoneCard({
	zone,
	routeName,
	zoneIndex,
	accessible,
	ownedRoots,
	caughtSpecies,
}: {
	zone: ZoneEncounter;
	routeName: string;
	zoneIndex: number;
	accessible: boolean;
	ownedRoots: Set<string>;
	caughtSpecies?: string;
}) {
	const newPokemon = zone.pokemon[0];
	const requiredName = zone.requires?.type === 'pokemon' ? zone.requires.name : null;
	const resolved = caughtSpecies !== undefined;
	const caughtHere = resolved && caughtSpecies !== '';
	const resolvedElsewhere = caughtSpecies === '';
	const isDupe = accessible && !resolved && !!newPokemon && ownedRoots.has(getEvoRoot(newPokemon.species));
	const clickable = accessible && !resolved && !isDupe;

	return <ZoneCardBase
		zone={zone}
		accessible={accessible || resolved}
		allDupes={isDupe}
		resolvedElsewhere={resolvedElsewhere}
		selectable={clickable}
		onClick={clickable ? () => PS.send(`/nuzlocke encounter ${routeName} ${zoneIndex}`) : undefined}
	>
		<div class="nz-trade-zone-row">
			{requiredName && <>
				<div class={cls('nz-trade-zone-pokemon', caughtHere && 'nz-trade-zone-pokemon-traded')}>
					<img src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(requiredName)}.png`} alt={requiredName} />
				</div>
				<div class="nz-trade-zone-arrow">→</div>
			</>}
			{newPokemon && (
				<div class={cls('nz-trade-zone-pokemon', caughtHere && 'nz-trade-zone-pokemon-received')}>
					<img src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(newPokemon.species)}.png`} alt={newPokemon.species} />
				</div>
			)}
		</div>
	</ZoneCardBase>;
}


// ---------------------------------------------------------------------------
// Route list item — unified for encounter and gift routes
// ---------------------------------------------------------------------------

interface RouteListItemProps {
	enc: RouteEncounter;
	isSelected: boolean;
	isResolved: boolean;
	isDeferred: boolean;
	statusSymbol: string;
	sprites: { species: string; isDupe: boolean; isCaught: boolean }[];
	onSelect: () => void;
}

function RouteListItem({
	enc, isSelected, isResolved, isDeferred, statusSymbol, sprites, onSelect,
}: RouteListItemProps) {
	return <div
		class={cls(
			'nz-route-list-row',
			isSelected && 'selected',
			isResolved && 'resolved',
		)}
		onClick={onSelect}
	>
		<div class="nz-route-list-row-top">
			<span class={cls(
				'nz-route-list-status',
				isDeferred && 'nz-route-status-deferred',
			)}>
				{statusSymbol}
			</span>
			<span class="nz-route-list-name">{enc.route}</span>
			{isDeferred && <span class="nz-route-deferred-badge">Deferred</span>}
		</div>
		{sprites.length > 0 && (
			<div class="nz-route-list-sprites">
				<div class="nz-route-sprite-group">
					{sprites.map(({ species, isDupe, isCaught }) => (
						<img
							key={toID(species)}
							class={cls(
								'nz-route-sprite',
								isDupe && !isCaught && 'nz-route-sprite-dupe',
								isCaught && 'nz-route-sprite-caught',
							)}
							src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(species)}.png`}
							alt={species}
							title={species}
						/>
					))}
				</div>
			</div>
		)}
	</div>;
}


// ---------------------------------------------------------------------------
// Gift choice picker — route-level choice gift (segment.gifts[] with choice: true)
// ---------------------------------------------------------------------------

function GiftChoicePicker({
	gift,
	giftIndex,
	ownedRoots,
	generation,
}: {
	gift: RouteEncounter;
	giftIndex: number;
	ownedRoots: Set<string>;
	generation: number;
}) {
	const allPokemon = gift.zones.flatMap(z => z.pokemon);

	return <div class="nz-zone-card">
		<div class="nz-zone-label">{gift.route}</div>
		<div class="nz-gift-zone-options">
			{allPokemon.map(e => {
				const isDupe = ownedRoots.has(getEvoRoot(e.species, generation));
				return <div
					key={e.species}
					class={cls('nz-gift-zone-option', 'nz-gift-zone-option-selectable', isDupe && 'nz-gift-zone-option-dupe')}
					onClick={() => PS.send(`/nuzlocke choosegift ${giftIndex} ${toID(e.species)}`)}
				>
					<img src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(e.species)}.png`} alt={e.species} />
				</div>;
			})}
		</div>
	</div>;
}


// ---------------------------------------------------------------------------
// Pokemon stats panel (right column)
// ---------------------------------------------------------------------------

class EncounterPokemonStats extends preact.Component<{
	pokemon: import('../types').OwnedPokemon | null;
	generation: number;
	nickname: string;
	onNickChange: (uid: string, value: string) => void;
}, { editing: boolean }> {
	override state = { editing: false };
	startEdit = () => this.setState({ editing: true });
	stopEdit = () => this.setState({ editing: false });

	render() {
		const { pokemon, generation, nickname, onNickChange } = this.props;
		const { editing } = this.state;
		const dex = Dex.forGen(generation);

		if (!pokemon) {
			return <div class="nz-encounter-stats">
				<div class="nz-detail-empty" style="margin:auto">No pokemon caught yet</div>
			</div>;
		}

		const sp = dex.species.get(pokemon.species);
		const nature = BattleNatures[pokemon.nature as keyof typeof BattleNatures] ?? {};
		const boostedStat = nature.plus as keyof StatsTable | undefined;
		const reducedStat = nature.minus as keyof StatsTable | undefined;

		const ivScore = calcIvScore(pokemon.ivs, sp.baseStats);
		const ivPct = Math.round(ivScore * 100);
		const ivTier = ivPct >= 62 ? 'high' : ivPct >= 50 ? 'mid' : ivPct >= 38 ? 'low' : 'poor';
		const ivLabel = ivTier === 'high' ? 'Great' : ivTier === 'mid' ? 'Good' : ivTier === 'low' ? 'Fair' : 'Poor';
		const natureQuality = calcNatureQuality(nature, sp.baseStats);
		const combinedPct = calcCombinedPercentile(ivScore, natureQuality, sp.baseStats);
		const topPercentile = combinedPct !== null && combinedPct <= 0.05 ? combinedPct : null;
		const worsePercentile = combinedPct !== null && combinedPct >= 0.95 ? combinedPct : null;

		return <div class="nz-encounter-stats">
			{/* Header: sprite + identity */}
			<div class="nz-encounter-stats-header">
				<img
					class="nz-encounter-stats-sprite"
					src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(pokemon.species)}.png`}
					alt={pokemon.species}
				/>
				<div class="nz-encounter-stats-identity">
					{editing
						? <input
							class="nz-encounter-stats-nick-input"
							type="text"
							value={nickname}
							maxLength={12}
							autofocus
							onInput={e => onNickChange(pokemon.uid, (e.target as HTMLInputElement).value)}
							onBlur={this.stopEdit}
						/>
						: <div class="nz-encounter-stats-nick nz-encounter-stats-nick-editable" onClick={this.startEdit}>
							{nickname}
						</div>
					}
					{nickname !== pokemon.species &&
						<div class="nz-encounter-stats-species">{pokemon.species}</div>
					}
					<div class="nz-encounter-stats-types"><NzTypeBadges species={pokemon.species} generation={generation} /></div>
					<div class="nz-encounter-stats-meta">
						Lv.{pokemon.level} · {pokemon.caughtRoute}
					</div>
				</div>
			</div>

			{/* Nature + Ability */}
			<div class="nz-encounter-stats-attrs">
				<div class="nz-encounter-stats-attr">
					<span class="nz-encounter-stats-attr-label">Nature</span>
					<div class="nz-encounter-stats-attr-value-row">
						<span class="nz-encounter-stats-attr-value">{pokemon.nature}</span>
						{natureQuality !== 'neutral' &&
							<span class={`nz-nature-quality nz-nature-quality-${natureQuality}`}>
								{natureQuality}
							</span>
						}
					</div>
					{boostedStat && reducedStat &&
						<span class="nz-encounter-stats-attr-desc">
							+{boostedStat.toUpperCase()} −{reducedStat.toUpperCase()}
						</span>
					}
				</div>
				<div class="nz-encounter-stats-attr">
					<span class="nz-encounter-stats-attr-label">Ability</span>
					<span class="nz-encounter-stats-attr-value">{pokemon.ability}</span>
					{(() => {
						const desc = dex.abilities.get(pokemon.ability).shortDesc;
						return desc ? <span class="nz-encounter-stats-attr-desc">{desc}</span> : null;
					})()}
				</div>
			</div>

			<NzStatPair
				species={pokemon.species}
				nature={pokemon.nature}
				generation={generation}
				ivs={pokemon.ivs}
				ivsExtra={<span class={`nz-iv-score nz-iv-score-${ivTier}`}>{ivLabel}</span>}
			/>
			{topPercentile !== null &&
				<div class="nz-encounter-top-callout">
					This {pokemon.species} is in the top {formatTopPct(topPercentile)} of {pokemon.species}s!
				</div>
			}
			{worsePercentile !== null &&
				<div class="nz-encounter-bad-callout">
					This {pokemon.species} is worse than {formatTopPct(worsePercentile)} of {pokemon.species}s!
				</div>
			}
		</div>;
	}
}


// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface EncountersState {
	selectedRoute: string | null;
	nicknames: Record<string, string>;
	deferredThisSession: Set<string>;
	lastSegmentIndex: number;
}

export class EncountersScreen extends preact.Component<{ game: NuzlockePanelPayload }, EncountersState> {
	override state: EncountersState = {
		selectedRoute: null,
		nicknames: {},
		deferredThisSession: new Set(),
		lastSegmentIndex: -1,
	};

	static getDerivedStateFromProps(
		props: { game: NuzlockePanelPayload },
		state: EncountersState
	): Partial<EncountersState> | null {
		const segment = props.game.segment;
		if (!segment) return null;

		const updates: Partial<EncountersState> = {};

		// Clear per-session defer tracking when entering a new segment
		const segIdx = props.game.currentSegmentIndex;
		if (segIdx !== state.lastSegmentIndex) {
			updates.lastSegmentIndex = segIdx;
			updates.deferredThisSession = new Set<string>();
			updates.selectedRoute = null;
		}

		const nicknames = { ...state.nicknames };
		let nicksChanged = false;
		props.game.box.forEach(p => {
			if (!(p.uid in nicknames)) {
				nicknames[p.uid] = p.nickname;
				nicksChanged = true;
			}
		});
		if (nicksChanged) updates.nicknames = nicknames;

		// Auto-select first unresolved route if nothing is selected yet
		const currentSelected = updates.selectedRoute !== undefined ? updates.selectedRoute : state.selectedRoute;
		if (!currentSelected) {
			const ownedRoots = new Set([
				...props.game.box.map(p => getEvoRoot(p.species)),
				...props.game.graveyard.map(p => getEvoRoot(p.species)),
			]);
			const tmMoves = props.game.tmMoves;
			const items = props.game.items;
			// Collect all displayed routes: current segment + deferred + locked (deduplicated)
			const currentRouteNames = new Set((segment.encounters ?? []).map(e => e.route));
			const allDisplayed: RouteEncounter[] = [
				...(segment.encounters ?? []),
				...(props.game.deferredRoutes ?? []).filter(r => !currentRouteNames.has(r.route)),
				...(props.game.lockedRoutes ?? []).filter(r => !currentRouteNames.has(r.route)),
			];
			const pending = allDisplayed.find(enc =>
				!props.game.resolvedRoutes.includes(enc.route) &&
				enc.zones.some(z =>
					hasZonePrereq(z, tmMoves, items, props.game.box.map(p => toID(p.species)), props.game.completedBattles) &&
					z.pokemon.some(e => !ownedRoots.has(getEvoRoot(e.species)))
				)
			);
			const autoSelected = pending?.route ?? null;
			// Fall back to first unresolved choice gift, then first accessible enc
			const fallback = !autoSelected
				? ((segment.gifts ?? []).find(g => g.choice && !props.game.resolvedRoutes.includes(g.route))?.route ??
					allDisplayed.find(enc => enc.zones.some(z => hasZonePrereq(z, tmMoves, items, props.game.box.map(p => toID(p.species)), props.game.completedBattles)))?.route ?? null)
				: autoSelected;
			if (fallback !== currentSelected) updates.selectedRoute = fallback;
		}

		return Object.keys(updates).length > 0 ? updates : null;
	}

	selectRoute = (routeName: string) => {
		this.setState({ selectedRoute: routeName });
	};

	setNick = (uid: string, value: string) => {
		this.setState((s: EncountersState) => ({ nicknames: { ...s.nicknames, [uid]: value } }));
	};

	handleDefer = (routeName: string) => {
		PS.send(`/nuzlocke defer ${routeName}`);
		this.setState((s: EncountersState) => {
			const next = new Set(s.deferredThisSession);
			next.add(routeName);
			return { deferredThisSession: next };
		});
	};

	submit = () => {
		const { game } = this.props;
		const parts = game.box
			.map(p => `${p.uid} ${(this.state.nicknames[p.uid] ?? p.nickname).replace(/\s+/g, '_')}`)
			.join(' ');
		PS.send(`/nuzlocke setnicks ${parts}`);
	};

	render() {
		const { game } = this.props;
		const { nicknames, selectedRoute, deferredThisSession } = this.state;
		const segment = game.segment!;

		const ownedRoots = new Set([
			...game.box.map(p => getEvoRoot(p.species, game.generation)),
			...game.graveyard.map(p => getEvoRoot(p.species, game.generation)),
		]);

		const encounters = segment.encounters ?? [];
		const allGifts = segment.gifts ?? [];
		const giftRouteNames = new Set(allGifts.map(r => r.route));

		// Build a unified list of all routes to display:
		// current segment encounters + gifts + deferred/locked routes from previous segments (deduplicated)
		const currentRouteNames = new Set(encounters.map(e => e.route));
		const extraDeferred = (game.deferredRoutes ?? []).filter(r => !currentRouteNames.has(r.route));
		const extraLocked = (game.lockedRoutes ?? []).filter(
			r => !currentRouteNames.has(r.route) && !extraDeferred.some(d => d.route === r.route)
		);
		const allDisplayedRoutes: RouteEncounter[] = [...encounters, ...allGifts, ...extraDeferred, ...extraLocked];

		// Compute zone accessibility for each displayed route.
		// encZones[i]: all zones with accessible flag + original index
		type ZoneEntry = { zone: ZoneEncounter; originalIndex: number; accessible: boolean };
		const encZones: ZoneEntry[][] = allDisplayedRoutes.map(enc =>
			enc.zones.map((zone, i) => ({
				zone,
				originalIndex: i,
				accessible: hasZonePrereq(zone, game.tmMoves, game.items, game.box.map(p => toID(p.species)), game.completedBattles),
			}))
		);
		const encAccessibleZones = encZones.map(zones => zones.filter(z => z.accessible));

		// A route is "pending" (blocks Continue) if:
		// - encounter route: unresolved, has accessible non-dupe zones, and NOT deferred this session
		// - gift route: unresolved choice gift (non-choice gifts are auto-resolved by server)
		const pendingRoutes = allDisplayedRoutes.filter((enc, i) => {
			if (giftRouteNames.has(enc.route)) {
				return enc.choice && !game.resolvedRoutes.includes(enc.route);
			}
			return (
				!game.resolvedRoutes.includes(enc.route) &&
				!deferredThisSession.has(enc.route) &&
				encAccessibleZones[i].some(({ zone }) =>
					zone.pokemon.some(e => !ownedRoots.has(getEvoRoot(e.species, game.generation)))
				)
			);
		});
		const canContinue = pendingRoutes.length === 0;

		// Detail panel: find selected route in the unified list
		const selectedEncIdx = allDisplayedRoutes.findIndex(enc => enc.route === selectedRoute);
		const selectedEnc = selectedEncIdx >= 0 ? allDisplayedRoutes[selectedEncIdx] : null;
		const selectedCaught = selectedRoute
			? game.box.find(p => p.caughtRoute === selectedRoute) ?? null
			: null;
		const selectedGiftDef = selectedRoute ? allGifts.find(g => g.route === selectedRoute) ?? null : null;
		const selectedChoiceGift = selectedGiftDef?.choice && !game.resolvedRoutes.includes(selectedRoute!)
			? selectedGiftDef
			: null;

		const isResolved = selectedRoute ? game.resolvedRoutes.includes(selectedRoute) : false;
		const isSelectedGift = selectedRoute ? giftRouteNames.has(selectedRoute) : false;
		const selectedAllZones = selectedEncIdx >= 0 ? encZones[selectedEncIdx] : [];
		const selectedAccessibleZones = selectedEncIdx >= 0 ? encAccessibleZones[selectedEncIdx] : [];

		return <NzScreen>
			<NzScreenHeader
				title={segment.name}
				meta={[
					{ label: 'Level Cap', value: String(segment.levelCap) },
					{ label: 'Next Battle', value: segment.battles[0]?.trainer ?? '?' },
					{ label: 'Routes Remaining', value: String(pendingRoutes.length) },
				]}
			/>

			<div class="nz-encounters-layout">
				{/* Left: route list */}
				<div class="nz-route-list">
					{allDisplayedRoutes.length > 0 && <div class="nz-route-list-section-label">Routes</div>}
					{allDisplayedRoutes.map((enc, encIdx) => {
						const accessibleZones = encAccessibleZones[encIdx];
						const allZones = encZones[encIdx];
						const isResolvedRow = game.resolvedRoutes.includes(enc.route);
						const isGift = giftRouteNames.has(enc.route);
						const isSelected = selectedRoute === enc.route;

						let statusSymbol = '';
						let isDeferred = false;
						let sprites: { species: string; isDupe: boolean; isCaught: boolean }[];

						if (isGift) {
							statusSymbol = isResolvedRow ? '✓' : '';
							const resolvedGift = isResolvedRow ? game.box.find(p => p.caughtRoute === enc.route) : undefined;
							const giftPokemon = enc.zones.flatMap(z => z.pokemon);
							sprites = resolvedGift
								? [{ species: resolvedGift.species, isDupe: false, isCaught: true }]
								: giftPokemon.map(e => ({
									species: e.species,
									isDupe: ownedRoots.has(getEvoRoot(e.species, game.generation)),
									isCaught: false,
								}));
						} else {
							const isServerLocked = (game.lockedRoutes ?? []).some(r => r.route === enc.route);
							const accessibleHasNonDupe = accessibleZones.some(({ zone }) =>
								zone.pokemon.some(e => !ownedRoots.has(getEvoRoot(e.species, game.generation)))
							);
							const lockedHasNonDupe = allZones.some(({ zone, accessible }) =>
								!accessible && zone.pokemon.some(e => !ownedRoots.has(getEvoRoot(e.species, game.generation)))
							);
							const isAllLocked = isServerLocked || (!isResolvedRow && !accessibleHasNonDupe && lockedHasNonDupe);
							const isDeferredThisSession = deferredThisSession.has(enc.route);
							// "Deferred" badge: carried from a previous segment, not yet re-deferred this session
							// Suppressed for server-locked routes (they show "Locked" badge instead)
							const isPendingDeferred = !isResolvedRow && !isDeferredThisSession && !isServerLocked &&
								(game.deferredRoutes ?? []).some(r => r.route === enc.route);
							const allDupes = !isResolvedRow && !isAllLocked && accessibleZones.length > 0 &&
								accessibleZones.every(({ zone }) =>
									zone.pokemon.every(e => ownedRoots.has(getEvoRoot(e.species, game.generation)))
								);
							isDeferred = isAllLocked || isDeferredThisSession || isPendingDeferred;

							if (isResolvedRow) statusSymbol = '✓';
							else if (allDupes) statusSymbol = '—';
							else if (isDeferredThisSession || isAllLocked) statusSymbol = '↩';

							const caughtPokemon = isResolvedRow ? game.box.find(p => p.caughtRoute === enc.route) : undefined;
							const seenSids = new Set<string>();
							const allSpecies: string[] = [];
							for (const { zone } of accessibleZones) {
								for (const e of zone.pokemon) {
									const sid = toID(e.species);
									if (!seenSids.has(sid)) { seenSids.add(sid); allSpecies.push(e.species); }
								}
							}
							sprites = allSpecies.map(species => ({
								species,
								isDupe: ownedRoots.has(getEvoRoot(species, game.generation)),
								isCaught: caughtPokemon !== undefined && toID(caughtPokemon.species) === toID(species),
							}));
						}

						return <RouteListItem
							key={enc.route}
							enc={enc}
							isSelected={isSelected}
							isResolved={isResolvedRow}
							isDeferred={isDeferred}
							statusSymbol={statusSymbol}
							sprites={sprites!}
							onSelect={() => this.selectRoute(enc.route)}
						/>;
					})}

					{segment.items.length > 0 && <>
						<div class="nz-route-list-divider">Items</div>
						<div class="nz-items-list" style="padding: 6px 8px">
							{segment.items.map(item =>
								<span key={item} class="nz-item-chip">{item}</span>
							)}
						</div>
					</>}

					{segment.tmMoves.length > 0 && <>
						<div class="nz-route-list-divider">TMs</div>
						<div class="nz-items-list" style="padding: 6px 8px">
							{segment.tmMoves.map(move =>
								<span key={move} class="nz-item-chip nz-tm-chip">{move}</span>
							)}
						</div>
					</>}
				</div>

				{/* Middle: detail panel */}
				<div class="nz-encounter-detail">
					{selectedChoiceGift && <GiftChoicePicker
						gift={selectedChoiceGift}
						giftIndex={allGifts.indexOf(selectedChoiceGift)}
						ownedRoots={ownedRoots}
						generation={game.generation}
					/>}

					{!selectedChoiceGift && selectedEnc && (() => {
						const isServerLockedRoute = (game.lockedRoutes ?? []).some(r => r.route === selectedEnc.route);
						const detailAccessibleHasNonDupe = selectedAccessibleZones.some(({ zone }) =>
							zone.pokemon.some(e => !ownedRoots.has(getEvoRoot(e.species, game.generation)))
						);
						const detailLockedHasNonDupe = selectedAllZones.some(({ zone, accessible }) =>
							!accessible && zone.pokemon.some(e => !ownedRoots.has(getEvoRoot(e.species, game.generation)))
						);
						const isAllLockedRoute = isServerLockedRoute || (!isResolved && !detailAccessibleHasNonDupe && detailLockedHasNonDupe);
						const isDeferredThisSession = deferredThisSession.has(selectedEnc.route);
						const showDefer = !isResolved && !isAllLockedRoute && !isDeferredThisSession && !isSelectedGift;
						return <>
							{!isSelectedGift && (isAllLockedRoute || isDeferredThisSession) && (() => {
								let hint = 'Deferred — will re-appear next segment';
								if (isAllLockedRoute) {
									const seen = new Set<string>();
									for (const { zone, accessible } of selectedAllZones) {
										if (accessible) continue;
										if (!zone.pokemon.some(e => !ownedRoots.has(getEvoRoot(e.species, game.generation)))) continue;
										const name = zone.requires?.name;
										if (name) seen.add(name);
									}
									if (seen.size > 0) hint += ` (missing: ${Array.from(seen).join(', ')})`;
								}
								return <div class="nz-detail-deferred-hint">{hint}</div>;
							})()}
							<div class="nz-zone-cards">
								{selectedAllZones.map(({ zone, originalIndex, accessible }) => {
									const caughtSpeciesForZone = !isResolved
										? undefined
										: !selectedCaught
										? '' // resolved but pokemon traded away — treat as resolved-elsewhere
										: (selectedCaught.caughtZoneIndex === undefined || originalIndex === selectedCaught.caughtZoneIndex
											? selectedCaught.species
											: '');
									const zoneProps = {
										key: originalIndex,
										zone,
										routeName: selectedEnc.route,
										zoneIndex: originalIndex,
										accessible,
										ownedRoots,
										caughtSpecies: caughtSpeciesForZone,
									};
									if (zone.method === 'Trade') return <TradeZoneCard {...zoneProps} />;
									if (zone.method === 'Gift') return <GiftZoneCard {...zoneProps} />;
									return <StandardZoneCard {...zoneProps} />;
								})}
							</div>
							{showDefer && (
								<button class="nz-btn-defer" onClick={() => this.handleDefer(selectedEnc.route)}>
									Defer to next segment
								</button>
							)}
						</>;
					})()}

					{!selectedRoute && <div class="nz-detail-empty">Select a route to scout</div>}
				</div>

				{/* Right: pokemon stats */}
				{(() => {
					const alive = game.box.filter(p => p.alive);
					const displayed = (isResolved && selectedCaught) ? selectedCaught
						: alive.length > 0 ? alive[alive.length - 1] : null;
					return <EncounterPokemonStats
						pokemon={displayed}
						generation={game.generation}
						nickname={displayed ? (nicknames[displayed.uid] ?? displayed.nickname) : ''}
						onNickChange={this.setNick}
					/>;
				})()}
			</div>

			<div class="nz-tb-battle-footer">
				<NzBtn
					onClick={this.submit}
					disabled={!canContinue}
					title={canContinue ? '' : `${pendingRoutes.length} route(s) still need action`}
				>
					Continue
				</NzBtn>
			</div>
		</NzScreen>;
	}
}
