"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}






















function hasZonePrereq(zone,tmMoves,items,ownedSpecies,completedBattles){
var prereq=zone.requires;
if(!prereq)return true;
if(prereq.type==='hm'||prereq.type==='move')return tmMoves.includes(prereq.name);
if(prereq.type==='pokemon')return ownedSpecies.includes(toID(prereq.name));
if(prereq.type==='battle')return completedBattles.includes(prereq.name);
return items.includes(prereq.name);
}


function prereqLabel(zone){var _zone$requires;
if(((_zone$requires=zone.requires)==null?void 0:_zone$requires.type)==='pokemon')return"own "+zone.requires.name;
var prereq=zone.requires;
return prereq?prereq.name:null;
}

function calcIvScore(ivs,baseStats){
var keys=['hp','atk','def','spa','spd','spe'];
var weighted=0;
var maxWeighted=0;for(var _i2=0;_i2<
keys.length;_i2++){var _baseStats$key,_baseStats$key2;var key=keys[_i2];
weighted+=ivs[key]*((_baseStats$key=baseStats[key])!=null?_baseStats$key:0);
maxWeighted+=31*((_baseStats$key2=baseStats[key])!=null?_baseStats$key2:0);
}
return maxWeighted>0?weighted/maxWeighted:0;
}

function calcNatureQuality(
nature,
baseStats)
{var _baseStats$plus,_baseStats$minus;
var plus=nature.plus;
var minus=nature.minus;
if(!plus||!minus)return'neutral';
var boostBase=(_baseStats$plus=baseStats[plus])!=null?_baseStats$plus:0;
var penaltyBase=(_baseStats$minus=baseStats[minus])!=null?_baseStats$minus:0;
if(boostBase>=penaltyBase)return'good';
return'bad';
}


function normalCDF(z){
if(z<-8)return 0;
if(z>8)return 1;
var t=1/(1+0.2316419*Math.abs(z));
var poly=t*(0.319381530+t*(-0.356563782+t*(1.781477937+t*(-1.821255978+t*1.330274429))));
var pdf=Math.exp(-0.5*z*z)/2.5066282746;
var p=1-pdf*poly;
return z>=0?p:1-p;
}



function calcCombinedPercentile(
ivScore,
natureQuality,
baseStats)
{
var keys=['hp','atk','def','spa','spd','spe'];
var weights=keys.map(function(k){var _baseStats$k;return(_baseStats$k=baseStats[k])!=null?_baseStats$k:0;});
var sumW=weights.reduce(function(a,b){return a+b;},0);
if(sumW===0)return null;


var varIvNorm=1023/(12*31*31);
var sumW2=weights.reduce(function(s,w){return s+w*w;},0);
var stdDev=Math.sqrt(varIvNorm*sumW2)/sumW;

var pIv=1-normalCDF((ivScore-0.5)/stdDev);


var goodNatures=0;for(var _i4=0,_Object$values2=
Object.values(BattleNatures);_i4<_Object$values2.length;_i4++){var _baseStats$n$plus,_baseStats$n$minus;var nat=_Object$values2[_i4];
var n=nat;
if(!n.plus||!n.minus)continue;
if(((_baseStats$n$plus=baseStats[n.plus])!=null?_baseStats$n$plus:0)>=((_baseStats$n$minus=baseStats[n.minus])!=null?_baseStats$n$minus:0))goodNatures++;
}

var pNature=natureQuality==='good'?goodNatures/25:
natureQuality==='neutral'?(goodNatures+5)/25:
1;

return pIv*pNature;
}

function formatTopPct(p){
var pct=p*100;
return pct<1?pct.toFixed(1)+"%":Math.round(pct)+"%";
}

function getEvoRoot(speciesName,generation){
var dex=generation?Dex.forGen(generation):Dex;
var species=dex.species.get(speciesName);
while(species.prevo){
species=dex.species.get(species.prevo);
}
return species.id;
}

function cls(){for(var _len=arguments.length,parts=new Array(_len),_key=0;_key<_len;_key++){parts[_key]=arguments[_key];}
return parts.filter(Boolean).join(' ');
}






function ZoneCardBase(_ref)















{var zone=_ref.zone,accessible=_ref.accessible,_ref$allDupes=_ref.allDupes,allDupes=_ref$allDupes===void 0?false:_ref$allDupes,_ref$resolvedElsewher=_ref.resolvedElsewhere,resolvedElsewhere=_ref$resolvedElsewher===void 0?false:_ref$resolvedElsewher,_ref$selectable=_ref.selectable,selectable=_ref$selectable===void 0?false:_ref$selectable,onClick=_ref.onClick,children=_ref.children;
var locked=!accessible;
var req=prereqLabel(zone);

return preact.h("div",{
"class":cls(
'nz-zone-card',
locked&&'nz-zone-card-locked',
(allDupes||resolvedElsewhere)&&'nz-zone-card-dupe',
selectable&&'nz-zone-card-selectable'
),
onClick:onClick},

preact.h("div",{"class":"nz-zone-label"},
preact.h("span",{"class":"nz-zone-method"},zone.method),
zone.zone?zone.zone:undefined,
req&&preact.h("span",{"class":"nz-zone-prereq-label"},"Requires ",req)
),
children
);
}







function StandardZoneCard(_ref2)













{var zone=_ref2.zone,routeName=_ref2.routeName,zoneIndex=_ref2.zoneIndex,accessible=_ref2.accessible,ownedRoots=_ref2.ownedRoots,caughtSpecies=_ref2.caughtSpecies;
var resolved=caughtSpecies!==undefined;
var allDupes=accessible&&!resolved&&zone.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));});
var dupeSet=new Set(
zone.pokemon.
filter(function(e){return ownedRoots.has(getEvoRoot(e.species))&&!(resolved&&toID(e.species)===toID(caughtSpecies!=null?caughtSpecies:''));}).
map(function(e){return toID(e.species);})
);
var totalRate=zone.pokemon.reduce(function(sum,e){return sum+e.rate;},0);
var activeTotal=zone.pokemon.filter(function(e){return!dupeSet.has(toID(e.species));}).reduce(function(sum,e){return sum+e.rate;},0);
var clickable=accessible&&!resolved&&!allDupes;

