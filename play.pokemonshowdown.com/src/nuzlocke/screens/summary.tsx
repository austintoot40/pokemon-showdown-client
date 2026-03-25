/**
 * Nuzlocke — Summary Screen
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { NzScreen, NzSection } from "../components/layout";
import { NzBtn } from "../components/primitives";
import { NzBoxCard, NzGraveyardCard } from "../components/pokemon-cards";
import { NzProgress } from "../components/run-history";
import type { NuzlockeStatePayload } from "../types";

export function SummaryScreen({ game }: { game: NuzlockeStatePayload }) {
	const alive = game.box.filter(p => p.alive);
	const isVictory = game.currentSegmentIndex >= game.totalSegments;
	const segmentList = Object.values(game.segmentNames);

	return <NzScreen>
		<div style="margin-bottom:20px;">
			{isVictory
				? <div class="nz-banner nz-banner-flawless">
					<div class="nz-banner-title">★ {game.scenarioName} — Complete</div>
					<div class="nz-banner-sub">
						{game.completedBattles.length} battles completed
						{game.graveyard.length === 0
							? ' — no casualties.'
							: ` — ${game.graveyard.length} unit${game.graveyard.length !== 1 ? 's' : ''} lost.`}
					</div>
				</div>
				: <div class="nz-banner nz-banner-loss">
					<div class="nz-banner-title">Run Over</div>
					<div class="nz-banner-sub">
						Reached segment {game.currentSegmentIndex + 1} of {game.totalSegments}.
						{' '}{game.completedBattles.length} battle{game.completedBattles.length !== 1 ? 's' : ''} completed.
					</div>
				</div>
			}
		</div>

		{segmentList.length > 0 && <NzSection title="Mission Progress">
			<NzProgress segments={segmentList} currentIndex={game.currentSegmentIndex} />
		</NzSection>}

		{alive.length > 0 && <NzSection title={`Survivors (${alive.length})`}>
			<div style="display:flex;flex-wrap:wrap;gap:10px;">
				{alive.map(p => <NzBoxCard key={p.uid} pokemon={p} />)}
			</div>
		</NzSection>}

		{game.graveyard.length > 0 && <NzSection title={`Graveyard (${game.graveyard.length})`}>
			<div style="display:flex;flex-wrap:wrap;gap:10px;">
				{game.graveyard.map(d =>
					<NzGraveyardCard
						key={d.uid}
						dead={d}
						segmentName={game.segmentNames[d.segment] ?? d.segment}
					/>
				)}
			</div>
		</NzSection>}

		<div style="margin-top:8px;">
			<NzBtn onClick={() => PS.send('/nuzlocke done')} variant="secondary">
				Done
			</NzBtn>
		</div>
	</NzScreen>;
}
