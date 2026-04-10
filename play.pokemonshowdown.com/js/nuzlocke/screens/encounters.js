"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}






















var METHOD_PREREQS={
'Surf':{type:'hm',name:'Surf'},
'Rock Smash':{type:'hm',name:'Rock Smash'},
'Fish Old':{type:'item',name:'Old Rod'},
'Fish Good':{type:'item',name:'Good Rod'},
'Fish Super':{type:'item',name:'Super Rod'}
};

function hasZonePrereq(zone,tmMoves,items){
var prereq=METHOD_PREREQS[zone.method];
if(!prereq)return true;
return prereq.type==='hm'?tmMoves.includes(prereq.name):items.includes(prereq.name);
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







function ZonePoolCard(_ref)











{var zone=_ref.zone,routeIndex=_ref.routeIndex,zoneIndex=_ref.zoneIndex,ownedRoots=_ref.ownedRoots,caughtSpecies=_ref.caughtSpecies;
var resolved=caughtSpecies!==undefined;
var allDupes=!resolved&&zone.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));});
var dupeSet=new Set(
zone.pokemon.
filter(function(e){return ownedRoots.has(getEvoRoot(e.species))&&!(resolved&&toID(e.species)===toID(caughtSpecies!=null?caughtSpecies:''));}).
map(function(e){return toID(e.species);})
);
var activeTotal=zone.pokemon.
filter(function(e){return!dupeSet.has(toID(e.species));}).
reduce(function(sum,e){return sum+e.rate;},0);

var clickable=!resolved&&!allDupes;


var zoneLabel=zone.zone||zone.method;
var showMethodSeparate=zone.zone&&zone.zone!==zone.method;

return preact.h("div",{
"class":"nz-zone-card"+(allDupes?' nz-zone-card-dupe':'')+(clickable?' nz-zone-card-selectable':''),
onClick:clickable?function(){return PS.send("/nuzlocke encounter "+routeIndex+" "+zoneIndex);}:undefined},

preact.h("div",{"class":"nz-zone-label"},
zoneLabel,
showMethodSeparate&&preact.h("span",{"class":"nz-zone-method"},zone.method),
zone.time&&preact.h("span",{"class":"nz-zone-time"},zone.time)
),
preact.h("div",{"class":"nz-route-pool"},
zone.pokemon.map(function(e){
var dupe=dupeSet.has(toID(e.species));
var isCaught=resolved&&toID(e.species)===toID(caughtSpecies);
var pct=dupe||activeTotal===0?0:Math.round(e.rate/activeTotal*100);
var slotClass=[
'nz-encounter-slot',
dupe?'nz-encounter-slot-dupe':'',
resolved&&!isCaught?'nz-encounter-slot-dimmed':'',
isCaught?'nz-encounter-slot-caught':''].
filter(Boolean).join(' ');
return preact.h("div",{key:e.species,"class":slotClass},
preact.h("img",{src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(e.species)+".png",alt:e.species}),
preact.h("div",{"class":"nz-encounter-rate-bar"},
preact.h("div",{"class":"nz-encounter-rate-fill",style:"width:"+pct+"%"})
),
preact.h("div",{"class":"nz-encounter-rate-label"},dupe?'dupe':pct+"%")
);
})
),
allDupes&&preact.h("div",{"class":"nz-label"},"Duplicate clause")
);
}





var STAT_KEYS=[
{label:'HP',key:'hp'},
{label:'Atk',key:'atk'},
{label:'Def',key:'def'},
{label:'SpA',key:'spa'},
{label:'SpD',key:'spd'},
{label:'Spe',key:'spe'}];var


