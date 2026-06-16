/**
 * Nuzlocke — Battle Screen
 */

import preact from "../../../js/lib/preact";
import { PS, type RoomID } from "../../client-main";
import { NzScreen, NzPanelFlat } from "../components/layout";
import type { NuzlockePanelPayload } from "../types";

export class BattleScreen extends preact.Component<{ game: NuzlockePanelPayload }> {
	override componentDidMount() {
		this.goToBattle();
	}

	override componentDidUpdate() {
		if ((PS as any).room?.id !== 'view-nuzlocke') return;
		this.goToBattle();
	}

	goToBattle = () => {
		const battleRoomId = this.props.game.battleRoomId as RoomID | null;
		if (!battleRoomId) return;
		if (PS.rooms[battleRoomId]) {
			PS.focusRoom(battleRoomId);
		} else {
			PS.join(battleRoomId);
		}
	};

	override render() {
		const { game } = this.props;
		const battleRoomId = game.battleRoomId as RoomID | null;

		return <NzScreen>
			<NzPanelFlat>
				<p style="color:var(--nz-text-muted);font-size:13px;">
					Battle in progress. Return here when it ends.
				</p>
				{battleRoomId && (
					<button class="nz-btn nz-btn-accent" onClick={this.goToBattle} style="margin-top:12px;">
						Go to Battle
					</button>
				)}
			</NzPanelFlat>
		</NzScreen>;
	}
}
