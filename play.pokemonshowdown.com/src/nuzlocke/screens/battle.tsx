/**
 * Nuzlocke — Battle Screen
 */

import preact from "../../../js/lib/preact";
import { PS, type RoomID } from "../../client-main";
import { NzScreen, NzScreenHeader, NzPanelFlat } from "../components/layout";
import type { NuzlockePanelPayload } from "../types";

export function BattleScreen({ game }: { game: NuzlockePanelPayload }) {
	const battle = game.segment?.battles[game.currentBattleIndex];
	const battleRoomId = game.battleRoomId as RoomID | null;

	function handleLoadBattle() {
		if (!battleRoomId) return;
		if (PS.rooms[battleRoomId]) {
			PS.focusRoom(battleRoomId);
		} else {
			PS.join(battleRoomId);
		}
	}

	return <NzScreen>
		<NzScreenHeader
			title="Battle in Progress"
			meta={battle ? [{ label: 'Opponent', value: battle.trainer }] : []}
		/>
		<NzPanelFlat>
			<p style="color:var(--nz-text-muted);font-size:13px;">
				Battle in progress. Return here when it ends.
			</p>
			{battleRoomId && (
				<button class="nz-btn nz-btn-accent" onClick={handleLoadBattle} style="margin-top:12px;">
					Go to Battle
				</button>
			)}
		</NzPanelFlat>
	</NzScreen>;
}
