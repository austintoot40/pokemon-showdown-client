/**
 * Nuzlocke — Move Panel
 *
 * Unified move selection for teambuilding:
 *   - 4 type-styled slot buttons
 *   - Search bar (name search, or exact type/category/target filter)
 *   - Scrollable table with sortable headers and new-move highlights
 *
 * Bidirectional click selection: click a button then a row, or a row then a button.
 * Swapping: clicking a row that's already in another slot moves it to the new slot.
 *
 * Drag (mouse/desktop only for row-to-slot; all devices for slot-to-slot reorder):
 *   - Drag a filled slot onto another slot to swap move order.
 *   - Drag a table row (mouse only) onto a slot to assign.
 * Click paths remain fully functional on all devices.
 */

import preact from "../../../js/lib/preact";
import { Dex, toID } from "../../battle-dex";
import type { LegalMove } from "../types";

type SortCol = 'acquired' | 'name' | 'type' | 'category' | 'power' | 'accuracy' | 'pp';

type MoveDrag =
	| { kind: 'slot'; fromSlot: number; overSlot: number | null; overRow: string | null; active: boolean; clientX: number; clientY: number; startX: number; startY: number }
	| { kind: 'row'; moveId: string; overSlot: number | null; active: boolean; clientX: number; clientY: number; startX: number; startY: number };

interface MovePanelProps {
	moves: string[];
	legalMoves: LegalMove[];
	generation: number;
	onChange: (moves: string[]) => void;
}

interface MovePanelState {
	activeSlot: number | null;
	activeMove: string | null;
	query: string;
	sortCol: SortCol;
	sortDir: 'asc' | 'desc';
	drag: MoveDrag | null;
}

