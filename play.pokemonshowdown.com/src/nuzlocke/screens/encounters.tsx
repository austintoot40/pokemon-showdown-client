/**
 * Nuzlocke — Encounters Screen
 */

import preact from "../../../js/lib/preact";
import { PS } from "../../client-main";
import { toID } from "../../battle-dex";
import { NzScreen, NzScreenHeader, NzSection } from "../components/layout";
import { NzBtn } from "../components/primitives";
import { NzRouteCard, NzRouteCardCaught } from "../components/route-cards";
import type { NuzlockeStatePayload } from "../types";

interface EncountersState {
	nicknames: Record<string, string>;
}

export class EncountersScreen extends preact.Component<{ game: NuzlockeStatePayload }, EncountersState> {
	state: EncountersState = { nicknames: {} };

	static getDerivedStateFromProps(
		props: { game: NuzlockeStatePayload },
		state: EncountersState
	): Partial<EncountersState> | null {
		const updated: Record<string, string> = { ...state.nicknames };
		let changed = false;
		props.game.box.forEach(p => {
			if (!(p.uid in updated)) {
				updated[p.uid] = p.nickname;
				changed = true;
			}
		});
		return changed ? { nicknames: updated } : null;
	}

	setNick = (uid: string, value: string) => {
		this.setState(s => ({ nicknames: { ...s.nicknames, [uid]: value } }));
	};

	submit = () => {
		const { game } = this.props;
		const parts = game.box
			.map(p => `${p.uid} ${(this.state.nicknames[p.uid] ?? p.nickname).replace(/\s+/g, '_')}`)
			.join(' ');
		PS.send(`/nuzlocke setnicks ${parts}`);
	};

	render() {
		const { game } = this.props;
		const { nicknames } = this.state;
		const segment = game.segment!;

		const pendingRoutes = segment.encounters.filter(r =>
			r.type !== 'gift' && !game.resolvedRoutes.includes(r.route)
		);
		const canContinue = pendingRoutes.length === 0;

		const starter = game.box.find(p => p.caughtRoute === 'Starter');
		const wildRoutes = segment.encounters.filter(r => r.type !== 'gift');
		const giftPokemon = game.box.filter(p =>
			segment.encounters.some(r => r.type === 'gift' && r.route === p.caughtRoute)
		);

		const hasBottom = segment.items.length > 0 || giftPokemon.length > 0;

		return <NzScreen>
			<NzScreenHeader
				title={segment.name}
				meta={[
					{ label: 'Level Cap', value: String(segment.levelCap) },
					{ label: 'Next Battle', value: segment.battles[0]?.trainer ?? '?' },
					{ label: 'Routes Remaining', value: String(pendingRoutes.length) },
				]}
			/>

			{starter && <NzSection title="Starter">
				<div class="nz-encounters-grid">
					<NzRouteCardCaught
						pokemon={starter}
						nickname={nicknames[starter.uid] ?? starter.nickname}
						onNickChange={this.setNick}
					/>
				</div>
			</NzSection>}

			{wildRoutes.length > 0 && <NzSection title="Routes">
				<div class="nz-encounters-grid">
					{segment.encounters.map((route, i) => {
						if (route.type === 'gift') return null;
						const caught = game.box.find(p => p.caughtRoute === route.route);
						if (caught) {
							return <NzRouteCardCaught
								key={route.route}
								pokemon={caught}
								pool={route.pokemon}
								nickname={nicknames[caught.uid] ?? caught.nickname}
								onNickChange={this.setNick}
							/>;
						}

						const ownedSpecies = new Set([
							...game.box.map(p => toID(p.species)),
							...game.box.map(p => toID(p.baseSpecies)),
							...game.graveyard.map(p => toID(p.species)),
						]);
						const allDupes = route.pokemon.every(s => ownedSpecies.has(toID(s)));

						return <NzRouteCard
							key={route.route}
							routeName={route.route}
							pool={route.pokemon}
							dupeSpecies={ownedSpecies}
							allDupes={allDupes}
							onExplore={() => PS.send(`/nuzlocke encounter ${i}`)}
						/>;
					})}
				</div>
			</NzSection>}

			{hasBottom && <div class="nz-encounters-bottom">
				{segment.items.length > 0 && <NzSection title="Items Received">
					<div class="nz-items-list">
						{segment.items.map(item => <span key={item} class="nz-item-chip">{item}</span>)}
					</div>
				</NzSection>}

				{giftPokemon.length > 0 && <NzSection title="Gift Pokémon">
					<div class="nz-encounters-grid">
						{giftPokemon.map(p =>
							<NzRouteCardCaught
								key={p.uid}
								pokemon={p}
								nickname={nicknames[p.uid] ?? p.nickname}
								onNickChange={this.setNick}
							/>
						)}
					</div>
				</NzSection>}
			</div>}

			<div style="margin-top:8px;">
				<NzBtn
					onClick={this.submit}
					disabled={!canContinue}
					title={canContinue ? '' : `${pendingRoutes.length} route(s) still unscouted`}
				>
					Continue
				</NzBtn>
			</div>
		</NzScreen>;
	}
}