return preact.h(ZoneCardBase,{
zone:zone,
accessible:accessible,
allDupes:allDupes,
selectable:clickable,
onClick:clickable?function(){return PS.send("/nuzlocke encounter "+routeName+" "+zoneIndex);}:undefined},

preact.h("div",{"class":"nz-route-pool"},
[].concat(zone.pokemon).sort(function(a,b){return b.rate-a.rate;}).map(function(e){
var dupe=accessible&&dupeSet.has(toID(e.species));
var isCaught=resolved&&toID(e.species)===toID(caughtSpecies);
var pct=!accessible?Math.round(e.rate/(totalRate||1)*100):
dupe||activeTotal===0?0:Math.round(e.rate/activeTotal*100);
return preact.h("div",{key:e.species,"class":cls(
'nz-encounter-slot',
dupe&&'nz-encounter-slot-dupe',
resolved&&!isCaught&&'nz-encounter-slot-dimmed',
isCaught&&'nz-encounter-slot-caught'
)},
preact.h(NzSprite,{species:e.species,"class":cls(
'nz-encounter-slot-sprite',
dupe&&'nz-encounter-slot-sprite-dupe',
resolved&&!isCaught&&'nz-encounter-slot-sprite-dimmed',
isCaught&&'nz-encounter-slot-sprite-caught'
)}),
preact.h("div",{"class":"nz-encounter-rate-bar"},
preact.h("div",{"class":"nz-encounter-rate-fill",style:"width:"+pct+"%"})
),
preact.h("div",{"class":"nz-encounter-rate-label"},dupe?'dupe':pct+"%")
);
})
)
);
}






function GiftZoneCard(_ref3)













{var zone=_ref3.zone,routeName=_ref3.routeName,zoneIndex=_ref3.zoneIndex,accessible=_ref3.accessible,ownedRoots=_ref3.ownedRoots,caughtSpecies=_ref3.caughtSpecies;
var resolvedElsewhere=caughtSpecies==='';
var caughtHere=caughtSpecies!==undefined&&caughtSpecies!=='';
var resolved=caughtSpecies!==undefined;
var allDupes=accessible&&!resolved&&zone.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));});
var isMulti=zone.pokemon.length>1;

return preact.h(ZoneCardBase,{
zone:zone,
accessible:accessible,
allDupes:allDupes,
resolvedElsewhere:resolvedElsewhere},

preact.h("div",{"class":"nz-gift-zone-options"},
zone.pokemon.map(function(e){
var isCaught=caughtHere&&toID(e.species)===toID(caughtSpecies);
var isDupe=accessible&&!isCaught&&ownedRoots.has(getEvoRoot(e.species));
var clickable=accessible&&!resolvedElsewhere&&!caughtHere&&!isDupe;
var dimmed=caughtHere&&!isCaught||resolvedElsewhere;
var sendCmd=isMulti?
function(){return PS.send("/nuzlocke encounterchoice "+routeName+" "+zoneIndex+" "+toID(e.species));}:
function(){return PS.send("/nuzlocke encounter "+routeName+" "+zoneIndex);};
return preact.h("div",{
key:e.species,
"class":cls(
'nz-gift-zone-option',
isDupe&&'nz-gift-zone-option-dupe',
isCaught&&'nz-gift-zone-option-caught',
dimmed&&!isDupe&&'nz-gift-zone-option-dimmed',
clickable&&'nz-gift-zone-option-selectable'
),
onClick:clickable?sendCmd:undefined},

preact.h(NzSprite,{species:e.species,"class":cls(
'nz-gift-zone-sprite',
isDupe&&'nz-gift-zone-sprite-dupe',
isCaught&&'nz-gift-zone-sprite-caught',
dimmed&&!isDupe&&'nz-gift-zone-sprite-dimmed'
)})
);
})
)
);
}






function TradeZoneCard(_ref4)













{var _zone$requires2;var zone=_ref4.zone,routeName=_ref4.routeName,zoneIndex=_ref4.zoneIndex,accessible=_ref4.accessible,ownedRoots=_ref4.ownedRoots,caughtSpecies=_ref4.caughtSpecies;
var newPokemon=zone.pokemon[0];
var requiredName=((_zone$requires2=zone.requires)==null?void 0:_zone$requires2.type)==='pokemon'?zone.requires.name:null;
var resolved=caughtSpecies!==undefined;
var caughtHere=resolved&&caughtSpecies!=='';
var resolvedElsewhere=caughtSpecies==='';
var isDupe=accessible&&!resolved&&!!newPokemon&&ownedRoots.has(getEvoRoot(newPokemon.species));
var clickable=accessible&&!resolved&&!isDupe;

return preact.h(ZoneCardBase,{
zone:zone,
accessible:accessible||resolved,
allDupes:isDupe,
resolvedElsewhere:resolvedElsewhere,
selectable:clickable,
onClick:clickable?function(){return PS.send("/nuzlocke encounter "+routeName+" "+zoneIndex);}:undefined},

preact.h("div",{"class":"nz-trade-zone-row"},
requiredName&&preact.h(preact.Fragment,null,
preact.h("div",{"class":cls('nz-trade-zone-pokemon',caughtHere&&'nz-trade-zone-pokemon-traded')},
preact.h(NzSprite,{species:requiredName,"class":cls('nz-trade-zone-sprite',caughtHere&&'nz-trade-zone-sprite-traded')})
),
preact.h("div",{"class":"nz-trade-zone-arrow"},"\u2192")
),
newPokemon&&
preact.h("div",{"class":cls('nz-trade-zone-pokemon',caughtHere&&'nz-trade-zone-pokemon-received')},
preact.h(NzSprite,{species:newPokemon.species,"class":cls('nz-trade-zone-sprite',caughtHere&&'nz-trade-zone-sprite-received')})
)

)
);
}

















