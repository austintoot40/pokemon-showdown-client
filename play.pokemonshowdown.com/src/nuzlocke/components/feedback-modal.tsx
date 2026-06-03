import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";

interface FeedbackModalProps {
	curScreen?: string;
	recentCommands?: string[];
	onClose: () => void;
}

export class FeedbackModal extends preact.Component<FeedbackModalProps> {
	message: string = '';
	submitted: boolean = false;

	handleInput = (e: Event) => {
		this.message = (e.target as HTMLTextAreaElement).value;
		this.forceUpdate();
	};

	handleSubmit = () => {
		if (this.message.trim().length < 5) return;

		const payload = {
			message: this.message.trim(),
			context: {
				curScreen: this.props.curScreen,
				recentCommands: this.props.recentCommands,
				userAgent: navigator.userAgent,
			},
		};
		PS.send(`/nuzlocke feedback ${btoa(unescape(encodeURIComponent(JSON.stringify(payload))))}`);
		this.submitted = true;
		this.forceUpdate();
		setTimeout(() => this.props.onClose(), 1800);
	};

	override render() {
		const { onClose } = this.props;

		if (this.submitted) {
			return (
				<div class="nz-modal-overlay" onClick={onClose}>
					<div class="nz-modal nz-feedback-modal" onClick={(e: Event) => e.stopPropagation()}>
						<div class="nz-modal-title">Sent!</div>
						<p class="nz-feedback-sent-msg">Thanks for the report.</p>
					</div>
				</div>
			);
		}

		return (
			<div class="nz-modal-overlay" onClick={onClose}>
				<div class="nz-modal nz-feedback-modal" onClick={(e: Event) => e.stopPropagation()}>
					<div class="nz-modal-title">Report a Bug</div>
					<div class="nz-feedback-subtitle">The software kind, not your favorite Caterpie.</div>

					<fieldset class="nz-modal-fieldset">
						<legend class="nz-modal-legend">What happened?</legend>
						<textarea
							class="nz-feedback-textarea"
							placeholder="Describe what you did, what happened, and what you expected."
							onInput={this.handleInput}
						/>
					</fieldset>

					<div class="nz-modal-actions">
						<button class="nz-btn nz-btn-secondary" onClick={onClose}>Cancel</button>
						<button
							class="nz-btn nz-btn-primary"
							onClick={this.handleSubmit}
							disabled={this.message.trim().length < 5}
						>
							Send Report
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export function FeedbackFab({ onClick }: { onClick: () => void }) {
	return (
		<button class="nz-feedback-fab" title="Report a bug" onClick={onClick}>
			Report Bug
		</button>
	);
}
