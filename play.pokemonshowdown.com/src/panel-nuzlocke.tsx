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
	NzRouteCard, NzRouteCardCaught, NzPartySlot, NzOpponentSlot, NzStatBars, NzIvBars,
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
	selectedUid: string | null;
	selectedOpponentIndex: number | null;
}

class TeambuildingScreen extends preact.Component<{ game: NuzlockeStatePayload }, TeambuildingState> {
	state: TeambuildingState = { moves: {}, heldItems: {}, errors: {}, selectedUid: null, selectedOpponentIndex: null };

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

	select = (uid: string) => this.setState({ selectedUid: uid, selectedOpponentIndex: null });
	selectOpponent = (index: number) => this.setState({ selectedOpponentIndex: index, selectedUid: null });
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
		const { moves, heldItems, errors, selectedUid, selectedOpponentIndex } = this.state;
		const segment = game.segment!;
		const battle = segment.battles[game.currentBattleIndex];
		const partyPokemon = game.party.map(uid => game.box.find(p => p.uid === uid)!).filter(Boolean);
		const boxOnly = game.box.filter(p => p.alive && !game.party.includes(p.uid));

		const selectedPokemon = selectedUid ? (game.box.find(p => p.uid === selectedUid) ?? null) : null;
		const isInParty = selectedUid ? game.party.includes(selectedUid) : false;
		const hasErrors = Object.keys(errors).length > 0;

		const takenItems = (uid: string) => new Set(
			game.party
				.filter(id => id !== uid)
				.map(id => heldItems[id] ?? game.box.find(p => p.uid === id)?.item ?? '')
				.filter(Boolean)
		);