function RouteListItem(_ref5)

{var enc=_ref5.enc,isSelected=_ref5.isSelected,isResolved=_ref5.isResolved,isDeferred=_ref5.isDeferred,statusSymbol=_ref5.statusSymbol,sprites=_ref5.sprites,onSelect=_ref5.onSelect,chevron=_ref5.chevron;
return preact.h("div",{
"class":cls(
'nz-route-list-row',
isSelected&&'selected',
isResolved&&'resolved'
),
onClick:onSelect},

preact.h("div",{"class":"nz-route-list-row-top"},
preact.h("span",{"class":cls(
'nz-route-list-status',
isDeferred&&'nz-route-status-deferred'
)},
statusSymbol
),
preact.h("span",{"class":"nz-route-list-name"},enc.route),
isDeferred&&preact.h("span",{"class":"nz-route-deferred-badge"},"Deferred"),
chevron&&preact.h("span",{"class":cls('nz-route-list-chevron',isSelected&&'nz-route-list-chevron-open')},"\u25BE")
),
sprites.length>0&&
preact.h("div",{"class":"nz-route-list-sprites"},
preact.h("div",{"class":"nz-route-sprite-group"},
sprites.map(function(_ref6){var species=_ref6.species,isDupe=_ref6.isDupe,isCaught=_ref6.isCaught;return(
preact.h(NzSprite,{
key:toID(species),
species:species,
"class":cls(
'nz-route-sprite',
isDupe&&!isCaught&&'nz-route-sprite-dupe',
isCaught&&'nz-route-sprite-caught'
),
size:40}
));}
)
)
)

);
}






function GiftChoicePicker(_ref7)









{var gift=_ref7.gift,giftIndex=_ref7.giftIndex,ownedRoots=_ref7.ownedRoots,generation=_ref7.generation;
var allPokemon=gift.zones.flatMap(function(z){return z.pokemon;});

return preact.h("div",{"class":"nz-zone-card"},
preact.h("div",{"class":"nz-zone-label"},gift.route),
preact.h("div",{"class":"nz-gift-zone-options"},
allPokemon.map(function(e){
var isDupe=ownedRoots.has(getEvoRoot(e.species,generation));
return preact.h("div",{
key:e.species,
"class":cls('nz-gift-zone-option','nz-gift-zone-option-selectable',isDupe&&'nz-gift-zone-option-dupe'),
onClick:function(){return PS.send("/nuzlocke choosegift "+giftIndex+" "+toID(e.species));}},

preact.h(NzSprite,{species:e.species,"class":cls('nz-gift-zone-sprite',isDupe&&'nz-gift-zone-sprite-dupe')})
);
})
)
);
}var






EncounterPokemonStats=function(_preact$Component){function EncounterPokemonStats(){var _this;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.





state={editing:false};_this.
startEdit=function(){PSView.setTextboxFocused(true);_this.setState({editing:true});};_this.
stopEdit=function(){PSView.setTextboxFocused(false);_this.setState({editing:false});};return _this;}_inheritsLoose(EncounterPokemonStats,_preact$Component);var _proto=EncounterPokemonStats.prototype;_proto.

render=function render(){var _BattleNatures;
var _this$props=this.props,pokemon=_this$props.pokemon,generation=_this$props.generation,nickname=_this$props.nickname,onNickChange=_this$props.onNickChange;
var editing=this.state.editing;
var dex=Dex.forGen(generation);

if(!pokemon){
return preact.h("div",{"class":"nz-encounter-stats"},
preact.h("div",{"class":"nz-detail-empty",style:"margin:auto"},"No pokemon caught yet")
);
}

var sp=dex.species.get(pokemon.species);
var nature=(_BattleNatures=BattleNatures[pokemon.nature])!=null?_BattleNatures:{};
var boostedStat=nature.plus;
var reducedStat=nature.minus;

var ivScore=calcIvScore(pokemon.ivs,sp.baseStats);
var ivPct=Math.round(ivScore*100);
var ivTier=ivPct>=62?'high':ivPct>=50?'mid':ivPct>=38?'low':'poor';
var ivLabel=ivTier==='high'?'Great':ivTier==='mid'?'Good':ivTier==='low'?'Fair':'Poor';
var natureQuality=calcNatureQuality(nature,sp.baseStats);
var combinedPct=calcCombinedPercentile(ivScore,natureQuality,sp.baseStats);
var topPercentile=combinedPct!==null&&combinedPct<=0.05?combinedPct:null;
var worsePercentile=combinedPct!==null&&combinedPct>=0.95?combinedPct:null;

return preact.h("div",{"class":"nz-encounter-stats"},

preact.h("div",{"class":"nz-encounter-stats-header"},
preact.h(NzSprite,{species:pokemon.species,"class":"nz-encounter-stats-sprite",size:60}),
preact.h("div",{"class":"nz-encounter-stats-identity"},
editing?
preact.h("input",{
"class":"nz-encounter-stats-nick-input",
type:"text",
value:nickname,
maxLength:12,
autofocus:true,
onInput:function(e){return onNickChange(pokemon.uid,e.target.value);},
onBlur:this.stopEdit}
):
preact.h("div",{"class":"nz-encounter-stats-nick nz-encounter-stats-nick-editable",onClick:this.startEdit},
nickname
),

nickname!==pokemon.species&&
preact.h("div",{"class":"nz-encounter-stats-species"},pokemon.species),

preact.h("div",{"class":"nz-encounter-stats-types"},preact.h(NzTypeBadges,{species:pokemon.species,generation:generation})),
preact.h("div",{"class":"nz-encounter-stats-meta"},"Lv.",
pokemon.level," \xB7 ",pokemon.caughtRoute
)
)
),


preact.h("div",{"class":"nz-encounter-stats-attrs"},
preact.h("div",{"class":"nz-encounter-stats-attr"},
preact.h("span",{"class":"nz-encounter-stats-attr-label"},"Nature"),
preact.h("div",{"class":"nz-encounter-stats-attr-value-row"},
preact.h("span",{"class":"nz-encounter-stats-attr-value"},pokemon.nature),
natureQuality!=='neutral'&&
preact.h("span",{"class":"nz-nature-quality nz-nature-quality-"+natureQuality},
natureQuality
)

),
boostedStat&&reducedStat&&
preact.h("span",{"class":"nz-encounter-stats-attr-desc"},"+",
boostedStat.toUpperCase()," \u2212",reducedStat.toUpperCase()
)

),
preact.h("div",{"class":"nz-encounter-stats-attr"},
preact.h("span",{"class":"nz-encounter-stats-attr-label"},"Ability"),
preact.h("span",{"class":"nz-encounter-stats-attr-value"},pokemon.ability),
function(){
var desc=dex.abilities.get(pokemon.ability).shortDesc;
return desc?preact.h("span",{"class":"nz-encounter-stats-attr-desc"},desc):null;
}()
)
),

preact.h(NzStatPair,{
species:pokemon.species,
nature:pokemon.nature,
generation:generation,
ivs:pokemon.ivs,
ivsExtra:preact.h("span",{"class":"nz-iv-score nz-iv-score-"+ivTier},ivLabel)}
),
topPercentile!==null&&
preact.h("div",{"class":"nz-encounter-top-callout"},"This ",
pokemon.species," is in the top ",formatTopPct(topPercentile)," of ",pokemon.species,"s!"
),

worsePercentile!==null&&
preact.h("div",{"class":"nz-encounter-bad-callout"},"This ",
pokemon.species," is worse than ",formatTopPct(worsePercentile)," of ",pokemon.species,"s!"
)

);
};return EncounterPokemonStats;}(preact.Component);var


















