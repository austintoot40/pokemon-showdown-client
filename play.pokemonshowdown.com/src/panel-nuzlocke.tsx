/**
 * Nuzlocke Simulator — Client Panel
 *
 * Registers a nuzlockeRenderer hook on PagePanel so that view-nuzlocke
 * renders this component instead of server-sent HTML. State arrives via
 * |nuzlockestate|<json> messages handled in panel-page.tsx.
 */

import preact from "../js/lib/preact";
import { PS } from "./client-main";
import { Dex, toID } from "./battle-dex";
import {
	NzRoot, NzScreen, NzScreenHeader, NzSection, NzPanel, NzPanelFlat,
	NzBtn, NzBadge, NzTypeBadges, NzHpBar,
	NzPokemonCard, NzBoxCard, NzGraveyardCard, NzOpponentCard, NzStarterCard,
	NzRouteCard, NzRouteCardCaught,
	NzBattleBanner, NzProgress, NzRunEntry,
	type OwnedPokemon, type DeadPokemon, type LegalMove, type EvoOption, type TrainerPokemon,
} from "./nuzlocke-ui";

// ---------------------------------------------------------------------------
// Payload types (mirrored from server types.ts / game.ts)
// ---------------------------------------------------------------------------

type NuzlockeScreen =
	'dashboard' | 'intro' | 'starter' | 'encounters' | 'teambuilding' | 'battle' | 'results' | 'summary';

interface RouteEncounter {
	route: string;
	type?: 'gift';
	pokemon: string[];
	levels: [number, number];
}

interface TrainerBattle {
	id: string;
	trainer: string;
	team: TrainerPokemon[];
}

interface NuzlockeScenarioCard {
	id: string;
	name: string;
	generation: number;
	description: string;
	segmentCount: number;
}

interface NuzlockeStatePayload {
	curScreen: NuzlockeScreen;
	scenarioId: string | null;
	scenarioName: string | null;
	scenarioDescription: string | null;
	starters: { species: string; level: number }[] | null;
	currentSegmentIndex: number;
	totalSegments: number;
	currentBattleIndex: number;
	completedBattles: string[];
	segment: {
		name: string;
		levelCap: number;
		items: string[];
		encounters: RouteEncounter[];
		battles: TrainerBattle[];
	} | null;
	box: OwnedPokemon[];
	party: string[];
	graveyard: DeadPokemon[];
	items: string[];
	tmMoves: string[];
	resolvedRoutes: string[];
	legalMoves: Record<string, LegalMove[]>;
	availableEvolutions: Record<string, EvoOption[]>;
	lastBattleResult: {
		won: boolean;
		perfect: boolean;
		trainerName: string;
		deaths: DeadPokemon[];
	} | null;
	nextScreen: NuzlockeScreen | null;
	segmentNames: Record<string, string>;
	scenarios: NuzlockeScenarioCard[];
}

// ---------------------------------------------------------------------------
// Starter selection screen
// ---------------------------------------------------------------------------

class StarterScreen extends preact.Component<{ game: NuzlockeStatePayload }, { selected: number | null }> {
	state = { selected: null as number | null };
	select = (i: number) => this.setState({ selected: i });
	confirm = () => {
		if (this.state.selected !== null) PS.send(`/nuzlocke starter ${this.state.selected}`);
	};
	override render() {
		const { game } = this.props;
		const { selected } = this.state;
		const starters = game.starters ?? [];
		return <NzScreen>
			<NzScreenHeader title="Choose Your Starter" />
			<div style="display:flex;gap:16px;flex-wrap:wrap;">
				{starters.map((s, i) =>
					<NzStarterCard
						key={i}
						species={s.species}
						selected={selected === i}
						onSelect={() => this.select(i)}
					/>
				)}
			</div>
			<div style="margin-top:16px;">
				<NzBtn onClick={this.confirm} disabled={selected === null}>
					Confirm
				</NzBtn>
			</div>
		</NzScreen>;
	}
}

// ---------------------------------------------------------------------------
// Encounters screen
// ---------------------------------------------------------------------------

interface EncountersState {
	nicknames: Record<string, string>;
}

class EncountersScreen extends preact.Component<{ game: NuzlockeStatePayload }, EncountersState> {
	state: EncountersState = { nicknames: {} };

	static getDerivedStateFromProps(
		props: { game: NuzlockeStatePayload },
		state: EncountersState
	): Partial<EncountersState> | null {
		const updated: Record<string, string> = { ...state.nicknames };
		let changed = false;
		props.game.box.forEach(p => {
			if (!(p.uid in updated)) {
				updated[p.uid] = p.nickname;
				changed = true;
			}
		});
		return changed ? { nicknames: updated } : null;
	}

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
		const { nicknames } = this.state;
		const segment = game.segment!;