EncounterPokemonStats=function(_preact$Component){function EncounterPokemonStats(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.





state={editing:false};_this.
startEdit=function(){return _this.setState({editing:true});};_this.
stopEdit=function(){return _this.setState({editing:false});};return _this;}_inheritsLoose(EncounterPokemonStats,_preact$Component);var _proto=EncounterPokemonStats.prototype;_proto.

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
preact.h("img",{
"class":"nz-encounter-stats-sprite",
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(pokemon.species)+".png",
alt:pokemon.species}
),
preact.h("div",{"class":"nz-encounter-stats-identity"},
editing?
preact.h("input",{
"class":"nz-encounter-stats-nick-input",
type:"text",
value:nickname,
maxlength:12,
autoFocus:true,
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


preact.h("div",{"class":"nz-encounter-stats-section-label"},"Base Stats"),
preact.h("div",{"class":"nz-stat-bars",style:"margin-bottom:8px"},
STAT_KEYS.map(function(_ref2){var label=_ref2.label,key=_ref2.key;
var val=sp.baseStats[key];
var pct=Math.round(val/255*100);
var tier=val>=100?'high':val>=70?'mid':val>=50?'low':'poor';
var mod=key===boostedStat?' nz-stat-nature-up':key===reducedStat?' nz-stat-nature-down':'';
return preact.h("div",{key:key,"class":"nz-stat-row"},
preact.h("div",{"class":"nz-stat-label"+mod},label),
preact.h("div",{"class":"nz-stat-bar-track"},
preact.h("div",{"class":"nz-stat-bar-fill nz-stat-"+tier,style:"width:"+pct+"%"})
),
preact.h("div",{"class":"nz-stat-value"+mod},val)
);
})
),


preact.h("div",{"class":"nz-encounter-stats-section-label"},"IVs",

preact.h("span",{"class":"nz-iv-score nz-iv-score-"+ivTier},ivLabel)
),
preact.h(NzIvBars,{ivs:pokemon.ivs}),
topPercentile!==null&&
preact.h("div",{"class":"nz-encounter-top-callout"},"This ",
pokemon.species," is in the top ",formatTopPct(topPercentile)," of ",pokemon.species,"s!"
),

worsePercentile!==null&&
preact.h("div",{"class":"nz-encounter-bad-callout"},"This ",
pokemon.species," is worse than ",formatTopPct(worsePercentile)," of ",pokemon.species,"s!"
)

);
};return EncounterPokemonStats;}(preact.Component);






function GiftChoicePicker(_ref3)









{var _ref4;var gift=_ref3.gift,giftIndex=_ref3.giftIndex,ownedRoots=_ref3.ownedRoots,generation=_ref3.generation;
return preact.h("div",{"class":"nz-gift-choice-picker"},
preact.h("div",{"class":"nz-gift-choice-header"},
preact.h("div",{"class":"nz-gift-choice-label"},"Choose one to receive"),
preact.h("div",{"class":"nz-gift-choice-route"},gift.route)
),
preact.h("div",{"class":"nz-gift-choice-options"},
(_ref4=[]).concat.apply(_ref4,gift.zones.map(function(z){return z.pokemon;})).map(function(e){
var isDupe=ownedRoots.has(getEvoRoot(e.species,generation));
return preact.h("div",{
key:e.species,
"class":"nz-gift-choice-option"+(isDupe?' nz-gift-choice-option-dupe':''),
onClick:function(){return PS.send("/nuzlocke choosegift "+giftIndex+" "+toID(e.species));}},

preact.h("img",{
"class":"nz-gift-choice-sprite",
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(e.species)+".png",
alt:e.species}
),
preact.h("div",{"class":"nz-gift-choice-name"},e.species),
preact.h(NzTypeBadges,{species:e.species,generation:generation}),
isDupe&&preact.h("div",{"class":"nz-gift-dupe-label"},"Dupe")
);
})
)
);
}var










EncountersScreen=function(_preact$Component2){function EncountersScreen(){var _this2;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this2=_preact$Component2.call.apply(_preact$Component2,[this].concat(args))||this;_this2.
state={selectedRoute:null,nicknames:{}};_this2.


















































selectRoute=function(routeName){
_this2.setState({selectedRoute:routeName});
};_this2.

setNick=function(uid,value){
_this2.setState(function(s){var _Object$assign;return{nicknames:Object.assign({},s.nicknames,(_Object$assign={},_Object$assign[uid]=value,_Object$assign))};});
};_this2.

submit=function(){
var game=_this2.props.game;
var parts=game.box.
map(function(p){var _this2$state$nickname;return p.uid+" "+((_this2$state$nickname=_this2.state.nicknames[p.uid])!=null?_this2$state$nickname:p.nickname).replace(/\s+/g,'_');}).
join(' ');
PS.send("/nuzlocke setnicks "+parts);
};return _this2;}_inheritsLoose(EncountersScreen,_preact$Component2);EncountersScreen.getDerivedStateFromProps=function getDerivedStateFromProps(props,state){var segment=props.game.segment;if(!segment)return null;var updated=Object.assign({},state.nicknames);var changed=false;props.game.box.forEach(function(p){if(!(p.uid in updated)){updated[p.uid]=p.nickname;changed=true;}});var selectedRoute=state.selectedRoute;if(!selectedRoute){var _segment$encounters,_pending$route;var ownedRoots=new Set([].concat(props.game.box.map(function(p){return getEvoRoot(p.species);}),props.game.graveyard.map(function(p){return getEvoRoot(p.species);})));var tmMoves=props.game.tmMoves;var items=props.game.items;var pending=((_segment$encounters=segment.encounters)!=null?_segment$encounters:[]).find(function(enc){return!props.game.resolvedRoutes.includes(enc.route)&&enc.zones.some(function(z){return hasZonePrereq(z,tmMoves,items)&&z.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species));});});});selectedRoute=(_pending$route=pending==null?void 0:pending.route)!=null?_pending$route:null;if(!selectedRoute){var _segment$gifts,_segment$encounters2,_ref5,_unresolvedChoice$rou;var unresolvedChoice=((_segment$gifts=segment.gifts)!=null?_segment$gifts:[]).find(function(g){return g.choice&&!props.game.resolvedRoutes.includes(g.route);});var firstAccessible=((_segment$encounters2=segment.encounters)!=null?_segment$encounters2:[]).find(function(enc){return enc.zones.some(function(z){return hasZonePrereq(z,tmMoves,items);});});selectedRoute=(_ref5=(_unresolvedChoice$rou=unresolvedChoice==null?void 0:unresolvedChoice.route)!=null?_unresolvedChoice$rou:firstAccessible==null?void 0:firstAccessible.route)!=null?_ref5:null;}if(selectedRoute!==state.selectedRoute)changed=true;}return changed?{nicknames:updated,selectedRoute:selectedRoute}:null;};var _proto2=EncountersScreen.prototype;_proto2.

