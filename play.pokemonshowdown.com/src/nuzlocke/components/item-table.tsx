/**
 * Nuzlocke — Item Selection Table
 *
 * Single-select table for held item assignment in teambuilding.
 * Columns: sprite · Name · Effect · Route Acquired
 *
 * Clicking a row equips that item (moves it out of the table into a slot above).
 * Clicking the × on the equipped slot unequips it. Clicking a different row swaps.
 */

import preact from "../../../js/lib/preact";
import { Dex } from "../../battle-dex";

interface NzItemTableProps {
	value: string;
	items: { id: string; name: string; location: string }[];
	onChange: (itemId: string) => void;
}

interface NzItemTableState {
	query: string;
}

export class NzItemTable extends preact.Component<NzItemTableProps, NzItemTableState> {
	override state: NzItemTableState = { query: '' };
	wrapRef: HTMLDivElement | null = null;

	override componentDidUpdate(prevProps: NzItemTableProps) {
		if (prevProps.items !== this.props.items) {
			this.setState({ query: '' });
		}
	}

	renderMobileCard(item: { id: string; name: string; location: string }) {
		const dexItem = Dex.items.get(item.name);
		const effect = dexItem?.shortDesc || dexItem?.desc || '';
		return (
			<li
				key={item.id}
				class="nz-item-card"
				onClick={() => this.props.onChange(item.id)}
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
		const { value, items, onChange } = this.props;
		const { query } = this.state;

		const equippedItem = value ? items.find(i => i.id === value) ?? null : null;
		const equippedName = equippedItem?.name ?? (value || null);

		const q = query.toLowerCase();
		const available = items.filter(i => i.id !== value);
		const filtered = q ? available.filter(item => item.name.toLowerCase().includes(q)) : available;

		return (
			<div class="nz-item-panel">
				<div class="nz-item-equipped">
					{equippedName ? (
						<div class="nz-item-equipped-filled">
							<span class="itemicon" style={Dex.getItemIcon(equippedName)} />
							<span class="nz-item-equipped-name">{equippedName}</span>
							{equippedItem && (() => {
								const desc = Dex.items.get(equippedName)?.shortDesc;
								return desc ? <span class="nz-item-equipped-desc">{desc}</span> : null;
							})()}
							<button class="nz-item-equipped-remove" onClick={() => onChange('')} title="Remove item">×</button>
						</div>
					) : (
						<div class="nz-item-equipped-empty">No item held — select one below</div>
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
								return (
									<tr
										key={item.id}
										onClick={() => onChange(item.id)}
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
