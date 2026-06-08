/**
 * Nuzlocke — Item Selection Table
 *
 * Single-select table for held item assignment in teambuilding.
 * Columns: sprite · Name · Effect · Route Acquired
 *
 * Clicking a row equips that item (moves it out of the table into a slot above).
 * Clicking the × on the equipped slot unequips it. Clicking a different row swaps.
 *
 * Drag (mouse only): drag a table row onto the equipped slot to assign the item.
 * Click path remains fully functional on all devices.
 */

import preact from "../../../js/lib/preact";
import { Dex } from "../../battle-dex";

interface NzItemTableProps {
	value: string;
	items: { id: string; name: string; location: string }[];
	excludeIds?: Set<string>;
	onChange: (itemId: string) => void;
}

interface NzItemTableState {
	query: string;
	drag: ItemDrag | null;
}

type ItemDrag = {
	itemId: string;
	overSlot: boolean;
	active: boolean;
	clientX: number;
	clientY: number;
	startX: number;
	startY: number;
};

export class NzItemTable extends preact.Component<NzItemTableProps, NzItemTableState> {
	override state: NzItemTableState = { query: '', drag: null };
	wrapRef: HTMLDivElement | null = null;
	equippedRef: HTMLDivElement | null = null;

	_drag: ItemDrag | null = null;
	_dragJustEnded = false;
	private _ghostEl: HTMLDivElement | null = null;

	override componentDidUpdate(prevProps: NzItemTableProps) {
		if (prevProps.items !== this.props.items) {
			this.setState({ query: '' });
		}
	}

	override componentWillUnmount() {
		this.cancelDrag();
		this._removeGhost();
	}

	// ---- Ghost ----

	private _removeGhost() {
		if (this._ghostEl) {
			this._ghostEl.remove();
			this._ghostEl = null;
		}
	}

	private _updateGhost(x: number, y: number, itemId: string) {
		if (!this._ghostEl) {
			this._ghostEl = document.createElement('div');
			this._ghostEl.className = 'nz-drag-ghost';
			document.body.appendChild(this._ghostEl);
		}
		const item = this.props.items.find(i => i.id === itemId);
		const name = item?.name ?? itemId;
		const iconStyle = item ? Dex.getItemIcon(item.name) : '';
		this._ghostEl.innerHTML = iconStyle
			? `<span class="itemicon" style="${iconStyle}"></span><span class="nz-drag-ghost-name">${name}</span>`
			: `<span class="nz-drag-ghost-name">${name}</span>`;
		this._ghostEl.style.left = `${x + 14}px`;
		this._ghostEl.style.top = `${y - 10}px`;
		this._ghostEl.style.display = 'flex';
	}

	// ---- Drag lifecycle ----