		const pendingRoutes = segment.encounters.filter(r =>
			r.type !== 'gift' && !game.resolvedRoutes.includes(r.route)
		);
		const canContinue = pendingRoutes.length === 0;

		const starter = game.box.find(p => p.caughtRoute === 'Starter');
		const wildRoutes = segment.encounters.filter(r => r.type !== 'gift');
		const giftPokemon = game.box.filter(p =>
			segment.encounters.some(r => r.type === 'gift' && r.route === p.caughtRoute)
		);

		const hasBottom = segment.items.length > 0 || giftPokemon.length > 0;

		return <NzScreen>
			<NzScreenHeader
				title={segment.name}
				meta={[
					{ label: 'Level Cap', value: String(segment.levelCap) },
					{ label: 'Next Battle', value: segment.battles[0]?.trainer ?? '?' },
					{ label: 'Routes Remaining', value: String(pendingRoutes.length) },
				]}
			/>

			{starter && <NzSection title="Starter">
				<div class="nz-encounters-grid">
					<NzRouteCardCaught
						pokemon={starter}
						nickname={nicknames[starter.uid] ?? starter.nickname}
						onNickChange={this.setNick}
					/>
				</div>
			</NzSection>}

			{wildRoutes.length > 0 && <NzSection title="Routes">
				<div class="nz-encounters-grid">
					{segment.encounters.map((route, i) => {
						if (route.type === 'gift') return null;
						const caught = game.box.find(p => p.caughtRoute === route.route);
						if (caught) {
							return <NzRouteCardCaught
								key={route.route}
								pokemon={caught}
								pool={route.pokemon}
								nickname={nicknames[caught.uid] ?? caught.nickname}
								onNickChange={this.setNick}
							/>;
						}

						const ownedSpecies = new Set([
							...game.box.map(p => toID(p.species)),
							...game.box.map(p => toID(p.baseSpecies)),
							...game.graveyard.map(p => toID(p.species)),
						]);
						const allDupes = route.pokemon.every(s => ownedSpecies.has(toID(s)));

						return <NzRouteCard
							key={route.route}
							routeName={route.route}
							pool={route.pokemon}
							dupeSpecies={ownedSpecies}
							allDupes={allDupes}
							onExplore={() => PS.send(`/nuzlocke encounter ${i}`)}
						/>;
					})}
				</div>
			</NzSection>}

			{hasBottom && <div class="nz-encounters-bottom">
				{segment.items.length > 0 && <NzSection title="Items Received">
					<div class="nz-items-list">
						{segment.items.map(item => <span key={item} class="nz-item-chip">{item}</span>)}
					</div>
				</NzSection>}

				{giftPokemon.length > 0 && <NzSection title="Gift Pokémon">
					<div class="nz-encounters-grid">
						{giftPokemon.map(p =>
							<NzRouteCardCaught
								key={p.uid}
								pokemon={p}
								nickname={nicknames[p.uid] ?? p.nickname}
								onNickChange={this.setNick}
							/>
						)}
					</div>
				</NzSection>}
			</div>}

			<div style="margin-top:8px;">
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

// ---------------------------------------------------------------------------
// Teambuilding screen
// ---------------------------------------------------------------------------

interface TeambuildingState {
	moves: Record<string, string[]>;
	heldItems: Record<string, string>;
	errors: Record<string, string>;
}

class TeambuildingScreen extends preact.Component<{ game: NuzlockeStatePayload }, TeambuildingState> {
	state: TeambuildingState = { moves: {}, heldItems: {}, errors: {} };

	static getDerivedStateFromProps(
		props: { game: NuzlockeStatePayload },
		state: TeambuildingState
	): Partial<TeambuildingState> | null {
		const moves = { ...state.moves };
		const heldItems = { ...state.heldItems };
		let changed = false;
		props.game.party.forEach(uid => {
			const p = props.game.box.find(b => b.uid === uid);
			const serverMoves = p ? p.moves.map(m => toID(m)) : [];
			if (!(uid in moves)) {
				moves[uid] = [...serverMoves, '', '', '', ''].slice(0, 4);
				changed = true;
			} else {
				const serverFilled = serverMoves.filter(Boolean).length;
				const localFilled = moves[uid].filter(Boolean).length;
				if (serverFilled > localFilled) {
					moves[uid] = [...serverMoves, '', '', '', ''].slice(0, 4);
					changed = true;
				}
			}
			if (!(uid in heldItems)) {
				heldItems[uid] = p ? p.item : '';
				changed = true;
			}
		});
		return changed ? { moves, heldItems } : null;
	}

