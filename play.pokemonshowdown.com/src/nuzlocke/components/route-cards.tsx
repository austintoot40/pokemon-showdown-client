/**
 * Nuzlocke UI — Route & Encounter Cards
 *
 * Unresolved route card and resolved (caught) route card.
 */

import preact from "../../../js/lib/preact";
import { toID } from "../../battle-dex";
import { NzSprite } from "./primitives";
import type { OwnedPokemon } from "../types";

export function NzRouteCard({
	routeName,
	pool,
	dupeSpecies,
	allDupes,
	onExplore,
}: {
	routeName: string;
	pool: string[];
	dupeSpecies: Set<string>;
	allDupes: boolean;
	onExplore: () => void;
}) {
	const cols = Math.max(1, Math.ceil(pool.length / 2));
	return <div
		class={`nz-route-card${allDupes ? ' nz-route-card-dupe' : ' nz-route-card-clickable'}`}
		onClick={allDupes ? undefined : onExplore}
	>
		<div class="nz-route-name">{routeName}</div>
		<div class="nz-route-pool" style={`grid-template-columns: repeat(${cols}, 80px)`}>
			{pool.map(s => {
				const src = `https://play.pokemonshowdown.com/sprites/gen5/${toID(s)}.png`;
				const dupe = dupeSpecies.has(toID(s));
				return <img key={s} src={src} alt={s} style={dupe ? 'opacity:0.25' : ''} />;
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
	pool?: string[];
	nickname?: string;
	onNickChange?: (uid: string, value: string) => void;
}, { editing: boolean }> {
	state = { editing: false };
	startEdit = () => this.setState({ editing: true });
	stopEdit = () => this.setState({ editing: false });
	override render() {
		const { pokemon, pool, nickname, onNickChange } = this.props;
		const { editing } = this.state;
		const displayName = nickname ?? pokemon.nickname;
		const cols = pool ? Math.max(1, Math.ceil(pool.length / 2)) : 1;
		return <div class="nz-route-card nz-route-card-resolved">
			<div class="nz-route-name">{pokemon.caughtRoute}</div>
			<div class="nz-route-pool" style={`grid-template-columns: repeat(${cols}, 80px)`}>
				{pool
					? pool.map(s => toID(s) === toID(pokemon.species)
						? <div key={s} class="nz-route-caught-aura">
							<NzSprite species={pokemon.species} shiny={pokemon.shiny} size={80} />
						</div>
						: <img key={s} src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(s)}.png`} alt={s} style="opacity:0.25" />
					)
					: <div class="nz-route-caught-aura">
						<NzSprite species={pokemon.species} shiny={pokemon.shiny} size={80} />
					</div>
				}
			</div>
			{onNickChange && editing
				? <input
					class="nz-route-caught nz-route-caught-input"
					type="text"
					value={displayName}
					maxlength={12}
					autoFocus
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
