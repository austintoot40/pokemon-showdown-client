/**
 * Main menu panel
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license AGPLv3
 */

import preact from "../js/lib/preact";
import { PSLoginServer } from "./client-connection";
import { PS, PSRoom, type RoomID, type RoomOptions, type Team } from "./client-main";
import { PSIcon, PSPanelWrapper, PSRoomPanel } from "./panels";
import type { BattlesRoom } from "./panel-battle";
import type { ChatRoom } from "./panel-chat";
import type { LadderFormatRoom } from "./panel-ladder";
import type { RoomsRoom } from "./panel-rooms";
import { TeamBox, type SelectType } from "./panel-teamdropdown";
import { Dex, toID, type ID } from "./battle-dex";
import type { Args } from "./battle-text-parser";
import { BattleLog } from "./battle-log"; // optional

export type RoomInfo = {
    title: string, desc?: string, userCount?: number, section?: string, privacy?: 'hidden',
    spotlight?: string, subRooms?: string[],
};

interface NuzlockePastRun {
    id: string;
    scenarioId: string;
    scenarioName: string;
    outcome: 'victory' | 'wipe';
    date: string;
    deathCount: number;
    graveyard: Array<{ uid: string; species: string; nickname: string; caughtRoute: string; killedBy: string; segment: string }>;
    survivors: Array<{ species: string; nickname: string }>;
    finalParty: Array<{ species: string; alive: boolean }>;
    finalBattle: string;
    segmentIndex: number;
    ai: string;
}

interface NuzlockeScenarioCard {
    id: string;
    name: string;
    generation: number;
    description: string;
    segmentCount: number;
    battleCount: number;
    encounterCount: number;
    starters: string[];
    color: string;
    pokemon: string;
}

// Lightweight run summary delivered globally (|updatenuzlocke| message).
// Drives the main menu widget: active run banner, scenario picker, past runs.
interface NuzlockeMenuPayload {
    activeRun: {
        scenarioId: string;
        scenarioName: string;
        segmentName: string;
        segmentIndex: number;
        totalSegments: number;
        deaths: number;
        partySpecies: string[];
        curRoom: string;
        ai: string;
    } | null;
    generation: number;
    scenarios: NuzlockeScenarioCard[];
    randomizerPreview: { scenarioId: string; starters: string[] } | null;
}

function getLocalPastRuns(): NuzlockePastRun[] {
    try {
        return JSON.parse(localStorage.getItem('nuzlocke_past_runs') ?? '[]');
    } catch {
        return [];
    }
}

function getLocalAiPreference(): string {
    return localStorage.getItem('nuzlocke_ai_preference') ?? 'game-accurate';
}

function setLocalAiPreference(difficulty: string) {
    localStorage.setItem('nuzlocke_ai_preference', difficulty);
}

interface RandomizerSettings {
    mode: 'shuffle' | 'fully-random';
    bstVariance: 'low' | 'medium' | 'high';
    randomizeItems: boolean;
}

const DEFAULT_RANDOMIZER: RandomizerSettings = { mode: 'shuffle', bstVariance: 'medium', randomizeItems: false };

function getLocalRandomizerSettings(): RandomizerSettings {
    try {
        return { ...DEFAULT_RANDOMIZER, ...JSON.parse(localStorage.getItem('nuzlocke_randomizer_settings') ?? '{}') };
    } catch {
        return { ...DEFAULT_RANDOMIZER };
    }
}

function setLocalRandomizerSettings(s: RandomizerSettings) {
    localStorage.setItem('nuzlocke_randomizer_settings', JSON.stringify(s));
}

const AI_DIFFICULTIES = [
    { id: 'game-accurate', label: 'Game' },
    { id: 'smart', label: 'Smart' },
    { id: 'competitive', label: 'Competitive' },
];