const TYPES = new Set([
	'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
	'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]);

const CATEGORIES = new Set(['physical', 'special', 'status']);

export function formatTarget(target: string | undefined): string {
	switch (target) {
		case 'allAdjacentFoes': return 'Spread';
		case 'normal': case 'any': return 'Single';
		case 'self': return 'Self';
		case 'adjacentAlly': return 'Ally';
		case 'adjacentAllyOrSelf': return 'Ally/Self';
		case 'allAdjacent': return 'All adj';
		case 'allySide': return 'Ally side';
		case 'foeSide': return 'Foe side';
		case 'all': return 'All';
		case 'randomNormal': return 'Random';
		default: return '—';
	}
}

const TARGET_DISPLAY_VALUES = new Set([
	'spread', 'single', 'self', 'ally', 'ally/self', 'all adj', 'ally side', 'foe side', 'all', 'random',
]);

export class NzMovePanel extends preact.Component<MovePanelProps, MovePanelState> {
	override state: MovePanelState = {
		activeSlot: null,
		activeMove: null,
		query: '',
		sortCol: 'acquired',
		sortDir: 'asc',
		drag: null,
	};

	private panelRef = preact.createRef<HTMLDivElement>();

	_drag: MoveDrag | null = null;
	_dragJustEnded = false;
	private _ghostEl: HTMLDivElement | null = null;

	override componentDidMount() {
		document.addEventListener('click', this.handleOutsideClick, true);
	}

	override componentWillUnmount() {
		document.removeEventListener('click', this.handleOutsideClick, true);
		this.cancelDrag();
		this._removeGhost();
	}

	handleOutsideClick = (e: MouseEvent) => {
		if (this.panelRef.current && !this.panelRef.current.contains(e.target as Node)) {
			this.setState({ activeSlot: null, activeMove: null });
		}
	};

	// Reset selection state when the pokemon changes (legalMoves reference changes)
	override componentDidUpdate(prevProps: MovePanelProps) {
		if (prevProps.legalMoves !== this.props.legalMoves) {
			this.setState({ activeSlot: null, activeMove: null, query: '' });
		}
	}

	// ---- Ghost (appended to body to escape clip-path on .nz-tb-detail) ----

	private _removeGhost() {
		if (this._ghostEl) {
			this._ghostEl.remove();
			this._ghostEl = null;
		}
	}

	private _updateGhost(x: number, y: number, moveId: string) {
		if (!this._ghostEl) {
			this._ghostEl = document.createElement('div');
			this._ghostEl.className = 'nz-drag-ghost';
			document.body.appendChild(this._ghostEl);
		}
		const move = Dex.forGen(this.props.generation).moves.get(moveId);
		const name = move?.name ?? moveId;
		const type = move?.type ?? '';
		const typeLower = type.toLowerCase();
		this._ghostEl.innerHTML = type
			? `<span class="nz-type nz-type-${typeLower}" style="font-size:10px;padding:1px 5px">${type}</span><span class="nz-drag-ghost-name">${name}</span>`
			: `<span class="nz-drag-ghost-name">${name}</span>`;
		this._ghostEl.style.left = `${x + 14}px`;
		this._ghostEl.style.top = `${y - 10}px`;
		this._ghostEl.style.display = 'flex';
	}

	// ---- Drag lifecycle ----

	_startDrag(state: MoveDrag) {
		this._drag = state;
		this.setState({ drag: this._drag });
		document.addEventListener('pointermove', this.onDragMove);
		document.addEventListener('pointerup', this.onDragEnd);
		document.addEventListener('pointercancel', this.cancelDrag);
	}

	cancelDrag = () => {
		document.removeEventListener('pointermove', this.onDragMove);
		document.removeEventListener('pointerup', this.onDragEnd);
		document.removeEventListener('pointercancel', this.cancelDrag);
		this._removeGhost();
		this._drag = null;
		this.setState({ drag: null });
	};

	startSlotDrag = (slot: number, e: PointerEvent) => {
		if (!this.props.moves[slot]) return;
		this._startDrag({
			kind: 'slot',
			fromSlot: slot,
			overSlot: null,
			overRow: null,
			active: false,
			clientX: e.clientX,
			clientY: e.clientY,
			startX: e.clientX,
			startY: e.clientY,
		});
	};

	startRowDrag = (moveId: string, e: PointerEvent) => {
		if (e.pointerType !== 'mouse') return;
		if (this.props.moves.includes(moveId)) return;
		this._startDrag({
			kind: 'row',
			moveId,
			overSlot: null,
			active: false,
			clientX: e.clientX,
			clientY: e.clientY,
			startX: e.clientX,
			startY: e.clientY,
		});
	};

	onDragMove = (e: PointerEvent) => {
		const drag = this._drag;
		if (!drag) return;
		e.preventDefault();
		const dx = e.clientX - drag.startX;
		const dy = e.clientY - drag.startY;
		const nowActive = drag.active || Math.hypot(dx, dy) > 5;
		const overSlot = nowActive ? this.computeOverSlot(e.clientX, e.clientY) : null;

		if (drag.kind === 'slot') {
			const overRow = nowActive && overSlot === null ? this.computeOverRow(e.clientX, e.clientY) : null;
			this._drag = { ...drag, overSlot, overRow, active: nowActive, clientX: e.clientX, clientY: e.clientY };
		} else {
			this._drag = { ...drag, overSlot, active: nowActive, clientX: e.clientX, clientY: e.clientY };
		}
		this.setState({ drag: this._drag });

		if (nowActive) {
			const moveId = drag.kind === 'slot' ? this.props.moves[drag.fromSlot] : drag.moveId;
			if (moveId) this._updateGhost(e.clientX, e.clientY, moveId);
		}
	};

	onDragEnd = (_e: PointerEvent) => {
		document.removeEventListener('pointermove', this.onDragMove);
		document.removeEventListener('pointerup', this.onDragEnd);
		document.removeEventListener('pointercancel', this.cancelDrag);
		this._removeGhost();
		const drag = this._drag;
		this._drag = null;
		this.setState({ drag: null });
		if (!drag?.active) return;

		this._dragJustEnded = true;
		setTimeout(() => { this._dragJustEnded = false; }, 50);

		const { moves, onChange } = this.props;

		if (drag.kind === 'slot') {
			const { fromSlot, overSlot, overRow } = drag;
			if (overSlot !== null && overSlot !== fromSlot) {
				// Dropped on another slot — swap the two moves
				const newMoves = [...moves];
				const temp = newMoves[fromSlot];
				newMoves[fromSlot] = newMoves[overSlot];
				newMoves[overSlot] = temp;
				onChange(newMoves);
			} else if (overRow !== null && overRow !== moves[fromSlot]) {
				// Dropped on a table row — assign that move to this slot; if it was
				// already in another slot, put the dragged move there (true swap).
				const newMoves = [...moves];
				const targetSlot = newMoves.findIndex(m => m === overRow);
				if (targetSlot !== -1) newMoves[targetSlot] = newMoves[fromSlot];
				newMoves[fromSlot] = overRow;
				onChange(newMoves);
			}
		} else {
			const { moveId, overSlot } = drag;
			if (overSlot !== null) {
				const newMoves = [...moves];
				const existingSlot = newMoves.findIndex(m => m === moveId);
				if (existingSlot !== -1 && existingSlot !== overSlot) newMoves[existingSlot] = '';
				newMoves[overSlot] = moveId;
				onChange(newMoves);
				this.setState({ activeMove: null, activeSlot: null });
			}
		}
	};

	computeOverSlot = (clientX: number, clientY: number): number | null => {
		if (!this.panelRef.current) return null;
		const buttons = this.panelRef.current.querySelectorAll<HTMLElement>('.nz-move-slots .movebutton');
		for (let i = 0; i < buttons.length; i++) {
			const rect = buttons[i].getBoundingClientRect();
			if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) return i;
		}
		return null;
	};

	computeOverRow = (clientX: number, clientY: number): string | null => {
		const el = document.elementFromPoint(clientX, clientY);
		if (!el) return null;
		const row = (el as Element).closest('[data-moveid]');
		return row ? row.getAttribute('data-moveid') : null;
	};

	// ---- Click handlers ----

	clickSlot = (slot: number) => {
		if (this._dragJustEnded) return;
		const { activeMove, activeSlot } = this.state;
		const { moves, onChange } = this.props;

		if (activeMove !== null) {
			// Row was selected first — assign it to this slot, swapping if needed
			const newMoves = [...moves];
			const existingSlot = newMoves.findIndex(m => m === activeMove);
			if (existingSlot !== -1 && existingSlot !== slot) newMoves[existingSlot] = '';
			newMoves[slot] = activeMove;
			onChange(newMoves);
			this.setState({ activeMove: null, activeSlot: null });
		} else {
			// Button-first: toggle slot selection
			this.setState({ activeSlot: activeSlot === slot ? null : slot, activeMove: null });
		}
	};

	clickRow = (moveId: string) => {
		if (this._dragJustEnded) return;
		const { activeSlot, activeMove } = this.state;
		const { moves, onChange } = this.props;

		// If clicking an already-active row, deselect it
		if (activeMove === moveId) {
			this.setState({ activeMove: null });
			return;
		}

		if (activeSlot !== null) {
			// Slot was selected first — assign this move to it, swapping if needed
			const newMoves = [...moves];
			const existingSlot = newMoves.findIndex(m => m === moveId);
			if (existingSlot !== -1 && existingSlot !== activeSlot) newMoves[existingSlot] = '';
			newMoves[activeSlot] = moveId;
			onChange(newMoves);
			this.setState({ activeSlot: null, activeMove: null });
		} else {
			// Row-first: select this move (skip if already equipped — looks and acts disabled)
			if (moves.includes(moveId)) return;
			this.setState({ activeMove: moveId, activeSlot: null });
		}
	};

	setSort = (col: SortCol) => {
		this.setState((s: MovePanelState) => ({
			sortCol: col,
			sortDir: s.sortCol === col ? (s.sortDir === 'asc' ? 'desc' : 'asc') : 'desc',
		}));
	};

	getFilteredSorted(): Array<{ lm: LegalMove; move: ReturnType<typeof Dex.moves.get> }> {
		const { legalMoves, generation } = this.props;
		const { query, sortCol, sortDir } = this.state;
		const q = query.trim().toLowerCase();
		const dex = Dex.forGen(generation);

		const rows = legalMoves.map(lm => ({ lm, move: dex.moves.get(toID(lm.name)) }))
			.filter(({ move }) => move.exists);

		// Filter
		const filtered = q === '' ? rows : (() => {
			if (TYPES.has(q)) {
				const displayType = (r: typeof rows[0]) => {
					const t = r.lm.hpType ?? r.move.type;
					return t.toLowerCase();
				};
				return rows.filter(r => displayType(r) === q);
			}
			if (CATEGORIES.has(q)) {
				return rows.filter(r => r.move.category.toLowerCase() === q);
			}
			const targetQ = q === 'ally/self' ? 'ally/self' : q;
			if (TARGET_DISPLAY_VALUES.has(targetQ)) {
				return rows.filter(r => formatTarget(r.move.target).toLowerCase() === targetQ);
			}
			return rows.filter(r => r.lm.name.toLowerCase().includes(q));
		})();

		// Sort
		const dir = sortDir === 'asc' ? 1 : -1;
		return [...filtered].sort((a, b) => {
			let va: number | string;
			let vb: number | string;
			switch (sortCol) {
				case 'acquired': {
					// isNew first (desc only), then level-up moves, then TMs/HMs
					if (a.lm.isNew !== b.lm.isNew) return a.lm.isNew ? -1 : 1;
					const aTM = a.lm.fromTM || a.lm.fromHM;
					const bTM = b.lm.fromTM || b.lm.fromHM;
					if (aTM !== bTM) return aTM ? 1 : -1;
					return (b.lm.acquisitionOrder - a.lm.acquisitionOrder) * dir;
				}
				case 'name':
					return a.lm.name.localeCompare(b.lm.name) * dir;
				case 'type':
					va = (a.lm.hpType ?? a.move.type).toLowerCase();
					vb = (b.lm.hpType ?? b.move.type).toLowerCase();
					return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
				case 'category':
					return a.move.category.localeCompare(b.move.category) * dir;
				case 'power':
					va = a.move.basePower ?? 0;
					vb = b.move.basePower ?? 0;
					return (va - vb) * dir;
				case 'accuracy': {
					const accA = a.move.accuracy === true ? 101 : (a.move.accuracy ?? 0);
					const accB = b.move.accuracy === true ? 101 : (b.move.accuracy ?? 0);
					return (accA - accB) * dir;
				}
				case 'pp':
					return ((a.move.pp ?? 0) - (b.move.pp ?? 0)) * dir;
				default:
					return 0;
			}
		});
	}

	renderSlotButton(slot: number) {
		const { moves } = this.props;
		const { activeSlot, activeMove, drag } = this.state;
		const moveId = moves[slot] ?? '';
		const move = moveId ? Dex.forGen(this.props.generation).moves.get(moveId) : null;
		const lm = moveId ? this.props.legalMoves.find(m => toID(m.name) === moveId) : null;
		const displayType = lm?.hpType ?? move?.type;
		const isActive = activeSlot === slot;
		const isTarget = activeSlot !== null && !isActive;

		const isDraggingThis = drag?.active && drag.kind === 'slot' && drag.fromSlot === slot;
		const isDragOver = drag?.active && (
			(drag.kind === 'slot' && drag.overSlot === slot && drag.fromSlot !== slot) ||
			(drag.kind === 'row' && drag.overSlot === slot)
		);

		const classes = [
			'movebutton',
			'nz-move-btn',
			displayType ? `type-${displayType}` : 'nz-move-btn--empty',
			isActive ? 'nz-move-btn--active' : '',
			isTarget ? 'nz-move-btn--active-target' : '',
			isDraggingThis ? 'nz-move-btn--dragging' : '',
			isDragOver ? 'nz-move-btn--drag-over' : '',
		].filter(Boolean).join(' ');

		return (
			<button
				key={slot}
				class={classes}
				onClick={() => this.clickSlot(slot)}
				onPointerDown={(e: PointerEvent) => this.startSlotDrag(slot, e)}
			>
				{move ? move.name : <span class="nz-move-btn-empty-label">— Empty —</span>}<br />
				<small class="type">{displayType ?? ' '}</small>
			</button>
		);
	}

	renderHeader(col: SortCol, label: string, className?: string) {
		const { sortCol, sortDir } = this.state;
		const active = sortCol === col;
		const cls = [className, active ? 'nz-th-active' : ''].filter(Boolean).join(' ') || undefined;
		return (
			<th class={cls} onClick={() => this.setSort(col)}>
				{label}
				{active && <span class="nz-sort-arrow">{sortDir === 'asc' ? '▲' : '▼'}</span>}
			</th>
		);
	}

	renderSortBar() {
		const { sortCol, sortDir } = this.state;
		const options: Array<[SortCol, string]> = [
			['acquired', 'Acq'],
			['name', 'Name'],
			['type', 'Type'],
			['category', 'Cat'],
			['power', 'BP'],
			['accuracy', 'Acc'],
			['pp', 'PP'],
		];
		return (
			<div class="nz-move-sort-bar">
				<span class="nz-move-sort-label">Sort:</span>
				{options.map(([col, label]) => {
					const active = sortCol === col;
					return (
						<button
							key={col}
							class={`nz-move-sort-btn${active ? ' nz-move-sort-btn--active' : ''}`}
							onClick={() => this.setSort(col)}
						>
							{label}{active && <span class="nz-sort-arrow">{sortDir === 'asc' ? '▲' : '▼'}</span>}
						</button>
					);
				})}
			</div>
		);
	}

	renderMobileCard({ lm, move }: { lm: LegalMove; move: ReturnType<typeof Dex.moves.get> }) {
		const { moves } = this.props;
		const { activeMove, drag: dragState } = this.state;
		const id = toID(lm.name);
		const isActive = activeMove === id;
		const isEquipped = moves.includes(id);
		const isDragging = dragState?.active && dragState.kind === 'row' && dragState.moveId === id;
		const isSlotDragOver = dragState?.active && dragState.kind === 'slot' && dragState.overRow === id;
		const displayType = lm.hpType ?? move.type;
		const power = move.basePower > 0 ? `${move.basePower}` : '—';
		const acc = move.accuracy === true ? '—' : `${move.accuracy}%`;
		let acquiredLabel: string;
		let acquiredNew = false;
		if (lm.fromTM || lm.fromHM) {
			acquiredLabel = lm.tmRoute || (lm.fromHM ? 'HM' : 'TM');
			acquiredNew = lm.isNew;
		} else {
			acquiredLabel = lm.learnedLevel !== undefined ? `Lv. ${lm.learnedLevel}` : '—';
			acquiredNew = lm.isNew;
		}
		const itemClass = [
			'nz-move-item',
			lm.isNew ? 'nz-move-item--new' : '',
			isActive ? 'nz-move-item--active' : '',
			isEquipped && !isActive ? 'nz-move-item--equipped' : '',
			isDragging ? 'nz-move-item--dragging' : '',
			isSlotDragOver ? 'nz-move-item--drag-over' : '',
		].filter(Boolean).join(' ');
		return (
			<li key={id} data-moveid={id} class={itemClass} onClick={() => this.clickRow(id)} onPointerDown={(e: PointerEvent) => this.startRowDrag(id, e)}>
				<div class="nz-move-item-header">
					<span class="nz-move-item-name">{lm.name}</span>
					<span class={`nz-type nz-type-${displayType.toLowerCase()}`}>{displayType}</span>
					<span class={`nz-move-cat nz-move-cat-${move.category.toLowerCase()}`}>{move.category}</span>
				</div>
				<div class="nz-move-item-desc">{move.shortDesc || move.desc || ''}</div>
				<div class="nz-move-item-stats">
					<span class="nz-move-item-stat"><span class="nz-move-item-stat-label">BP</span>{power}</span>
					<span class="nz-move-item-stat"><span class="nz-move-item-stat-label">Acc</span>{acc}</span>
					<span class="nz-move-item-stat"><span class="nz-move-item-stat-label">PP</span>{move.pp}</span>
					<span class={`nz-move-item-acq${acquiredNew ? ' nz-move-col-acquired--new' : ''}`}>{acquiredLabel}</span>
				</div>
			</li>
		);
	}

	override render() {
		const { moves } = this.props;
		const { activeSlot, activeMove, query, drag } = this.state;
		const rows = this.getFilteredSorted();

		return (
			<div class="nz-move-panel" ref={this.panelRef}>
				<div class={`nz-move-slots-wrap${(activeMove !== null || (drag?.active && drag.kind === 'row')) ? ' nz-move-selecting' : ''}`}>
					<div class="movemenu nz-move-slots">
						{[0, 1, 2, 3].map(slot => this.renderSlotButton(slot))}
					</div>
				</div>

				<input
					class="nz-move-search"
					type="text"
					placeholder="Search moves… (or type a type, category, or target)"
					value={query}
					onInput={(e: any) => this.setState({ query: e.target.value })}
				/>

				{this.renderSortBar()}

				<div class={`nz-move-table-wrap nz-move-desktop${(activeSlot !== null || (drag?.active && drag.kind === 'slot')) ? ' nz-move-selecting' : ''}${drag?.active && drag.kind === 'row' ? ' nz-move-drag-active' : ''}`}>
					<table class="nz-move-table">
						<thead>
							<tr>
								{this.renderHeader('name', 'Move')}
								{this.renderHeader('type', 'Type')}
								{this.renderHeader('category', 'Cat')}
								<th class="nz-move-col-desc">Effect</th>
								{this.renderHeader('power', 'BP', 'nz-move-col-stat')}
								{this.renderHeader('accuracy', 'Acc', 'nz-move-col-stat')}
								{this.renderHeader('pp', 'PP', 'nz-move-col-stat')}
								{this.renderHeader('acquired', 'Acquired', 'nz-move-col-acquired-header')}
							</tr>
						</thead>
						<tbody>
							{rows.map(({ lm, move }) => {
								const id = toID(lm.name);
								const isActive = activeMove === id;
								const isEquipped = moves.includes(id);
								const isNew = lm.isNew;
								const displayType = lm.hpType ?? move.type;
								const cat = move.category;
								const power = move.basePower > 0 ? `${move.basePower}` : '—';
								const acc = move.accuracy === true ? '—' : `${move.accuracy}%`;
								const isDragging = drag?.active && drag.kind === 'row' && drag.moveId === id;

								let acquiredLabel: string;
								let acquiredNew = false;
								if (lm.fromTM || lm.fromHM) {
									acquiredLabel = lm.tmRoute || (lm.fromHM ? 'HM' : 'TM');
									acquiredNew = lm.isNew;
								} else {
									acquiredLabel = lm.learnedLevel !== undefined ? `Lv. ${lm.learnedLevel}` : '—';
									acquiredNew = lm.isNew;
								}

								const isSlotDragOver = drag?.active && drag.kind === 'slot' && drag.overRow === id;
								const rowClass = [
									isNew ? 'nz-move-row--new' : '',
									isActive ? 'nz-move-row--active' : '',
									isEquipped && !isActive ? 'nz-move-row--equipped' : '',
									isDragging ? 'nz-move-row--dragging' : '',
									isSlotDragOver ? 'nz-move-row--drag-over' : '',
								].filter(Boolean).join(' ') || undefined;

								return (
									<tr key={id} data-moveid={id} class={rowClass} onClick={() => this.clickRow(id)} onPointerDown={(e: PointerEvent) => this.startRowDrag(id, e)}>
										<td class="nz-move-col-name">{lm.name}</td>
										<td><span class={`nz-type nz-type-${displayType.toLowerCase()}`}>{displayType}</span></td>
										<td><span class={`nz-move-cat nz-move-cat-${move.category.toLowerCase()}`}>{cat}</span></td>
										<td class="nz-move-col-desc"><div class="nz-move-col-desc-inner">{move.shortDesc || move.desc || ''}</div></td>
										<td class="nz-move-col-stat">{power}</td>
										<td class="nz-move-col-stat">{acc}</td>
										<td class="nz-move-col-stat">{move.pp}</td>
										<td class={`nz-move-col-acquired${acquiredNew ? ' nz-move-col-acquired--new' : ''}`}>
											{acquiredLabel}
										</td>
									</tr>
								);
							})}
							{rows.length === 0 && (
								<tr>
									<td colSpan={8} style="text-align:center;color:var(--nz-text-dim);padding:16px;">
										No moves match
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div class={`nz-move-list-wrap nz-move-mobile${(activeSlot !== null || (drag?.active && drag.kind === 'slot')) ? ' nz-move-selecting' : ''}`}>
					{rows.length === 0
						? <div class="nz-move-no-results">No moves match</div>
						: <ul class="nz-move-list">
							{rows.map(row => this.renderMobileCard(row))}
						</ul>
					}
				</div>

			</div>
		);
	}
}
