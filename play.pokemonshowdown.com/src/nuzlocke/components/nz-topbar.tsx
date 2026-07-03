import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { FeedbackModal } from "./feedback-modal";

// ---------------------------------------------------------------------------
// Module-level hook — called by NuzlockeErrorBoundary on render errors
// ---------------------------------------------------------------------------

let _openFeedbackCb: () => void = () => {};

export function openFeedbackModal() {
	_openFeedbackCb();
}

// ---------------------------------------------------------------------------
// Mobile back handler — set by panel-mainmenu when the mobile starter-picking
// view is showing, so the topbar's back arrow returns to game selection
// instead of the main menu.
// ---------------------------------------------------------------------------

let _mobileBackHandler: (() => void) | null = null;
let _onMobileBackChange: () => void = () => {};

export function setMobileBackHandler(cb: () => void) {
	_mobileBackHandler = cb;
	_onMobileBackChange();
}

export function clearMobileBackHandler() {
	_mobileBackHandler = null;
	_onMobileBackChange();
}

// ---------------------------------------------------------------------------
// Run count — updated by panel-mainmenu when |updatenuzlocke| arrives
// ---------------------------------------------------------------------------

const _RUNCOUNT_KEY = 'nuzlocke_run_count';
const _savedCount = localStorage.getItem(_RUNCOUNT_KEY);
let _runCount: number | null = _savedCount !== null ? parseInt(_savedCount, 10) : null;

export function setRunCount(count: number) {
	_runCount = count;
	localStorage.setItem(_RUNCOUNT_KEY, String(count));
}

// ---------------------------------------------------------------------------
// Trainer avatar list — built dynamically from BattleAvatarNumbers at render time
// ---------------------------------------------------------------------------

const _AVATAR_KEY = 'nuzlocke_avatar_pref';

function getTrainerList(): string[] {
	const avatarNumbers = (window as any).BattleAvatarNumbers as Record<string, string> | undefined;
	if (!avatarNumbers) return ['lucas'];
	const seen = new Set<string>();
	const out: string[] = [];
	for (const val of Object.values(avatarNumbers)) {
		if (!val || val.startsWith('#')) continue;
		if (!seen.has(val)) { seen.add(val); out.push(val); }
	}
	out.sort((a, b) => a.localeCompare(b));
	return out;
}

// ---------------------------------------------------------------------------
// Settings panel
// ---------------------------------------------------------------------------

interface NzSettingsPanelProps {
	onClose: () => void;
}

interface NzSettingsPanelState {
	muted: boolean;
	avatar: string;
	search: string;
}

class NzSettingsPanel extends preact.Component<NzSettingsPanelProps, NzSettingsPanelState> {
	state: NzSettingsPanelState = {
		muted: PS.prefs.mute,
		avatar: localStorage.getItem(_AVATAR_KEY) || PS.user.avatar || 'lucas',
		search: '',
	};

	toggleMute = () => {
		PS.prefs.set('mute', !PS.prefs.mute);
		this.setState({ muted: PS.prefs.mute });
		PS.update();
	};

	setAvatar = (avatarId: string) => {
		PS.user.avatar = avatarId;
		localStorage.setItem(_AVATAR_KEY, avatarId);
		PS.send('/avatar ' + avatarId);
		this.setState({ avatar: avatarId });
	};

	handleOverlayClick = (e: Event) => {
		if (e.target === e.currentTarget) this.props.onClose();
	};

	override render() {
		const { onClose } = this.props;
		const { muted, avatar, search } = this.state;
		const q = search.toLowerCase().trim();
		const trainers = getTrainerList().filter(id => !q || id.includes(q));

		return (
			<div class="nz-settings-overlay" onClick={this.handleOverlayClick}>
				<div class="nz-settings-panel nz-elevated" onClick={(e: Event) => e.stopPropagation()}>
					<div class="nz-settings-header">
						<span class="nz-settings-title">Settings</span>
						<button class="nz-settings-close" onClick={onClose} aria-label="Close">
							<i class="fa fa-times" aria-hidden></i>
						</button>
					</div>

					<div class="nz-settings-body">
						{/* Sound */}
						<section class="nz-settings-section">
							<div class="nz-settings-row">
								<span class="nz-settings-label">
									<i class={`fa ${muted ? 'fa-volume-off' : 'fa-volume-up'}`} aria-hidden></i>
									{' '}Sound
								</span>
								<button
									class={`nz-settings-toggle ${muted ? 'nz-settings-toggle--off' : 'nz-settings-toggle--on'}`}
									onClick={this.toggleMute}
								>
									{muted ? 'Off' : 'On'}
								</button>
							</div>
						</section>

{/* Trainer Avatar */}
						<section class="nz-settings-section nz-settings-section--last">
							<div class="nz-settings-section-label">Trainer Avatar</div>
							<div class="nz-avatar-preview">
								<img
									src={`//play.pokemonshowdown.com/sprites/trainers/${avatar}.png`}
									alt={avatar}
									width="80"
									height="80"
								/>
								<span class="nz-avatar-preview-name">{avatar}</span>
							</div>
							<input
								class="nz-avatar-search"
								type="text"
								placeholder="Search…"
								value={search}
								onInput={(e: Event) => this.setState({ search: (e.target as HTMLInputElement).value })}
							/>
							<div class="nz-avatar-scroll">
								<div class="nz-avatar-grid">
									{trainers.map(id => (
										<button
											key={id}
											class={`nz-avatar-btn ${avatar === id ? 'nz-avatar-btn--selected' : ''}`}
											onClick={() => this.setAvatar(id)}
											title={id}
										>
											<img
												src={`//play.pokemonshowdown.com/sprites/trainers/${id}.png`}
												alt={id}
												width="40"
												height="40"
											/>
										</button>
									))}
								</div>
							</div>
						</section>

					</div>
				</div>
			</div>
		);
	}
}