render=function render(){var _segment$encounters3,_segment$gifts2,_game$box$find,_allGifts$find,_game$box$find2,_segment$battles$0$tr,_segment$battles$,_this3=this,_nicknames$selectedRe;
var game=this.props.game;
var _this$state=this.state,nicknames=_this$state.nicknames,selectedRoute=_this$state.selectedRoute;
var segment=game.segment;

var ownedRoots=new Set([].concat(
game.box.map(function(p){return getEvoRoot(p.species,game.generation);}),
game.graveyard.map(function(p){return getEvoRoot(p.species,game.generation);}))
);

var encounters=(_segment$encounters3=segment.encounters)!=null?_segment$encounters3:[];
var allGifts=(_segment$gifts2=segment.gifts)!=null?_segment$gifts2:[];
var giftRouteNames=new Set(allGifts.map(function(r){return r.route;}));



var encVisibleZones=
encounters.map(function(enc){return(
enc.zones.
map(function(zone,i){return{zone:zone,originalIndex:i};}).
filter(function(_ref6){var zone=_ref6.zone;return hasZonePrereq(zone,game.tmMoves,game.items);}));}
);


var visibleEncounters=encounters.filter(function(enc,i){return(
game.resolvedRoutes.includes(enc.route)||encVisibleZones[i].length>0);}
);


var pendingRoutes=encounters.filter(function(enc,i){return(
(game.resolvedRoutes.includes(enc.route)||encVisibleZones[i].length>0)&&
!game.resolvedRoutes.includes(enc.route)&&
encVisibleZones[i].some(function(_ref7){var zone=_ref7.zone;return zone.pokemon.some(function(e){return!ownedRoots.has(getEvoRoot(e.species));});}));}
);
var unresolvedChoiceGifts=allGifts.filter(function(g){return g.choice&&!game.resolvedRoutes.includes(g.route);});
var canContinue=pendingRoutes.length===0&&unresolvedChoiceGifts.length===0;


var resolvedGiftPokemon=game.box.filter(function(p){return giftRouteNames.has(p.caughtRoute);});


var selectedEncIndex=encounters.findIndex(function(enc){return enc.route===selectedRoute;});
var selectedEnc=selectedEncIndex>=0?encounters[selectedEncIndex]:null;
var selectedCaught=selectedRoute?(_game$box$find=
game.box.find(function(p){return p.caughtRoute===selectedRoute;}))!=null?_game$box$find:null:
null;
var selectedGiftDef=selectedRoute?(_allGifts$find=
allGifts.find(function(g){return g.route===selectedRoute;}))!=null?_allGifts$find:null:
null;
var selectedResolvedGift=selectedGiftDef&&game.resolvedRoutes.includes(selectedRoute)?(_game$box$find2=
game.box.find(function(p){return p.caughtRoute===selectedRoute;}))!=null?_game$box$find2:null:
null;
var selectedChoiceGift=selectedGiftDef!=null&&selectedGiftDef.choice&&!game.resolvedRoutes.includes(selectedRoute)?
selectedGiftDef:
null;

var isResolved=selectedRoute?game.resolvedRoutes.includes(selectedRoute):false;

var selectedVisibleZones=selectedEncIndex>=0?encVisibleZones[selectedEncIndex]:[];
var isMultiZone=selectedVisibleZones.length>1;

return preact.h(NzScreen,null,
preact.h(NzScreenHeader,{
title:segment.name,
meta:[
{label:'Level Cap',value:String(segment.levelCap)},
{label:'Next Battle',value:(_segment$battles$0$tr=(_segment$battles$=segment.battles[0])==null?void 0:_segment$battles$.trainer)!=null?_segment$battles$0$tr:'?'},
{label:'Routes Remaining',value:String(pendingRoutes.length)}]}

),

preact.h("div",{"class":"nz-encounters-layout"},

preact.h("div",{"class":"nz-route-list"},
visibleEncounters.length>0&&preact.h("div",{"class":"nz-route-list-section-label"},"Routes"),
visibleEncounters.map(function(enc){
var encIdx=encounters.indexOf(enc);
var visibleZones=encVisibleZones[encIdx];
var resolved=game.resolvedRoutes.includes(enc.route);
var allDupes=!resolved&&visibleZones.every(function(_ref8){var zone=_ref8.zone;return(
zone.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));}));}
);
var isSelected=selectedRoute===enc.route;
var caughtPokemon=resolved?
game.box.find(function(p){return p.caughtRoute===enc.route;}):
undefined;


var seenSids=new Set();
var allSpecies=[];for(var _i6=0;_i6<
visibleZones.length;_i6++){var _ref9=visibleZones[_i6];var zone=_ref9.zone;for(var _i8=0,_zone$pokemon2=
zone.pokemon;_i8<_zone$pokemon2.length;_i8++){var e=_zone$pokemon2[_i8];
var sid=toID(e.species);
if(!seenSids.has(sid)){seenSids.add(sid);allSpecies.push(e.species);}
}
}

return preact.h("div",{
key:enc.route,
"class":"nz-route-list-row"+(isSelected?' selected':'')+(resolved?' resolved':''),
onClick:function(){return _this3.selectRoute(enc.route);}},

preact.h("div",{"class":"nz-route-list-row-top"},
preact.h("span",{"class":"nz-route-list-status"},
resolved?'✓':allDupes?'—':''
),
preact.h("span",{"class":"nz-route-list-name"},enc.route)
),
preact.h("div",{"class":"nz-route-list-sprites"},
preact.h("div",{"class":"nz-route-sprite-group"},
allSpecies.map(function(species){
var sid=toID(species);
var isDupe=ownedRoots.has(getEvoRoot(species,game.generation));
var isCaught=caughtPokemon!==undefined&&toID(caughtPokemon.species)===sid;
var cls=[
'nz-route-sprite',
isDupe&&!isCaught?'nz-route-sprite-dupe':'',
isCaught?'nz-route-sprite-caught':''].
filter(Boolean).join(' ');
return preact.h("img",{
key:sid,
"class":cls,
src:"https://play.pokemonshowdown.com/sprites/gen5/"+sid+".png",
alt:species,
title:species}
);
})
)
)
);
}),

