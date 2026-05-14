/**
 * Nuzlocke — Hall of Shame (Wipe Screen)
 *
 * Shown when the player loses a battle and their run ends (curScreen === 'wipe').
 * Displays a large trainer sprite and a randomly selected quip that appears
 * word-by-word, mimicking in-game dialog.
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { NzRoot, NzScreen } from "../components/layout";
import type { NuzlockePanelPayload } from "../types";

const QUIPS: string[] = [
	"Try catching better Pokémon.",
	"You probably just rolled bad natures or something.",
	"It is the true nature of nuzlockers to lose repeatedly.",
	"Pokémon Go might be more your speed.",
	"Your battle style is... intriguing.",
	"Unfortunately, you can't save scum your way out of this one.",
];

export function WipeScreen({ game }: { game: NuzlockePanelPayload }) {
	const battle = game.segment?.battles[game.currentBattleIndex];
	const trainerName = battle?.trainer ?? 'the trainer';
	const spriteId = battle?.sprite ?? 'unknown';
	const spriteUrl = (window as any).Dex?.resolveAvatar(spriteId) as string
		?? `https://play.pokemonshowdown.com/sprites/trainers/${spriteId}.png`;

	const rawQuip = QUIPS[Math.floor(Math.random() * QUIPS.length)].replace(/\{trainer\}/g, trainerName);
	const words = rawQuip.split(' ');

	const trainerDelay = 0.5;
	const quipStart = 1.2;
	const wordSpacing = 0.12;
	const footerDelay = quipStart + words.length * wordSpacing + 0.5;

	function handleMainMenu() {
		PS.send('/nuzlocke done');
	}

	return (
		<NzRoot>
			<NzScreen>
				<div class="nz-shame-screen">
					<div class="nz-shame-header">
						<div class="nz-shame-title">✗ HALL OF SHAME ✗</div>
						<div class="nz-shame-subtitle">
							Your run is over.
						</div>
					</div>

					<div class="nz-shame-trainer-wrap" style={`animation-delay:${trainerDelay}s`}>
						<img
							class="nz-shame-trainer-img"
							src={spriteUrl}
							alt={trainerName}
							width={128}
							height={128}
						/>
					</div>

					<div class="nz-shame-quip">
						{words.map((word, i) => (
							<span
								key={i}
								class="nz-shame-word"
								style={`animation-delay:${quipStart + i * wordSpacing}s`}
							>
								{word}
							</span>
						))}
					</div>

					<div class="nz-shame-footer" style={`animation-delay:${footerDelay}s`}>
						<button class="nz-btn nz-shame-menu-btn" onClick={handleMainMenu}>
							Main Menu
						</button>
					</div>
				</div>
			</NzScreen>
		</NzRoot>
	);
}
