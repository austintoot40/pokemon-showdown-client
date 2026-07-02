/**
 * Nuzlocke — Segment Overview Screen
 *
 * Shown at the start of each segment (curScreen === 'segment').
 * Displays the full run timeline and a button to begin exploration.
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { NzRoot, NzScreen } from "../components/layout";
import { NzSprite } from "../components/primitives";
import type { NuzlockePanelPayload } from "../types";


// -----------------------------------------------------------------------
// Generic carousel — shared timer/fade logic for trainer and pokemon slots
// -----------------------------------------------------------------------

interface CarouselState { index: number; visible: boolean; }

class Carousel extends preact.Component<{
	items: any[];
	renderItem: (item: any, visible: boolean) => preact.VNode | null;
	empty?: preact.VNode | null;
}, CarouselState> {
	override state: CarouselState = { index: 0, visible: true };
	private timer: ReturnType<typeof setInterval> | null = null;
	private fadeTimer: ReturnType<typeof setTimeout> | null = null;

	override componentDidMount() {
		if (this.props.items.length > 1) this.timer = setInterval(() => this.advance(), 3000);
	}

	override componentWillUnmount() {
		if (this.timer !== null) clearInterval(this.timer);
		if (this.fadeTimer !== null) clearTimeout(this.fadeTimer);
	}

	advance() {
		this.setState({ visible: false });
		this.fadeTimer = setTimeout(() => {
			this.setState((s: CarouselState) => ({ index: (s.index + 1) % this.props.items.length, visible: true }));
		}, 250);
	}

	override render() {
		const { items, renderItem, empty } = this.props;
		if (items.length === 0) return empty ?? null;
		return renderItem(items[this.state.index], this.state.visible);
	}
}

function TrainerCarousel({ sprites }: { sprites: string[] }) {
	return <Carousel
		items={sprites}
		empty={<div class="nz-tl-trainer-placeholder" />}
		renderItem={(sprite: string, visible: boolean) => {
			const url = (window as any).Dex?.resolveAvatar(sprite) as string
				?? `https://play.pokemonshowdown.com/sprites/trainers/${sprite}.png`;
			return <div class={`nz-tl-trainer-wrap${visible ? ' nz-tl-trainer-visible' : ''}`}>
				<img class="nz-tl-trainer-sprite" src={url} alt={sprite} width={80} height={80} />
			</div>;
		}}
	/>;
}

interface PokemonCarouselItem { species: string; label: string; }

function PokemonCarousel({ items, variant }: { items: PokemonCarouselItem[]; variant: 'catch' | 'death' }) {
	return <Carousel
		items={items}
		renderItem={(item: PokemonCarouselItem, visible: boolean) => {
			const wrapCls = `nz-pkmn-carousel nz-pkmn-carousel--${variant}${visible ? ' nz-pkmn-carousel-visible' : ''}`;
			return <div class={wrapCls}>
				<NzSprite species={item.species} class="nz-pkmn-carousel-sprite" />
				<div class="nz-pkmn-carousel-label">{item.label}</div>
			</div>;
		}}
	/>;
}

// -----------------------------------------------------------------------
// Full timeline node
// -----------------------------------------------------------------------

function TimelineNode({ summary, index }: {
	summary: NuzlockePanelPayload['segmentSummaries'][number];
	index: number;
}) {
	const isDone = summary.status === 'completed';
	const isCurrent = summary.status === 'current';

	const trainerSprites = summary.battles.map(b => b.sprite).filter(Boolean) as string[];

	return <div class={`nz-tl-node nz-tl-node--${summary.status}`}>
		{/* Current node is a card, full stop — no separate pip button standing in front of it */}
		{!isCurrent && <div class={`nz-tl-pip${isDone ? ' nz-tl-pip--done' : ''}`}>
			{index + 1}
		</div>}

		<div class={`nz-tl-body${isCurrent ? ' nz-tl-card' : ''}`}>
			<div class="nz-tl-label">{summary.name}</div>

			{/* Trainer sprites — carousel cycles through chained battles */}
			<div class="nz-tl-trainers">
				<TrainerCarousel sprites={trainerSprites} />
			</div>

			{/* Deaths carousel */}
			{isDone && summary.deaths.length > 0 && <PokemonCarousel
				variant="death"
				items={summary.deaths.map(d => ({
					species: d.species,
					label: d.nickname,
				}))}
			/>}
		</div>
	</div>;
}

// -----------------------------------------------------------------------
// Main screen
// -----------------------------------------------------------------------

export function SegmentScreen({ game }: { game: NuzlockePanelPayload }) {
	const summaries = game.segmentSummaries ?? [];
	const current = summaries.find(s => s.status === 'current');

	function handleProceed() {
		PS.send('/nuzlocke proceed');
	}

	const colorStyle = game.scenarioColor ? `--scenario-color:${game.scenarioColor}` : '';
	const bgSpriteSrc = game.scenarioPokemon ?? null;

	return <NzRoot>
		<NzScreen>
			<div class="nz-seg-screen" style={colorStyle}>

				<div class="nz-seg-header">
					{bgSpriteSrc && <NzSprite species={bgSpriteSrc} class="nz-seg-bg-sprite" size={120} decorative />}
					<div class="nz-seg-scenario">{game.scenarioName}</div>
					<div class="nz-seg-title">{current?.name ?? 'New Segment'}</div>
					<div class="nz-seg-progress">{game.currentSegmentIndex + 1} / {game.totalSegments}</div>
				</div>

				{/* Full timeline */}
				<div class="nz-seg-timeline-wrap">
					<div class="nz-seg-timeline">
						{summaries.map((s, i) => <preact.Fragment key={s.id}>
							{i > 0 && <div class={`nz-tl-line${s.status !== 'upcoming' && summaries[i - 1].status !== 'upcoming' ? ' nz-tl-line--done' : ''}`} />}
							<TimelineNode summary={s} index={i} />
						</preact.Fragment>)}
					</div>
				</div>

				<div class="nz-seg-footer">
					<button class="nz-btn nz-btn-primary nz-seg-proceed-btn" onClick={handleProceed}>
						Encounters
					</button>
				</div>

				{/* Mobile bottom bar */}
				<div class="nz-seg-mobile-bar">
					<div class="nz-seg-mobile-bar-info">
						<span class="nz-seg-mobile-bar-name">{current?.name ?? 'New Segment'}</span>
						<span class="nz-seg-mobile-bar-progress">{game.currentSegmentIndex + 1} / {game.totalSegments}</span>
					</div>
					<button class="nz-btn nz-btn-primary nz-seg-proceed-btn" onClick={handleProceed}>
						Encounters
					</button>
				</div>

			</div>
		</NzScreen>
	</NzRoot>;
}