(unresolvedChoiceGifts.length>0||resolvedGiftPokemon.length>0)&&preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-route-list-divider"},"Gifts"),
unresolvedChoiceGifts.map(function(g){var _ref10;
var giftPokemon=(_ref10=[]).concat.apply(_ref10,g.zones.map(function(z){return z.pokemon;}));
return preact.h("div",{
key:g.route,
"class":"nz-route-list-row nz-route-list-row-choice"+(selectedRoute===g.route?' selected':''),
onClick:function(){return _this3.selectRoute(g.route);}},

preact.h("div",{"class":"nz-route-list-row-top"},
preact.h("span",{"class":"nz-route-list-status nz-gift-status-choose"},"!"),
preact.h("span",{"class":"nz-route-list-name"},g.route)
),
preact.h("div",{"class":"nz-route-list-sprites"},
giftPokemon.map(function(e){return(
preact.h("img",{
key:toID(e.species),
"class":"nz-route-sprite",
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(e.species)+".png",
alt:e.species,
title:e.species}
));}
)
)
);
}),
resolvedGiftPokemon.map(function(p){return(
preact.h("div",{
key:p.uid,
"class":"nz-route-list-row resolved"+(selectedRoute===p.caughtRoute?' selected':''),
onClick:function(){return _this3.selectRoute(p.caughtRoute);}},

preact.h("div",{"class":"nz-route-list-row-top"},
preact.h("span",{"class":"nz-route-list-status"},"\u2713"),
preact.h("span",{"class":"nz-route-list-name"},p.caughtRoute)
),
preact.h("div",{"class":"nz-route-list-sprites"},
preact.h("img",{
"class":"nz-route-sprite nz-route-sprite-caught",
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(p.species)+".png",
alt:p.species,
title:p.species}
)
)
));}
)
),

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
),