	_startDrag(state: ItemDrag) {
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

	startRowDrag = (itemId: string, e: PointerEvent) => {
		if (e.pointerType !== 'mouse') return;
		this._startDrag({
			itemId,
			overSlot: false,
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
		const overSlot = nowActive ? this.computeOverEquippedSlot(e.clientX, e.clientY) : false;
		this._drag = { ...drag, overSlot, active: nowActive, clientX: e.clientX, clientY: e.clientY };
		this.setState({ drag: this._drag });

		if (nowActive) this._updateGhost(e.clientX, e.clientY, drag.itemId);
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

		if (drag.overSlot) {
			this.props.onChange(drag.itemId);
		}
	};

	computeOverEquippedSlot = (clientX: number, clientY: number): boolean => {
		if (!this.equippedRef) return false;
		const rect = this.equippedRef.getBoundingClientRect();
		return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
	};

	renderMobileCard(item: { id: string; name: string; location: string }) {
		const dexItem = Dex.items.get(item.name);
		const effect = dexItem?.shortDesc || dexItem?.desc || '';
		return (
			<li
				key={item.id}
				class="nz-item-card"
				onClick={() => {
					if (this._dragJustEnded) return;
					this.props.onChange(item.id);
				}}
				onPointerDown={(e: PointerEvent) => this.startRowDrag(item.id, e)}
			>
				<div class="nz-item-card-header">
					<span class="itemicon" style={Dex.getItemIcon(item.name)} />
					<span class="nz-item-card-name">{item.name}</span>
					<span class="nz-item-card-location">{item.location || '—'}</span>
				</div>
				{effect && <div class="nz-item-card-desc">{effect}</div>}
			</li>
		);
	}

	render() {
		const { value, items, excludeIds, onChange } = this.props;
		const { query, drag } = this.state;

		const equippedItem = value ? items.find(i => i.id === value) ?? null : null;
		const equippedName = equippedItem?.name ?? (value || null);

		const q = query.toLowerCase();
		const available = items.filter(i => i.id !== value && !(excludeIds?.has(i.id)));
		const filtered = q ? available.filter(item => item.name.toLowerCase().includes(q)) : available;

		const equippedDragOver = drag?.active && drag.overSlot;

		return (
			<div class="nz-item-panel">
				<div
					class="nz-item-equipped"
					ref={(el: any) => { this.equippedRef = el; }}
				>
					{equippedName ? (
						<div class={`nz-item-equipped-filled${equippedDragOver ? ' nz-item-equipped--drag-over' : ''}`}>
							<span class="itemicon" style={Dex.getItemIcon(equippedName)} />
							<span class="nz-item-equipped-name">{equippedName}</span>
							{equippedItem && (() => {
								const desc = Dex.items.get(equippedName)?.shortDesc;
								return desc ? <span class="nz-item-equipped-desc">{desc}</span> : null;
							})()}
							<button class="nz-item-equipped-remove" onClick={() => onChange('')} title="Remove item">×</button>
						</div>
					) : (
						<div class={`nz-item-equipped-empty${equippedDragOver ? ' nz-item-equipped--drag-over' : ''}`}>
							{equippedDragOver ? 'Drop to equip' : 'No item held — select one below'}
						</div>
					)}
				</div>
				<input
					class="nz-item-search"
					type="text"
					placeholder="Search items…"
					value={query}
					onInput={(e: any) => this.setState({ query: e.target.value })}
				/>
				<div class="nz-item-table-wrap nz-item-desktop" ref={(el: any) => { this.wrapRef = el; }}>
					<table class="nz-item-table">
						<thead>
							<tr>
								<th class="nz-item-col-sprite"></th>
								<th class="nz-item-col-name">Item</th>
								<th class="nz-item-col-desc">Effect</th>
								<th class="nz-item-col-location">Route Acquired</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map(item => {
								const dexItem = Dex.items.get(item.name);
								const effect = dexItem?.shortDesc || dexItem?.desc || '';
								const isDragging = drag?.active && drag.itemId === item.id;
								return (
									<tr
										key={item.id}
										class={isDragging ? 'nz-item-row--dragging' : undefined}
										onClick={() => {
											if (this._dragJustEnded) return;
											onChange(item.id);
										}}
										onPointerDown={(e: PointerEvent) => this.startRowDrag(item.id, e)}
									>
										<td class="nz-item-col-sprite">
											<span class="itemicon" style={Dex.getItemIcon(item.name)} />
										</td>
										<td class="nz-item-col-name">{item.name}</td>
										<td class="nz-item-col-desc">
											<div class="nz-item-col-desc-inner">{effect}</div>
										</td>
										<td class="nz-item-col-location">{item.location || '—'}</td>
									</tr>
								);
							})}
							{filtered.length === 0 && (
								<tr>
									<td colSpan={4} class="nz-item-no-results">No items match</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
				<ul class="nz-item-list nz-item-mobile">
					{filtered.map(item => this.renderMobileCard(item))}
					{filtered.length === 0 && <li class="nz-item-no-results">No items match</li>}
				</ul>
			</div>
		);
	}
}