EncountersScreen=function(_preact$Component2){function EncountersScreen(){var _this2;for(var _len3=arguments.length,args=new Array(_len3),_key3=0;_key3<_len3;_key3++){args[_key3]=arguments[_key3];}_this2=_preact$Component2.call.apply(_preact$Component2,[this].concat(args))||this;_this2.
state={
selectedRoute:null,
mobileExpandedRoute:null,
mobileAutoExpanded:false,
nicknames:{},
deferredThisSession:new Set(),
lastSegmentIndex:-1,
showTutorial:false,
statsExpanded:false
};_this2.









dismissEncountersTutorial=function(){
try{var _localStorage$getItem;
var key='nuzlocke_tutorial';
var seen=JSON.parse((_localStorage$getItem=localStorage.getItem(key))!=null?_localStorage$getItem:'{}');
seen.encounters=true;
localStorage.setItem(key,JSON.stringify(seen));
}catch(_unused){}
_this2.setState({showTutorial:false});
};_this2.







































































selectRoute=function(routeName){
_this2.setState({selectedRoute:routeName});
};_this2.

toggleRouteMobile=function(routeName){
_this2.setState(function(s){
var collapsing=s.mobileExpandedRoute===routeName;
return{

selectedRoute:collapsing?s.selectedRoute:routeName,

mobileExpandedRoute:collapsing?null:routeName,
statsExpanded:false
};
});
};_this2.

toggleStats=function(){
_this2.setState(function(s){return{statsExpanded:!s.statsExpanded};});
};_this2.

setNick=function(uid,value){
_this2.setState(function(s){var _Object$assign;return{nicknames:Object.assign({},s.nicknames,(_Object$assign={},_Object$assign[uid]=value,_Object$assign))};});
};_this2.

handleDefer=function(routeName){
PS.send("/nuzlocke defer "+routeName);
_this2.setState(function(s){
var next=new Set(s.deferredThisSession);
next.add(routeName);
return{deferredThisSession:next};
});
};_this2.

submit=function(){
var game=_this2.props.game;
var parts=game.box.
map(function(p){var _this2$state$nickname;return p.uid+" "+((_this2$state$nickname=_this2.state.nicknames[p.uid])!=null?_this2$state$nickname:p.nickname).replace(/\s+/g,'_');}).
join(' ');
PS.send("/nuzlocke setnicks "+parts);
};return _this2;}_inheritsLoose(EncountersScreen,_preact$Component2);var _proto2=EncountersScreen.prototype;_proto2.componentDidMount=function componentDidMount(){try{var _localStorage$getItem2;var key='nuzlocke_tutorial';var seen=JSON.parse((_localStorage$getItem2=localStorage.getItem(key))!=null?_localStorage$getItem2:'{}');if(!seen.encounters)this.setState({showTutorial:true});}catch(_unused2){}};EncountersScreen.getDerivedStateFromProps=function getDerivedStateFromProps(props,state){var segment=props.game.segment;if(!segment)return null;var updates={};var segIdx=props.game.currentSegmentIndex;if(segIdx!==state.lastSegmentIndex){updates.lastSegmentIndex=segIdx;updates.deferredThisSession=new Set();updates.selectedRoute=null;updates.mobileExpandedRoute=null;updates.mobileAutoExpanded=false;}var nicknames=Object.assign({},state.nicknames);var nicksChanged=false;props.game.box.forEach(function(p){if(!(p.uid in nicknames)){nicknames[p.uid]=p.nickname;nicksChanged=true;}});if(nicksChanged)updates.nicknames=nicknames;var currentSelected=updates.selectedRoute!==undefined?updates.selectedRoute:state.selectedRoute;if(!currentSelected){var _segment$encounters,_segment$encounters2,_props$game$deferredR,_props$game$lockedRou,_pending$route,_ref8,_find$route,_find,_segment$gifts,_allDisplayed$find;var ownedRoots=new Set([].concat(props.game.box.map(function(p){return getEvoRoot(p.species);}),props.game.graveyard.map(function(p){return getEvoRoot(p.species);})));var tmMoves=props.game.tmMoves;var items=props.game.items;var currentRouteNames=new Set(((_segment$encounters=segment.encounters)!=null?_segment$encounters:[]).map(function(e){return e.route;}));var allDisplayed=[].concat((_segment$encounters2=segment.encounters)!=null?_segment$encounters2:[],((_props$game$deferredR=props.game.deferredRoutes)!=null?_props$game$deferredR:[]).filter(function(r){return!currentRouteNames.has(r.route);}),((_props$game$lockedRou=props.game.lockedRoutes)!=null?_props$game$lockedRou:[]).filter(function(r){return!currentRouteNames.has(r.route);}));var pending=allDisplayed.find(function(enc){return!props.game.resolvedRoutes.includes(enc.route)&&enc.zones.some(function(z){return hasZonePrereq(z,tmMoves,items,props.game.box.map(function(p){return toID(p.species);}),props.game.completedBattles)&&z.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species));});});});var autoSelected=(_pending$route=pending==null?void 0:pending.route)!=null?_pending$route:null;var fallback=!autoSelected?(_ref8=(_find$route=(_find=((_segment$gifts=segment.gifts)!=null?_segment$gifts:[]).find(function(g){return g.choice&&!props.game.resolvedRoutes.includes(g.route);}))==null?void 0:_find.route)!=null?_find$route:(_allDisplayed$find=allDisplayed.find(function(enc){return enc.zones.some(function(z){return hasZonePrereq(z,tmMoves,items,props.game.box.map(function(p){return toID(p.species);}),props.game.completedBattles);});}))==null?void 0:_allDisplayed$find.route)!=null?_ref8:null:autoSelected;if(fallback!==currentSelected)updates.selectedRoute=fallback;if(!state.mobileAutoExpanded&&fallback){updates.mobileExpandedRoute=fallback;updates.mobileAutoExpanded=true;}}return Object.keys(updates).length>0?updates:null;};_proto2.

