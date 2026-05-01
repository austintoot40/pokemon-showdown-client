/**
 * Nuzlocke — Move Panel
 *
 * Unified move selection for teambuilding:
 *   - 4 type-styled slot buttons
 *   - Search bar (name search, or exact type/category/target filter)
 *   - Scrollable table with sortable headers and new-move highlights
 *
 * Bidirectional selection: click a button then a row, or a row then a button.
 * Swapping: clicking a row that's already in another slot moves it to the new slot.
 */

import preact from "../../../js/lib/preact";
import { Dex, toID } from "../../battle-dex";
import type { LegalMove } from "../types";

type SortCol = 'acquired' | 'name' | 'type' | 'category' | 'power' | 'accuracy' | 'pp';

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
	};

	private panelRef = preact.createRef<HTMLDivElement>();

	override componentDidMount() {
		document.addEventListener('click', this.handleOutsideClick, true);
	}

	override componentWillUnmount() {
		document.removeEventListener('click', this.handleOutsideClick, true);
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

	clickSlot = (slot: number) => {
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
		const { activeSlot, activeMove } = this.state;
		const moveId = moves[slot] ?? '';
		const move = moveId ? Dex.forGen(this.props.generation).moves.get(moveId) : null;
		const lm = moveId ? this.props.legalMoves.find(m => toID(m.name) === moveId) : null;
		const displayType = lm?.hpType ?? move?.type;
		const isActive = activeSlot === slot;
		const isTarget = activeSlot !== null && !isActive;

		const classes = [
			'movebutton',
			'nz-move-btn',
			displayType ? `type-${displayType}` : 'nz-move-btn--empty',
			isActive ? 'nz-move-btn--active' : '',
			isTarget ? 'nz-move-btn--active-target' : '',
		].filter(Boolean).join(' ');

		return (
			<button key={slot} class={classes} onClick={() => this.clickSlot(slot)}>
				{move ? move.name : <span class="nz-move-btn-empty-label">— Empty —</span>}<br />
				<small class="type">{displayType ?? '\u00a0'}</small>
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

	override render() {
		const { moves } = this.props;
		const { activeSlot, activeMove, query } = this.state;
		const rows = this.getFilteredSorted();

		return (
			<div class="nz-move-panel" ref={this.panelRef}>
				<div class={`nz-move-slots-wrap${activeMove !== null ? ' nz-move-selecting' : ''}`}>
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

				<div class={`nz-move-table-wrap${activeSlot !== null ? ' nz-move-selecting' : ''}`}>
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

								let acquiredLabel: string;
								let acquiredNew = false;
								if (lm.fromTM || lm.fromHM) {
									acquiredLabel = lm.tmRoute || (lm.fromHM ? 'HM' : 'TM');
									acquiredNew = lm.isNew;
								} else {
									acquiredLabel = lm.learnedLevel !== undefined ? `Lv. ${lm.learnedLevel}` : '—';
									acquiredNew = lm.isNew;
								}

								const rowClass = [
									isNew ? 'nz-move-row--new' : '',
									isActive ? 'nz-move-row--active' : '',
									isEquipped && !isActive ? 'nz-move-row--equipped' : '',
								].filter(Boolean).join(' ') || undefined;

								return (
									<tr key={id} class={rowClass} onClick={() => this.clickRow(id)}>
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

			</div>
		);
	}
}