// ---------------------------------------------------------------------------
// Main topbar
// ---------------------------------------------------------------------------

interface NzTopBarState {
	settingsOpen: boolean;
	feedbackOpen: boolean;
}

export class NzTopBar extends preact.Component<{}, NzTopBarState> {
	state: NzTopBarState = {
		settingsOpen: false,
		feedbackOpen: false,
	};

	_avatarTimeout: ReturnType<typeof setTimeout> | undefined;

	override componentDidMount() {
		_openFeedbackCb = () => {
			this.setState({ settingsOpen: false, feedbackOpen: true });
		};
		_onMobileBackChange = () => this.forceUpdate();
		this._sendAvatarWhenReady();
	}

	_sendAvatarWhenReady = () => {
		const savedAvatar = localStorage.getItem(_AVATAR_KEY);
		if (!savedAvatar) return;
		if (!(PS as any).connection?.connected) {
			this._avatarTimeout = setTimeout(this._sendAvatarWhenReady, 200);
			return;
		}
		PS.send('/avatar ' + savedAvatar);
	};

	override componentWillUnmount() {
		_openFeedbackCb = () => {};
		_onMobileBackChange = () => {};
		clearTimeout(this._avatarTimeout);
	}

	openSettings = () => this.setState({ settingsOpen: true });
	closeSettings = () => this.setState({ settingsOpen: false });
	openFeedback = () => this.setState({ settingsOpen: false, feedbackOpen: true });
	closeFeedback = () => this.setState({ feedbackOpen: false });

	goToMenu = () => {
		const ps = PS as any;
		ps.join('');
		for (const roomId of Object.keys(ps.rooms)) {
			if (roomId !== '') ps.removeRoom(ps.rooms[roomId]);
		}
	};

	override render() {
		const { settingsOpen, feedbackOpen } = this.state;
		const ps = PS as any;
		const currentRoomId: string = ps.room?.id ?? ps.curRoom?.id ?? '';
		const inRun = currentRoomId !== '';
		return (
			<>
				<div class="nz-topbar">
					<div class="nz-topbar-left">
						{inRun ? (
							<button
								class="nz-topbar-btn nz-topbar-back-btn"
								onClick={this.goToMenu}
								title="Back to Main Menu"
								aria-label="Back to Main Menu"
							>
								<i class="fa fa-arrow-left" aria-hidden></i>
							</button>
						) : _mobileBackHandler && (
							<button
								class="nz-topbar-btn nz-topbar-back-btn nz-topbar-back-btn--mobile-only"
								onClick={_mobileBackHandler}
								title="Back to Game Selection"
								aria-label="Back to Game Selection"
							>
								<i class="fa fa-arrow-left" aria-hidden></i>
							</button>
						)}
					</div>
					<div class="nz-topbar-brand">
						<span class="nz-topbar-wordmark">NUZLOCKE</span>
						<span class="nz-topbar-sub">SIM<span class="nz-topbar-sub-full">ULATOR</span></span>
						{_runCount !== null && (
							<span class="nz-topbar-runcount">
								{_runCount.toLocaleString()} run{_runCount !== 1 ? 's' : ''} worldwide
							</span>
						)}
					</div>
					<div class="nz-topbar-actions">
						<a class="nz-topbar-btn" href="view-about" title="About This Game" aria-label="About This Game">
							<i class="fa fa-info-circle" aria-hidden></i>
						</a>
						<button class="nz-topbar-btn" onClick={this.openFeedback} title="Report a Bug" aria-label="Report a Bug">
							<i class="fa fa-bug" aria-hidden></i>
						</button>
						<button class="nz-topbar-btn" onClick={this.openSettings} aria-label="Settings" title="Settings">
							<i class="fa fa-cog" aria-hidden></i>
						</button>
					</div>
				</div>
				{settingsOpen && (
					<NzSettingsPanel
						onClose={this.closeSettings}
					/>
				)}
				{feedbackOpen && (
					<FeedbackModal onClose={this.closeFeedback} />
				)}
			</>
		);
	}
}
