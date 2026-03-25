/**
 * Nuzlocke — Results Screen
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { NzScreen, NzScreenHeader } from "../components/layout";
import { NzBtn } from "../components/primitives";
import { NzBattleBanner } from "../components/run-history";
import type { NuzlockeStatePayload } from "../types";

export function ResultsScreen({ game }: { game: NuzlockeStatePayload }) {
	const result = game.lastBattleResult;
	const continueLabel = game.nextScreen === 'summary' ? 'View Summary' : 'Continue';

	if (!result) {
		return <NzScreen>
			<NzScreenHeader title="Battle Result" />
			<p class="nz-notice">No result data available.</p>
			<NzBtn onClick={() => PS.send('/nuzlocke continue')}>{continueLabel}</NzBtn>
		</NzScreen>;
	}

	return <NzScreen>
		<NzBattleBanner
			won={result.won}
			perfect={result.perfect}
			trainerName={result.trainerName}
			deaths={result.deaths}
		/>
		<div style="margin-top:16px;">
			<NzBtn onClick={() => PS.send('/nuzlocke continue')}>{continueLabel}</NzBtn>
		</div>
	</NzScreen>;
}