	setMove = (uid: string, slot: number, value: string) => {
		this.setState(s => {
			const moves = { ...s.moves, [uid]: [...(s.moves[uid] ?? ['', '', '', ''])] };
			moves[uid][slot] = value;
			return { moves };
		});
	};

	setItem = (uid: string, value: string) => {
		this.setState(s => ({ heldItems: { ...s.heldItems, [uid]: value } }));
	};

	validate(): Record<string, string> {
		const { game } = this.props;
		const { moves } = this.state;
		const errors: Record<string, string> = {};
		for (const uid of game.party) {
			const selected = (moves[uid] ?? []).filter(Boolean);
			if (selected.length === 0) {
				errors[uid] = 'Must have at least 1 move.';
				continue;
			}
			if (new Set(selected).size !== selected.length) {
				errors[uid] = 'Duplicate moves selected.';
			}
		}
		return errors;
	}

	clickBattle = () => {
		const errors = this.validate();
		if (Object.keys(errors).length > 0) {
			this.setState({ errors });
			return;
		}
		const { game } = this.props;
		const { moves, heldItems } = this.state;
		const parts = game.party.map(uid => {
			const m = (moves[uid] ?? []).filter(Boolean).concat(['', '', '', '']).slice(0, 4).join(',');
			const item = heldItems[uid] || 'none';
			return `${uid} ${m} ${item}`;
		}).join(' ');
		PS.send(`/nuzlocke battlewithmoves ${parts}`);
	};