export class MainMenuRoom extends PSRoom {
    override readonly classType: string = 'mainmenu';
    listeners: Record<string, ((response: any) => void)[] | null> = {};
    userdetailsCache: {
        [userid: string]: {
            userid: ID,
            name: string,
            avatar?: string | number,
            status?: string,
            group?: string,
            customgroup?: string,
            rooms?: { [roomid: string]: { isPrivate?: true, p1?: string, p2?: string } },
        },
    } = {};
    roomsCache: {
        battleCount?: number,
        userCount?: number,
        chat?: RoomInfo[],
        sectionTitles?: string[],
    } = {};
    searchCountdown: { format: string, packedTeam: string, countdown: number, timer: number } | null = null;
    /** used to track the moment between "search sent" and "server acknowledged search sent" */
    teamSent: string | null = null;
    search: { searching: string[], games: Record<RoomID, string> | null } = { searching: [], games: null };
    disallowSpectators: boolean | null = PS.prefs.disallowspectators;
    lastChallenged: number | null = null;
    nuzlockeMenuPayload: NuzlockeMenuPayload | null = null;
    constructor(options: RoomOptions) {
        super(options);
        if (this.backlog) {
            // these aren't set yet, but a lot of things could go wrong if we don't
            PS.rooms[''] = this;
            PS.mainmenu = this;
            for (const args of this.backlog) {
                this.receiveLine(args);
            }
            this.backlog = null;
        }
    }
    adjustPrivacy() {
        PS.prefs.set('disallowspectators', this.disallowSpectators);
        if (this.disallowSpectators) return '/noreply /hidenext \n';
        return '';
    }
    startSearch = (format: string, team?: Team, parentElem?: HTMLElement | null) => {
        PS.requestNotifications();
        if (this.searchCountdown) {
            PS.alert("Wait for this countdown to finish first...", { parentElem });
            return;
        } else if (this.search.searching.includes(format)) {
            PS.alert(`You're already searching for a ${BattleLog.formatName(format)} battle...`, { parentElem });
            return;
        }
        this.searchCountdown = {
            format,
            packedTeam: team?.packedTeam || '',
            countdown: 3,
            timer: setInterval(this.doSearchCountdown, 1000),
        };
        this.update(null);
    };
    searchingFormat() {
        return this.searchCountdown?.format || this.teamSent ||
            this.search.searching?.[this.search.searching.length - 1] || null;
    }
    cancelSearch = () => {
        if (this.searchCountdown) {
            clearTimeout(this.searchCountdown.timer);
            this.searchCountdown = null;
            this.update(null);
            return true;
        }
        if (this.teamSent || this.search.searching?.length) {
            this.teamSent = null;
            PS.send(`/cancelsearch`);
            this.update(null);
            return true;
        }
        return false;
    };
    doSearchCountdown = () => {
        if (!this.searchCountdown) return; // ??? race???

        this.searchCountdown.countdown--;
        if (this.searchCountdown.countdown <= 0) {
            this.doSearch(this.searchCountdown);
            clearTimeout(this.searchCountdown.timer);
            this.searchCountdown = null;
        }
        this.update(null);
    };
    doSearch = (search: NonNullable<typeof this.searchCountdown>) => {
        this.teamSent = search.format;
        const privacy = this.adjustPrivacy();
        PS.send(`/utm ${search.packedTeam}`);
        PS.send(`${privacy}/search ${search.format}`);
    };
    override receiveLine(args: Args) {
        const [cmd] = args;
        switch (cmd) {
        case 'challstr': {
            const [, challstr] = args;
            PS.user.challstr = challstr;
            PSLoginServer.query(
                'upkeep', { challstr }
            ).then(res => {
                if (!res?.username) {
                    PS.user.initializing = false;
                    return;
                }
                // | , ; are not valid characters in names
                res.username = res.username.replace(/[|,;]+/g, '');
                if (res.loggedin) {
                    PS.user.registered = { name: res.username, userid: toID(res.username) };
                }
                PS.user.handleAssertion(res.username, res.assertion);
            });
            return;
        } case 'updateuser': {
            const [, fullName, namedCode, avatar] = args;
            const named = namedCode === '1';
            if (named) PS.user.initializing = false;
            PS.user.setName(fullName, named, avatar);
            PS.teams.loadRemoteTeams();
            return;
        } case 'updatechallenges': {
            const [, challengesBuf] = args;
            this.receiveChallenges(challengesBuf);
            return;
        } case 'updatesearch': {
            const [, searchBuf] = args;
            this.receiveSearch(searchBuf);
            return;
        } case 'queryresponse': {
            const [, queryId, responseJSON] = args;
            this.handleQueryResponse(queryId as ID, JSON.parse(responseJSON));
            return;
        } case 'pm': {
            const [, user1, user2, message] = args;
            this.handlePM(user1, user2, message);
            let sideRoom = PS.rightPanel as ChatRoom;
            if (sideRoom?.type === "chat" && PS.prefs.inchatpm) sideRoom?.log?.add(args);
            return;
        } case 'formats': {
            this.parseFormats(args);
            return;
        } case 'popup': {
            const [, message] = args;
            for (const roomid in PS.rooms) {
                const room = PS.rooms[roomid] as ChatRoom | MainMenuRoom;
                if (room.teamSent) {
                    room.teamSent = null;
                    room.update(null);
                }
                if (room.type === 'team') (room as any).cancelUpload();
            }
            PS.alert(message.replace(/\|\|/g, '\n'));
            return;
        } case 'updatenuzlocke': {
            const [, payload] = args;
            this.nuzlockeMenuPayload = JSON.parse(payload);
            this.update(null);
            return;
        }
        }
        const lobby = PS.rooms['lobby'];
        if (lobby) lobby.receiveLine(args);
    }
    receiveChallenges(dataBuf: string) {
        let json;
        try {
            json = JSON.parse(dataBuf);
        } catch {}
        for (const userid in json.challengesFrom) {
            PS.getPMRoom(toID(userid));
        }
        if (json.challengeTo) {
            PS.getPMRoom(toID(json.challengeTo.to));
        }
        for (const roomid in PS.rooms) {
            const room = PS.rooms[roomid] as ChatRoom;
            if (!room.pmTarget) continue;
            const targetUserid = toID(room.pmTarget);
            if (!room.challenged && !(targetUserid in json.challengesFrom) &&
                !room.challenging && json.challengeTo?.to !== targetUserid) {
                continue;
            }
            room.challenged = room.parseChallenge(json.challengesFrom[targetUserid]);
            room.challenging = json.challengeTo?.to === targetUserid ? room.parseChallenge(json.challengeTo.format) : null;
            room.update(null);
        }
    }
    receiveSearch(dataBuf: string) {
        let json;
        this.teamSent = null;
        try {
            json = JSON.parse(dataBuf);
        } catch {}
        this.search = json;
        this.update(null);
    }
    parseFormats(formatsList: string[]) {
        let isSection = false;
        let section = '';

        let column = 0;

        window.NonBattleGames = { rps: 'Rock Paper Scissors' };
        for (let i = 3; i <= 9; i += 2) {
            window.NonBattleGames[`bestof${i}`] = `Best-of-${i}`;
        }
        window.BattleFormats = {};
        for (let j = 1; j < formatsList.length; j++) {
            const entry = formatsList[j];
            if (isSection) {
                section = entry;
                isSection = false;
            } else if (entry === ',LL') {
                PS.teams.usesLocalLadder = true;
            } else if (entry === '' || (entry.startsWith(',') && !isNaN(Number(entry.slice(1))))) {
                isSection = true;

                if (entry) {
                    column = parseInt(entry.slice(1), 10) || 0;
                }
            } else {
                let name = entry;
                let searchShow = true;
                let challengeShow = true;
                let tournamentShow = true;
                let partner = false;
                let bestOfDefault = false;
                let teraPreviewDefault = false;
                let team: 'preset' | null = null;
                let teambuilderLevel: number | null = null;
                let lastCommaIndex = name.lastIndexOf(',');
                let code = lastCommaIndex >= 0 ? parseInt(name.substr(lastCommaIndex + 1), 16) : NaN;
                if (!isNaN(code)) {
                    name = name.substr(0, lastCommaIndex);
                    if (code & 1) team = 'preset';
                    if (!(code & 2)) searchShow = false;
                    if (!(code & 4)) challengeShow = false;
                    if (!(code & 8)) tournamentShow = false;
                    if (code & 16) teambuilderLevel = 50;
                    if (code & 32) partner = true;
                    if (code & 64) bestOfDefault = true;
                    if (code & 128) teraPreviewDefault = true;
                } else {
                    // Backwards compatibility: late 0.9.0 -> 0.10.0
                    if (name.substr(name.length - 2) === ',#') { // preset teams
                        team = 'preset';
                        name = name.substr(0, name.length - 2);
                    }
                    if (name.substr(name.length - 2) === ',,') { // search-only
                        challengeShow = false;
                        name = name.substr(0, name.length - 2);
                    } else if (name.substr(name.length - 1) === ',') { // challenge-only
                        searchShow = false;
                        name = name.substr(0, name.length - 1);
                    }
                }
                let id = toID(name);
                let isTeambuilderFormat = !team && !name.endsWith('Custom Game');
                let teambuilderFormat = '' as ID;
                let teambuilderFormatName = '';
                if (isTeambuilderFormat) {
                    teambuilderFormatName = name;
                    if (!id.startsWith('gen')) {
                        teambuilderFormatName = '[Gen 6] ' + name;
                    }
                    let parenPos = teambuilderFormatName.indexOf('(');
                    if (parenPos > 0 && name.endsWith(')')) {
                        // variation of existing tier
                        teambuilderFormatName = teambuilderFormatName.slice(0, parenPos).trim();
                    }
                    if (teambuilderFormatName !== name) {
                        teambuilderFormat = toID(teambuilderFormatName);
                        if (BattleFormats[teambuilderFormat]) {
                            BattleFormats[teambuilderFormat].isTeambuilderFormat = true;
                        } else {
                            BattleFormats[teambuilderFormat] = {
                                id: teambuilderFormat,
                                name: teambuilderFormatName,
                                team,
                                section,
                                column,
                                rated: false,
                                isTeambuilderFormat: true,
                                effectType: 'Format',
                            };
                        }
                        isTeambuilderFormat = false;
                    }
                }
                if (BattleFormats[id]?.isTeambuilderFormat) {
                    isTeambuilderFormat = true;
                }
                // make sure formats aren't out-of-order
                if (BattleFormats[id]) delete BattleFormats[id];
                BattleFormats[id] = {
                    id,
                    name,
                    team,
                    section,
                    column,
                    searchShow,
                    challengeShow,
                    tournamentShow,
                    bestOfDefault,
                    teraPreviewDefault,
                    rated: searchShow && id.substr(4, 7) !== 'unrated',
                    teambuilderLevel,
                    partner,
                    teambuilderFormat,
                    isTeambuilderFormat,
                    effectType: 'Format',
                };
            }
        }

        // Match base formats to their variants, if they are unavailable in the server.
        let multivariantFormats: { [id: string]: 1 } = {};
        for (let id in BattleFormats) {
            let teambuilderFormat = BattleFormats[BattleFormats[id].teambuilderFormat!];
            if (!teambuilderFormat || multivariantFormats[teambuilderFormat.id]) continue;
            if (!teambuilderFormat.searchShow && !teambuilderFormat.challengeShow && !teambuilderFormat.tournamentShow) {
                // The base format is not available.
                if (teambuilderFormat.battleFormat) {
                    multivariantFormats[teambuilderFormat.id] = 1;
                    teambuilderFormat.battleFormat = '';
                } else {
                    teambuilderFormat.battleFormat = id;
                }
            }
        }
        PS.teams.update('format');
    }
    handlePM(user1: string, user2: string, message?: string) {
        const userid1 = toID(user1);
        const userid2 = toID(user2);
        const pmTarget = PS.user.userid === userid1 ? user2 : user1;
        const pmTargetid = PS.user.userid === userid1 ? userid2 : userid1;
        let roomid = `dm-${pmTargetid}` as RoomID;
        if (pmTargetid === PS.user.userid) roomid = 'dm-' as RoomID;
        let room = PS.rooms[roomid] as ChatRoom | undefined;
        if (!room) {
            PS.addRoom({
                id: roomid,
                args: { pmTarget },
                autofocus: false,
            });
            room = PS.rooms[roomid] as ChatRoom;
        } else {
            room.updateTarget(pmTarget);
        }
        if (message) room.receiveLine([`c`, user1, message]);
        PS.update();
    }
    /**
     * Client-to-server query. Handles `/crq` aka `/cmd`.
     *
     * Most queries are still handled hardcoded, so this is only for certain
     * special queries that need a Promise.
     */
    makeQuery(id: string, param?: string) {
        let fullid = id;
        if (param) fullid += ` ${toID(param)}`;
        return new Promise<any>(resolve => {
            if (!this.listeners[fullid]) {
                this.listeners[fullid] = [];
                PS.send(`/cmd ${id} ${param || ''}`);
            }
            this.listeners[fullid]!.push(resolve);
        });
    }
    handleQueryResponse(id: ID, response: any) {
        let fullid: string = id;
        switch (id) {
        case 'userdetails':
            let userid = response.userid;
            fullid += ` ${userid}`;
            let userdetails = this.userdetailsCache[userid];
            if (!userdetails) {
                this.userdetailsCache[userid] = response;
            } else {
                Object.assign(userdetails, response);
            }
            PS.rooms[`user-${userid}`]?.update(null);
            PS.rooms[`viewuser-${userid}`]?.update(null);
            PS.rooms[`users`]?.update(null);
            break;
        case 'rooms':
            if (response.pspl) {
                for (const roomInfo of response.pspl) roomInfo.spotlight = "Spotlight";
                response.chat = [...response.pspl, ...response.chat];
                response.pspl = null;
            }
            if (response.official) {
                for (const roomInfo of response.official) roomInfo.section = "Official";
                response.chat = [...response.official, ...response.chat];
                response.official = null;
            }
            this.roomsCache = response;
            const roomsRoom = PS.rooms[`rooms`] as RoomsRoom;
            if (roomsRoom) roomsRoom.update(null);
            break;
        case 'roomlist':
            const battlesRoom = PS.rooms[`battles`] as BattlesRoom;
            if (battlesRoom) {
                const battleTable = response.rooms;
                const battles = [];
                for (const battleid in battleTable) {
                    battleTable[battleid].id = battleid;
                    battles.push(battleTable[battleid]);
                }
                battlesRoom.battles = battles;
                battlesRoom.update(null);
            }
            break;
        case 'laddertop':
            for (const [roomid, ladderRoom] of Object.entries(PS.rooms)) {
                if (roomid.startsWith('ladder-')) {
                    (ladderRoom as LadderFormatRoom).update(response);
                }
            }
            break;
        case 'teamupload':
            if (PS.teams.uploading) {
                const team = PS.teams.uploading;
                team.uploaded = {
                    teamid: response.teamid,
                    notLoaded: false,
                    private: response.private,
                };
                PS.rooms[`team-${team.key}`]?.update(null);
                PS.rooms.teambuilder?.update(null);
                PS.teams.uploading = null;
            }
            break;
        case 'teamupdate':
            for (const team of PS.teams.list) {
                if (team.teamid === response.teamid) {
                    team.uploaded = {
                        teamid: response.teamid,
                        notLoaded: false,
                        private: response.private,
                    };
                    PS.rooms[`team-${team.key}`]?.update(null);
                    PS.rooms.teambuilder?.update(null);
                    PS.teams.uploading = null;
                    break;
                }
            }
            break;
        }
        for (const callback of this.listeners[fullid] || []) callback(response);
        delete this.listeners[fullid];
    }
}

