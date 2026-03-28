/**
 * Nuzlocke UI — Pokémon Cards
 *
 * Full, compact, graveyard, and opponent card components.
 */

import preact from "../../../js/lib/preact";
import { Dex } from "../../battle-dex";
import { NzSprite, NzTypeBadges } from "./primitives";
import type { OwnedPokemon, DeadPokemon, TrainerPokemon } from "../types";

export function NzPokemonCard({
	pokemon,
	levelCap,
	actions,
}: {
	pokemon: OwnedPokemon;
	levelCap?: number;
	actions?: preact.ComponentChildren;
}) {
	const sp = Dex.species.get(pokemon.species);
	return <div class="nz-card">
		<NzSprite species={pokemon.species} shiny={pokemon.shiny} />
		<div class="nz-card-nickname">
			{pokemon.nickname}
			{pokemon.shiny && <span style="color:var(--nz-warning);margin-left:4px;">★</span>}
		</div>
		{pokemon.nickname !== pokemon.species && <div class="nz-card-species">{pokemon.species}</div>}
		<div class="nz-card-level">Lv. {levelCap ?? pokemon.level}</div>
		<div class="nz-card-types"><NzTypeBadges species={pokemon.species} /></div>
		<div class="nz-card-nature">{pokemon.nature} · {pokemon.ability}</div>
		{actions && <div class="nz-card-actions">{actions}</div>}
	</div>;
}

export function NzBoxCard({
	pokemon,
	levelCap,
	actions,
}: {
	pokemon: OwnedPokemon;
	levelCap?: number;
	actions?: preact.ComponentChildren;
}) {
	return <div class="nz-card nz-card-compact">
		<NzSprite species={pokemon.species} shiny={pokemon.shiny} size={48} />
		<div class="nz-card-nickname">{pokemon.nickname}</div>
		{pokemon.nickname !== pokemon.species && <div class="nz-card-species">{pokemon.species}</div>}
		<div class="nz-card-level">Lv. {levelCap ?? pokemon.level}</div>
		<div class="nz-card-types"><NzTypeBadges species={pokemon.species} /></div>
		{actions && <div style="margin-top:6px;width:100%;">{actions}</div>}
	</div>;
}

export function NzGraveyardCard({
	dead,
	segmentName,
}: {
	dead: DeadPokemon;
	segmentName: string;
}) {
	return <div class="nz-card nz-card-dead nz-card-compact">
		<NzSprite species={dead.species} size={48} />
		<div class="nz-card-nickname">{dead.nickname}</div>
		{dead.nickname !== dead.species && <div class="nz-card-species">{dead.species}</div>}
		<div class="nz-card-killed-by">{dead.killedBy}</div>
		<div class="nz-card-died-in">{segmentName}</div>
	</div>;
}

export function NzOpponentCard({ pokemon }: { pokemon: TrainerPokemon }) {
	return <div class="nz-card nz-card-opponent">
		<NzSprite species={pokemon.species} size={56} />
		<div class="nz-card-nickname">{pokemon.species}</div>
		<div class="nz-card-level">Lv. {pokemon.level}</div>
		<div class="nz-card-types"><NzTypeBadges species={pokemon.species} /></div>
		<div class="nz-card-opponent nz-card-ability">{pokemon.ability}</div>
		{pokemon.item && <div class="nz-card-item" style="margin-top:2px;padding-top:0;border:none;">
			<span class="nz-card-item-label">{pokemon.item}</span>
		</div>}
		<div class="nz-card-opponent nz-card-move-list">{pokemon.moves.join(' · ')}</div>
	</div>;
}