	render() {
		const { game } = this.props;
		const { moves, heldItems, errors } = this.state;
		const segment = game.segment!;
		const battle = segment.battles[game.currentBattleIndex];
		const partyPokemon = game.party.map(uid => game.box.find(p => p.uid === uid)!).filter(Boolean);
		const boxOnly = game.box.filter(p => p.alive && !game.party.includes(p.uid));

		const takenItems = (uid: string) => new Set(
			game.party
				.filter(id => id !== uid)
				.map(id => game.box.find(p => p.uid === id)?.item ?? heldItems[id] ?? '')
				.filter(Boolean)
		);

		const hasErrors = Object.keys(errors).length > 0;

		return <NzScreen>
			<NzScreenHeader
				title={`vs. ${battle?.trainer ?? 'Unknown'}`}
				meta={[
					{ label: 'Level Cap', value: String(segment.levelCap) },
					{ label: 'Segment', value: segment.name },
				]}
			/>

			<NzSection title="Opponent">
				<div style="display:flex;flex-wrap:wrap;gap:10px;">
					{battle?.team.map(t => <NzOpponentCard key={t.species} pokemon={t} />)}
				</div>
			</NzSection>

			<NzSection title={`Party (${partyPokemon.length}/6)`}>
				{partyPokemon.length === 0
					? <p class="nz-notice">No Pokémon in party. Add from Box below.</p>
					: <div style="display:flex;flex-wrap:wrap;gap:12px;">
						{partyPokemon.map((p, i) => {
							const legalMoves = game.legalMoves[p.uid] ?? [];
							const selectedMoves = moves[p.uid] ?? ['', '', '', ''];
							const error = errors[p.uid];
							const taken = takenItems(p.uid);
							const availableItems = game.items;

							return <div key={p.uid} class={`nz-card${error ? ' nz-card-invalid' : ''}`}
								style="width:184px;">
								<img
									class="nz-card-sprite"
									src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(p.species)}.png`}
									alt={p.species}
								/>
								<div class="nz-card-nickname">
									{p.nickname}
									{p.shiny && <span style="color:var(--nz-warning);margin-left:4px;">★</span>}
								</div>
								{p.nickname !== p.species && <div class="nz-card-species">{p.species}</div>}
								<div class="nz-card-level">Lv. {segment.levelCap}</div>
								<div class="nz-card-types"><NzTypeBadges species={p.species} /></div>
								<div class="nz-card-nature">{p.nature} · {p.ability}</div>

								{error && <div class="nz-card-error">⚠ {error}</div>}

								<div class="nz-card-moves">
									<div class="nz-label" style="margin-bottom:3px;">Moves</div>
									{[0, 1, 2, 3].map(slot =>
										<select
											key={slot}
											value={selectedMoves[slot] ?? ''}
											onChange={e => this.setMove(p.uid, slot, (e.target as HTMLSelectElement).value)}
										>
											<option value="">(empty)</option>
											{legalMoves.map(m =>
												<option key={m.name} value={toID(m.name)}>
													{m.fromTM ? `${m.name} (TM)` : m.name}
												</option>
											)}
										</select>
									)}
								</div>

								<div class="nz-card-item">
									<div class="nz-label" style="margin-bottom:3px;">Held Item</div>
									<select
										value={heldItems[p.uid] ?? ''}
										onChange={e => this.setItem(p.uid, (e.target as HTMLSelectElement).value)}
									>
										<option value="">(none)</option>
										{availableItems.map(item => {
											const id = toID(item);
											return <option key={id} value={id} disabled={taken.has(item)}>{item}</option>;
										})}
									</select>
								</div>

								<div class="nz-card-actions">
									{i > 0
										? <NzBtn size="sm" variant="secondary"
											onClick={() => PS.send(`/nuzlocke partymove ${p.uid} left`)}>◀</NzBtn>
										: <NzBtn size="sm" variant="secondary" disabled>◀</NzBtn>
									}
									<NzBtn size="sm" variant="danger"
										onClick={() => PS.send(`/nuzlocke removefromparty ${p.uid}`)}>
										Remove
									</NzBtn>
									{i < partyPokemon.length - 1
										? <NzBtn size="sm" variant="secondary"
											onClick={() => PS.send(`/nuzlocke partymove ${p.uid} right`)}>▶</NzBtn>
										: <NzBtn size="sm" variant="secondary" disabled>▶</NzBtn>
									}
								</div>

								{(game.availableEvolutions[p.uid] ?? []).map(evo =>
									<div key={evo.species} style="margin-top:4px;width:100%;">
										<NzBtn size="sm" variant="secondary"
											onClick={() => PS.send(`/nuzlocke evolve ${p.uid} ${toID(evo.species)}`)}>
											{evo.type === 'item'
												? `Evolve → ${evo.species} (${evo.item})`
												: `Evolve → ${evo.species}`}
										</NzBtn>
									</div>
								)}
							</div>;
						})}
					</div>
				}
			</NzSection>

			{hasErrors && <p class="nz-error">⚠ Fix errors before battling.</p>}

			<div style="margin-bottom:20px;">
				<NzBtn
					onClick={this.clickBattle}
					disabled={partyPokemon.length === 0}
					title={partyPokemon.length === 0 ? 'Add Pokémon to party first' : ''}
				>
					Battle!
				</NzBtn>
			</div>

			{boxOnly.length > 0 && <NzSection title={`Box (${boxOnly.length})`}>
				<div style="display:flex;flex-wrap:wrap;gap:10px;">
					{boxOnly.map(p => {
						const evos = game.availableEvolutions[p.uid] ?? [];
						return <NzBoxCard
							key={p.uid}
							pokemon={p}
							levelCap={segment.levelCap}
							actions={<>
								{game.party.length < 6 &&
									<NzBtn size="sm" variant="secondary"
										onClick={() => PS.send(`/nuzlocke addtoparty ${p.uid}`)}>
										Add
									</NzBtn>
								}
								{evos.map(evo =>
									<NzBtn key={evo.species} size="sm" variant="secondary"
										onClick={() => PS.send(`/nuzlocke evolve ${p.uid} ${toID(evo.species)}`)}>
										{evo.type === 'item' ? `→ ${evo.species} (${evo.item})` : `→ ${evo.species}`}
									</NzBtn>
								)}
							</>}
						/>;
					})}
				</div>
			</NzSection>}
		</NzScreen>;
	}
}

// ---------------------------------------------------------------------------
// Battle screen
// ---------------------------------------------------------------------------

function BattleScreen({ game }: { game: NuzlockeStatePayload }) {
	const battle = game.segment?.battles[game.currentBattleIndex];
	return <NzScreen>
		<NzScreenHeader
			title="Battle in Progress"
			meta={battle ? [{ label: 'Opponent', value: battle.trainer }] : []}
		/>
		<NzPanelFlat>
			<p style="color:var(--nz-text-muted);font-size:13px;">
				Battle in progress. Return here when it ends.
			</p>
		</NzPanelFlat>
	</NzScreen>;
}

// ---------------------------------------------------------------------------
// Results screen
// ---------------------------------------------------------------------------

function ResultsScreen({ game }: { game: NuzlockeStatePayload }) {
	const result = game.lastBattleResult;
	const continueLabel = game.nextScreen === 'summary' ? 'View Summary' : 'Continue';

	if (!result) {
		return <NzScreen>
			<NzScreenHeader title="Battle Result" />
			<p class="nz-notice">No result data available.</p>
			<NzBtn onClick={() => PS.send('/nuzlocke continue')}>{continueLabel}</NzBtn>
		</NzScreen>;
	}

	return <NzScreen>
		<NzBattleBanner
			won={result.won}
			perfect={result.perfect}
			trainerName={result.trainerName}
			deaths={result.deaths}
		/>
		<div style="margin-top:16px;">
			<NzBtn onClick={() => PS.send('/nuzlocke continue')}>{continueLabel}</NzBtn>
		</div>
	</NzScreen>;
}

// ---------------------------------------------------------------------------
// Summary screen
// ---------------------------------------------------------------------------

function SummaryScreen({ game }: { game: NuzlockeStatePayload }) {
	const alive = game.box.filter(p => p.alive);
	const isVictory = game.currentSegmentIndex >= game.totalSegments;
	const segmentList = Object.values(game.segmentNames);

	return <NzScreen>
		<div style="margin-bottom:20px;">
			{isVictory
				? <div class="nz-banner nz-banner-flawless">
					<div class="nz-banner-title">★ {game.scenarioName} — Complete</div>
					<div class="nz-banner-sub">
						{game.completedBattles.length} battles completed
						{game.graveyard.length === 0
							? ' — no casualties.'
							: ` — ${game.graveyard.length} unit${game.graveyard.length !== 1 ? 's' : ''} lost.`}
					</div>
				</div>
				: <div class="nz-banner nz-banner-loss">
					<div class="nz-banner-title">Run Over</div>
					<div class="nz-banner-sub">
						Reached segment {game.currentSegmentIndex + 1} of {game.totalSegments}.
						{' '}{game.completedBattles.length} battle{game.completedBattles.length !== 1 ? 's' : ''} completed.
					</div>
				</div>
			}
		</div>

		{segmentList.length > 0 && <NzSection title="Mission Progress">
			<NzProgress segments={segmentList} currentIndex={game.currentSegmentIndex} />
		</NzSection>}

		{alive.length > 0 && <NzSection title={`Survivors (${alive.length})`}>
			<div style="display:flex;flex-wrap:wrap;gap:10px;">
				{alive.map(p => <NzBoxCard key={p.uid} pokemon={p} />)}
			</div>
		</NzSection>}

		{game.graveyard.length > 0 && <NzSection title={`Graveyard (${game.graveyard.length})`}>
			<div style="display:flex;flex-wrap:wrap;gap:10px;">
				{game.graveyard.map(d =>
					<NzGraveyardCard
						key={d.uid}
						dead={d}
						segmentName={game.segmentNames[d.segment] ?? d.segment}
					/>
				)}
			</div>
		</NzSection>}

		<div style="margin-top:8px;">
			<NzBtn onClick={() => PS.send('/nuzlocke done')} variant="secondary">
				Done
			</NzBtn>
		</div>
	</NzScreen>;
}

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------

function NuzlockeGamePanel({ gameState }: { gameState: NuzlockeStatePayload | null }) {
	if (!gameState) return <NzRoot><NzScreen><p class="nz-notice">Loading...</p></NzScreen></NzRoot>;

	let screen: preact.VNode;
	switch (gameState.curScreen) {
	case 'dashboard':
		screen = <NzScreen><p class="nz-notice">No active run. Return to the main menu to start one.</p></NzScreen>;
		break;
	case 'starter':      screen = <StarterScreen game={gameState} />; break;
	case 'encounters':   screen = <EncountersScreen game={gameState} />; break;
	case 'teambuilding': screen = <TeambuildingScreen game={gameState} />; break;
	case 'battle':       screen = <BattleScreen game={gameState} />; break;
	case 'results':      screen = <ResultsScreen game={gameState} />; break;
	case 'summary':      screen = <SummaryScreen game={gameState} />; break;
	default:
		screen = <NzScreen><p class="nz-notice">Unknown screen: {(gameState as any).curScreen}</p></NzScreen>;
	}

	return <NzRoot>{screen}</NzRoot>;
}

// ---------------------------------------------------------------------------
// Register the renderer hook on PagePanel
// ---------------------------------------------------------------------------

const PagePanel = (PS.roomTypes['html'] as any);
if (PagePanel) {
	PagePanel.nuzlockeRenderer = (gameState: NuzlockeStatePayload | null) =>
		<NuzlockeGamePanel gameState={gameState} />;
}
