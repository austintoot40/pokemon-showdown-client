/**
 * Nuzlocke — Segment Overview Screen
 *
 * Shown at the start of each segment (curScreen === 'segment').
 * Displays the full run timeline and a button to begin exploration.
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { NzScreen } from "../components/layout";
import { NzSprite } from "../components/primitives";
import { NzTutorial, TutorialStep } from "../components/tutorial";
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

// -----------------------------------------------------------------------
// Outcome badge — skull+count if the segment had deaths, checkmark if clean.
// Purely presentational; the whole node handles the click/tooltip.
// -----------------------------------------------------------------------

function OutcomeBadge({ deaths }: { deaths: NuzlockePanelPayload['segmentSummaries'][number]['deaths'] }) {
	const hasDeaths = deaths.length > 0;
	return <div class="nz-tl-badge">
		{hasDeaths ? '💀' : '✓'}{hasDeaths && deaths.length > 1 ? deaths.length : ''}
	</div>;
}

// -----------------------------------------------------------------------
// Full timeline node — whole card is the selectable element; clicking a
// completed node reports its position up to SegmentScreen, which renders
// the tooltip outside the clip-path'd timeline strip (see there for why).
// -----------------------------------------------------------------------

// Desktop (hover-capable, wide enough) gets hover-to-show; touch/narrow
// screens keep tap-to-toggle. Matches the mobile breakpoint used elsewhere
// in this file (max-width: 600px).
const isDesktop = () => window.matchMedia('(min-width: 601px) and (hover: hover)').matches;

class TimelineNode extends preact.Component<{
	summary: NuzlockePanelPayload['segmentSummaries'][number];
	index: number;
	isOpen: boolean;
	onOpen: (index: number, anchor: HTMLDivElement) => void;
	onClose: () => void;
	onToggle: (index: number, anchor: HTMLDivElement) => void;
}> {
	private anchorRef = preact.createRef<HTMLDivElement>();

	handleClick = () => {
		if (this.props.summary.status !== 'completed' || !this.anchorRef.current || isDesktop()) return;
		this.props.onToggle(this.props.index, this.anchorRef.current);
	};

	handleMouseEnter = () => {
		if (this.props.summary.status !== 'completed' || !this.anchorRef.current || !isDesktop()) return;
		this.props.onOpen(this.props.index, this.anchorRef.current);
	};

	handleMouseLeave = () => {
		if (!isDesktop()) return;
		this.props.onClose();
	};

	override render() {
		const { summary, index, isOpen } = this.props;
		const isDone = summary.status === 'completed';
		const isCurrent = summary.status === 'current';

		const trainerSprites = summary.battles.map(b => b.sprite).filter(Boolean) as string[];

		return <div
			class={`nz-tl-node nz-tl-node--${summary.status}${isDone ? ' nz-tl-node--selectable' : ''}${isOpen ? ' nz-tl-node--open' : ''}`}
			onClick={this.handleClick}
			onMouseEnter={this.handleMouseEnter}
			onMouseLeave={this.handleMouseLeave}
			role={isDone ? 'button' : undefined}
			tabIndex={isDone ? 0 : undefined}
		>
			{/* Current node is a card, full stop — no separate pip button standing in front of it */}
			{!isCurrent && <div class={`nz-tl-pip${isDone ? ' nz-tl-pip--done' : ''}`}>
				{index + 1}
			</div>}

			<div class={`nz-tl-body${isCurrent ? ' nz-tl-card' : ''}`}>
				<div class="nz-tl-label">{summary.name}</div>

				{/* Trainer sprites — carousel cycles through chained battles. Badge overlays the sprite's corner. */}
				<div class="nz-tl-trainers" ref={this.anchorRef}>
					{isDone && <OutcomeBadge deaths={summary.deaths} />}
					<TrainerCarousel sprites={trainerSprites} />
				</div>
			</div>
		</div>;
	}
}

