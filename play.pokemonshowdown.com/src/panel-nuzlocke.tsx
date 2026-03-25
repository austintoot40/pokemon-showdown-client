/**
 * Nuzlocke Simulator — Client Panel
 *
 * Registers a nuzlockeRenderer hook on PagePanel so that view-nuzlocke
 * renders this component instead of server-sent HTML. State arrives via
 * |nuzlockestate|<json> messages handled in panel-page.tsx.
 */

import preact from "../js/lib/preact";
import { PS } from "./client-main";
import { NzRoot, NzScreen } from "./nuzlocke/components/layout";
import { StarterScreen } from "./nuzlocke/screens/starter";
import { EncountersScreen } from "./nuzlocke/screens/encounters";
import { TeambuildingScreen } from "./nuzlocke/screens/teambuilding";
import { BattleScreen } from "./nuzlocke/screens/battle";
import { ResultsScreen } from "./nuzlocke/screens/results";
import { SummaryScreen } from "./nuzlocke/screens/summary";
import type { NuzlockeStatePayload } from "./nuzlocke/types";

function NuzlockeGamePanel({ gameState }: { gameState: NuzlockeStatePayload | null }) {
	if (!gameState) return <NzRoot><NzScreen><p class="nz-notice">Loading...</p></NzScreen></NzRoot>;

	let screen: preact.VNode;
	switch (gameState.curScreen) {
	case 'dashboard':
		screen = <NzScreen><p class="nz-notice">No active run. Return to the main menu to start one.</p></NzScreen>;
		break;
	case 'intro':
	case 'starter':      screen = <StarterScreen game={gameState} />; break;
	case 'encounters':   screen = <EncountersScreen game={gameState} />; break;
	case 'teambuilding': screen = <TeambuildingScreen game={gameState} />; break;
	case 'battle':       screen = <BattleScreen game={gameState} />; break;
	case 'results':      screen = <ResultsScreen game={gameState} />; break;
	case 'summary':      screen = <SummaryScreen game={gameState} />; break;
	default:
		screen = <NzScreen><p class="nz-notice">Unknown screen: {(gameState as any).curScreen}</p></NzScreen>;
	}

	return <NzRoot>{screen}</NzRoot>;
}

const PagePanel = (PS.roomTypes['html'] as any);
if (PagePanel) {
	PagePanel.nuzlockeRenderer = (gameState: NuzlockeStatePayload | null) =>
		<NuzlockeGamePanel gameState={gameState} />;
}