render=function render(){var _segment$encounters3,_segment$gifts2,_game$deferredRoutes,_game$lockedRoutes,_this3=this,_game$box$find,_allGifts$find,_game$lockedRoutes2,_nicknames$mobileDisp;
var game=this.props.game;
var _this$state=this.state,nicknames=_this$state.nicknames,selectedRoute=_this$state.selectedRoute,mobileExpandedRoute=_this$state.mobileExpandedRoute,deferredThisSession=_this$state.deferredThisSession;
var segment=game.segment;

var ownedRoots=new Set([].concat(
game.box.map(function(p){return getEvoRoot(p.species,game.generation);}),
game.graveyard.map(function(p){return getEvoRoot(p.species,game.generation);}))
);

var encounters=(_segment$encounters3=segment.encounters)!=null?_segment$encounters3:[];
var allGifts=(_segment$gifts2=segment.gifts)!=null?_segment$gifts2:[];
var giftRouteNames=new Set(allGifts.map(function(r){return r.route;}));



var currentRouteNames=new Set(encounters.map(function(e){return e.route;}));
var extraDeferred=((_game$deferredRoutes=game.deferredRoutes)!=null?_game$deferredRoutes:[]).filter(function(r){return!currentRouteNames.has(r.route);});
var extraLocked=((_game$lockedRoutes=game.lockedRoutes)!=null?_game$lockedRoutes:[]).filter(
function(r){return!currentRouteNames.has(r.route)&&!extraDeferred.some(function(d){return d.route===r.route;});}
);
var allDisplayedRoutes=[].concat(encounters,allGifts,extraDeferred,extraLocked);




var encZones=allDisplayedRoutes.map(function(enc){return(
enc.zones.map(function(zone,i){return{
zone:zone,
originalIndex:i,
accessible:hasZonePrereq(zone,game.tmMoves,game.items,game.box.map(function(p){return toID(p.species);}),game.completedBattles)
};}));}
);
var encAccessibleZones=encZones.map(function(zones){return zones.filter(function(z){return z.accessible;});});




var pendingRoutes=allDisplayedRoutes.filter(function(enc,i){
if(giftRouteNames.has(enc.route)){
return enc.choice&&!game.resolvedRoutes.includes(enc.route);
}
return(
!game.resolvedRoutes.includes(enc.route)&&
!deferredThisSession.has(enc.route)&&
encAccessibleZones[i].some(function(_ref9){var zone=_ref9.zone;return(
zone.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species,game.generation));}));}
));

});
var canTeambuilding=pendingRoutes.length===0;

var currentPendingIdx=pendingRoutes.findIndex(function(r){return r.route===selectedRoute;});
var nextPendingRoute=pendingRoutes.length>0?
pendingRoutes[(currentPendingIdx>=0?currentPendingIdx+1:0)%pendingRoutes.length]:
null;
var goToNextUnresolved=nextPendingRoute?
function(){return _this3.selectRoute(nextPendingRoute.route);}:
undefined;


var selectedEncIdx=allDisplayedRoutes.findIndex(function(enc){return enc.route===selectedRoute;});
var selectedEnc=selectedEncIdx>=0?allDisplayedRoutes[selectedEncIdx]:null;
var selectedCaught=selectedRoute?(_game$box$find=
game.box.find(function(p){return p.caughtRoute===selectedRoute;}))!=null?_game$box$find:null:
null;
var selectedGiftDef=selectedRoute?(_allGifts$find=allGifts.find(function(g){return g.route===selectedRoute;}))!=null?_allGifts$find:null:null;
var selectedChoiceGift=selectedGiftDef!=null&&selectedGiftDef.choice&&!game.resolvedRoutes.includes(selectedRoute)?
selectedGiftDef:
null;

var isResolved=selectedRoute?game.resolvedRoutes.includes(selectedRoute):false;
var isSelectedGift=selectedRoute?giftRouteNames.has(selectedRoute):false;
var selectedAllZones=selectedEncIdx>=0?encZones[selectedEncIdx]:[];
var selectedAccessibleZones=selectedEncIdx>=0?encAccessibleZones[selectedEncIdx]:[];