function TimelineTooltip({ deaths, pos }: {
	deaths: NuzlockePanelPayload['segmentSummaries'][number]['deaths'];
	pos: { top: number; left: number };
}) {
	return <div class="nz-tl-tooltip" style={`top:${pos.top}px; left:${pos.left}px`}>
		{deaths.length > 0 ? deaths.map(d => <div class="nz-tl-tooltip-row" key={d.uid}>
			<NzSprite species={d.species} size={44} class="nz-tl-tooltip-sprite" />
			<div class="nz-tl-tooltip-text">
				<div class="nz-tl-tooltip-name">{d.nickname}</div>
			</div>
		</div>) : <div class="nz-tl-tooltip-row">
			<div class="nz-tl-tooltip-text">
				<div class="nz-tl-tooltip-name">No losses this segment</div>
			</div>
		</div>}
	</div>;
}

// -----------------------------------------------------------------------
// Main screen
// -----------------------------------------------------------------------

interface SegmentScreenState {
	showTutorial: boolean;
	openIndex: number | null;
	tooltipPos: { top: number; left: number } | null;
}

export class SegmentScreen extends preact.Component<{ game: NuzlockePanelPayload }, SegmentScreenState> {
	override state: SegmentScreenState = { showTutorial: false, openIndex: null, tooltipPos: null };

	toggleTooltip = (index: number, anchor: HTMLDivElement) => {
		if (this.state.openIndex === index) {
			this.setState({ openIndex: null, tooltipPos: null });
			return;
		}
		this.openTooltip(index, anchor);
	};

	openTooltip = (index: number, anchor: HTMLDivElement) => {
		const rect = anchor.getBoundingClientRect();
		this.setState({ openIndex: index, tooltipPos: { top: rect.bottom + 6, left: rect.left + rect.width / 2 } });
	};

	closeTooltip = () => {
		this.setState({ openIndex: null, tooltipPos: null });
	};

	override componentDidMount() {
		try {
			const key = 'nuzlocke_tutorial';
			const seen = JSON.parse(localStorage.getItem(key) ?? '{}');
			if (!seen.segment) this.setState({ showTutorial: true });
		} catch {}
	}

	dismissSegmentTutorial = () => {
		try {
			const key = 'nuzlocke_tutorial';
			const seen = JSON.parse(localStorage.getItem(key) ?? '{}');
			seen.segment = true;
			localStorage.setItem(key, JSON.stringify(seen));
		} catch {}
		this.setState({ showTutorial: false });
	};

	handleProceed = () => {
		PS.send('/nuzlocke proceed');
	};

	override render() {
		const { game } = this.props;
		const summaries = game.segmentSummaries ?? [];
		const current = summaries.find(s => s.status === 'current');
		const handleProceed = this.handleProceed;

		const colorStyle = game.scenarioColor ? `--scenario-color:${game.scenarioColor}` : '';
		const bgSpriteSrc = game.scenarioPokemon ?? null;

		return <NzScreen>
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
							<TimelineNode
							summary={s} index={i} isOpen={this.state.openIndex === i}
							onToggle={this.toggleTooltip} onOpen={this.openTooltip} onClose={this.closeTooltip}
						/>
						</preact.Fragment>)}
					</div>
				</div>

				{/* Rendered outside the clip-path'd timeline strip so it isn't clipped */}
				{this.state.openIndex !== null && this.state.tooltipPos &&
					<TimelineTooltip deaths={summaries[this.state.openIndex].deaths} pos={this.state.tooltipPos} />}

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

			{this.state.showTutorial && (() => {
				const SEGMENT_STEPS: TutorialStep[] = [
					{
						selector: '.nz-seg-timeline',
						title: 'Here\'s the Run',
						body: 'Beat all these fights to win! If a Pokémon faints, it\'s gone for good. Lose a fight entirely, and it\'s game over.',
					},
					{
						selector: '.nz-seg-proceed-btn',
						title: 'Head to Encounters',
						body: 'Click here to go catch Pokémon before your first battle.',
					},
				];
				return <NzTutorial steps={SEGMENT_STEPS} onDone={this.dismissSegmentTutorial} />;
			})()}
		</NzScreen>;
	}
}
