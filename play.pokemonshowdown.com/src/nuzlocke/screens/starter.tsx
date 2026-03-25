/**
 * Nuzlocke — Starter Selection Screen
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { NzScreen, NzScreenHeader } from "../components/layout";
import { NzBtn } from "../components/primitives";
import { NzStarterCard } from "../components/pokemon-cards";
import type { NuzlockeStatePayload } from "../types";

export class StarterScreen extends preact.Component<{ game: NuzlockeStatePayload }, { selected: number | null }> {
	state = { selected: null as number | null };
	select = (i: number) => this.setState({ selected: i });
	confirm = () => {
		if (this.state.selected !== null) PS.send(`/nuzlocke starter ${this.state.selected}`);
	};
	override render() {
		const { game } = this.props;
		const { selected } = this.state;
		const starters = game.starters ?? [];
		return <NzScreen>
			<NzScreenHeader title="Choose Your Starter" />
			<div style="display:flex;gap:16px;flex-wrap:wrap;">
				{starters.map((s, i) =>
					<NzStarterCard
						key={i}
						species={s.species}
						selected={selected === i}
						onSelect={() => this.select(i)}
					/>
				)}
			</div>
			<div style="margin-top:16px;">
				<NzBtn onClick={this.confirm} disabled={selected === null}>
					Confirm
				</NzBtn>
			</div>
		</NzScreen>;
	}
}
