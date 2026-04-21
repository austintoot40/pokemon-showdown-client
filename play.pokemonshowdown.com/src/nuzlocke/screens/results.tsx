/**
 * Nuzlocke — Results Screen
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { NzScreen, NzScreenHeader } from "../components/layout";
import { NzBtn } from "../components/primitives";
import { NzBattleBanner } from "../components/run-history";
import type { NuzlockePanelPayload } from "../types";

export function ResultsScreen({ game }: { game: NuzlockePanelPayload }) {
	const result = game.lastBattleResult;
	const continueLabel = game.nextScreen === 'done' ? 'Finish'
		: game.nextScreen === 'battle' ? 'Next Battle'
		: 'Continue';

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
		<div style="margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;">
			<NzBtn onClick={() => PS.send('/nuzlocke continue')}>{continueLabel}</NzBtn>
			{!result.won && <NzBtn variant="danger" onClick={() => PS.send('/nuzlocke giveup')}>Give Up</NzBtn>}
		</div>
	</NzScreen>;
}