		// ---- Detail panel ----
		let detailContent: preact.VNode;
		if (selectedOpponentIndex !== null && battle?.team[selectedOpponentIndex]) {
			// Opponent read-only detail
			const opp = battle.team[selectedOpponentIndex];
			detailContent = <>
				<div class="nz-tb-detail-header">
					<div class="nz-tb-detail-sprite">
						<img
							src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(opp.species)}.png`}
							alt={opp.species}
						/>
					</div>
					<div class="nz-tb-detail-info">
						<div class="nz-card-nickname">{opp.species}</div>
						<div class="nz-card-level">Lv. {opp.level}</div>
						<div class="nz-card-types"><NzTypeBadges species={opp.species} /></div>
						<div class="nz-card-nature">{opp.ability}</div>
					</div>
				</div>

				<div class="nz-stat-split">
					<div>
						<div class="nz-label" style="margin-bottom:4px;">Base</div>
						<NzStatBars species={opp.species} />
					</div>
					<div>
						<div class="nz-label" style="margin-bottom:4px;">IVs</div>
						<div class="nz-stat-no-ivs">Enemy Pokémon don't have IVs.</div>
					</div>
				</div>

				<div class="nz-moves-grid">
					<span class="nz-moves-col-header">Move</span>
					<span class="nz-moves-col-header">Type</span>
					<span class="nz-moves-col-header">Cat</span>
					<span class="nz-moves-col-header">BP</span>
					<span class="nz-moves-col-header">Acc</span>
					<span class="nz-moves-col-header">Effect</span>
					{opp.moves.map((moveId, i) => {
						const move = moveId ? Dex.moves.get(moveId) : null;
						const ex = !!(move?.exists);
						const cat = ex ? (move!.category === 'Physical' ? 'Phys' : move!.category === 'Special' ? 'Spec' : 'Status') : '';
						const power = ex && move!.basePower > 0 ? `${move!.basePower}` : ex ? '—' : '';
						const acc = ex ? (move!.accuracy === true ? '—' : `${move!.accuracy}%`) : '';
						return <preact.Fragment key={i}>
							<div class="nz-tb-move-name">{ex ? move!.name : moveId || '—'}</div>
							{ex ? <span class={`nz-type nz-type-${move!.type.toLowerCase()}`}>{move!.type}</span> : <span />}
							{ex ? <span class={`nz-move-cat nz-move-cat-${move!.category.toLowerCase()}`}>{cat}</span> : <span />}
							<span class={ex ? 'nz-move-stat' : ''}>{power}</span>
							<span class={ex ? 'nz-move-stat' : ''}>{acc}</span>
							<span class="nz-move-grid-desc">{ex ? (move!.shortDesc ?? '') : ''}</span>
						</preact.Fragment>;
					})}
				</div>

				{opp.item && (() => {
					const item = Dex.items.get(opp.item);
					return <>
						<div class="nz-label" style="margin-top:12px;margin-bottom:5px;">Held Item</div>
						<div class="nz-move-slot">
							<div class="nz-tb-move-name">{item.exists ? item.name : opp.item}</div>
							{item.exists && item.shortDesc && <div class="nz-item-desc">{item.shortDesc}</div>}
						</div>
					</>;
				})()}
			</>;
		} else if (!selectedPokemon) {
			detailContent = <div class="nz-tb-detail-empty">
				<p class="nz-notice">Select a Pokémon to edit</p>
			</div>;
		} else {
			const legalMoves = isInParty ? (game.legalMoves[selectedPokemon.uid] ?? []) : [];
			const selectedMoves = isInParty ? (moves[selectedPokemon.uid] ?? ['', '', '', '']) : [];
			const evos = game.availableEvolutions[selectedPokemon.uid] ?? [];
			const error = isInParty ? errors[selectedPokemon.uid] : undefined;

			detailContent = <>
				<div class="nz-tb-detail-header">
					<div class="nz-tb-detail-sprite">
						<img
							src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(selectedPokemon.species)}.png`}
							alt={selectedPokemon.species}
							class={selectedPokemon.shiny ? 'shiny' : ''}
						/>
					</div>
					<div class="nz-tb-detail-info">
						<div class="nz-card-nickname">
							{selectedPokemon.nickname}
							{selectedPokemon.shiny && <span style="color:var(--nz-warning);margin-left:4px;">★</span>}
						</div>
						{selectedPokemon.nickname !== selectedPokemon.species &&
							<div class="nz-card-species">{selectedPokemon.species}</div>}
						<div class="nz-card-level">Lv. {segment.levelCap}</div>
						<div class="nz-card-types"><NzTypeBadges species={selectedPokemon.species} /></div>
						<div class="nz-card-nature">{selectedPokemon.nature} · {selectedPokemon.ability}</div>
					</div>
				</div>

				<div class="nz-stat-split">
					<div>
						<div class="nz-label" style="margin-bottom:4px;">Base</div>
						<NzStatBars species={selectedPokemon.species} />
					</div>
					<div>
						<div class="nz-label" style="margin-bottom:4px;">IVs</div>
						<NzIvBars ivs={selectedPokemon.ivs} />
					</div>
				</div>

				{error && <div class="nz-card-error" style="margin-bottom:8px;">⚠ {error}</div>}

				{isInParty && <>
					<div class="nz-moves-grid">
						<span class="nz-moves-col-header">Move</span>
						<span class="nz-moves-col-header">Type</span>
						<span class="nz-moves-col-header">Cat</span>
						<span class="nz-moves-col-header">BP</span>
						<span class="nz-moves-col-header">Acc</span>
						<span class="nz-moves-col-header">Effect</span>
						{[0, 1, 2, 3].map(slot => {
							const moveId = selectedMoves[slot] ?? '';
							const move = moveId ? Dex.moves.get(moveId) : null;
							const ex = !!(move?.exists);
							const cat = ex ? (move!.category === 'Physical' ? 'Phys' : move!.category === 'Special' ? 'Spec' : 'Status') : '';
							const power = ex && move!.basePower > 0 ? `${move!.basePower}` : ex ? '—' : '';
							const acc = ex ? (move!.accuracy === true ? '—' : `${move!.accuracy}%`) : '';
							return <preact.Fragment key={slot}>
								<select
									class="nz-tb-select"
									value={moveId}
									onChange={e => this.setMove(selectedPokemon.uid, slot, (e.target as HTMLSelectElement).value)}
								>
									<option value="">(empty)</option>
									{legalMoves.map(m =>
										<option key={m.name} value={toID(m.name)}>
											{m.fromTM ? `${m.name} (TM)` : m.name}
										</option>
									)}
								</select>
								{ex ? <span class={`nz-type nz-type-${move!.type.toLowerCase()}`}>{move!.type}</span> : <span />}
								{ex ? <span class={`nz-move-cat nz-move-cat-${move!.category.toLowerCase()}`}>{cat}</span> : <span />}
								<span class={ex ? 'nz-move-stat' : ''}>{power}</span>
								<span class={ex ? 'nz-move-stat' : ''}>{acc}</span>
								<span class="nz-move-grid-desc">{ex ? (move!.shortDesc ?? '') : ''}</span>
							</preact.Fragment>;
						})}
					</div>

					<div class="nz-label" style="margin-top:12px;margin-bottom:5px;">Held Item</div>
					<div class="nz-move-slot">
						<select
							class="nz-tb-select"
							value={heldItems[selectedPokemon.uid] ?? ''}
							onChange={e => this.setItem(selectedPokemon.uid, (e.target as HTMLSelectElement).value)}
						>
							<option value="">(none)</option>
							{game.items.map(item => {
								const id = toID(item);
								return <option key={id} value={id} disabled={takenItems(selectedPokemon.uid).has(item)}>
									{item}
								</option>;
							})}
						</select>
						{(() => {
							const itemId = heldItems[selectedPokemon.uid] ?? '';
							const item = itemId ? Dex.items.get(itemId) : null;
							const desc = item?.exists ? item.shortDesc : '';
							return desc ? <div class="nz-item-desc">{desc}</div> : null;
						})()}
					</div>
				</>}

				<div class="nz-tb-detail-actions">
					{isInParty
						? <NzBtn size="sm" variant="danger"
							onClick={() => PS.send(`/nuzlocke removefromparty ${selectedPokemon.uid}`)}>
							Remove from Party
						</NzBtn>
						: game.party.length < 6 &&
							<NzBtn size="sm" variant="secondary"
								onClick={() => PS.send(`/nuzlocke addtoparty ${selectedPokemon.uid}`)}>
								Add to Party
							</NzBtn>
					}
					{evos.map(evo =>
						<NzBtn key={evo.species} size="sm" variant="secondary"
							onClick={() => PS.send(`/nuzlocke evolve ${selectedPokemon.uid} ${toID(evo.species)}`)}>
							{evo.type === 'item'
								? `Evolve → ${evo.species} (${evo.item})`
								: `Evolve → ${evo.species}`}
						</NzBtn>
					)}
				</div>
			</>;
		}

		// ---- Full render ----
		return <NzScreen>
			<NzScreenHeader
				title={`vs. ${battle?.trainer ?? 'Unknown'}`}
				meta={[
					{ label: 'Level Cap', value: String(segment.levelCap) },
					{ label: 'Segment', value: segment.name },
				]}
			/>

			<div class="nz-tb-layout">

				{/* Col 1: detail panel */}
				<div class={`nz-tb-detail${selectedOpponentIndex !== null ? ' nz-tb-detail-opponent' : ''}`}>
					{detailContent}
				</div>

				{/* Col 2: party + opponent + box (shared grid — rows size together) */}
				<div class="nz-tb-columns">
					<div class="nz-section-title">Party ({partyPokemon.length}/6)</div>
					<div class="nz-section-title nz-section-title-danger">vs. {battle?.trainer ?? 'Opponent'}</div>
					<div class="nz-section-title">Box ({boxOnly.length})</div>
					{([0, 1, 2, 3, 4, 5] as const).map(i => {
						const pok = partyPokemon[i];
						const opp = battle?.team[i];
						const chunk = boxOnly.slice(i * 3, i * 3 + 3);
						return <preact.Fragment key={i}>
							{pok
								? <NzPartySlot
									pokemon={pok}
									levelCap={segment.levelCap}
									selected={selectedUid === pok.uid}
									isFirst={i === 0}
									isLast={i === partyPokemon.length - 1}
									onSelect={() => this.select(pok.uid)}
									onMoveUp={() => PS.send(`/nuzlocke partymove ${pok.uid} left`)}
									onMoveDown={() => PS.send(`/nuzlocke partymove ${pok.uid} right`)}
									hasError={!!errors[pok.uid]}
								/>
								: <div class="nz-party-slot nz-party-slot-empty">— empty —</div>
							}
							{opp
								? <NzOpponentSlot
									pokemon={opp}
									selected={selectedOpponentIndex === i}
									onSelect={() => this.selectOpponent(i)}
								/>
								: <div class="nz-party-slot nz-party-slot-empty" />
							}
							<div class="nz-box-row-cell">
								{[0, 1, 2].map(j => chunk[j]
									? <div
										key={chunk[j].uid}
										class={`nz-tb-box-card${selectedUid === chunk[j].uid ? ' nz-tb-box-card-selected' : ''}`}
										onClick={() => this.select(chunk[j].uid)}
									>
										<img
											src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(chunk[j].species)}.png`}
											alt={chunk[j].species}
										/>
										<div class="nz-tb-box-card-name">{chunk[j].nickname}</div>
									</div>
									: null
								)}
							</div>
						</preact.Fragment>;
					})}
					{boxOnly.length > 18 && Array.from({ length: Math.ceil((boxOnly.length - 18) / 3) }, (_, i) => {
						const chunk = boxOnly.slice(18 + i * 3, 21 + i * 3);
						return <preact.Fragment key={`overflow-${i}`}>
							<div />
							<div />
							<div class="nz-box-row-cell">
								{[0, 1, 2].map(j => chunk[j]
									? <div
										key={chunk[j].uid}
										class={`nz-tb-box-card${selectedUid === chunk[j].uid ? ' nz-tb-box-card-selected' : ''}`}
										onClick={() => this.select(chunk[j].uid)}
									>
										<img
											src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(chunk[j].species)}.png`}
											alt={chunk[j].species}
										/>
										<div class="nz-tb-box-card-name">{chunk[j].nickname}</div>
									</div>
									: null
								)}
							</div>
						</preact.Fragment>;
					})}
				</div>

			</div>

			{/* Battle button — below layout */}
			<div class="nz-tb-battle-footer">
				{hasErrors && <p class="nz-error">⚠ Fix errors before battling.</p>}
				<NzBtn
					onClick={this.clickBattle}
					disabled={partyPokemon.length === 0}
					title={partyPokemon.length === 0 ? 'Add Pokémon to party first' : ''}
				>
					Battle!
				</NzBtn>
			</div>
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
	case 'intro':
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
