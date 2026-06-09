/**
 * Nuzlocke — About Page
 *
 * Renders as a PS tab at view-about. Pure client-side, no server state.
 */

import preact from "../../../js/lib/preact";
import { NzSprite } from "../components/primitives";
import { NzLoadingScreen } from "../components/layout";
import { PS } from "../../client-main";
import { Dex } from "../../battle-dex";

function SectionHeader({ color, children }: { color: 'fire' | 'water' | 'grass' | 'electric'; children: preact.ComponentChildren }) {
	return <div class={`nz-about-section-header nz-about-section-header-${color}`}>{children}</div>;
}

function SpriteRow({ pokemon }: { pokemon: string[] }) {
	return (
		<div class="nz-about-sprite-row">
			{pokemon.map(p => (
				<NzSprite key={p} species={p} size={60} class="nz-about-sprite" animate={false} />
			))}
		</div>
	);
}

function TrainerSprite({ sprite, alt }: { sprite: string; alt: string }) {
	const url = (window as any).Dex?.resolveAvatar(sprite) as string
		?? `https://play.pokemonshowdown.com/sprites/trainers/${sprite}.png`;
	return <img class="nz-about-trainer" src={url} alt={alt} width={96} height={96} />;
}

let _spriteSheetReady = false;

export function AboutPage() {
	if (!(window as any).BattlePokedex) return <NzLoadingScreen />;

	if (!_spriteSheetReady) {
		const sheet = new Image();
		sheet.onload = () => { _spriteSheetReady = true; PS.update(); };
		sheet.src = `${Dex.resourcePrefix}sprites/pokemonicons-sheet.png?v21`;
		if (sheet.complete) {
			_spriteSheetReady = true;
		} else {
			return <NzLoadingScreen />;
		}
	}
	return (
		<div class="nz-about-content">
			<div class="nz-about-sections-grid">

				<section class="nz-about-section">
					<SectionHeader color="fire">The Origin Story</SectionHeader>
					<div class="nz-about-section-inner">
						<div class="nz-about-text-col">
							<p>
								Thank you so much for playing my game!
							</p>
							<p>
								I've had this idea rolling around in my head for years. I love nuzlockes,
								but I never have the motivation to start a new one, since the best parts were buried
								under hours of filler. If I have to fight ten more Team Rocket grunts
								with four Zubats each I'm going to end up on the news. I made this to
								focus on just the good parts of the nuzlocke and skip over the BS.
							</p>
						</div>
						<div class="nz-about-sprite-col">
							<div class="nz-about-sprite-card">
								<div class="nz-about-sprite-caption">"Go! My 14 underleveled zubats!"</div>
								<TrainerSprite sprite="teamrocketgruntm-gen3" alt="Team Rocket Grunt" />
								<SpriteRow pokemon={['Zubat', 'Zubat', 'Zubat']} />
							</div>
						</div>
					</div>
				</section>

				<section class="nz-about-section">
					<SectionHeader color="water">Strategy Focused</SectionHeader>
					<div class="nz-about-section-inner nz-about-section-inner-flip">
						<div class="nz-about-sprite-col">
							<div class="nz-about-sprite-card">
								<SpriteRow pokemon={['Torchic', 'Mudkip', 'Treecko']} />
								<TrainerSprite sprite="steven" alt="Champion" />
								<div class="nz-about-sprite-caption">"Hey wait, I still need that letter delivered!"</div>
							</div>
						</div>
						<div class="nz-about-text-col">
							<p>
								This game is my best attempt to design purely for nuzlocke strategy.
								Get your random encounters, build a team, and try to beat the next major fight.
								No grinding, no filler fights, no scouring Bulbapedia for which strength puzzle
								they hid the Water Stone behind.
							</p>
						</div>
					</div>
				</section>

				<section class="nz-about-section">
					<SectionHeader color="grass">Under the Hood</SectionHeader>
					<div class="nz-about-section-inner">
						<div class="nz-about-text-col">
							<p>
								If you're curious how it works, it's a heavily modified Pokémon Showdown fork,
								which is open source and the only full Pokémon battle sim I could find that
								runs in a browser. On top of that I wrote the AI from scratch and mapped out
								all the encounters, items, and battles for each scenario.
							</p>
						</div>
						<div class="nz-about-sprite-col">
							<div class="nz-about-sprite-card">
								<SpriteRow pokemon={['Rotom', 'Porygon2']} />
								<TrainerSprite sprite="scientist" alt="Scientist" />
								<div class="nz-about-sprite-caption">"It's all spaghetti code of course."</div>
							</div>
						</div>
					</div>
				</section>

				<section class="nz-about-section">
					<SectionHeader color="electric">What's Next</SectionHeader>
					<div class="nz-about-section-inner nz-about-section-inner-flip">
						<div class="nz-about-sprite-col">
							<div class="nz-about-sprite-card">
								<div class="nz-about-sprite-caption">"That's right, I send out my SIXTH Garchomp!"</div>
								<TrainerSprite sprite="cynthia" alt="Champion" />
								<SpriteRow pokemon={['Garchomp', 'Rayquaza']} />
							</div>
						</div>
						<div class="nz-about-text-col">
							<p>
								There's a lot of things I want to add eventually. Difficult ROM hacks like
								Emerald Kaizo, the rest of the mainline games, a custom scenario editor,
								and more.
							</p>
							<p>
								I'll keep adding content as long as you all keep playing, so have fun and
								tell your friends about it!
							</p>
						</div>
					</div>
				</section>

			</div>
			<div class="nz-about-footer">
				<button class="nz-btn nz-btn-primary nz-about-footer-btn" onClick={() => (PS as any).leave('view-about')}>Close</button>
			</div>
		</div>
	);
}