class NewsPanel extends PSRoomPanel {
    static readonly id = 'news';
    static readonly routes = ['news'];
    static readonly title = 'News';
    static readonly location = 'mini-window';
    change = (ev: Event) => {
        const target = ev.currentTarget as HTMLInputElement;
        if (target.value === '1') {
            document.cookie = "preactalpha=1; expires=Thu, 1 May 2026 12:00:00 UTC; path=/";
        } else {
            document.cookie = "preactalpha=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        if (target.value === 'leave') {
            document.location.href = `/`;
        }
    };
    override render() {
        const cookieSet = document.cookie.includes('preactalpha=1');
        return <PSPanelWrapper room={this.props.room} fullSize scrollable>
            <div class="construction">
                This is the client rewrite beta test.
                <form>
                    <label class="checkbox">
                        <input type="radio" name="preactalpha" value="1" onChange={this.change} checked={cookieSet} /> {}
                        Use Rewrite always
                    </label>
                    <label class="checkbox">
                        <input type="radio" name="preactalpha" value="0" onChange={this.change} checked={!cookieSet} /> {}
                        Use Rewrite with URL
                    </label>
                    <label class="checkbox">
                        <input type="radio" name="preactalpha" value="leave" onChange={this.change} /> {}
                        Back to the old client
                    </label>
                </form>
                Provide feedback in <a href="development" style="color:black">the Dev chatroom</a>.
            </div>
            <div class="readable-bg" dangerouslySetInnerHTML={{ __html: PS.newsHTML }}></div>
        </PSPanelWrapper>;
    }
}