preact.h("div",{"class":"nz-encounter-detail"},
selectedChoiceGift&&preact.h(GiftChoicePicker,{
gift:selectedChoiceGift,
giftIndex:allGifts.indexOf(selectedChoiceGift),
ownedRoots:ownedRoots,
generation:game.generation}
),

!selectedChoiceGift&&selectedResolvedGift&&preact.h(NzRouteCardCaught,{
pokemon:selectedResolvedGift,
nickname:(_nicknames$selectedRe=nicknames[selectedResolvedGift.uid])!=null?_nicknames$selectedRe:selectedResolvedGift.nickname,
onNickChange:this.setNick}
),

!selectedChoiceGift&&!selectedResolvedGift&&selectedEnc&&preact.h(preact.Fragment,null,
isMultiZone&&!isResolved&&preact.h("div",{"class":"nz-detail-choose-hint"},"Choose one zone \u2014 you only get one encounter here"

),
preact.h("div",{"class":"nz-zone-cards"},
selectedVisibleZones.map(function(_ref11){var zone=_ref11.zone,originalIndex=_ref11.originalIndex;return(
preact.h(ZonePoolCard,{
zone:zone,
routeIndex:selectedEncIndex,
zoneIndex:originalIndex,
ownedRoots:ownedRoots,
caughtSpecies:isResolved?
(selectedCaught==null?void 0:selectedCaught.caughtZoneIndex)===undefined||originalIndex===selectedCaught.caughtZoneIndex?
selectedCaught==null?void 0:selectedCaught.species:
'':
undefined}
));}
)
)
),

!selectedRoute&&preact.h("div",{"class":"nz-detail-empty"},"Select a route to scout")
),


function(_nicknames$displayed$){
var alive=game.box.filter(function(p){return p.alive;});
var displayed=isResolved&&selectedCaught?selectedCaught:
alive.length>0?alive[alive.length-1]:null;
return preact.h(EncounterPokemonStats,{
pokemon:displayed,
generation:game.generation,
nickname:displayed?(_nicknames$displayed$=nicknames[displayed.uid])!=null?_nicknames$displayed$:displayed.nickname:'',
onNickChange:_this3.setNick}
);
}()
),

preact.h("div",{"class":"nz-tb-battle-footer"},
preact.h(NzBtn,{
onClick:this.submit,
disabled:!canContinue,
title:canContinue?'':pendingRoutes.length+" route(s) still unscouted"},
"Continue"

)
)
);
};return EncountersScreen;}(preact.Component);
//# sourceMappingURL=encounters.js.map