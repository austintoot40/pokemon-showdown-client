/**
 * Nuzlocke — Victory / Hall of Fame Screen
 *
 * Shown when the player beats all segments of a run (curScreen === 'done').
 * Pokemon appear one-by-one with a 1-second stagger, then the footer fades in.
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { NzRoot, NzScreen } from "../components/layout";
import type { NuzlockePanelPayload, OwnedPokemon } from "../types";

function SpriteSlot({ mon, index }: { mon: OwnedPokemon; index: number }) {
	const speciesId = mon.species.toLowerCase().replace(/[^a-z0-9]/g, '');
	const src = `https://play.pokemonshowdown.com/sprites/gen5/${speciesId}.png`;
	return (
		<div class="nz-victory-slot" style={`animation-delay:${index}s`}>
			<div class="nz-victory-sprite-wrap">
				<img
					class="nz-victory-sprite"
					src={src}
					alt={mon.species}
					width={120}
					height={120}
				/>
			</div>
			<div class="nz-victory-mon-name">{mon.nickname || mon.species}</div>
			{mon.nickname && mon.nickname !== mon.species && (
				<div class="nz-victory-mon-species">{mon.species}</div>
			)}
			<div class="nz-victory-mon-level">Lv. {mon.level}</div>
		</div>
	);
}

export function VictoryScreen({ game }: { game: NuzlockePanelPayload }) {
	const partyMembers: OwnedPokemon[] = game.party
		.map(uid => game.box.find(p => p.uid === uid))
		.filter((p): p is OwnedPokemon => !!p);

	const pokemonStartDelay = 1; // seconds after header before first pokemon appears
	const lastDelay = pokemonStartDelay + partyMembers.length;
	const footerDelay = lastDelay + 0.5;

	const finalTrainer = game.lastBattleResult?.trainerName ?? null;

	function handleMainMenu() {
		PS.send('/nuzlocke done');
	}

	return (
		<NzRoot>
			<NzScreen>
				<div class="nz-victory-screen">
					<div class="nz-victory-stars" aria-hidden="true" />

					<div class="nz-victory-header">
						<div class="nz-victory-title">
							★ HALL OF FAME ★
						</div>
						<div class="nz-victory-subtitle">
							{game.scenarioName ? `You conquered ${game.scenarioName}!` : 'Run complete!'}
						</div>
						{finalTrainer && (
							<div class="nz-victory-trainer">
								Defeated {finalTrainer}
							</div>
						)}
					</div>

					<div class="nz-victory-party">
						{partyMembers.map((mon, i) => (
							<SpriteSlot key={mon.uid} mon={mon} index={pokemonStartDelay + i} />
						))}
					</div>

					<div class="nz-victory-footer" style={`animation-delay:${footerDelay}s`}>
						<button class="nz-btn nz-victory-menu-btn" onClick={handleMainMenu}>
							Main Menu
						</button>
					</div>
				</div>
			</NzScreen>
		</NzRoot>
	);
}