function NuzlockeLoadingPanel() {
    return (
        <div class="nz-active-run-panel nz-active-run-panel-loading" aria-busy="true" aria-label="Loading run data">
            <div class="nz-loading-skel nz-loading-skel-title" />
            <div class="nz-loading-skel nz-loading-skel-meta" />
            <div class="nz-loading-skel nz-loading-skel-bar" style="margin-top:16px;margin-bottom:0;" />
            <div class="nz-team-grid">
                {[0,1,2,3,4,5].map(i => (
                    <div key={i} class="nz-team-slot nz-team-slot-loading">
                        <div class="nz-loading-skel nz-loading-skel-sprite" />
                        <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                            <div class="nz-loading-skel nz-loading-skel-name" />
                            <div class="nz-loading-skel nz-loading-skel-type" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

class MainMenuPanel extends PSRoomPanel<MainMenuRoom> {
    static readonly id = 'mainmenu';
    static readonly routes = [''];
    static readonly Model = MainMenuRoom;
    static readonly icon = <i class="fa fa-home" aria-hidden></i>;
    selectedScenario: string | null = null;
    selectedStarter: number | null = null;
    selectedDifficulty: string = getLocalAiPreference();
    confirmAbandon: boolean = false;
    showRandomizerModal: boolean = false;
    randomizerSettings: RandomizerSettings = getLocalRandomizerSettings();

    clickAbandon = () => {
        this.confirmAbandon = true;
        this.forceUpdate();
    };
    clickConfirmAbandon = () => {
        this.confirmAbandon = false;
        this.selectedStarter = null;
        PS.send('/nuzlocke abandon');
    };
    clickCancelAbandon = () => {
        this.confirmAbandon = false;
        this.forceUpdate();
    };
    clickStartRun = () => {
        const status = this.props.room.nuzlockeMenuPayload;
        const randomizerPreview = status?.randomizerPreview ?? null;
        const hasActivePreview = !!(randomizerPreview && randomizerPreview.scenarioId === this.selectedScenario);
        if (hasActivePreview) {
            PS.send(`/nuzlocke randomizestart ${this.selectedScenario} ${this.selectedDifficulty} ${this.selectedStarter}`);
        } else {
            PS.send(`/nuzlocke start ${this.selectedScenario} ${this.selectedDifficulty} ${this.selectedStarter}`);
        }
    };
    clickCancelRandomizer = () => {
        this.selectedStarter = null;
        PS.send('/nuzlocke randomizercancel');
        this.forceUpdate();
    };
    openRandomizerModal = () => {
        this.showRandomizerModal = true;
        this.forceUpdate();
    };
    closeRandomizerModal = () => {
        this.showRandomizerModal = false;
        this.forceUpdate();
    };
    setRandomizerMode = (mode: 'shuffle' | 'fully-random') => {
        this.randomizerSettings = { ...this.randomizerSettings, mode };
        setLocalRandomizerSettings(this.randomizerSettings);
        this.forceUpdate();
    };
    setRandomizerBst = (bstVariance: 'low' | 'medium' | 'high') => {
        this.randomizerSettings = { ...this.randomizerSettings, bstVariance };
        setLocalRandomizerSettings(this.randomizerSettings);
        this.forceUpdate();
    };
    setRandomizerItems = (randomizeItems: boolean) => {
        this.randomizerSettings = { ...this.randomizerSettings, randomizeItems };
        setLocalRandomizerSettings(this.randomizerSettings);
        this.forceUpdate();
    };
    clickRandomize = () => {
        if (!this.selectedScenario) return;
        this.selectedStarter = null;
        const { mode, bstVariance, randomizeItems } = this.randomizerSettings;
        PS.send(`/nuzlocke randomizerpreview ${this.selectedScenario} ${mode} ${bstVariance} ${randomizeItems}`);
        this.showRandomizerModal = false;
        this.forceUpdate();
    };
    selectScenario = (id: string) => {
        this.selectedScenario = id;
        this.selectedStarter = null;
        this.forceUpdate();
    };
    selectStarter = (index: number) => {
        this.selectedStarter = index;
        this.forceUpdate();
    };
    setDifficulty = (difficulty: string) => {
        this.selectedDifficulty = difficulty;
        setLocalAiPreference(difficulty);
        PS.send(`/nuzlocke setai ${difficulty}`);
        this.forceUpdate();
    };
    override render() {
        const status = this.props.room.nuzlockeMenuPayload;
        const activeRun = status?.activeRun ?? null;
        const pastRuns = getLocalPastRuns();
        const currentDifficulty = activeRun?.ai ?? this.selectedDifficulty;

        const serverScenarios = status?.scenarios ?? [];
        const selectedScenarioData = this.selectedScenario
            ? serverScenarios.find(s => s.id === this.selectedScenario) ?? null
            : null;
        const randomizerPreview = status?.randomizerPreview ?? null;
        const hasActivePreview = !!(randomizerPreview && randomizerPreview.scenarioId === this.selectedScenario);
        const displayedStarters: string[] = hasActivePreview
            ? randomizerPreview!.starters
            : (selectedScenarioData?.starters ?? []);
        const scenarioRuns = selectedScenarioData
            ? pastRuns.filter(r => r.scenarioId === selectedScenarioData.id)
            : [];
        const scenarioVictories = scenarioRuns.filter(r => r.outcome === 'victory').length;
        const scenarioWipes = scenarioRuns.filter(r => r.outcome === 'wipe').length;
        const lastWipe = [...scenarioRuns].reverse().find(r => r.outcome === 'wipe') ?? null;
        const lastWipeTeam = lastWipe?.finalParty ?? null;

        return <PSPanelWrapper room={this.props.room}>
            <div class="mainmenu">
                <div class="mainmenu-left">
                    <div class="nz-root">
                        <div class="nz-dashboard nz-dashboard-has-run">

                            <div class="nz-dashboard-run">
                                {status === null ? (
                                    <NuzlockeLoadingPanel />
                                ) : !activeRun ? (
                                    selectedScenarioData ? (
                                        <div class="nz-active-run-panel" style={`--scenario-color:${selectedScenarioData.color};`}>
                                            <img class="nz-panel-sprite" src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(selectedScenarioData.pokemon)}.png`} alt="" aria-hidden="true" />
                                            <div class="nz-panel-sections">

                                                {/* Left column: Scenario + Configuration */}
                                                <div class="nz-panel-col-main">

                                                    <div class="nz-panel-section">
                                                        <div class="nz-active-run-title" style="font-size:18px;margin-bottom:6px;">{selectedScenarioData.name}</div>
                                                        <div class="nz-scenario-stats">
                                                            <span>Gen {selectedScenarioData.generation}</span>
                                                            <span class="nz-scenario-stats-sep">·</span>
                                                            <span>{selectedScenarioData.battleCount} fights</span>
                                                            <span class="nz-scenario-stats-sep">·</span>
                                                            <span>{selectedScenarioData.encounterCount} encounters</span>
                                                        </div>
                                                        <div class="nz-scenario-description">{selectedScenarioData.description}</div>
                                                    </div>

                                                    <div class="nz-panel-section nz-panel-section-config">
                                                        {selectedScenarioData.starters.length > 0 && (
                                                            <>
                                                                <div class="nz-label" style="margin-bottom:6px;">
                                                                    Starter
                                                                    {hasActivePreview && (
                                                                        <span class="nz-badge nz-badge-warning" style="margin-left:6px;padding-top:0;padding-bottom:0;line-height:1;vertical-align:middle;">Randomized</span>
                                                                    )}
                                                                </div>
                                                                <div class="nz-starter-picker">
                                                                    {displayedStarters.map((species, i) => {
                                                                        const types = Dex.species.get(species)?.types ?? [];
                                                                        return <div
                                                                            key={i}
                                                                            class={`nz-starter-pick${this.selectedStarter === i ? ' nz-starter-pick-selected' : ''}`}
                                                                            onClick={() => this.selectStarter(i)}
                                                                        >
                                                                            <img
                                                                                src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(species)}.png`}
                                                                                alt={species}
                                                                            />
                                                                            <div class="nz-starter-pick-name">{species}</div>
                                                                            <div class="nz-starter-pick-types">
                                                                                {types.map((t: string) => (
                                                                                    <span key={t} class={`nz-type nz-type-${t.toLowerCase()}`}>{t}</span>
                                                                                ))}
                                                                            </div>
                                                                        </div>;
                                                                    })}
                                                                </div>
                                                            </>
                                                        )}
                                                        <div class="nz-label" style="margin-bottom:6px;margin-top:12px;">AI Difficulty</div>
                                                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                                                            {AI_DIFFICULTIES.map(d => (
                                                                <button
                                                                    key={d.id}
                                                                    class={`nz-difficulty-btn${currentDifficulty === d.id ? ' active' : ''}`}
                                                                    onClick={() => this.setDifficulty(d.id)}
                                                                >{d.label}</button>
                                                            ))}
                                                        </div>
                                                        <div class="nz-btn-group">
                                                            <button
                                                                class="nz-btn nz-btn-primary"
                                                                onClick={this.clickStartRun}
                                                                disabled={!!(displayedStarters.length && this.selectedStarter === null)}
                                                            >Start Run</button>
                                                            {hasActivePreview ? (
                                                                <button
                                                                    class="nz-btn nz-btn-secondary"
                                                                    onClick={this.clickCancelRandomizer}
                                                                >Normal Run</button>
                                                            ) : (
                                                                <button
                                                                    class="nz-btn nz-btn-randomizer"
                                                                    onClick={this.openRandomizerModal}
                                                                >Randomize</button>
                                                            )}
                                                        </div>
                                                    </div>

                                                </div>

                                                {/* Right column: Stats */}
                                                <div class="nz-panel-col-side">
                                                    <div class="nz-label" style="margin-bottom:10px;">Your Stats</div>
                                                    {scenarioRuns.length > 0 ? (
                                                        <>
                                                            <div class="nz-stat-chips">
                                                                <div class="nz-stat-chip">
                                                                    <div class="nz-stat-chip-value wins">{scenarioVictories}</div>
                                                                    <div class="nz-stat-chip-label">Wins</div>
                                                                </div>
                                                                <div class="nz-stat-chip">
                                                                    <div class="nz-stat-chip-value losses">{scenarioWipes}</div>
                                                                    <div class="nz-stat-chip-label">Losses</div>
                                                                </div>
                                                            </div>
                                                            {lastWipeTeam && lastWipeTeam.length > 0 && (
                                                                <div class="nz-stat-last-run">
                                                                    <div class="nz-label" style="margin-bottom:8px;">Last Loss</div>
                                                                    <div class="nz-active-run-segment" style="margin-bottom:8px;">
                                                                        {lastWipe!.finalBattle || `Segment ${lastWipe!.segmentIndex + 1}`}
                                                                        {' · '}{lastWipe!.deathCount} death{lastWipe!.deathCount !== 1 ? 's' : ''}
                                                                    </div>
                                                                    <div class="nz-stat-last-team">
                                                                        {lastWipeTeam.map((p, i) => (
                                                                            <img
                                                                                key={i}
                                                                                src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(p.species)}.png`}
                                                                                alt={p.species}
                                                                                style={p.alive ? '' : 'opacity:0.3;filter:grayscale(1)'}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div class="nz-active-run-segment">No previous attempts</div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    ) : (
                                        <div class="nz-active-run-panel nz-active-run-panel-empty">
                                            <div class="nz-active-run-title">No Active Run</div>
                                            <div class="nz-active-run-segment">Select a scenario to begin.</div>
                                        </div>
                                    )
                                ) : (
                                    <div class="nz-active-run-panel" style={`--scenario-color:${serverScenarios.find(s => s.id === activeRun.scenarioId)?.color ?? ''};`}>
                                        <img class="nz-panel-sprite" src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(serverScenarios.find(s => s.id === activeRun.scenarioId)?.pokemon ?? '')}.png`} alt="" aria-hidden="true" />
                                        <div class="nz-active-run-header">
                                            <div>
                                                <div class="nz-active-run-title">{activeRun.scenarioName}</div>
                                                <div class="nz-active-run-segment">
                                                    {activeRun.segmentName} · Segment {activeRun.segmentIndex + 1} / {activeRun.totalSegments}
                                                </div>
                                            </div>
                                            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                                                <span class="nz-badge nz-badge-active">Active</span>
                                                {activeRun.deaths > 0 && (
                                                    <span class="nz-badge nz-badge-danger">
                                                        {activeRun.deaths} {activeRun.deaths === 1 ? 'loss' : 'losses'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div class="nz-active-run-progress">
                                            <div class="nz-label" style="margin-bottom:6px;">
                                                Segment Progress — {activeRun.segmentIndex + 1} / {activeRun.totalSegments}
                                            </div>
                                            <div class="nz-segment-bar">
                                                {Array.from({length: activeRun.totalSegments}).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        class={`nz-segment-pip${i < activeRun.segmentIndex ? ' done' : i === activeRun.segmentIndex ? ' current' : ''}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div class="nz-label" style="margin-bottom:8px;">Party</div>
                                        <div class="nz-team-grid">
                                            {activeRun.partySpecies.map((species, i) => {
                                                const types = Dex.species.get(species)?.types ?? [];
                                                return <div key={i} class="nz-team-slot">
                                                    <img
                                                        src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(species)}.png`}
                                                        alt={species}
                                                    />
                                                    <div class="nz-team-slot-info">
                                                        <div class="nz-team-slot-name">{species}</div>
                                                        <div class="nz-team-slot-types">
                                                            {types.map((t: string) => (
                                                                <span key={t} class={`nz-type nz-type-${t.toLowerCase()}`}>{t}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>;
                                            })}
                                        </div>

                                        {this.confirmAbandon ? (
                                            <div class="nz-btn-group">
                                                <span class="nz-label nz-label-danger" style="margin-right:8px;">Abandon permanently?</span>
                                                <button class="nz-btn nz-btn-danger" onClick={this.clickConfirmAbandon}>Yes, abandon</button>
                                                <button class="nz-btn nz-btn-secondary" onClick={this.clickCancelAbandon}>Cancel</button>
                                            </div>
                                        ) : (
                                            <div class="nz-btn-group">
                                                <a class="nz-btn nz-btn-primary" href="view-nuzlocke">Resume Run</a>
                                                <button class="nz-btn nz-btn-secondary" onClick={this.clickAbandon}>Abandon</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div class="nz-dashboard-scenarios">
                                <div class="nz-scenarios-header">
                                    <div class="nz-section-title" style="margin-bottom:0;">Scenarios</div>
                                </div>
                                <div class="nz-scenario-grid">
                                    {[...serverScenarios].sort((a, b) => a.generation - b.generation).map(scenario => {
                                        const selected = this.selectedScenario === scenario.id;
                                        return <div
                                            key={scenario.id}
                                            class={`nz-scenario-card${selected ? ' nz-scenario-card-selected' : ''}`}
                                            style={`--scenario-color:${scenario.color};`}
                                            onClick={() => this.selectScenario(scenario.id)}
                                        >
                                            <img
                                                class="nz-scenario-card-sprite"
                                                src={`https://play.pokemonshowdown.com/sprites/gen5/${toID(scenario.pokemon)}.png`}
                                                alt=""
                                                aria-hidden="true"
                                            />
                                            <div class="nz-scenario-card-content">
                                                <div class="nz-scenario-card-title">{scenario.name}</div>
                                                <div class="nz-scenario-card-meta">Gen {scenario.generation}</div>
                                            </div>
                                        </div>;
                                    })}
                                </div>
                            </div>

                            {(status === null || pastRuns.length > 0) && <div class="nz-dashboard-history">
                                <div class="nz-section-title" style="margin-bottom:12px;">
                                    {status === null ? 'Past Runs' : `Past Runs (${pastRuns.length})`}
                                </div>
                                {status === null ? (
                                    <div class="nz-run-list nz-run-list-loading" aria-busy="true">
                                        {[0,1,2].map(i => (
                                            <div key={i} class="nz-run-entry">
                                                <div class="nz-loading-skel" style="width:52px;height:20px;border-radius:2px;flex-shrink:0;" />
                                                <div class="nz-loading-skel nz-loading-skel-run-name" />
                                                <div class="nz-loading-skel nz-loading-skel-run-meta" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                <div class="nz-run-list">
                                    {[...pastRuns].reverse().map(run => {
                                        const date = new Date(run.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                                        const won = run.outcome === 'victory';
                                        return <div key={run.id} class="nz-run-entry">
                                            <span class={`nz-badge ${won ? 'nz-badge-active' : 'nz-badge-danger'}`}>{won ? 'Victory' : 'Wipe'}</span>
                                            <span class="nz-run-entry-name">{run.scenarioName}</span>
                                            {(run.finalParty ?? run.survivors).length > 0 && <span class="nz-run-entry-sprites">
                                                {(run.finalParty ?? run.survivors.map(s => ({ ...s, alive: true }))).map((p, i) =>
                                                    <span key={i}>
                                                        <PSIcon pokemon={toID(p.species)} />
                                                    </span>
                                                )}
                                            </span>}
                                            <span class="nz-run-entry-meta">
                                                {date} · {run.deathCount} death{run.deathCount !== 1 ? 's' : ''}
                                                {run.finalBattle ? ` · ${run.finalBattle}` : ''}
                                            </span>
                                        </div>;
                                    })}
                                </div>
                                )}
                            </div>}

                        </div>
                    </div>
                </div>
            </div>
            {this.showRandomizerModal && (
                <RandomizerModal
                    settings={this.randomizerSettings}
                    onClose={this.closeRandomizerModal}
                    onConfirm={this.clickRandomize}
                    onSetMode={this.setRandomizerMode}
                    onSetBst={this.setRandomizerBst}
                    onSetItems={this.setRandomizerItems}
                />
            )}
        </PSPanelWrapper>;
    }
}

function RandomizerModal(props: {
    settings: RandomizerSettings;
    onClose: () => void;
    onConfirm: () => void;
    onSetMode: (mode: 'shuffle' | 'fully-random') => void;
    onSetBst: (bst: 'low' | 'medium' | 'high') => void;
    onSetItems: (val: boolean) => void;
}) {
    const { settings, onClose, onConfirm, onSetMode, onSetBst, onSetItems } = props;
    return (
        <div class="nz-modal-overlay" onClick={onClose}>
            <div class="nz-modal" onClick={(e: Event) => e.stopPropagation()}>
                <div class="nz-modal-title">Randomizer Settings</div>

                <fieldset class="nz-modal-fieldset">
                    <legend class="nz-modal-legend">
                        Mode
                        <span
                            class="nz-tooltip"
                            data-tooltip="Shuffle swaps each species for a unique replacement. Fully Random picks independently per route."
                        >?</span>
                    </legend>
                    <div class="nz-modal-radio-group">
                        <label class="nz-modal-radio">
                            <input
                                type="radio"
                                name="nz-rand-mode"
                                value="shuffle"
                                checked={settings.mode === 'shuffle'}
                                onChange={() => onSetMode('shuffle')}
                            />
                            Shuffle
                        </label>
                        <label class="nz-modal-radio">
                            <input
                                type="radio"
                                name="nz-rand-mode"
                                value="fully-random"
                                checked={settings.mode === 'fully-random'}
                                onChange={() => onSetMode('fully-random')}
                            />
                            Fully Random
                        </label>
                    </div>
                </fieldset>

                <fieldset class="nz-modal-fieldset">
                    <legend class="nz-modal-legend">
                        BST Variance
                        <span
                            class="nz-tooltip"
                            data-tooltip="How similar the replacement's Base Stat Total must be to the original. Low = ±33%, Medium = ±66%, High = any."
                        >?</span>
                    </legend>
                    <div class="nz-modal-radio-group">
                        <label class="nz-modal-radio">
                            <input
                                type="radio"
                                name="nz-rand-bst"
                                value="low"
                                checked={settings.bstVariance === 'low'}
                                onChange={() => onSetBst('low')}
                            />
                            Low (±33%)
                        </label>
                        <label class="nz-modal-radio">
                            <input
                                type="radio"
                                name="nz-rand-bst"
                                value="medium"
                                checked={settings.bstVariance === 'medium'}
                                onChange={() => onSetBst('medium')}
                            />
                            Medium (±66%)
                        </label>
                        <label class="nz-modal-radio">
                            <input
                                type="radio"
                                name="nz-rand-bst"
                                value="high"
                                checked={settings.bstVariance === 'high'}
                                onChange={() => onSetBst('high')}
                            />
                            High (any)
                        </label>
                    </div>
                </fieldset>

                <fieldset class="nz-modal-fieldset">
                    <legend class="nz-modal-legend">
                        Items
                        <span
                            class="nz-tooltip"
                            data-tooltip="Shuffles held items across segments so you get different items each run."
                        >?</span>
                    </legend>
                    <label class="nz-modal-toggle">
                        <input
                            type="checkbox"
                            checked={settings.randomizeItems}
                            onChange={(e: Event) => onSetItems((e.target as HTMLInputElement).checked)}
                        />
                        <span class="nz-modal-toggle-track" />
                        Randomize Items
                    </label>
                </fieldset>

                <div class="nz-modal-actions">
                    <button class="nz-btn nz-btn-secondary" onClick={onClose}>Cancel</button>
                    <button class="nz-btn nz-btn-randomizer" onClick={onConfirm}>Randomize</button>
                </div>
            </div>
        </div>
    );
}

export class FormatDropdown extends preact.Component<{
    selectType?: SelectType, format?: string, defaultFormat?: string, placeholder?: string,
    onChange?: JSX.EventHandler<Event>,
}> {
    declare base?: HTMLButtonElement;
    format = '';
    change = (e: Event) => {
        if (!this.base) return;
        this.format = this.base.value;
        this.forceUpdate();
        if (this.props.onChange) this.props.onChange(e);
    };
    render() {
        this.format = this.props.format || this.format || this.props.defaultFormat || '';
        let [formatName, customRules] = this.format.split('@@@');
        if (window.BattleLog) formatName = BattleLog.formatName(formatName);
        if (this.props.format && !this.props.onChange) {
            // There's intentionally no `disabled` prop. If this is out of sync
            // with the `format` and `onChange` props, that's a bug.
            return <button
                name="format" value={this.format} class="select formatselect preselected" disabled
            >
                {formatName}
                {!!customRules && [<br />, <small>Custom rules: {customRules}</small>]}
            </button>;
        }
        return <button
            name="format" value={this.format} data-selecttype={this.props.selectType}
            class="select formatselect" data-href="/formatdropdown" onChange={this.change}
        >
            {formatName || (!!this.props.placeholder && <em>{this.props.placeholder}</em>) || null}
            {!!customRules && [<br />, <small>Custom rules: {customRules}</small>]}
        </button>;
    }
}

class TeamDropdown extends preact.Component<{ format: string }> {
    teamFormat = '';
    teamKey = '';
    change = () => {
        if (!this.base) return;
        this.teamKey = (this.base as HTMLButtonElement).value;
        this.forceUpdate();
    };
    getDefaultTeam(teambuilderFormat: string) {
        for (const team of PS.teams.list) {
            if (team.format === teambuilderFormat) return team.key;
        }
        return '';
    }
    render() {
        const teamFormat = PS.teams.teambuilderFormat(this.props.format);
        const formatData = window.BattleFormats?.[teamFormat];
        if (formatData?.team) {
            return <button class="select teamselect preselected" name="team" value="random" disabled>
                <div class="team">
                    <strong>Random team</strong>
                    <small>
                        <PSIcon pokemon={null} />
                        <PSIcon pokemon={null} />
                        <PSIcon pokemon={null} />
                        <PSIcon pokemon={null} />
                        <PSIcon pokemon={null} />
                        <PSIcon pokemon={null} />
                    </small>
                </div>
            </button>;
        }
        if (teamFormat !== this.teamFormat) {
            this.teamFormat = teamFormat;
            this.teamKey = this.getDefaultTeam(teamFormat);
        }
        const team = PS.teams.byKey[this.teamKey] || null;
        return <button
            name="team" value={this.teamKey}
            class="select teamselect" data-href="/teamdropdown" data-format={teamFormat} onChange={this.change}
        >
            {PS.roomTypes['teamdropdown'] && <TeamBox team={team} noLink />}
        </button>;
    }
}

export class TeamForm extends preact.Component<{
    children: preact.ComponentChildren,
    class?: string, format?: string, teamFormat?: string, hideFormat?: boolean, selectType?: SelectType,
    defaultFormat?: string,
    onSubmit: ((e: Event, format: string, team?: Team) => void) | null,
    onValidate?: ((e: Event, format: string, team?: Team) => void) | null,
}> {
    format = '';
    teraPreview = false;
    bestOf = false;
    changeFormat = (ev: Event) => {
        this.format = (ev.target as HTMLButtonElement).value;
    };
    submit = (ev: Event, validate?: 'validate') => {
        ev.preventDefault();
        let format = this.format;
        // in tournaments, format is the custom name & teamFormat is the original format.
        const teambuilderFormat = this.props.teamFormat || PS.teams.teambuilderFormat(format);
        const teamElement = this.base!.querySelector<HTMLButtonElement>('button[name=team]');
        const teamKey = teamElement!.value;
        const team = teamKey ? PS.teams.byKey[teamKey] : undefined;
        if (!window.BattleFormats[teambuilderFormat]?.team && !team) {
            PS.alert('You need to go into the Teambuilder and build a team for this format.', {
                parentElem: teamElement!,
            });
            return;
        }
        if (this.teraPreview) {
            const hasCustomRules = format.includes('@@@');
            format = `${format}${hasCustomRules ? ', Tera Type Preview' : '@@@ Tera Type Preview'}`;
        }
        if (this.bestOf) {
            const hasCustomRules = format.includes('@@@');
            const value = this.base?.querySelector<HTMLInputElement>('input[name=bestofvalue]')?.value;
            format = `${format}${hasCustomRules ? `, Best of = ${value!}` : `@@@ Best of = ${value!}`}`;
        }
        PS.teams.loadTeam(team).then(() => {
            (validate === 'validate' ? this.props.onValidate : this.props.onSubmit)?.(ev, format, team);
        });
    };
    toggleCustomRule = (ev: Event) => {
        const checked = (ev.target as HTMLInputElement)?.checked;
        const rule = (ev.target as HTMLInputElement)?.name;
        if (rule === 'terapreview') this.teraPreview = checked;
        if (rule === 'bestof') this.bestOf = checked;
    };
    handleClick = (ev: Event) => {
        let target = ev.target as HTMLButtonElement | null;
        while (target && target !== this.base) {
            if (target.tagName === 'BUTTON' && target.name === 'validate') {
                this.submit(ev, 'validate');
                return;
            }
            target = target.parentNode as HTMLButtonElement | null;
        }
    };
    render() {
        const formatId = toID(this.format.split('@@@')[0]);
        if (window.BattleFormats) {
            this.format ||= this.props.defaultFormat || '';
            if (!this.format) {
                this.format = `gen${Dex.gen}randombattle`;

                const starredPrefs = PS.prefs.starredformats || {};
                // .reverse() because the newest starred format should be the default one
                const starred = Object.keys(starredPrefs).filter(id => starredPrefs[id] === true).reverse();
                for (let id of starred) {
                    let format = window.BattleFormats[id];
                    if (!format) continue;
                    if (this.props.selectType === 'challenge' && format?.challengeShow === false) continue;
                    if (this.props.selectType === 'search' && format?.searchShow === false) continue;
                    if (this.props.selectType === 'teambuilder' && format?.team) continue;
                    this.format = id;
                    break;
                }
            }
        }
        if (this.props.defaultFormat?.startsWith('!!')) {
            // The !! means that it overrides any current format, and will only be
            // sent as a prop once
            this.format = this.props.defaultFormat.slice(2);
        }
        if (this.props.format) this.format = this.props.format;
        return <form class={this.props.class} onSubmit={this.submit} onClick={this.handleClick}>
            {!this.props.hideFormat && <p>
                <label class="label">
                    Format:<br />
                    <FormatDropdown
                        selectType={this.props.selectType} format={this.format}
                        onChange={this.props.format ? undefined : this.changeFormat}
                    />
                </label>
            </p>}
            <p>
                <label class="label">
                    Team:<br />
                    <TeamDropdown format={this.props.teamFormat || this.format} />
                </label>
            </p>
            {this.props.selectType === 'challenge' &&
                window.BattleFormats[formatId]?.teraPreviewDefault && <p>
                <label class="checkbox">
                    <input type="checkbox" name="terapreview" onChange={this.toggleCustomRule} />
                    <abbr title="Start a battle with Tera Type Preview">Tera Type Preview</abbr></label></p>}
            {this.props.selectType === 'challenge' &&
                window.BattleFormats[formatId]?.bestOfDefault && <p>
                <label class="checkbox"><input type="checkbox" name="bestof" onChange={this.toggleCustomRule} />
                    <abbr title="Start a team-locked best-of-n series">
                        Best-of-<input
                            name="bestofvalue" type="number" min="3" max="9" step="2" value="3" style="width: 28px; vertical-align: initial;"
                        />
                    </abbr></label></p>}
            <p>{this.props.children}</p>
        </form>;
    }
}

PS.addRoomType(NewsPanel, MainMenuPanel);