var selIsServerLocked=selectedEnc?((_game$lockedRoutes2=game.lockedRoutes)!=null?_game$lockedRoutes2:[]).some(function(r){return r.route===selectedEnc.route;}):false;
var selAccessibleHasNonDupe=selectedAccessibleZones.some(function(_ref10){var zone=_ref10.zone;return(
zone.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species,game.generation));}));}
);
var selLockedHasNonDupe=selectedAllZones.some(function(_ref11){var zone=_ref11.zone,accessible=_ref11.accessible;return(
!accessible&&zone.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species,game.generation));}));}
);
var selIsAllLocked=selIsServerLocked||!isResolved&&!selAccessibleHasNonDupe&&selLockedHasNonDupe;
var selIsDeferred=selectedEnc?deferredThisSession.has(selectedEnc.route):false;
var showDefer=!!(selectedEnc&&!isResolved&&!selIsAllLocked&&!selIsDeferred&&!isSelectedGift);
var selDeferHint=function(){
var hint='Deferred — will re-appear next segment';
if(selIsAllLocked&&selectedAllZones.length>0){
var seen=new Set();for(var _i6=0;_i6<
selectedAllZones.length;_i6++){var _zone$requires3;var _ref12=selectedAllZones[_i6];var zone=_ref12.zone;var accessible=_ref12.accessible;
if(accessible)continue;
if(!zone.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species,game.generation));}))continue;
var name=(_zone$requires3=zone.requires)==null?void 0:_zone$requires3.name;
if(name)seen.add(name);
}
if(seen.size>0)hint+=" (missing: "+Array.from(seen).join(', ')+")";
}
return hint;
}();


var alive=game.box.filter(function(p){return p.alive;});
var mobileDisplayed=isResolved&&selectedCaught?selectedCaught:
alive.length>0?alive[alive.length-1]:null;
var mobileNick=mobileDisplayed?(_nicknames$mobileDisp=nicknames[mobileDisplayed.uid])!=null?_nicknames$mobileDisp:mobileDisplayed.nickname:'';
var mobileIvTier=function(){
if(!mobileDisplayed)return null;
var sp=Dex.forGen(game.generation).species.get(mobileDisplayed.species);
if(!(sp!=null&&sp.exists)||!mobileDisplayed.ivs)return null;
var ivPct=Math.round(calcIvScore(mobileDisplayed.ivs,sp.baseStats)*100);
return ivPct>=62?'high':ivPct>=50?'mid':ivPct>=38?'low':'poor';
}();
var mobileIvLabel=mobileIvTier==='high'?'Great':mobileIvTier==='mid'?'Good':mobileIvTier==='low'?'Fair':mobileIvTier==='poor'?'Poor':null;
var mobileNatQ=function(_BattleNatures2){
if(!mobileDisplayed)return null;
var sp=Dex.forGen(game.generation).species.get(mobileDisplayed.species);
if(!(sp!=null&&sp.exists))return null;
var nat=(_BattleNatures2=BattleNatures[mobileDisplayed.nature])!=null?_BattleNatures2:{};
return calcNatureQuality(nat,sp.baseStats);
}();


var renderZoneContent=function(){
if(!selectedEnc)return null;
return preact.h(preact.Fragment,null,
!isSelectedGift&&(selIsAllLocked||selIsDeferred)&&
preact.h("div",{"class":"nz-detail-deferred-hint"},selDeferHint),

preact.h("div",{"class":"nz-zone-cards"},
selectedAllZones.map(function(_ref13){var zone=_ref13.zone,originalIndex=_ref13.originalIndex,accessible=_ref13.accessible;
var caughtSpeciesForZone=!isResolved?undefined:
!selectedCaught?'':
selectedCaught.caughtZoneIndex===undefined||originalIndex===selectedCaught.caughtZoneIndex?
selectedCaught.species:'';
var zoneProps={
key:originalIndex,zone:zone,
routeName:selectedEnc.route,zoneIndex:originalIndex,
accessible:accessible,ownedRoots:ownedRoots,caughtSpecies:caughtSpeciesForZone
};
if(zone.method==='Trade')return preact.h(TradeZoneCard,zoneProps);
if(zone.method==='Gift')return preact.h(GiftZoneCard,zoneProps);
return preact.h(StandardZoneCard,zoneProps);
})
),
showDefer&&
preact.h("button",{"class":"nz-btn-defer",onClick:function(){return _this3.handleDefer(selectedEnc.route);}},"Defer to next segment"

)

);
};

return preact.h(NzScreen,null,
preact.h("div",{"class":"nz-encounters-layout"},

preact.h("div",{"class":"nz-route-list"},
preact.h("div",{"class":"nz-route-list-rows"},
allDisplayedRoutes.length>0&&preact.h("div",{"class":"nz-route-list-section-label"},"Routes"),
allDisplayedRoutes.map(function(enc,encIdx){
var accessibleZones=encAccessibleZones[encIdx];
var allZones=encZones[encIdx];
var isResolvedRow=game.resolvedRoutes.includes(enc.route);
var isGift=giftRouteNames.has(enc.route);
var isSelected=selectedRoute===enc.route;

var statusSymbol='';
var isDeferred=false;
var sprites;

if(isGift){
statusSymbol=isResolvedRow?'✓':'';
var resolvedGift=isResolvedRow?game.box.find(function(p){return p.caughtRoute===enc.route;}):undefined;
var giftPokemon=enc.zones.flatMap(function(z){return z.pokemon;});
sprites=resolvedGift?
[{species:resolvedGift.species,isDupe:false,isCaught:true}]:
giftPokemon.map(function(e){return{
species:e.species,
isDupe:ownedRoots.has(getEvoRoot(e.species,game.generation)),
isCaught:false
};});
}else{var _game$lockedRoutes3,_game$deferredRoutes2;
var isServerLocked=((_game$lockedRoutes3=game.lockedRoutes)!=null?_game$lockedRoutes3:[]).some(function(r){return r.route===enc.route;});
var accessibleHasNonDupe=accessibleZones.some(function(_ref14){var zone=_ref14.zone;return(
zone.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species,game.generation));}));}
);
var lockedHasNonDupe=allZones.some(function(_ref15){var zone=_ref15.zone,accessible=_ref15.accessible;return(
!accessible&&zone.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species,game.generation));}));}
);
var isAllLocked=isServerLocked||!isResolvedRow&&!accessibleHasNonDupe&&lockedHasNonDupe;
var isDeferredThisSession=deferredThisSession.has(enc.route);


