/**
 * Nuzlocke UI — Route & Encounter Cards
 *
 * Unresolved route card and resolved (caught) route card.
 */

import preact from "../../../js/lib/preact";
import { toID } from "../../battle-dex";
import { NzSprite } from "./primitives";
import type { EncounterEntry, OwnedPokemon } from "../types";

export function NzRouteCard({
	routeName,
	pool,
	dupeSpecies,
	allDupes,
	onExplore,
}: {
	routeName: string;
	pool: EncounterEntry[];
	dupeSpecies: Set<string>;
	allDupes: boolean;
	onExplore: () => void;
}) {
	const activeTotal = pool
		.filter(e => !dupeSpecies.has(toID(e.species)))
		.reduce((sum, e) => sum + e.rate, 0);
	return <div
		class={`nz-route-card${allDupes ? ' nz-route-card-dupe' : ' nz-route-card-clickable'}`}
		onClick={allDupes ? undefined : onExplore}
	>
		<div class="nz-route-name">{routeName}</div>
		<div class="nz-route-pool">
			{pool.map(e => {
				const src = `https://play.pokemonshowdown.com/sprites/gen5/${toID(e.species)}.png`;
				const dupe = dupeSpecies.has(toID(e.species));
				const pct = dupe || activeTotal === 0 ? 0 : Math.round(e.rate / activeTotal * 100);
				return <div key={e.species} class={`nz-encounter-slot${dupe ? ' nz-encounter-slot-dupe' : ''}`}>
					<img src={src} alt={e.species} />
					<div class="nz-encounter-rate-bar">
						<div class="nz-encounter-rate-fill" style={`width:${pct}%`} />
					</div>
					<div class="nz-encounter-rate-label">{dupe ? 'dupe' : `${pct}%`}</div>
				</div>;
			})}
		</div>
		{allDupes
			? <div class="nz-label">Duplicate clause</div>
			: <div class="nz-route-caught" aria-hidden style="visibility:hidden">_</div>
		}
	</div>;
}

export class NzRouteCardCaught extends preact.Component<{
	pokemon: OwnedPokemon;
	pool?: EncounterEntry[];
	nickname?: string;
	onNickChange?: (uid: string, value: string) => void;
}, { editing: boolean }> {
	override state = { editing: false };
	startEdit = () => this.setState({ editing: true });
	stopEdit = () => this.setState({ editing: false });
	override render() {
		const { pokemon, pool, nickname, onNickChange } = this.props;
		const { editing } = this.state;
		const displayName = nickname ?? pokemon.nickname;
		return <div class="nz-route-card nz-route-card-resolved">
			<div class="nz-route-name">{pokemon.caughtRoute}</div>
			<div class="nz-route-pool">
				{pool
					? pool.map(e => toID(e.species) === toID(pokemon.species)
						? <div key={e.species} class="nz-route-caught-aura">
							<NzSprite species={pokemon.species} size={80} />
						</div>
						: <img key={e.species} src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(e.species)}.png`} alt={e.species} style="opacity:0.25" />
					)
					: <div class="nz-route-caught-aura">
						<NzSprite species={pokemon.species} size={80} />
					</div>
				}
			</div>
			{onNickChange && editing
				? <input
					class="nz-route-caught nz-route-caught-input"
					type="text"
					value={displayName}
					maxLength={12}
					autofocus
					onInput={(e) => onNickChange(pokemon.uid, (e.target as HTMLInputElement).value)}
					onBlur={this.stopEdit}
				/>
				: <div
					class={`nz-route-caught${onNickChange ? ' nz-route-caught-editable' : ''}`}
					onClick={onNickChange ? this.startEdit : undefined}
				>
					{displayName}
				</div>
			}
		</div>;
	}
}
