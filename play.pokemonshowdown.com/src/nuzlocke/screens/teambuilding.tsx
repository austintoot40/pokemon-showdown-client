/**
 * Nuzlocke — Teambuilding Screen
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { Dex, toID } from "../../battle-dex";
import { NzScreen, NzScreenHeader } from "../components/layout";
import { NzBtn, NzTypeBadges } from "../components/primitives";
import { NzStatBars, NzIvBars, NzPartySlot, NzOpponentSlot } from "../components/teambuilding";
import type { NuzlockePanelPayload } from "../types";

interface TeambuildingState {
	moves: Record<string, string[]>;
	heldItems: Record<string, string>;
	errors: Record<string, string>;
	selectedUid: string | null;
	selectedOpponentIndex: number | null;
}

export class TeambuildingScreen extends preact.Component<{ game: NuzlockePanelPayload }, TeambuildingState> {
	state: TeambuildingState = { moves: {}, heldItems: {}, errors: {}, selectedUid: null, selectedOpponentIndex: null };

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
						const move = moveId ? Dex.forGen(this.props.game.generation).moves.get(moveId) : null;
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

				<div class="nz-moves-grid">
					<span class="nz-moves-col-header">Move</span>
					<span class="nz-moves-col-header">Type</span>
					<span class="nz-moves-col-header">Cat</span>
					<span class="nz-moves-col-header">BP</span>
					<span class="nz-moves-col-header">Acc</span>
					<span class="nz-moves-col-header">Effect</span>
					{[0, 1, 2, 3].map(slot => {
						const moveId = selectedMoves[slot] ?? '';
						const move = moveId ? Dex.forGen(this.props.game.generation).moves.get(moveId) : null;
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
									<option 
										key={m.name} 
										value={toID(m.name)}
										disabled={selectedMoves.includes(toID(m.name))}
									>
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

				{isInParty && <>
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
								return <option key={id} value={id} disabled={takenItems(selectedPokemon.uid).has(id)}>
									{item}
								</option>;
							})}
						</select>
						{(() => {
							const itemId = heldItems[selectedPokemon.uid] ?? '';
							const item = itemId ? Dex.forGen(this.props.game.generation).items.get(itemId) : null;
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
						<NzBtn key={evo.species} size="sm" variant="evolve"
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
					<div class="nz-section-title">Party ({partyPokemon.length}/6)<span class="nz-tb-hint">double-click to move to box</span></div>
					<div class="nz-section-title nz-section-title-danger">vs. {battle?.trainer ?? 'Opponent'}</div>
					<div class="nz-section-title">Box ({boxOnly.length})<span class="nz-tb-hint">double-click to add to party</span></div>
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
									onDoubleClick={() => PS.send(`/nuzlocke removefromparty ${pok.uid}`)}
									onMoveUp={() => PS.send(`/nuzlocke partymove ${pok.uid} left`)}
									onMoveDown={() => PS.send(`/nuzlocke partymove ${pok.uid} right`)}
									hasError={!!errors[pok.uid]}
									canEvolve={!!(game.availableEvolutions[pok.uid]?.length)}
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
										class={`nz-tb-box-card${selectedUid === chunk[j].uid ? ' nz-tb-box-card-selected' : ''}${game.availableEvolutions[chunk[j].uid]?.length ? ' nz-tb-box-card-evolve' : ''}`}
										onClick={() => this.select(chunk[j].uid)}
										onDblClick={() => game.party.length < 6 && PS.send(`/nuzlocke addtoparty ${chunk[j].uid}`)}
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
										class={`nz-tb-box-card${selectedUid === chunk[j].uid ? ' nz-tb-box-card-selected' : ''}${game.availableEvolutions[chunk[j].uid]?.length ? ' nz-tb-box-card-evolve' : ''}`}
										onClick={() => this.select(chunk[j].uid)}
										onDblClick={() => game.party.length < 6 && PS.send(`/nuzlocke addtoparty ${chunk[j].uid}`)}
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