var isPendingDeferred=!isResolvedRow&&!isDeferredThisSession&&!isServerLocked&&
((_game$deferredRoutes2=game.deferredRoutes)!=null?_game$deferredRoutes2:[]).some(function(r){return r.route===enc.route;});
var allDupes=!isResolvedRow&&!isAllLocked&&accessibleZones.length>0&&
accessibleZones.every(function(_ref16){var zone=_ref16.zone;return(
zone.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species,game.generation));}));}
);
isDeferred=isAllLocked||isDeferredThisSession||isPendingDeferred;

if(isResolvedRow)statusSymbol='✓';else
if(allDupes)statusSymbol='—';else
if(isDeferredThisSession||isAllLocked)statusSymbol='↩';

var caughtPokemon=isResolvedRow?game.box.find(function(p){return p.caughtRoute===enc.route;}):undefined;
var seenSids=new Set();
var allSpecies=[];for(var _i8=0;_i8<
accessibleZones.length;_i8++){var _ref17=accessibleZones[_i8];var zone=_ref17.zone;for(var _i10=0,_zone$pokemon2=
zone.pokemon;_i10<_zone$pokemon2.length;_i10++){var e=_zone$pokemon2[_i10];
var sid=toID(e.species);
if(!seenSids.has(sid)){seenSids.add(sid);allSpecies.push(e.species);}
}
}
sprites=allSpecies.map(function(species){return{
species:species,
isDupe:ownedRoots.has(getEvoRoot(species,game.generation)),
isCaught:caughtPokemon!==undefined&&toID(caughtPokemon.species)===toID(species)
};});
}

return preact.h(RouteListItem,{
key:enc.route,
enc:enc,
isSelected:isSelected,
isResolved:isResolvedRow,
isDeferred:isDeferred,
statusSymbol:statusSymbol,
sprites:sprites,
onSelect:function(){return _this3.selectRoute(enc.route);}}
);
})
),

preact.h("div",{"class":"nz-route-list-extras"},
segment.items.length>0&&preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-route-list-divider"},"Items"),
preact.h("div",{"class":"nz-items-list",style:"padding: 6px 8px"},
segment.items.map(function(item){return(
preact.h("span",{key:item,"class":"nz-item-chip"},item));}
)
)
),

segment.tmMoves.length>0&&preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-route-list-divider"},"TMs"),
preact.h("div",{"class":"nz-items-list",style:"padding: 6px 8px"},
segment.tmMoves.map(function(move){return(
preact.h("span",{key:move,"class":"nz-item-chip nz-tm-chip"},move));}
)
)
)
)
),


preact.h("div",{"class":"nz-encounter-detail"},
selectedChoiceGift&&preact.h(GiftChoicePicker,{
gift:selectedChoiceGift,
giftIndex:allGifts.indexOf(selectedChoiceGift),
ownedRoots:ownedRoots,
generation:game.generation}
),

!selectedChoiceGift&&renderZoneContent(),

!selectedRoute&&preact.h("div",{"class":"nz-detail-empty"},"Select a route to scout")
),


preact.h(EncounterPokemonStats,{
pokemon:mobileDisplayed,
generation:game.generation,
nickname:mobileNick,
onNickChange:this.setNick}
)
),

preact.h("div",{"class":"nz-tb-battle-footer"},
canTeambuilding?
preact.h(NzBtn,{onClick:this.submit},"Teambuilding"):
preact.h(NzBtn,{onClick:goToNextUnresolved},"Next (",pendingRoutes.length," left)")

),


preact.h("div",{"class":"nz-enc-mobile"},
preact.h("div",{"class":"nz-enc-mobile-content"},
preact.h("div",{"class":"nz-route-list-rows"},
allDisplayedRoutes.length>0&&preact.h("div",{"class":"nz-route-list-section-label"},"Routes"),
allDisplayedRoutes.map(function(enc,encIdx){
var accessibleZones=encAccessibleZones[encIdx];
var allZones=encZones[encIdx];
var isResolvedRow=game.resolvedRoutes.includes(enc.route);
var isGift=giftRouteNames.has(enc.route);
var isExpanded=mobileExpandedRoute===enc.route;

var statusSymbol='';
var isDeferred=false;
var sprites;

if(isGift){
statusSymbol=isResolvedRow?'✓':'';
var resolvedGift=isResolvedRow?game.box.find(function(p){return p.caughtRoute===enc.route;}):undefined;
var giftPokemon=enc.zones.flatMap(function(z){return z.pokemon;});
sprites=resolvedGift?
[{species:resolvedGift.species,isDupe:false,isCaught:true}]:
giftPokemon.map(function(e){return{
species:e.species,
isDupe:ownedRoots.has(getEvoRoot(e.species,game.generation)),
isCaught:false
};});
}else{var _game$lockedRoutes4,_game$deferredRoutes3;
var isServerLocked=((_game$lockedRoutes4=game.lockedRoutes)!=null?_game$lockedRoutes4:[]).some(function(r){return r.route===enc.route;});
var accessibleHasNonDupe=accessibleZones.some(function(_ref18){var zone=_ref18.zone;return(
zone.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species,game.generation));}));}
);
var lockedHasNonDupe=allZones.some(function(_ref19){var zone=_ref19.zone,accessible=_ref19.accessible;return(
!accessible&&zone.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species,game.generation));}));}
);
var isAllLocked=isServerLocked||!isResolvedRow&&!accessibleHasNonDupe&&lockedHasNonDupe;
var isDeferredSession=deferredThisSession.has(enc.route);
var isPendingDeferred=!isResolvedRow&&!isDeferredSession&&!isServerLocked&&
((_game$deferredRoutes3=game.deferredRoutes)!=null?_game$deferredRoutes3:[]).some(function(r){return r.route===enc.route;});
var allDupes=!isResolvedRow&&!isAllLocked&&accessibleZones.length>0&&
accessibleZones.every(function(_ref20){var zone=_ref20.zone;return(
zone.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species,game.generation));}));}
);
isDeferred=isAllLocked||isDeferredSession||isPendingDeferred;
if(isResolvedRow)statusSymbol='✓';else
if(allDupes)statusSymbol='—';else
if(isDeferredSession||isAllLocked)statusSymbol='↩';
var caughtPokemon=isResolvedRow?game.box.find(function(p){return p.caughtRoute===enc.route;}):undefined;
var seenSids=new Set();
var allSpecies=[];for(var _i12=0;_i12<
accessibleZones.length;_i12++){var _ref21=accessibleZones[_i12];var zone=_ref21.zone;for(var _i14=0,_zone$pokemon4=
zone.pokemon;_i14<_zone$pokemon4.length;_i14++){var e=_zone$pokemon4[_i14];
var sid=toID(e.species);
if(!seenSids.has(sid)){seenSids.add(sid);allSpecies.push(e.species);}
}
}
sprites=allSpecies.map(function(species){return{
species:species,
isDupe:ownedRoots.has(getEvoRoot(species,game.generation)),
isCaught:caughtPokemon!==undefined&&toID(caughtPokemon.species)===toID(species)
};});
}

