/**
 * Nuzlocke — Teambuilding Screen
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { Dex, toID } from "../../battle-dex";
import { BattleNatures } from "../../battle-dex-data";
import { NzScreen, NzTimeline } from "../components/layout";
import { NzBtn, NzSprite, NzTypeBadges } from "../components/primitives";
import { NzTutorial, TutorialStep } from "../components/tutorial";
import { NzItemTable } from "../components/item-table";
import { FeedbackFab } from "../components/feedback-modal";
import { NzMovePanel, formatTarget } from "../components/move-panel";
import { NzStatPair, NzPartySlot, NzOpponentSlot } from "../components/teambuilding";
import { calcIvScore, calcNatureQuality, calcCombinedPercentile } from "./encounters";
import type { NuzlockePanelPayload } from "../types";


type DragSource = { kind: 'party'; uid: string; fromIdx: number } | { kind: 'box'; uid: string };

interface DragState {
	source: DragSource;
	overPartyIdx: number;
	overBox: boolean;
	clientX: number;
	clientY: number;
	startX: number;
	startY: number;
	active: boolean;
}

interface TeambuildingState {
	moves: Record<string, string[]>;
	heldItems: Record<string, string>;
	errors: Record<string, string>;
	selectedUid: string | null;
	selectedOpponent: { battleIdx: number; slotIdx: number } | null;
	showTutorial: boolean;
	activeTab: 'moves' | 'items';
	drag: DragState | null;
	showItemWarning: boolean;
	mobileTab: 'loadout' | 'team' | 'vs';
}

export class TeambuildingScreen extends preact.Component<{ game: NuzlockePanelPayload; onFeedback?: () => void }, TeambuildingState> {
	override state: TeambuildingState = { moves: {}, heldItems: {}, errors: {}, selectedUid: null, selectedOpponent: null, showTutorial: false, activeTab: 'moves', drag: null, showItemWarning: false, mobileTab: 'loadout' };

	// Instance variable tracks drag state synchronously — avoids reading stale Preact state in document event handlers.
	_drag: DragState | null = null;
	_dragJustEnded = false;

	override componentDidMount() {
		try {
			const key = `nuzlocke_tutorial_${PS.user.userid || PS.user.name}`;
			const seen = JSON.parse(localStorage.getItem(key) ?? '{}');
			if (!seen.teambuilding) this.setState({ showTutorial: true });
		} catch {}
	}

	override componentWillUnmount() {
		this.cancelDrag();
	}

	_startDrag(initialState: DragState) {
		this._drag = initialState;
		this.setState({ drag: this._drag });
		document.addEventListener('pointermove', this.onDragMove);
		document.addEventListener('pointerup', this.onDragEnd);
		document.addEventListener('pointercancel', this.cancelDrag);
	}

	cancelDrag = () => {
		document.removeEventListener('pointermove', this.onDragMove);
		document.removeEventListener('pointerup', this.onDragEnd);
		document.removeEventListener('pointercancel', this.cancelDrag);
		this._drag = null;
		this.setState({ drag: null });
	};

	startPartyDrag = (uid: string, fromIdx: number, e: PointerEvent) => {
		this._startDrag({
			source: { kind: 'party', uid, fromIdx },
			overPartyIdx: fromIdx,
			overBox: false,
			clientX: e.clientX,
			clientY: e.clientY,
			startX: e.clientX,
			startY: e.clientY,
			active: false,
		});
	};

	startBoxDrag = (uid: string, e: PointerEvent) => {
		const { game } = this.props;
		if (game.boxDisabled || game.party.length >= 6) return;
		e.preventDefault();
		e.stopPropagation();
		this._startDrag({
			source: { kind: 'box', uid },
			overPartyIdx: game.party.length,
			overBox: false,
			clientX: e.clientX,
			clientY: e.clientY,
			startX: e.clientX,
			startY: e.clientY,
			active: false,
		});
	};

	onDragMove = (e: PointerEvent) => {
		const drag = this._drag;
		if (!drag) return;
		e.preventDefault();
		const dx = e.clientX - drag.startX;
		const dy = e.clientY - drag.startY;
		const nowActive = drag.active || Math.hypot(dx, dy) > 5;
		const overPartyIdx = nowActive ? this.computeOverPartyIdx(e.clientY) : drag.overPartyIdx;
		const overBox = nowActive && drag.source.kind === 'party' && this.isOverBox(e.clientX, e.clientY);
		this._drag = { ...drag, overPartyIdx, overBox, clientX: e.clientX, clientY: e.clientY, active: nowActive };
		this.setState({ drag: this._drag });
	};

	onDragEnd = (_e: PointerEvent) => {
		document.removeEventListener('pointermove', this.onDragMove);
		document.removeEventListener('pointerup', this.onDragEnd);
		document.removeEventListener('pointercancel', this.cancelDrag);
		const drag = this._drag;
		this._drag = null;
		this.setState({ drag: null });
		if (!drag?.active) return;
		this._dragJustEnded = true;
		setTimeout(() => { this._dragJustEnded = false; }, 50);

		const { game } = this.props;
		if (drag.source.kind === 'party') {
			if (drag.overBox) {
				PS.send(`/nuzlocke removefromparty ${drag.source.uid}`);
			} else {
				const fromIdx = drag.source.fromIdx;
				const toIdx = drag.overPartyIdx;
				if (fromIdx !== toIdx) {
					const newParty = [...game.party];
					const [moved] = newParty.splice(fromIdx, 1);
					newParty.splice(toIdx, 0, moved);
					PS.send(`/nuzlocke partyreorder ${newParty.join(' ')}`);
				}
			}
		} else {
			if (!drag.overBox) {
				const newParty = [...game.party];
				newParty.splice(drag.overPartyIdx, 0, drag.source.uid);
				PS.send(`/nuzlocke partyreorder ${newParty.slice(0, 6).join(' ')}`);
			}
		}
	};

	computeOverPartyIdx = (clientY: number): number => {
		const partyLen = this.props.game.party.length;
		const slots = document.querySelectorAll<HTMLElement>('.nz-tb-party-col .nz-party-slot:not(.nz-party-slot-empty), .nz-tb-mobile-party-list .nz-party-slot:not(.nz-party-slot-empty)');
		let overIdx = partyLen;
		for (let i = 0; i < slots.length; i++) {
			const rect = slots[i].getBoundingClientRect();
			if (clientY < rect.top + rect.height / 2) {
				overIdx = i;
				break;
			}
		}
		return Math.max(0, Math.min(overIdx, partyLen));
	};

	isOverBox = (clientX: number, clientY: number): boolean => {
		const boxScroll = document.querySelector<HTMLElement>('.nz-tb-box-col .nz-tb-col-scroll, .nz-tb-mobile-box-grid');
		if (!boxScroll) return false;
		const rect = boxScroll.getBoundingClientRect();
		return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
	};

	dismissTeambuildingTutorial = () => {
		try {
			const key = `nuzlocke_tutorial_${PS.user.userid || PS.user.name}`;
			const seen = JSON.parse(localStorage.getItem(key) ?? '{}');
			seen.teambuilding = true;
			localStorage.setItem(key, JSON.stringify(seen));
		} catch {}
		this.setState({ showTutorial: false });
	};

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

	select = (uid: string) => {
		if (this._dragJustEnded) return;
		this.setState({ selectedUid: uid, selectedOpponent: null, activeTab: 'moves' });
	};

	selectMobileTeamSlot = (uid: string) => {
		if (this._dragJustEnded) return;
		this.setState({ selectedUid: uid, selectedOpponent: null, activeTab: 'moves', mobileTab: 'loadout' });
	};

	selectOpponent = (battleIdx: number, slotIdx: number) => this.setState({ selectedOpponent: { battleIdx, slotIdx }, selectedUid: null, mobileTab: 'vs' });

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
			this.setState({ errors, mobileTab: 'loadout' });
			return;
		}
		const { game } = this.props;
		const { heldItems } = this.state;
		const heldSet = new Set(Object.values(heldItems).filter(Boolean));
		const partyMissingItem = game.party.some(uid => !heldItems[uid]);
		const itemsAvailable = game.holdableItems.some(i => !heldSet.has(i.id));
		if (partyMissingItem && itemsAvailable) {
			this.setState({ showItemWarning: true });
			return;
		}
		this.commitBattle();
	};

	commitBattle = () => {
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

	// ---- Mobile render helpers ----

	renderMobilePartyStrip() {
		const { game } = this.props;
		const { selectedUid, heldItems, errors } = this.state;

		return <div class="nz-tb-mobile-strip">
			{([0, 1, 2, 3, 4, 5] as const).map(i => {
				const uid = game.party[i];
				const pok = uid ? game.box.find(p => p.uid === uid) ?? null : null;
				if (!pok) {
					return <div key={i} class="nz-tb-strip-slot nz-tb-strip-slot-empty">—</div>;
				}
				const held = heldItems[pok.uid] ?? '';
				const heldId = held ? toID(Dex.items.get(held)?.name ?? held) : '';
				return <div
					key={pok.uid}
					class={`nz-tb-strip-slot${selectedUid === pok.uid ? ' nz-tb-strip-slot-selected' : ''}${errors[pok.uid] ? ' nz-tb-strip-slot-error' : ''}`}
					title={pok.nickname}
					onClick={() => this.select(pok.uid)}
				>
					<NzSprite species={pok.species} size={36} />
					{heldId
						? <span class={`itemicon ${heldId} nz-tb-strip-item`} />
						: <span class="nz-tb-strip-item-empty" />
					}
				</div>;
			})}
		</div>;
	}

	renderMobileLoadout() {
		const { game } = this.props;
		const { moves, heldItems, errors, selectedUid } = this.state;
		const segment = game.segment!;

		const selectedPokemon = selectedUid ? (game.box.find(p => p.uid === selectedUid) ?? null) : null;
		const isInParty = selectedUid ? game.party.includes(selectedUid) : false;
		const legalMoves = selectedPokemon ? (game.legalMoves[selectedPokemon.uid] ?? []) : [];
		const selectedMoves = selectedPokemon ? (moves[selectedPokemon.uid] ?? ['', '', '', '']) : ['', '', '', ''];
		const evos = selectedPokemon ? (game.availableEvolutions[selectedPokemon.uid] ?? []) : [];
		const error = selectedPokemon && isInParty ? errors[selectedPokemon.uid] : undefined;

		let statsBlock: preact.VNode | null = null;
		if (selectedPokemon) {
			const sp = Dex.forGen(game.generation).species.get(selectedPokemon.species);
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

			statsBlock = <div class="nz-tb-info-stats">
				<div class="nz-tb-left-col">
					<div class="nz-tb-detail-header">
						<div class="nz-tb-detail-sprite">
							<NzSprite species={selectedPokemon.species} size={60} />
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
							<div class="nz-card-types"><NzTypeBadges species={selectedPokemon.species} generation={game.generation} /></div>
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
								const desc = Dex.forGen(game.generation).abilities.get(selectedPokemon.ability).shortDesc;
								return desc ? <div class="nz-card-subdesc">{desc}</div> : null;
							})()}
						</div>
					</div>
				</div>
				<NzStatPair species={selectedPokemon.species} nature={selectedPokemon.nature} generation={game.generation} ivs={selectedPokemon.ivs} ivsExtra={selectedPokemon.ivs && ivLabel !== 'Fair' ? <span class={`nz-iv-score nz-iv-score-${ivTier}`}>{ivLabel}</span> : undefined} />
			</div>;
		}

		const { onFeedback } = this.props;
		return <div class="nz-tb-mobile-tab nz-tb-mobile-loadout">
			{this.renderMobilePartyStrip()}

			{!selectedPokemon
				? <div class="nz-tb-detail-empty"><p class="nz-notice">Tap a party slot above to edit</p></div>
				: <>
					{statsBlock}

					{error && <div class="nz-card-error" style="margin-bottom:8px;">⚠ {error}</div>}

					<div class="nz-tb-mobile-section">Moves</div>
					<NzMovePanel
						moves={selectedMoves}
						legalMoves={legalMoves}
						generation={game.generation}
						onChange={newMoves => {
							newMoves.forEach((id, slot) => this.setMove(selectedPokemon.uid, slot, id));
						}}
					/>

					{isInParty && <>
						<div class="nz-tb-mobile-section">Held Item</div>
						<NzItemTable
							value={heldItems[selectedPokemon.uid] ?? ''}
							items={game.holdableItems}
							onChange={id => this.setItem(selectedPokemon.uid, id)}
						/>
					</>}

					{evos.length > 0 && <div class="nz-tb-detail-evos" style="margin-top:10px;">
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
				</>
			}
			{onFeedback && <FeedbackFab onClick={onFeedback} />}
		</div>;
	}

	renderMobileTeam() {
		const { game } = this.props;
		const { selectedUid, drag } = this.state;
		const isDragging = !!(drag?.active);
		const dragUid = isDragging ? drag!.source.uid : null;
		const boxDisabled = game.boxDisabled;
		const segment = game.segment!;
		const partyPokemon = game.party.map(uid => game.box.find(p => p.uid === uid)!).filter(Boolean);
		const boxOnly = game.box.filter(p => p.alive && !game.party.includes(p.uid));

		return <div class="nz-tb-mobile-tab nz-tb-mobile-team">
			<div class="nz-section-title">Party ({partyPokemon.length}/6)</div>
			<div class={`nz-tb-mobile-party-list${isDragging && drag!.overBox ? ' nz-party-col-drop-box' : ''}`}>
				{([0, 1, 2, 3, 4, 5] as const).map(i => {
					const pok = partyPokemon[i];
					const isLast = i === partyPokemon.length - 1;
					const dropIndicator = isDragging && !drag!.overBox
						? drag!.overPartyIdx === i ? 'before' as const
						: isLast && drag!.overPartyIdx >= partyPokemon.length ? 'after' as const
						: null
						: null;
					if (pok) {
						return <NzPartySlot
							key={pok.uid}
							pokemon={pok}
							levelCap={segment.levelCap}
							generation={game.generation}
							selected={selectedUid === pok.uid}
							isDragging={isDragging && pok.uid === dragUid}
							dropIndicator={dropIndicator}
							onSelect={() => this.selectMobileTeamSlot(pok.uid)}
							onDragPointerDown={(e: PointerEvent) => this.startPartyDrag(pok.uid, i, e)}
							hasError={!!this.state.errors[pok.uid]}
							canEvolve={!!(game.availableEvolutions[pok.uid]?.length)}
							heldItem={this.state.heldItems[pok.uid] ?? ''}
						/>;
					}
					return <div key={i} class="nz-party-slot nz-party-slot-empty">— empty —</div>;
				})}
			</div>

			<div class="nz-section-title" style="margin-top:12px;">
				Box ({boxOnly.length})
				{boxDisabled && <span class="nz-tb-hint">locked during battle sequence</span>}
			</div>
			<div class={`nz-tb-mobile-box-grid${isDragging && drag!.overBox ? ' nz-box-drop-target' : ''}`}>
				{boxOnly.map(mon => (
					<div
						key={mon.uid}
						class={`nz-tb-box-card${selectedUid === mon.uid ? ' nz-tb-box-card-selected' : ''}${game.availableEvolutions[mon.uid]?.length ? ' nz-tb-box-card-evolve' : ''}${boxDisabled ? ' nz-tb-box-card-disabled' : ''}${isDragging && mon.uid === dragUid ? ' nz-tb-box-card-dragging' : ''}`}
						onClick={() => !isDragging && this.selectMobileTeamSlot(mon.uid)}
						onPointerDown={!boxDisabled && game.party.length < 6 ? (e: PointerEvent) => this.startBoxDrag(mon.uid, e) : undefined}
					>
						<NzSprite species={mon.species} size={40} />
						<div class="nz-tb-box-card-name">{mon.nickname}</div>
					</div>
				))}
			</div>
			{this.props.onFeedback && <FeedbackFab onClick={this.props.onFeedback} />}
		</div>;
	}

	renderMobileVs() {
		const { game } = this.props;
		const { selectedOpponent } = this.state;
		const segment = game.segment!;
		const battle = segment.battles[game.currentBattleIndex];
		const remainingBattles = segment.battles.slice(game.currentBattleIndex);

		const selectedOppPokemon = selectedOpponent !== null
			? remainingBattles[selectedOpponent.battleIdx]?.team[selectedOpponent.slotIdx]
			: null;

		return <div class="nz-tb-mobile-tab nz-tb-mobile-vs">
			<div class="nz-section-title nz-section-title-danger">vs. {battle?.trainer ?? 'Opponent'}</div>
			<div class="nz-tb-mobile-opp-list">
				{remainingBattles.map((b, bi) => <preact.Fragment key={bi}>
					{bi > 0 && <div class="nz-section-title nz-section-title-danger" style="margin-top:12px;">vs. {b.trainer}</div>}
					{b.team.map((opp, i) =>
						<NzOpponentSlot
							key={`${bi}-${i}`}
							pokemon={opp}
							generation={game.generation}
							selected={selectedOpponent?.battleIdx === bi && selectedOpponent?.slotIdx === i}
							onSelect={() => this.selectOpponent(bi, i)}
						/>
					)}
				</preact.Fragment>)}
			</div>

			{selectedOppPokemon && (() => {
				const opp = selectedOppPokemon;
				return <div class="nz-tb-mobile-opp-detail">
					<div class="nz-tb-detail-header" style="margin-bottom:10px;">
						<div class="nz-tb-detail-sprite">
							<NzSprite species={opp.species} size={60} />
						</div>
						<div class="nz-tb-detail-info">
							<div class="nz-card-nickname">{opp.species}</div>
							<div class="nz-card-level">Lv. {opp.level}</div>
							<div class="nz-card-types"><NzTypeBadges species={opp.species} generation={game.generation} /></div>
							<div class="nz-card-nature">{opp.ability}</div>
							{(() => {
								const desc = Dex.forGen(game.generation).abilities.get(opp.ability).shortDesc;
								return desc ? <div class="nz-card-subdesc">{desc}</div> : null;
							})()}
						</div>
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
							const move = moveId ? Dex.forGen(game.generation).moves.get(moveId) : null;
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
						const item = Dex.forGen(game.generation).items.get(opp.item);
						return <>
							<div class="nz-label" style="margin-top:12px;margin-bottom:5px;">Held Item</div>
							<div class="nz-move-slot">
								<div class="nz-tb-move-name">{item.exists ? item.name : opp.item}</div>
								{item.exists && item.shortDesc && <div class="nz-item-desc">{item.shortDesc}</div>}
							</div>
						</>;
					})()}
				</div>;
			})()}
			{this.props.onFeedback && <FeedbackFab onClick={this.props.onFeedback} />}
		</div>;
	}

	render() {
		const { game } = this.props;
		const { moves, heldItems, errors, selectedUid, selectedOpponent, drag, showItemWarning, mobileTab } = this.state;
		const isDragging = !!(drag?.active);
		const dragUid = isDragging ? drag!.source.uid : null;
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
							<NzSprite species={opp.species} size={60} />
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
								<NzSprite species={selectedPokemon.species} size={60} />
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

				<div class="nz-tb-tabs">
					<button
						class={`nz-tb-tab${(this.state.activeTab === 'moves' || !isInParty) ? ' nz-tb-tab--active' : ''}`}
						onClick={() => this.setState({ activeTab: 'moves' })}
					>Moves</button>
					{isInParty && <button
						class={`nz-tb-tab${this.state.activeTab === 'items' ? ' nz-tb-tab--active' : ''}`}
						onClick={() => this.setState({ activeTab: 'items' })}
					>Items</button>}
				</div>

				{(this.state.activeTab === 'moves' || !isInParty) && <NzMovePanel
					moves={selectedMoves}
					legalMoves={legalMoves}
					generation={this.props.game.generation}
					onChange={newMoves => {
						newMoves.forEach((id, slot) => this.setMove(selectedPokemon.uid, slot, id));
					}}
				/>}

				{this.state.activeTab === 'items' && isInParty && <NzItemTable
					value={heldItems[selectedPokemon.uid] ?? ''}
					items={game.holdableItems}
					onChange={id => this.setItem(selectedPokemon.uid, id)}
				/>}

				<div class="nz-tb-detail-actions">
					<div>
						{boxDisabled ? null : (isInParty
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
			<NzTimeline game={game} />

			{/* Desktop layout — hidden on mobile via CSS */}
			<div class="nz-tb-layout">

				{/* Col 1: detail panel */}
				<div class={`nz-tb-detail${selectedOpponent !== null ? ' nz-tb-detail-opponent' : ''}`}>
					{detailContent}
				</div>

				{/* Col 2: party + box + opponent — three independently-scrolling columns */}
				<div class="nz-tb-columns">

					<div class="nz-tb-party-col">
						<div class="nz-section-title">Party ({partyPokemon.length}/6)</div>
						<div class={`nz-tb-col-scroll${isDragging && drag!.overBox ? ' nz-party-col-drop-box' : ''}`}>
							{([0, 1, 2, 3, 4, 5] as const).map(i => {
								const pok = partyPokemon[i];
								const isLast = i === partyPokemon.length - 1;
								const dropIndicator = isDragging && !drag!.overBox
									? drag!.overPartyIdx === i ? 'before' as const
									: isLast && drag!.overPartyIdx >= partyPokemon.length ? 'after' as const
									: null
									: null;
								if (pok) {
									return <NzPartySlot
										key={pok.uid}
										pokemon={pok}
										levelCap={segment.levelCap}
										generation={this.props.game.generation}
										selected={selectedUid === pok.uid}
										isDragging={isDragging && pok.uid === dragUid}
										dropIndicator={dropIndicator}
										onSelect={() => this.select(pok.uid)}
										onDragPointerDown={(e: PointerEvent) => this.startPartyDrag(pok.uid, i, e)}
										hasError={!!errors[pok.uid]}
										canEvolve={!!(game.availableEvolutions[pok.uid]?.length)}
										heldItem={heldItems[pok.uid] ?? ''}
									/>;
								}
								return <div key={i} class="nz-party-slot nz-party-slot-empty">— empty —</div>;
							})}
						</div>
					</div>

					<div class="nz-tb-box-col">
						<div class="nz-section-title">
							Box ({boxOnly.length})
							{boxDisabled && <span class="nz-tb-hint">locked during battle sequence</span>}
						</div>
						<div class={`nz-tb-col-scroll${isDragging && drag!.overBox ? ' nz-box-drop-target' : ''}`}>
							<div class="nz-tb-box-grid">
								{boxOnly.map(mon => (
									<div
										key={mon.uid}
										class={`nz-tb-box-card${selectedUid === mon.uid ? ' nz-tb-box-card-selected' : ''}${game.availableEvolutions[mon.uid]?.length ? ' nz-tb-box-card-evolve' : ''}${boxDisabled ? ' nz-tb-box-card-disabled' : ''}${isDragging && mon.uid === dragUid ? ' nz-tb-box-card-dragging' : ''}`}
										onClick={() => !isDragging && this.select(mon.uid)}
										onPointerDown={!boxDisabled && game.party.length < 6 ? (e: PointerEvent) => this.startBoxDrag(mon.uid, e) : undefined}
									>
										<NzSprite species={mon.species} size={40} />
										<div class="nz-tb-box-card-name">{mon.nickname}</div>
									</div>
								))}
							</div>
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

			{/* Desktop battle footer — hidden on mobile */}
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

			{/* Mobile layout — visible only on narrow screens via CSS */}
			<div class="nz-tb-mobile">
				<div class="nz-tb-mobile-content">
					{mobileTab === 'loadout' && this.renderMobileLoadout()}
					{mobileTab === 'team' && this.renderMobileTeam()}
					{mobileTab === 'vs' && this.renderMobileVs()}
				</div>
				<div class="nz-tb-mobile-bar">
					{hasErrors && <span class="nz-tb-mobile-bar-error">⚠ Fix errors</span>}
					<div class="nz-tb-mobile-tabs">
						<button
							class={`nz-tb-mobile-nav${mobileTab === 'loadout' ? ' nz-tb-mobile-nav-active' : ''}`}
							onClick={() => this.setState({ mobileTab: 'loadout' })}
						>Loadout</button>
						<button
							class={`nz-tb-mobile-nav${mobileTab === 'team' ? ' nz-tb-mobile-nav-active' : ''}`}
							onClick={() => this.setState({ mobileTab: 'team' })}
						>Team</button>
						<button
							class={`nz-tb-mobile-nav${mobileTab === 'vs' ? ' nz-tb-mobile-nav-active' : ''}`}
							onClick={() => this.setState({ mobileTab: 'vs' })}
						>Vs.</button>
					</div>
					{evolveAllCount > 0 && <NzBtn size="sm" variant="evolve" onClick={() => PS.send('/nuzlocke evolveall')}>
						Evo ({evolveAllCount})
					</NzBtn>}
					<NzBtn
						onClick={this.clickBattle}
						disabled={partyPokemon.length === 0}
					>
						Battle!
					</NzBtn>
				</div>
			</div>

			{isDragging && (() => {
				const pok = game.box.find(p => p.uid === dragUid);
				if (!pok) return null;
				return <div
					class={`nz-drag-ghost${drag!.overBox ? ' nz-drag-ghost-remove' : ''}`}
					style={`left:${drag!.clientX + 14}px;top:${drag!.clientY + 14}px`}
				>
					<NzSprite species={pok.species} size={32} />
					<span class="nz-drag-ghost-name">{pok.nickname}</span>
				</div>;
			})()}

			{showItemWarning && (() => {
				const missingCount = game.party.filter(uid => !heldItems[uid]).length;
				return <div class="nz-item-warning-overlay">
					<div class="nz-item-warning-dialog">
						<div class="nz-item-warning-title">Items not assigned</div>
						<div class="nz-item-warning-body">
							{missingCount === 1
								? '1 party member has no held item.'
								: `${missingCount} party members have no held item.`
							}{' '}There are items available to assign.
						</div>
						<div class="nz-item-warning-actions">
							<NzBtn variant="secondary" size="sm" onClick={() => {
								this.setState({ showItemWarning: false, activeTab: 'items', mobileTab: 'loadout' });
								const firstUnequipped = game.party.find(uid => !heldItems[uid]);
								if (firstUnequipped) this.setState({ selectedUid: firstUnequipped });
							}}>Assign Items</NzBtn>
							<NzBtn size="sm" onClick={() => {
								this.setState({ showItemWarning: false });
								this.commitBattle();
							}}>Battle Anyway</NzBtn>
						</div>
					</div>
				</div>;
			})()}

			{this.state.showTutorial && (() => {
				const TEAMBUILDING_STEPS: TutorialStep[] = [
					{
						title: 'Prepare Your Team',
						body: 'Before each battle, set your party, assign moves and held items, and view the opponent\'s team. Everything here carries into the fight.',
					},
					{
						selector: '.nz-move-panel',
						title: 'Assigning Moves',
						body: 'Click a slot, then click a move to assign it — the pulsing outline shows where to click next. On desktop you can also drag: pull a move row onto a slot, drag a slot onto a row to swap, or drag one slot onto another to reorder.',
						onActivate: () => this.setState({ activeTab: 'moves' }),
					},
					{
						selector: '.nz-item-panel',
						title: 'Held Items',
						body: 'Click any item in the list to equip it. On desktop you can also drag an item row onto the equipped slot at the top. Each Pokémon can hold one item.',
						onActivate: () => this.setState({ activeTab: 'items' }),
					},
					{
						selector: '.nz-tb-party-col',
						title: 'Your Party',
						body: 'Drag a box Pokémon into the party to add it, drag a party slot to reorder, or drag a party Pokémon into the box to swap it out.',
					},
					{
						selector: '.nz-tb-opponent-col',
						title: 'Opponent Preview',
						body: 'Click any opponent Pokémon to see their full stats, moves, and ability in the detail panel.',
					},
				];
				return <NzTutorial steps={TEAMBUILDING_STEPS} onDone={this.dismissTeambuildingTutorial} />;
			})()}
		</NzScreen>;
	}
}
