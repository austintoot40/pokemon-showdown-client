/**
 * Nuzlocke — Segment Overview Screen
 *
 * Shown at the start of each segment (curScreen === 'segment').
 * Displays the full run timeline and a button to begin exploration.
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { NzRoot, NzScreen } from "../components/layout";
import type { NuzlockePanelPayload } from "../types";

function nzToID(str: string): string {
	if (!str || typeof str !== 'string') return '';
	return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// -----------------------------------------------------------------------
// Trainer carousel (cycles through chained battle sprites)
// -----------------------------------------------------------------------

interface TrainerCarouselState { index: number; visible: boolean; }

class TrainerCarousel extends preact.Component<{ sprites: string[] }, TrainerCarouselState> {
	private timer: ReturnType<typeof setInterval> | null = null;
	private fadeTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(props: any) {
		super(props);
		this.state = { index: 0, visible: true };
	}

	override componentDidMount() {
		if (this.props.sprites.length > 1) {
			this.timer = setInterval(() => this.advance(), 3000);
		}
	}

	override componentWillUnmount() {
		if (this.timer !== null) clearInterval(this.timer);
		if (this.fadeTimer !== null) clearTimeout(this.fadeTimer);
	}

	advance() {
		this.setState({ visible: false });
		this.fadeTimer = setTimeout(() => {
			this.setState((s: TrainerCarouselState) => ({
				index: (s.index + 1) % this.props.sprites.length,
				visible: true,
			}));
		}, 250);
	}

	render() {
		const { sprites } = this.props;
		if (sprites.length === 0) return <div class="nz-tl-trainer-placeholder" />;
		const sprite = sprites[this.state.index];
		const url = (window as any).Dex?.resolveAvatar(sprite) as string
			?? `https://play.pokemonshowdown.com/sprites/trainers/${sprite}.png`;
		return <div class={`nz-tl-trainer-wrap${this.state.visible ? ' nz-tl-trainer-visible' : ''}`}>
			<img class="nz-tl-trainer-sprite" src={url} alt={sprite} width={80} height={80} />
		</div>;
	}
}

// -----------------------------------------------------------------------
// Pokemon carousel (catches / deaths in timeline nodes)
// -----------------------------------------------------------------------

interface PokemonCarouselItem {
	src: string;
	label: string;
}

interface PokemonCarouselState { index: number; visible: boolean; }

class PokemonCarousel extends preact.Component<
	{ items: PokemonCarouselItem[]; variant: 'catch' | 'death' },
	PokemonCarouselState
> {
	private timer: ReturnType<typeof setInterval> | null = null;
	private fadeTimer: ReturnType<typeof setTimeout> | null = null;

	constructor(props: any) {
		super(props);
		this.state = { index: 0, visible: true };
	}

	override componentDidMount() {
		if (this.props.items.length > 1) {
			this.timer = setInterval(() => this.advance(), 3000);
		}
	}

	override componentWillUnmount() {
		if (this.timer !== null) clearInterval(this.timer);
		if (this.fadeTimer !== null) clearTimeout(this.fadeTimer);
	}

	advance() {
		this.setState({ visible: false });
		this.fadeTimer = setTimeout(() => {
			this.setState((s: PokemonCarouselState) => ({
				index: (s.index + 1) % this.props.items.length,
				visible: true,
			}));
		}, 250);
	}

	render() {
		const { items, variant } = this.props;
		if (items.length === 0) return null;
		const item = items[this.state.index];
		const wrapCls = `nz-pkmn-carousel nz-pkmn-carousel--${variant}${this.state.visible ? ' nz-pkmn-carousel-visible' : ''}`;
		return <div class={wrapCls}>
			<img class="nz-pkmn-carousel-sprite" src={item.src} alt={item.label} />
			<div class="nz-pkmn-carousel-label">{item.label}</div>
	</div>;
	}
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
		{/* Central pip — numbered so sequence is clear across wrapped rows */}
		<div class={`nz-tl-pip${isCurrent ? ' nz-tl-pip--current' : isDone ? ' nz-tl-pip--done' : ''}`}>
			{isCurrent ? '▶' : index + 1}
		</div>

		<div class="nz-tl-label">{summary.name}</div>

		{/* Trainer sprites — carousel cycles through chained battles */}
		<div class="nz-tl-trainers">
			<TrainerCarousel sprites={trainerSprites} />
		</div>

		{/* Deaths carousel */}
		{isDone && summary.deaths.length > 0 && <PokemonCarousel
			variant="death"
			items={summary.deaths.map(d => ({
				src: `https://play.pokemonshowdown.com/sprites/ani/${nzToID(d.species)}.gif`,
				label: d.nickname,
			}))}
		/>}
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
	const bgSpriteSrc = game.scenarioPokemon
		? `https://play.pokemonshowdown.com/sprites/ani/${nzToID(game.scenarioPokemon)}.gif`
		: null;

	return <NzRoot>
		<NzScreen>
			<div class="nz-seg-screen" style={colorStyle}>

				<div class="nz-seg-header">
					{bgSpriteSrc && <img class="nz-seg-bg-sprite" src={bgSpriteSrc} alt="" aria-hidden="true" />}
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
					<button class="nz-btn nz-btn-primary" onClick={handleProceed}>
						Continue
					</button>
				</div>

			</div>
		</NzScreen>
	</NzRoot>;
}
