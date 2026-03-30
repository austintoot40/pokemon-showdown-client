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
import { NzIvBars } from "../components/teambuilding";
import { NzRouteCardCaught } from "../components/route-cards";
import type { NuzlockePanelPayload, RouteEncounter, StatsTable } from "../types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const METHOD_ORDER = ['walk', 'surf', 'oldRod', 'goodRod', 'superRod', 'rockSmash'];

const METHOD_LABELS: Record<string, string> = {
	walk: 'Grass',
	surf: 'Surfing',
	oldRod: 'Old Rod',
	goodRod: 'Good Rod',
	superRod: 'Super Rod',
	rockSmash: 'Rock Smash',
};

const METHOD_ICONS: Record<string, string> = {
	surf: '🌊',
	oldRod: '🎣',
	goodRod: '🎣',
	superRod: '🎣',
	rockSmash: '⛏',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEvoRoot(speciesName: string, generation?: number): string {
	const dex = generation ? Dex.forGen(generation) : Dex;
	let species = dex.species.get(speciesName);
	while (species.prevo) {
		species = dex.species.get(species.prevo);
	}
	return species.id;
}

interface FlatEntry {
	route: RouteEncounter;
	method: string;
	flatIndex: number;
}

/** Flattens encounters by stable method order, returning method+flatIndex alongside each route. */
function buildFlatEntries(encounters: Record<string, RouteEncounter[]>): FlatEntry[] {
	const result: FlatEntry[] = [];
	let idx = 0;
	for (const method of METHOD_ORDER) {
		for (const route of encounters[method] ?? []) {
			result.push({ route, method, flatIndex: idx++ });
		}
	}
	return result;
}

interface RouteGroup {
	routeName: string;
	methods: FlatEntry[];
}

/** Deduplicates flat entries by route name, preserving all methods per route. */
function buildRouteGroups(flatEntries: FlatEntry[]): RouteGroup[] {
	const map = new Map<string, RouteGroup>();
	for (const entry of flatEntries) {
		const name = entry.route.route;
		if (!map.has(name)) map.set(name, { routeName: name, methods: [] });
		map.get(name)!.methods.push(entry);
	}
	return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single method's pool displayed in the detail panel. */
function MethodPoolCard({
	method,
	encounter,
	ownedRoots,
	onScout,
	caughtSpecies,
}: {
	method: string;
	encounter: RouteEncounter;
	ownedRoots: Set<string>;
	onScout: () => void;
	caughtSpecies?: string;
}) {
	const resolved = caughtSpecies !== undefined;
	const allDupes = !resolved && encounter.pokemon.every(e => ownedRoots.has(getEvoRoot(e.species)));
	const dupeSet = new Set(
		encounter.pokemon.filter(e => ownedRoots.has(getEvoRoot(e.species))).map(e => toID(e.species))
	);
	const activeTotal = resolved
		? encounter.pokemon.reduce((sum, e) => sum + e.rate, 0)
		: encounter.pokemon
			.filter(e => !dupeSet.has(toID(e.species)))
			.reduce((sum, e) => sum + e.rate, 0);

	const clickable = !resolved && !allDupes;

	return <div
		class={`nz-method-pool-card${allDupes ? ' nz-method-pool-card-dupe' : ''}${clickable ? ' nz-method-pool-card-selectable' : ''}`}
		onClick={clickable ? onScout : undefined}
	>
		<div class="nz-method-pool-label">{METHOD_LABELS[method] ?? method}</div>
		<div class="nz-route-pool">
			{encounter.pokemon.map(e => {
				const dupe = !resolved && dupeSet.has(toID(e.species));
				const isCaught = resolved && toID(e.species) === toID(caughtSpecies!);
				const pct = dupe || activeTotal === 0 ? 0 : Math.round(e.rate / activeTotal * 100);
				const slotClass = [
					'nz-encounter-slot',
					dupe ? 'nz-encounter-slot-dupe' : '',
					resolved && !isCaught ? 'nz-encounter-slot-dimmed' : '',
					isCaught ? 'nz-encounter-slot-caught' : '',
				].filter(Boolean).join(' ');
				return <div key={e.species} class={slotClass}>
					<img src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(e.species)}.png`} alt={e.species} />
					<div class="nz-encounter-rate-bar">
						<div class="nz-encounter-rate-fill" style={`width:${pct}%`} />
					</div>
					<div class="nz-encounter-rate-label">{dupe ? 'dupe' : `${pct}%`}</div>
				</div>;
			})}
		</div>
		{allDupes && <div class="nz-label">Duplicate clause</div>}
	</div>;
}

// ---------------------------------------------------------------------------
// Pokemon stats panel (right column)
// ---------------------------------------------------------------------------

const STAT_KEYS: Array<{ label: string; key: keyof StatsTable }> = [
	{ label: 'HP',  key: 'hp'  },
	{ label: 'Atk', key: 'atk' },
	{ label: 'Def', key: 'def' },
	{ label: 'SpA', key: 'spa' },
	{ label: 'SpD', key: 'spd' },
	{ label: 'Spe', key: 'spe' },
];

class EncounterPokemonStats extends preact.Component<{
	pokemon: import('../types').OwnedPokemon | null;
	generation: number;
	nickname: string;
	onNickChange: (uid: string, value: string) => void;
}, { editing: boolean }> {
	state = { editing: false };
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
						maxlength={12}
						autoFocus
						onInput={e => onNickChange(pokemon.uid, (e.target as HTMLInputElement).value)}
						onBlur={this.stopEdit}
					/>
					: <div class="nz-encounter-stats-nick nz-encounter-stats-nick-editable" onClick={this.startEdit}>
						{nickname}
						{pokemon.shiny && <span class="nz-shiny-star">★</span>}
					</div>
				}
				{nickname !== pokemon.species &&
					<div class="nz-encounter-stats-species">{pokemon.species}</div>
				}
				<div class="nz-encounter-stats-types"><NzTypeBadges species={pokemon.species} /></div>
				<div class="nz-encounter-stats-meta">
					Lv.{pokemon.level} · {pokemon.caughtRoute}
				</div>
			</div>
		</div>

		{/* Nature + Ability */}
		<div class="nz-encounter-stats-attrs">
			<div class="nz-encounter-stats-attr">
				<span class="nz-encounter-stats-attr-label">Nature</span>
				<span class="nz-encounter-stats-attr-value">{pokemon.nature}</span>
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

		{/* Base stats */}
		<div class="nz-encounter-stats-section-label">Base Stats</div>
		<div class="nz-stat-bars" style="margin-bottom:8px">
			{STAT_KEYS.map(({ label, key }) => {
				const val = sp.baseStats[key as keyof typeof sp.baseStats] as number;
				const pct = Math.round((val / 255) * 100);
				const tier = val >= 100 ? 'high' : val >= 70 ? 'mid' : val >= 50 ? 'low' : 'poor';
				const mod = key === boostedStat ? ' nz-stat-nature-up' : key === reducedStat ? ' nz-stat-nature-down' : '';
				return <div key={key} class="nz-stat-row">
					<div class={`nz-stat-label${mod}`}>{label}</div>
					<div class="nz-stat-bar-track">
						<div class={`nz-stat-bar-fill nz-stat-${tier}`} style={`width:${pct}%`} />
					</div>
					<div class={`nz-stat-value${mod}`}>{val}</div>
				</div>;
			})}
		</div>

		{/* IVs */}
		<div class="nz-encounter-stats-section-label">IVs</div>
		<NzIvBars ivs={pokemon.ivs} />
	</div>;
	}
}

// ---------------------------------------------------------------------------
// Gift choice picker
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
	return <div class="nz-gift-choice-picker">
		<div class="nz-gift-choice-header">
			<div class="nz-gift-choice-label">Choose one to receive</div>
			<div class="nz-gift-choice-route">{gift.route}</div>
		</div>
		<div class="nz-gift-choice-options">
			{gift.pokemon.map(e => {
				const isDupe = ownedRoots.has(getEvoRoot(e.species, generation));
				return <div
					key={e.species}
					class={`nz-gift-choice-option${isDupe ? ' nz-gift-choice-option-dupe' : ''}`}
					onClick={() => PS.send(`/nuzlocke choosegift ${giftIndex} ${toID(e.species)}`)}
				>
					<img
						class="nz-gift-choice-sprite"
						src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(e.species)}.png`}
						alt={e.species}
					/>
					<div class="nz-gift-choice-name">{e.species}</div>
					<NzTypeBadges species={e.species} />
					{isDupe && <div class="nz-gift-dupe-label">Dupe</div>}
				</div>;
			})}
		</div>
	</div>;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface EncountersState {
	selectedRoute: string | null;
	nicknames: Record<string, string>;
}

export class EncountersScreen extends preact.Component<{ game: NuzlockePanelPayload }, EncountersState> {
	state: EncountersState = { selectedRoute: null, nicknames: {} };

	static getDerivedStateFromProps(
		props: { game: NuzlockePanelPayload },
		state: EncountersState
	): Partial<EncountersState> | null {
		const segment = props.game.segment;
		if (!segment) return null;

		const updated: Record<string, string> = { ...state.nicknames };
		let changed = false;
		props.game.box.forEach(p => {
			if (!(p.uid in updated)) {
				updated[p.uid] = p.nickname;
				changed = true;
			}
		});

		// Auto-select first unresolved route if nothing is selected yet
		let selectedRoute = state.selectedRoute;
		if (!selectedRoute) {
			const flatEntries = buildFlatEntries(segment.encounters);
			const groups = buildRouteGroups(flatEntries);
			const ownedRoots = new Set([
				...props.game.box.map(p => getEvoRoot(p.species)),
				...props.game.graveyard.map(p => getEvoRoot(p.species)),
			]);
			const pending = groups.find(g =>
				!props.game.resolvedRoutes.includes(g.routeName) &&
				!g.methods.every(m => m.route.pokemon.every(e => ownedRoots.has(getEvoRoot(e.species))))
			);
			selectedRoute = pending?.routeName ?? null;
			// Fall back to first unresolved choice gift, then first route
			if (!selectedRoute) {
				const unresolvedChoice = (segment.gifts ?? []).find(
					g => g.choice && !props.game.resolvedRoutes.includes(g.route)
				);
				selectedRoute = unresolvedChoice?.route ?? groups[0]?.routeName ?? null;
			}
			if (selectedRoute !== state.selectedRoute) changed = true;
		}

		return changed ? { nicknames: updated, selectedRoute } : null;
	}

	selectRoute = (routeName: string) => {
		this.setState({ selectedRoute: routeName });
	};

	setNick = (uid: string, value: string) => {
		this.setState(s => ({ nicknames: { ...s.nicknames, [uid]: value } }));
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
		const { nicknames, selectedRoute } = this.state;
		const segment = game.segment!;

		const ownedRoots = new Set([
			...game.box.map(p => getEvoRoot(p.species, game.generation)),
			...game.graveyard.map(p => getEvoRoot(p.species, game.generation)),
		]);

		const flatEntries = buildFlatEntries(segment.encounters);
		const routeGroups = buildRouteGroups(flatEntries);
		const allGifts = segment.gifts ?? [];
		const giftRouteNames = new Set(allGifts.map(r => r.route));

		// A route is pending if unresolved and not all-dupes across all its methods
		const pendingRoutes = routeGroups.filter(g =>
			!game.resolvedRoutes.includes(g.routeName) &&
			!g.methods.every(m => m.route.pokemon.every(e => ownedRoots.has(getEvoRoot(e.species))))
		);
		const unresolvedChoiceGifts = allGifts.filter(g => g.choice && !game.resolvedRoutes.includes(g.route));
		const canContinue = pendingRoutes.length === 0 && unresolvedChoiceGifts.length === 0;

		// Gift pokemon: resolved ones are in the box
		const resolvedGiftPokemon = game.box.filter(p => giftRouteNames.has(p.caughtRoute));

		// Detail panel content for the selected route
		const selectedGroup = routeGroups.find(g => g.routeName === selectedRoute) ?? null;
		const selectedCaught = selectedRoute
			? game.box.find(p => p.caughtRoute === selectedRoute) ?? null
			: null;
		const selectedGiftDef = selectedRoute
			? allGifts.find(g => g.route === selectedRoute) ?? null
			: null;
		const selectedResolvedGift = selectedGiftDef && game.resolvedRoutes.includes(selectedRoute!)
			? game.box.find(p => p.caughtRoute === selectedRoute) ?? null
			: null;
		const selectedChoiceGift = selectedGiftDef?.choice && !game.resolvedRoutes.includes(selectedRoute!)
			? selectedGiftDef
			: null;

		const isResolved = selectedRoute ? game.resolvedRoutes.includes(selectedRoute) : false;
		const isMultiMethod = (selectedGroup?.methods.length ?? 0) > 1;

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
					{routeGroups.length > 0 && <div class="nz-route-list-section-label">Routes</div>}
					{routeGroups.map(group => {
						const resolved = game.resolvedRoutes.includes(group.routeName);
						const allDupes = !resolved && group.methods.every(m =>
							m.route.pokemon.every(e => ownedRoots.has(getEvoRoot(e.species)))
						);
						const isSelected = selectedRoute === group.routeName;

						const caughtPokemon = resolved
							? game.box.find(p => p.caughtRoute === group.routeName)
							: undefined;

						return <div
							key={group.routeName}
							class={`nz-route-list-row${isSelected ? ' selected' : ''}${resolved ? ' resolved' : ''}`}
							onClick={() => this.selectRoute(group.routeName)}
						>
							<div class="nz-route-list-row-top">
								<span class="nz-route-list-status">
									{resolved ? '✓' : allDupes ? '—' : ''}
								</span>
								<span class="nz-route-list-name">{group.routeName}</span>
							</div>
							<div class="nz-route-list-sprites">
								{group.methods.map(entry => {
									const uniqueSpecies = Array.from(
										new Map(entry.route.pokemon.map(e => [toID(e.species), e.species])).values()
									);
									return <div key={entry.method} class="nz-route-sprite-group">
										{entry.method !== 'walk' &&
											<span class="nz-route-sprite-method-icon">{METHOD_ICONS[entry.method] ?? entry.method}</span>
										}
										{uniqueSpecies.map(species => {
											const sid = toID(species);
											const isDupe = ownedRoots.has(getEvoRoot(species, game.generation));
											const isCaught = caughtPokemon !== undefined && toID(caughtPokemon.species) === sid;
											const cls = [
												'nz-route-sprite',
												isDupe && !isCaught ? 'nz-route-sprite-dupe' : '',
												isCaught ? 'nz-route-sprite-caught' : '',
											].filter(Boolean).join(' ');
											return <img
												key={sid}
												class={cls}
												src={`https://play.pokemonshowdown.com/sprites/gen5/${sid}.png`}
												alt={species}
												title={species}
											/>;
										})}
									</div>;
								})}
							</div>
						</div>;
					})}

					{(unresolvedChoiceGifts.length > 0 || resolvedGiftPokemon.length > 0) && <>
						<div class="nz-route-list-divider">Gifts</div>
						{unresolvedChoiceGifts.map(g =>
							<div
								key={g.route}
								class={`nz-route-list-row nz-route-list-row-choice${selectedRoute === g.route ? ' selected' : ''}`}
								onClick={() => this.selectRoute(g.route)}
							>
								<div class="nz-route-list-row-top">
									<span class="nz-route-list-status nz-gift-status-choose">!</span>
									<span class="nz-route-list-name">{g.route}</span>
								</div>
								<div class="nz-route-list-sprites">
									{g.pokemon.map(e =>
										<img
											key={toID(e.species)}
											class="nz-route-sprite"
											src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(e.species)}.png`}
											alt={e.species}
											title={e.species}
										/>
									)}
								</div>
							</div>
						)}
						{resolvedGiftPokemon.map(p =>
							<div
								key={p.uid}
								class={`nz-route-list-row resolved${selectedRoute === p.caughtRoute ? ' selected' : ''}`}
								onClick={() => this.selectRoute(p.caughtRoute)}
							>
								<div class="nz-route-list-row-top">
									<span class="nz-route-list-status">✓</span>
									<span class="nz-route-list-name">{p.caughtRoute}</span>
								</div>
								<div class="nz-route-list-sprites">
									<img
										class="nz-route-sprite nz-route-sprite-caught"
										src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(p.species)}.png`}
										alt={p.species}
										title={p.species}
									/>
								</div>
							</div>
						)}
					</>}

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

					{!selectedChoiceGift && selectedResolvedGift && <NzRouteCardCaught
						pokemon={selectedResolvedGift}
						nickname={nicknames[selectedResolvedGift.uid] ?? selectedResolvedGift.nickname}
						onNickChange={this.setNick}
					/>}

					{!selectedChoiceGift && !selectedResolvedGift && selectedGroup && <>
						{isMultiMethod && !isResolved && <div class="nz-detail-choose-hint">
							Choose one method — you only get one encounter here
						</div>}
						<div class="nz-method-pools">
							{selectedGroup.methods.map(entry =>
								<MethodPoolCard
									key={entry.method}
									method={entry.method}
									encounter={entry.route}
									ownedRoots={ownedRoots}
									onScout={() => PS.send(`/nuzlocke encounter ${entry.flatIndex}`)}
									caughtSpecies={isResolved ? selectedCaught?.species : undefined}
								/>
							)}
						</div>
					</>}

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
					title={canContinue ? '' : `${pendingRoutes.length} route(s) still unscouted`}
				>
					Continue
				</NzBtn>
			</div>
		</NzScreen>;
	}
}
