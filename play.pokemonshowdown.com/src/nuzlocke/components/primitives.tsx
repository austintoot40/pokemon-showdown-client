/**
 * Nuzlocke UI — Primitive Components
 *
 * Atomic UI elements: type badges, HP bar, badge, button, sprite.
 */

import preact from "../../../js/lib/preact";
import { Dex, toID } from "../../battle-dex";
import type { LegalMove } from "../types";

export function NzTypeBadges({ species }: { species: string }) {
	const sp = Dex.species.get(species);
	return <>{sp.types.map(t =>
		<span key={t} class={`nz-type nz-type-${t.toLowerCase()}`}>{t}</span>
	)}</>;
}

export function NzHpBar({ current, max, label }: { current: number; max: number; label?: string }) {
	const pct = max > 0 ? Math.round((current / max) * 100) : 0;
	const stateClass = pct > 50 ? 'nz-hp-high' : pct > 20 ? 'nz-hp-mid' : 'nz-hp-low';
	return <div class={`nz-hp-bar ${stateClass}`}>
		{label && <div class="nz-hp-bar-meta"><span>{label}</span><span>{current}/{max}</span></div>}
		<div class="nz-hp-bar-track">
			<div class="nz-hp-bar-fill" style={`width:${pct}%`}></div>
		</div>
	</div>;
}

export function NzBadge({
	children,
	variant = 'muted',
}: {
	children: preact.ComponentChildren;
	variant?: 'active' | 'danger' | 'accent' | 'warning' | 'muted';
}) {
	return <span class={`nz-badge nz-badge-${variant}`}>{children}</span>;
}

export function NzBtn({
	children,
	onClick,
	disabled,
	variant = 'primary',
	size,
	title,
}: {
	children: preact.ComponentChildren;
	onClick?: () => void;
	disabled?: boolean;
	variant?: 'primary' | 'secondary' | 'danger' | 'evolve';
	size?: 'sm';
	title?: string;
}) {
	const cls = [
		'nz-btn',
		`nz-btn-${variant}`,
		size === 'sm' ? 'nz-btn-sm' : '',
	].filter(Boolean).join(' ');
	return <button class={cls} onClick={onClick} disabled={disabled} title={title}>{children}</button>;
}

function dropdownStyle(rect: DOMRect, minWidth: number): Record<string, string> {
	const gap = 4;
	const maxAllowed = 240;
	const spaceBelow = window.innerHeight - rect.bottom - gap;
	const spaceAbove = rect.top - gap;
	const useBelow = spaceBelow >= 100 || spaceBelow >= spaceAbove;
	return useBelow ? {
		top: `${rect.bottom + gap}px`,
		left: `${rect.left}px`,
		minWidth: `${minWidth}px`,
		maxHeight: `${Math.min(maxAllowed, spaceBelow)}px`,
	} : {
		bottom: `${window.innerHeight - rect.top + gap}px`,
		left: `${rect.left}px`,
		minWidth: `${minWidth}px`,
		maxHeight: `${Math.min(maxAllowed, spaceAbove)}px`,
	};
}

interface NzMoveSelectProps {
	value: string;
	moves: LegalMove[];
	disabledMoves: string[];
	generation: number;
	onChange: (moveId: string) => void;
}

interface NzMoveSelectState {
	query: string;
	open: boolean;
}

export class NzMoveSelect extends preact.Component<NzMoveSelectProps, NzMoveSelectState> {
	state: NzMoveSelectState = { query: '', open: false };
	inputEl: HTMLInputElement | null = null;
	portalEl: HTMLDivElement | null = null;

	componentDidMount() {
		this.portalEl = document.createElement('div');
		document.body.appendChild(this.portalEl);
	}

	componentDidUpdate() {
		this.updatePortal();
	}

	componentWillUnmount() {
		if (this.portalEl) {
			preact.render('' as any, this.portalEl);
			document.body.removeChild(this.portalEl);
			this.portalEl = null;
		}
	}

	handleFocus = () => {
		this.setState({ open: true, query: '' });
	};

	handleInput = (e: Event) => {
		this.setState({ query: (e.target as HTMLInputElement).value });
	};

	handleBlur = () => {
		this.setState({ open: false, query: '' });
	};

	select(id: string) {
		this.props.onChange(id);
		this.setState({ open: false, query: '' });
	}

	updatePortal() {
		if (!this.portalEl) return;
		preact.render(this.renderDropdown(), this.portalEl);
	}

