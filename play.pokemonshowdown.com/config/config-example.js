/** @type {import('../play.pokemonshowdown.com/src/client-main').PSConfig} */
var Config = Config || {};

/* version */ Config.version = "0";

Config.bannedHosts = ['cool.jit.su', 'pokeball-nixonserver.rhcloud.com'];

Config.whitelist = [
	'wikipedia.org'
];

// Where to find the game server. For local dev, use localhost and the port
// from pokemon-showdown/config/config.js (default 8000).
// For production, set host to your public domain and port to 80 or 443.
Config.defaultserver = {
	id: 'nuzlocke',
	host: 'localhost',
	port: 8000,
	httpport: 8000,
	registered: false
};

Config.testclient = true;
Config.server = Config.defaultserver;

Config.roomsFirstOpenScript = function () {
};

Config.customcolors = {
	'zarel': 'aeo'
};
/*** Begin automatically generated configuration ***/
Config.version = "0.11.2 (2290995c)";

Config.routes = {
	root: 'pokemonshowdown.com',
	client: 'play.pokemonshowdown.com',
	dex: 'dex.pokemonshowdown.com',
	replays: 'replay.pokemonshowdown.com',
	users: 'pokemonshowdown.com/users',
	teams: 'teams.pokemonshowdown.com',
};
/*** End automatically generated configuration ***/
