/**
 * Nuzlocke — Teambuilding Screen
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { Dex, toID } from "../../battle-dex";
import { BattleNatures } from "../../battle-dex-data";
import { NzScreen, NzScreenHeader } from "../components/layout";
import { NzBtn, NzTypeBadges } from "../components/primitives";
import { NzItemTable } from "../components/item-table";
import { NzMovePanel, formatTarget } from "../components/move-panel";
import { NzStatPair, NzPartySlot, NzOpponentSlot } from "../components/teambuilding";
import { calcIvScore, calcNatureQuality, calcCombinedPercentile } from "./encounters";
import type { NuzlockePanelPayload } from "../types";


interface TeambuildingState {
	moves: Record<string, string[]>;
	heldItems: Record<string, string>;
	errors: Record<string, string>;
	selectedUid: string | null;
	selectedOpponent: { battleIdx: number; slotIdx: number } | null;
}

export class TeambuildingScreen extends preact.Component<{ game: NuzlockePanelPayload }, TeambuildingState> {
	override state: TeambuildingState = { moves: {}, heldItems: {}, errors: {}, selectedUid: null, selectedOpponent: null };

	static getDerivedStateFromProps(
		props: { game: NuzlockePanelPayload },
		state: TeambuildingState
	): Partial<TeambuildingState> | null {
		const moves = { ...state.moves };
		const heldItems = { ...state.heldItems };
		let changed = false;
		props.game.box.filter(p => p.alive).forEach(p => {
			const uid = p.uid;
			const serverMoves = p.moves.map(m => toID(m));
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
				heldItems[uid] = toID(p.item);
				changed = true;
			}
		});
		let selectedUid = state.selectedUid;
		if (!selectedUid) {
			const defaultUid = props.game.party[0]
				?? props.game.box.find(p => p.alive && !props.game.party.includes(p.uid))?.uid
				?? null;
			if (defaultUid) {
				selectedUid = defaultUid;
				changed = true;
			}
		}
		return changed ? { moves, heldItems, selectedUid } : null;
	}

	select = (uid: string) => this.setState({ selectedUid: uid, selectedOpponent: null });
	selectOpponent = (battleIdx: number, slotIdx: number) => this.setState({ selectedOpponent: { battleIdx, slotIdx }, selectedUid: null });

	setMove = (uid: string, slot: number, value: string) => {
		this.setState((s: TeambuildingState) => {
			const moves = { ...s.moves, [uid]: [...(s.moves[uid] ?? ['', '', '', ''])] };
			moves[uid][slot] = value;
			return { moves };
		});
	};

	setItem = (uid: string, value: string) => {
		this.setState((s: TeambuildingState) => ({ heldItems: { ...s.heldItems, [uid]: value } }));
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
		// Include all alive Pokemon so box moves are persisted; server only uses party for battle
		const parts = game.box.filter(p => p.alive).map(p => {
			const uid = p.uid;
			const m = (moves[uid] ?? []).filter(Boolean).concat(['', '', '', '']).slice(0, 4).join(',');
			const item = heldItems[uid] || 'none';
			return `${uid} ${m} ${item}`;
		}).join(' ');
		PS.send(`/nuzlocke battlewithmoves ${parts}`);
	};

	render() {
		const { game } = this.props;
		const { moves, heldItems, errors, selectedUid, selectedOpponent } = this.state;
		const boxDisabled = game.boxDisabled;
		const segment = game.segment!;
		const battle = segment.battles[game.currentBattleIndex];
		const remainingBattles = segment.battles.slice(game.currentBattleIndex);
		const partyPokemon = game.party.map(uid => game.box.find(p => p.uid === uid)!).filter(Boolean);
		const boxOnly = game.box.filter(p => p.alive && !game.party.includes(p.uid));

		const evolveAllCount = game.box.filter(p => p.alive).filter(p => {
			const evos = (game.availableEvolutions[p.uid] ?? []).filter(e => e.item === null);
			return evos.length === 1;
		}).length;

		const selectedPokemon = selectedUid ? (game.box.find(p => p.uid === selectedUid) ?? null) : null;
		const isInParty = selectedUid ? game.party.includes(selectedUid) : false;
		const hasErrors = Object.keys(errors).length > 0;

		const itemCount = (id: string) =>
			game.items.filter(i => toID(i) === id).length;
		const heldByOthers = (uid: string, id: string) =>
			game.party
				.filter(pid => pid !== uid)
				.filter(pid => toID(heldItems[pid] ?? game.box.find(p => p.uid === pid)?.item ?? '') === id)
				.length;

		const selectedOppPokemon = selectedOpponent !== null
			? remainingBattles[selectedOpponent.battleIdx]?.team[selectedOpponent.slotIdx]
			: null;

		// ---- Detail panel ----
		let detailContent: preact.VNode;
		if (selectedOppPokemon) {
			// Opponent read-only detail
			const opp = selectedOppPokemon;
			detailContent = <>
				<div class="nz-tb-info-stats">
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
							<div class="nz-card-types"><NzTypeBadges species={opp.species} generation={this.props.game.generation} /></div>
							<div class="nz-card-nature">{opp.ability}</div>
							{(() => {
								const desc = Dex.forGen(this.props.game.generation).abilities.get(opp.ability).shortDesc;
								return desc ? <div class="nz-card-subdesc">{desc}</div> : null;
							})()}
						</div>
					</div>
					<NzStatPair species={opp.species} generation={this.props.game.generation} />
				</div>

				<div class="nz-moves-grid">
					<span class="nz-moves-col-header">Move</span>
					<span class="nz-moves-col-header">Type</span>
					<span class="nz-moves-col-header">Cat</span>
					<span class="nz-moves-col-header">BP</span>
					<span class="nz-moves-col-header">Acc</span>
					<span class="nz-moves-col-header">Target</span>
					<span class="nz-moves-col-header">Effect</span>
					{opp.moves.map((moveId, i) => {
						const move = moveId ? Dex.forGen(this.props.game.generation).moves.get(moveId) : null;
						const ex = !!(move?.exists);
						const cat = ex ? move!.category : '';
						const power = ex && move!.basePower > 0 ? `${move!.basePower}` : ex ? '—' : '';
						const acc = ex ? (move!.accuracy === true ? '—' : `${move!.accuracy}%`) : '';
						return <preact.Fragment key={i}>
							<div class="nz-tb-move-name">{ex ? move!.name : moveId || '—'}</div>
							{ex ? <span class={`nz-type nz-type-${move!.type.toLowerCase()}`}>{move!.type}</span> : <span />}
							{ex ? <span class={`nz-move-cat nz-move-cat-${move!.category.toLowerCase()}`}>{cat}</span> : <span />}
							<span class={ex ? 'nz-move-stat' : ''}>{power}</span>
							<span class={ex ? 'nz-move-stat' : ''}>{acc}</span>
							<span class="nz-move-stat">{ex ? formatTarget(move!.target) : ''}</span>
							<span class="nz-move-grid-desc">{ex ? (move!.shortDesc ?? '') : ''}</span>
						</preact.Fragment>;
					})}
				</div>

				{opp.item && (() => {
					const item = Dex.forGen(this.props.game.generation).items.get(opp.item);
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
			const legalMoves = game.legalMoves[selectedPokemon.uid] ?? [];
			const selectedMoves = moves[selectedPokemon.uid] ?? ['', '', '', ''];
			const evos = game.availableEvolutions[selectedPokemon.uid] ?? [];
			const error = isInParty ? errors[selectedPokemon.uid] : undefined;

			const sp = Dex.forGen(this.props.game.generation).species.get(selectedPokemon.species);
			const nat = BattleNatures[selectedPokemon.nature as keyof typeof BattleNatures] ?? {} as any;
			const natureQuality = sp?.exists ? calcNatureQuality(nat, sp.baseStats) : 'neutral' as const;
			const ivScore = sp?.exists && selectedPokemon.ivs ? calcIvScore(selectedPokemon.ivs, sp.baseStats) : 0;
			const ivPct = Math.round(ivScore * 100);
			const ivTier = ivPct >= 62 ? 'high' : ivPct >= 50 ? 'mid' : ivPct >= 38 ? 'low' : 'poor';
			const ivLabel = ivTier === 'high' ? 'Great' : ivTier === 'mid' ? 'Good' : ivTier === 'low' ? 'Fair' : 'Poor';

			const combinedPct = sp?.exists ? calcCombinedPercentile(ivScore, natureQuality, sp.baseStats) : null;
			const topPercentile = combinedPct !== null && combinedPct <= 0.05 ? combinedPct : null;
			const worsePercentile = combinedPct !== null && combinedPct >= 0.95 ? combinedPct : null;
			const formatTopPct = (p: number): string => {
				const pct = p * 100;
				return pct < 1 ? `${pct.toFixed(1)}%` : `${Math.round(pct)}%`;
			};

			detailContent = <>
				<div class="nz-tb-info-stats">
					<div class="nz-tb-left-col">
						<div class="nz-tb-detail-header">
							<div class="nz-tb-detail-sprite">
								<img
									src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(selectedPokemon.species)}.png`}
									alt={selectedPokemon.species}
								/>
							</div>
							<div class="nz-tb-detail-info">
								<div class="nz-card-nickname">
									<span>{selectedPokemon.nickname}</span>
									{topPercentile && <span class="nz-tb-percentile-badge nz-tb-percentile-top">Top {formatTopPct(topPercentile)}</span>}
									{worsePercentile && <span class="nz-tb-percentile-badge nz-tb-percentile-worse">Bottom {formatTopPct(worsePercentile)}</span>}
								</div>
								{selectedPokemon.nickname !== selectedPokemon.species &&
									<div class="nz-card-species">{selectedPokemon.species}</div>}
								<div class="nz-card-level">Lv. {segment.levelCap}</div>
								<div class="nz-card-types"><NzTypeBadges species={selectedPokemon.species} generation={this.props.game.generation} /></div>
							</div>
						</div>
						<div class="nz-tb-nature-ability">
							<div class="nz-tb-nature-col">
								<div class="nz-card-nature" style="display:flex;align-items:center;gap:6px">
									<span>{selectedPokemon.nature}</span>
									{natureQuality !== 'neutral' &&
										<span class={`nz-nature-quality nz-nature-quality-${natureQuality}`}>{natureQuality}</span>
									}
								</div>
								{nat.plus && nat.minus
									? <div class="nz-card-subdesc">+{nat.plus.toUpperCase()} −{nat.minus.toUpperCase()}</div>
									: <div class="nz-card-subdesc">Neutral</div>
								}
							</div>
							<div class="nz-tb-ability-col">
								<div class="nz-card-nature">{selectedPokemon.ability}</div>
								{(() => {
									const desc = Dex.forGen(this.props.game.generation).abilities.get(selectedPokemon.ability).shortDesc;
									return desc ? <div class="nz-card-subdesc">{desc}</div> : null;
								})()}
							</div>
						</div>
					</div>
					<NzStatPair species={selectedPokemon.species} nature={selectedPokemon.nature} generation={this.props.game.generation} ivs={selectedPokemon.ivs} ivsExtra={selectedPokemon.ivs && ivLabel !== 'Fair' ? <span class={`nz-iv-score nz-iv-score-${ivTier}`}>{ivLabel}</span> : undefined} />
				</div>

				{error && <div class="nz-card-error" style="margin-bottom:8px;">⚠ {error}</div>}

				<NzMovePanel
					moves={selectedMoves}
					legalMoves={legalMoves}
					generation={this.props.game.generation}
					onChange={newMoves => {
						newMoves.forEach((id, slot) => this.setMove(selectedPokemon.uid, slot, id));
					}}
				/>

				{isInParty && <>
					<div class="nz-label" style="margin-top:12px;margin-bottom:5px;">Held Item</div>
					{(() => {
						const disabledItemIds = game.holdableItems
							.filter(({ id }) => heldByOthers(selectedPokemon.uid, id) >= itemCount(id))
							.map(({ id }) => id);
						return <NzItemTable
							value={heldItems[selectedPokemon.uid] ?? ''}
							items={game.holdableItems}
							disabledIds={disabledItemIds}
							onChange={id => this.setItem(selectedPokemon.uid, id)}
						/>;
					})()}
				</>}

				<div class="nz-tb-detail-actions">
					<div>
						{!boxDisabled && (isInParty
							? <NzBtn size="sm" variant="danger"
								onClick={() => PS.send(`/nuzlocke removefromparty ${selectedPokemon.uid}`)}>
								Remove from Party
							</NzBtn>
							: game.party.length < 6
								? <NzBtn size="sm" variant="secondary"
									onClick={() => PS.send(`/nuzlocke addtoparty ${selectedPokemon.uid}`)}>
									Add to Party
								</NzBtn>
								: null
						)}
					</div>
					{evos.length > 0 && <div class="nz-tb-detail-evos">
						{evos.map(evo =>
							<NzBtn key={evo.species} size="sm" variant="evolve"
								onClick={() => PS.send(`/nuzlocke evolve ${selectedPokemon.uid} ${toID(evo.species)}`)}>
								{evo.type === 'item'
									? `Evolve → ${evo.species} (${evo.item})`
									: selectedPokemon.species === 'Nincada' && evo.species === 'Ninjask'
										? 'Evolve → Ninjask (+Shedinja)'
										: `Evolve → ${evo.species}`}
							</NzBtn>
						)}
					</div>}
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
				<div class={`nz-tb-detail${selectedOpponent !== null ? ' nz-tb-detail-opponent' : ''}`}>
					{detailContent}
				</div>

				{/* Col 2: party + box + opponent — three independently-scrolling columns */}
				<div class="nz-tb-columns">

					<div class="nz-tb-party-col">
						<div class="nz-section-title">Party ({partyPokemon.length}/6){!boxDisabled && <span class="nz-tb-hint">double-click to move to box</span>}</div>
						<div class="nz-tb-col-scroll">
							{([0, 1, 2, 3, 4, 5] as const).map(i => {
								const pok = partyPokemon[i];
								return pok
									? <NzPartySlot
										key={pok.uid}
										pokemon={pok}
										levelCap={segment.levelCap}
										generation={this.props.game.generation}
										selected={selectedUid === pok.uid}
										isFirst={i === 0}
										isLast={i === partyPokemon.length - 1}
										onSelect={() => this.select(pok.uid)}
										onDoubleClick={boxDisabled ? undefined : () => PS.send(`/nuzlocke removefromparty ${pok.uid}`)}
										onMoveUp={() => PS.send(`/nuzlocke partymove ${pok.uid} left`)}
										onMoveDown={() => PS.send(`/nuzlocke partymove ${pok.uid} right`)}
										hasError={!!errors[pok.uid]}
										canEvolve={!!(game.availableEvolutions[pok.uid]?.length)}
									/>
									: <div key={i} class="nz-party-slot nz-party-slot-empty">— empty —</div>;
							})}
						</div>
					</div>

					<div class="nz-tb-box-col">
						<div class="nz-section-title">Box ({boxOnly.length}){boxDisabled ? <span class="nz-tb-hint">locked during battle sequence</span> : <span class="nz-tb-hint">double-click to add to party</span>}</div>
						<div class="nz-tb-col-scroll">
							{Array.from({ length: Math.ceil(boxOnly.length / 3) }, (_, i) => {
								const chunk = boxOnly.slice(i * 3, i * 3 + 3);
								return <div key={i} class="nz-box-row-cell">
									{[0, 1, 2].map(j => chunk[j]
										? <div
											key={chunk[j].uid}
											class={`nz-tb-box-card${selectedUid === chunk[j].uid ? ' nz-tb-box-card-selected' : ''}${game.availableEvolutions[chunk[j].uid]?.length ? ' nz-tb-box-card-evolve' : ''}${boxDisabled ? ' nz-tb-box-card-disabled' : ''}`}
											onClick={() => this.select(chunk[j].uid)}
											onDblClick={boxDisabled ? undefined : () => game.party.length < 6 && PS.send(`/nuzlocke addtoparty ${chunk[j].uid}`)}
										>
											<img
												src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(chunk[j].species)}.png`}
												alt={chunk[j].species}
											/>
											<div class="nz-tb-box-card-name">{chunk[j].nickname}</div>
										</div>
										: null
									)}
								</div>;
							})}
						</div>
					</div>

					<div class="nz-tb-opponent-col">
						<div class="nz-section-title nz-section-title-danger">vs. {battle?.trainer ?? 'Opponent'}</div>
						<div class="nz-tb-col-scroll">
							{remainingBattles.map((b, bi) => <preact.Fragment key={bi}>
								{bi > 0 && <div class="nz-section-title nz-section-title-danger" style="margin-top:12px;">vs. {b.trainer}</div>}
								{b.team.map((opp, i) =>
									<NzOpponentSlot
										key={`${bi}-${i}`}
										pokemon={opp}
										generation={this.props.game.generation}
										selected={selectedOpponent?.battleIdx === bi && selectedOpponent?.slotIdx === i}
										onSelect={() => this.selectOpponent(bi, i)}
									/>
								)}
							</preact.Fragment>)}
						</div>
					</div>

				</div>

			</div>

			{/* Battle button — below layout */}
			<div class="nz-tb-battle-footer">
				{hasErrors && <p class="nz-error">⚠ Fix errors before battling.</p>}
				<div class="nz-tb-footer-row">
					{evolveAllCount > 0 && <NzBtn
						size="sm"
						variant="evolve"
						onClick={() => PS.send('/nuzlocke evolveall')}
						title="Evolves all Pokémon with exactly one available evolution that uses no items. Level-up and trade evolutions qualify; stone evolutions and branching choices (e.g. Wurmple) are skipped."
					>
						Evolve All ({evolveAllCount})
					</NzBtn>}
					<NzBtn
						onClick={this.clickBattle}
						disabled={partyPokemon.length === 0}
						title={partyPokemon.length === 0 ? 'Add Pokémon to party first' : ''}
					>
						Battle!
					</NzBtn>
				</div>
			</div>
		</NzScreen>;
	}
}
