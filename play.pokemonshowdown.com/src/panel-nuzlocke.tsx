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
import { EncountersScreen } from "./nuzlocke/screens/encounters";
import { TeambuildingScreen } from "./nuzlocke/screens/teambuilding";
import { BattleScreen } from "./nuzlocke/screens/battle";
import type { NuzlockePanelPayload } from "./nuzlocke/types";

// ---------------------------------------------------------------------------
// Error reporting
// ---------------------------------------------------------------------------

// Circular buffer of the last 5 commands sent to the server.
const recentCommands: string[] = [];
const RECENT_COMMANDS_MAX = 5;

// Keep a direct reference before patching so error reports don't pollute the buffer.
const _origSend = PS.send.bind(PS);

(PS as any).send = (msg: string, roomid?: any) => {
	recentCommands.push(msg);
	if (recentCommands.length > RECENT_COMMANDS_MAX) recentCommands.shift();
	return _origSend(msg, roomid);
};

function sendNuzlockeError(err: Error, context?: Record<string, unknown>) {
	try {
		const payload = {
			error: { message: err.message, stack: err.stack },
			context: {
				userAgent: navigator.userAgent,
				recentCommands: [...recentCommands],
				...context,
			},
		};
		_origSend(`/nuzlocke logerror ${btoa(JSON.stringify(payload))}`);
	} catch {}
}

window.addEventListener('error', e => {
	sendNuzlockeError(
		e.error instanceof Error ? e.error : new Error(e.message),
		{ type: 'global', filename: e.filename, lineno: e.lineno }
	);
});

window.addEventListener('unhandledrejection', e => {
	const err = e.reason instanceof Error ? e.reason : new Error(String(e.reason));
	sendNuzlockeError(err, { type: 'unhandledRejection' });
});

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function NuzlockeGamePanel({ gameState }: { gameState: NuzlockePanelPayload | null }) {
	if (!gameState) return <NzRoot><NzScreen><p class="nz-notice">Loading...</p></NzScreen></NzRoot>;

	let screen: preact.VNode;
	switch (gameState.curScreen) {
	case 'encounters':   screen = <EncountersScreen game={gameState} />; break;
	case 'teambuilding': screen = <TeambuildingScreen game={gameState} />; break;
	case 'battle':       screen = <BattleScreen game={gameState} />; break;
	default:
		screen = <NzScreen><p class="nz-notice">Unknown screen: {(gameState as any).curScreen}</p></NzScreen>;
	}

	return <NzRoot>{screen}</NzRoot>;
}

class NuzlockeErrorBoundary extends preact.Component<{ gameState: NuzlockePanelPayload | null }> {
	componentDidCatch(err: Error) {
		sendNuzlockeError(err, { type: 'render', screen: this.props.gameState?.curScreen });
	}
	render() {
		return <NuzlockeGamePanel gameState={this.props.gameState} />;
	}
}

const PagePanel = (PS.roomTypes['html'] as any);
if (PagePanel) {
	PagePanel.nuzlockeRenderer = (gameState: NuzlockePanelPayload | null) =>
		<NuzlockeErrorBoundary gameState={gameState} />;
}
