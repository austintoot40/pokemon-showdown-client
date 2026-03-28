/**
 * Nuzlocke — Shared Type Definitions
 *
 * All interfaces shared across components, screens, and panels.
 * Mirrors server-side types.ts / game.ts.
 */

// ---------------------------------------------------------------------------
// Pokemon data types
// ---------------------------------------------------------------------------

export interface StatsTable {
	hp: number;
	atk: number;
	def: number;
	spa: number;
	spd: number;
	spe: number;
}

export interface OwnedPokemon {
	uid: string;
	species: string;
	baseSpecies: string;
	nickname: string;
	level: number;
	nature: string;
	ability: string;
	ivs: StatsTable;
	moves: string[];
	item: string;
	gender: string;
	shiny: boolean;
	caughtRoute: string;
	alive: boolean;
}

export interface DeadPokemon {
	uid: string;
	species: string;
	nickname: string;
	caughtRoute: string;
	killedBy: string;
	segment: string;
}

export interface LegalMove {
	name: string;
	fromTM: boolean;
}

export interface EvoOption {
	species: string;
	item: string | null;
	type: 'level' | 'trade' | 'item';
}

export interface TrainerPokemon {
	species: string;
	level: number;
	ability: string;
	moves: string[];
	item: string | null;
}

// ---------------------------------------------------------------------------
// Game state / screen types
// ---------------------------------------------------------------------------

export type NuzlockeScreen =
	'dashboard' | 'encounters' | 'teambuilding' | 'battle' | 'results' | 'summary';

export interface EncounterEntry {
	species: string;
	rate: number;   // encounter weight; values in a route sum to 100
}

export interface RouteEncounter {
	route: string;
	pokemon: EncounterEntry[];
	levels: [number, number];
}

export interface TrainerBattle {
	id: string;
	trainer: string;
	team: TrainerPokemon[];
}

export interface NuzlockeScenarioCard {
	id: string;
	name: string;
	generation: number;
	description: string;
	segmentCount: number;
}

// Full game state delivered to the view-nuzlocke room (|nuzlockestate| message).
// Drives all game screens in the Preact panel.
export interface NuzlockePanelPayload {
	curScreen: NuzlockeScreen;
	scenarioId: string | null;
	scenarioName: string | null;
	scenarioDescription: string | null;
	generation: number;
	currentSegmentIndex: number;
	totalSegments: number;
	currentBattleIndex: number;
	completedBattles: string[];
	segment: {
		name: string;
		levelCap: number;
		items: string[];
		encounters: Record<string, RouteEncounter[]>;
		gifts: RouteEncounter[];
		battles: TrainerBattle[];
	} | null;
	box: OwnedPokemon[];
	party: string[];
	graveyard: DeadPokemon[];
	items: string[];
	tmMoves: string[];
	resolvedRoutes: string[];
	legalMoves: Record<string, LegalMove[]>;
	availableEvolutions: Record<string, EvoOption[]>;
	lastBattleResult: {
		won: boolean;
		perfect: boolean;
		trainerName: string;
		deaths: DeadPokemon[];
	} | null;
	nextScreen: NuzlockeScreen | null;
	segmentNames: Record<string, string>;
	scenarios: NuzlockeScenarioCard[];
}
