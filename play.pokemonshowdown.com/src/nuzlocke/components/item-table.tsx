/**
 * Nuzlocke — Item Selection Table
 *
 * Single-select table for held item assignment in teambuilding.
 * Columns: sprite · Name · Effect · Route Acquired
 * Clicking a row selects it; clicking the selected row or "(none)" clears it.
 * Items held by other party members are disabled (dimmed, not clickable).
 */

import preact from "../../../js/lib/preact";
import { Dex } from "../../battle-dex";

interface NzItemTableProps {
	value: string;
	items: { id: string; name: string; location: string }[];
	disabledIds: string[];
	onChange: (itemId: string) => void;
}

export class NzItemTable extends preact.Component<NzItemTableProps> {
	clickRow = (id: string) => {
		const { value, onChange } = this.props;
		onChange(value === id ? '' : id);
	};

	render() {
		const { value, items, disabledIds } = this.props;

		return (
			<div class="nz-item-table-wrap">
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
						<tr
							class={!value ? 'nz-item-row--selected' : undefined}
							onClick={() => this.props.onChange('')}
						>
							<td></td>
							<td class="nz-item-col-name nz-item-none-label">(none)</td>
							<td></td>
							<td></td>
						</tr>
						{items.map(item => {
							const isSelected = value === item.id;
							const isDisabled = disabledIds.includes(item.id);
							const dexItem = Dex.items.get(item.name);
							const effect = dexItem?.shortDesc || dexItem?.desc || '';
							const rowClass = [
								isSelected ? 'nz-item-row--selected' : '',
								isDisabled ? 'nz-item-row--disabled' : '',
							].filter(Boolean).join(' ') || undefined;

							return (
								<tr
									key={item.id}
									class={rowClass}
									onClick={isDisabled ? undefined : () => this.clickRow(item.id)}
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
					</tbody>
				</table>
			</div>
		);
	}
}