return preact.h(preact.Fragment,{key:enc.route},
preact.h(RouteListItem,{
enc:enc,
isSelected:isExpanded,
isResolved:isResolvedRow,
isDeferred:isDeferred,
statusSymbol:statusSymbol,
sprites:sprites,
onSelect:function(){return _this3.toggleRouteMobile(enc.route);},
chevron:true}
),
isExpanded&&preact.h("div",{"class":"nz-enc-mobile-zones"},
selectedChoiceGift?
preact.h(GiftChoicePicker,{
gift:selectedChoiceGift,
giftIndex:allGifts.indexOf(selectedChoiceGift),
ownedRoots:ownedRoots,
generation:game.generation}
):
renderZoneContent()

)
);
})
),

preact.h("div",{"class":"nz-route-list-extras"},
segment.items.length>0&&preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-route-list-divider"},"Items"),
preact.h("div",{"class":"nz-items-list",style:"padding: 6px 8px"},
segment.items.map(function(item){return preact.h("span",{key:item,"class":"nz-item-chip"},item);})
)
),
segment.tmMoves.length>0&&preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-route-list-divider"},"TMs"),
preact.h("div",{"class":"nz-items-list",style:"padding: 6px 8px"},
segment.tmMoves.map(function(move){return preact.h("span",{key:move,"class":"nz-item-chip nz-tm-chip"},move);})
)
)
)
),


this.state.statsExpanded&&mobileDisplayed&&
preact.h("div",{"class":"nz-enc-mobile-stats-full"},
preact.h("div",{"class":"nz-enc-mobile-stats-full-header"},
preact.h("button",{"class":"nz-enc-mobile-stats-close",onClick:function(){return _this3.setState({statsExpanded:false});}},"\u2715 Close")
),
preact.h(EncounterPokemonStats,{
pokemon:mobileDisplayed,
generation:game.generation,
nickname:mobileNick,
onNickChange:this.setNick}
)
),



preact.h("div",{"class":"nz-enc-mobile-bar"},
preact.h("div",{
"class":"nz-enc-mobile-stats-strip"+(mobileDisplayed?' nz-enc-mobile-stats-strip-active':''),
onClick:mobileDisplayed?this.toggleStats:undefined},

mobileDisplayed?preact.h(preact.Fragment,null,
preact.h(NzSprite,{species:mobileDisplayed.species,size:28}),
preact.h("span",{"class":"nz-enc-mobile-bar-name"},mobileNick),
mobileIvLabel&&preact.h("span",{"class":"nz-iv-score nz-iv-score-"+mobileIvTier},mobileIvLabel),
mobileNatQ&&mobileNatQ!=='neutral'&&preact.h("span",{"class":"nz-nature-quality nz-nature-quality-"+mobileNatQ},mobileNatQ),
preact.h("span",{"class":"nz-enc-mobile-expand-icon"},this.state.statsExpanded?'▼':'▲')
):preact.h("span",{"class":"nz-enc-mobile-bar-empty"},"No catches yet")
),
canTeambuilding?
preact.h(NzBtn,{onClick:this.submit},"Teambuilding"):
preact.h(NzBtn,{onClick:goToNextUnresolved},"Next (",pendingRoutes.length," left)")

)
),

this.state.showTutorial&&function(){
var ENCOUNTERS_STEPS=[
{
title:'Catching Pokémon',
body:'Before each trainer battle, you explore all available routes to catch new Pokémon. Since this is a nuzlocke, you only get one encounter per route.'
},
{
selector:'.nz-route-list-rows',
title:'Routes',
body:'Every route currently available is listed here. Click a route to see its encounter zones.'
},
{
selector:'.nz-encounter-detail',
title:'Encounter Zones',
body:'Each route has one or more zones with different encounter pools. Pick one to catch a random Pokémon, but remember you only get one encounter for this route!'
},
{
selector:'.nz-encounter-stats, .nz-enc-mobile-stats-strip',
title:'Viewing Your Catch',
body:'Once you catch a Pokémon, its stats show up here.'
},
{
selector:'.nz-btn-defer',
title:'Deferring Routes',
body:'Some zones will be greyed out, indicating you don\'t have the requirements to catch there. Defer the route to see it again later when you do meet the requirements.'
},
{
selector:'.nz-route-list-extras',
title:'Items',
body:'You also find items and TMs you can use or give to your Pokemon.'
},
{
title:'Ready to Go',
body:'Catch a Pokémon on each route to continue.'
}];

return preact.h(NzTutorial,{steps:ENCOUNTERS_STEPS,onDone:_this3.dismissEncountersTutorial});
}()
);
};return EncountersScreen;}(preact.Component);
//# sourceMappingURL=encounters.js.map