	renderDropdown(): preact.VNode {
		const { value, moves, disabledMoves, generation } = this.props;
		const { query, open } = this.state;

		if (!open || !this.inputEl) return <></>;

		const rect = this.inputEl.getBoundingClientRect();
		const style = dropdownStyle(rect, Math.max(rect.width, 340));

		const genDex = Dex.forGen(generation);
		const q = query.toLowerCase();
		const filtered = !q ? moves : moves.filter(m => {
			if (m.name.toLowerCase().includes(q)) return true;
			const md = genDex.moves.get(toID(m.name));
			if (!md.exists) return false;
			if (md.type.toLowerCase().includes(q)) return true;
			const cat = md.category.toLowerCase();
			if (cat.includes(q)) return true;
			if (q === 'phys' && cat === 'physical') return true;
			if (q === 'spec' && cat === 'special') return true;
			return false;
		});

		return (
			<div class="nz-move-select-dropdown" style={style}>
				<div
					class={`nz-move-select-option${!value ? ' is-selected' : ''}`}
					onMouseDown={(e: MouseEvent) => { e.preventDefault(); this.select(''); }}
				>
					<span class="nz-move-select-name"><span>(empty)</span></span>
				</div>
				{filtered.map(m => {
					const id = toID(m.name);
					const md = genDex.moves.get(id);
					const isDisabled = disabledMoves.includes(id);
					const isSelected = value === id;
					const catKey = md.exists ? md.category.toLowerCase() : '';
					const catLabel = md.exists
						? (md.category === 'Physical' ? 'Phys' : md.category === 'Special' ? 'Spec' : 'Status')
						: '';
					const suffix = m.fromHM ? 'HM' : m.fromTM ? 'TM' : null;
					return (
						<div
							key={m.name}
							class={['nz-move-select-option', isDisabled ? 'is-disabled' : '', isSelected ? 'is-selected' : ''].filter(Boolean).join(' ')}
							onMouseDown={(e: MouseEvent) => { e.preventDefault(); if (!isDisabled) this.select(id); }}
						>
							<span class="nz-move-select-name">
								<span>{m.name}</span>
								{suffix && <span class="nz-move-select-suffix">{suffix}</span>}
							</span>
							{md.exists && <span class={`nz-type nz-type-${md.type.toLowerCase()}`}>{md.type}</span>}
							{md.exists && <span class={`nz-move-cat nz-move-cat-${catKey}`}>{catLabel}</span>}
						</div>
					);
				})}
				{filtered.length === 0 && (
					<div class="nz-move-select-empty">No moves match</div>
				)}
			</div>
		);
	}

	render() {
		const { value, generation } = this.props;
		const { query, open } = this.state;
		const displayValue = open ? query : (value ? (Dex.forGen(generation).moves.get(value).name ?? '') : '');
		return (
			<div class="nz-move-select">
				<input
					ref={(el: any) => { this.inputEl = el; }}
					class="nz-move-select-input"
					type="text"
					value={displayValue}
					placeholder="(empty)"
					onFocus={this.handleFocus}
					onInput={this.handleInput}
					onBlur={this.handleBlur}
				/>
			</div>
		);
	}
}

interface NzItemSelectProps {
	value: string;           // selected item id
	items: { id: string; name: string }[];
	disabledIds: string[];   // ids held by other party members beyond available count
	onChange: (itemId: string) => void;
}

export class NzItemSelect extends preact.Component<NzItemSelectProps, NzMoveSelectState> {
	state: NzMoveSelectState = { query: '', open: false };
	inputEl: HTMLInputElement | null = null;
	portalEl: HTMLDivElement | null = null;

	componentDidMount() {
		this.portalEl = document.createElement('div');
		document.body.appendChild(this.portalEl);
	}

	componentDidUpdate() {
		this.updatePortal();
	}

	componentWillUnmount() {
		if (this.portalEl) {
			preact.render('' as any, this.portalEl);
			document.body.removeChild(this.portalEl);
			this.portalEl = null;
		}
	}

	handleFocus = () => { this.setState({ open: true, query: '' }); };
	handleInput = (e: Event) => { this.setState({ query: (e.target as HTMLInputElement).value }); };
	handleBlur = () => { this.setState({ open: false, query: '' }); };

	select(id: string) {
		this.props.onChange(id);
		this.setState({ open: false, query: '' });
	}

	updatePortal() {
		if (!this.portalEl) return;
		preact.render(this.renderDropdown(), this.portalEl);
	}

	renderDropdown(): preact.VNode {
		const { value, items, disabledIds } = this.props;
		const { query, open } = this.state;

		if (!open || !this.inputEl) return <></>;

		const rect = this.inputEl.getBoundingClientRect();
		const style = dropdownStyle(rect, Math.max(rect.width, 200));

		const q = query.toLowerCase();
		const filtered = !q ? items : items.filter(it => it.name.toLowerCase().includes(q));

		return (
			<div class="nz-move-select-dropdown" style={style}>
				<div
					class={`nz-move-select-option nz-item-option${!value ? ' is-selected' : ''}`}
					onMouseDown={(e: MouseEvent) => { e.preventDefault(); this.select(''); }}
				>
					<span class="nz-move-select-name"><span>(none)</span></span>
				</div>
				{filtered.map(it => {
					const isDisabled = disabledIds.includes(it.id);
					const isSelected = value === it.id;
					return (
						<div
							key={it.id}
							class={['nz-move-select-option nz-item-option', isDisabled ? 'is-disabled' : '', isSelected ? 'is-selected' : ''].filter(Boolean).join(' ')}
							onMouseDown={(e: MouseEvent) => { e.preventDefault(); if (!isDisabled) this.select(it.id); }}
						>
							<span class="itemicon" style={Dex.getItemIcon(it.name)} />
							<span class="nz-move-select-name"><span>{it.name}</span></span>
						</div>
					);
				})}
				{filtered.length === 0 && (
					<div class="nz-move-select-empty">No items match</div>
				)}
			</div>
		);
	}

	render() {
		const { value, items } = this.props;
		const { query, open } = this.state;
		const displayValue = open ? query : (value ? (items.find(it => it.id === value)?.name ?? '') : '');
		return (
			<div class="nz-move-select">
				<input
					ref={(el: any) => { this.inputEl = el; }}
					class="nz-move-select-input"
					type="text"
					value={displayValue}
					placeholder="(none)"
					onFocus={this.handleFocus}
					onInput={this.handleInput}
					onBlur={this.handleBlur}
				/>
			</div>
		);
	}
}

export function NzSprite({ species, size = 60 }: { species: string; size?: number }) {
	const id = toID(species);
	const src = `https://play.pokemonshowdown.com/sprites/gen5/${id}.png`;
	return <img
		class="nz-card-sprite"
		src={src}
		alt={species}
		style={`width:${size}px;height:${size}px;`}
	/>;
}
