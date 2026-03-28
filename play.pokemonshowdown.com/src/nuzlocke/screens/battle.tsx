/**
 * Nuzlocke — Battle Screen
 */

import preact from "../../../js/lib/preact";
import { NzScreen, NzScreenHeader, NzPanelFlat } from "../components/layout";
import type { NuzlockePanelPayload } from "../types";

export function BattleScreen({ game }: { game: NuzlockePanelPayload }) {
	const battle = game.segment?.battles[game.currentBattleIndex];
	return <NzScreen>
		<NzScreenHeader
			title="Battle in Progress"
			meta={battle ? [{ label: 'Opponent', value: battle.trainer }] : []}
		/>
		<NzPanelFlat>
			<p style="color:var(--nz-text-muted);font-size:13px;">
				Battle in progress. Return here when it ends.
			</p>
		</NzPanelFlat>
	</NzScreen>;
}
