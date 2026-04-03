"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}




















var METHOD_ORDER=['walk','surf','oldRod','goodRod','superRod','rockSmash'];

var METHOD_LABELS={
walk:'Grass',
surf:'Surfing',
oldRod:'Old Rod',
goodRod:'Good Rod',
superRod:'Super Rod',
rockSmash:'Rock Smash'
};






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








function buildFlatEntries(encounters){
var result=[];
var idx=0;for(var _i6=0;_i6<
METHOD_ORDER.length;_i6++){var method=METHOD_ORDER[_i6];for(var _i8=0,_ref2=(_encounters$method=
encounters[method])!=null?_encounters$method:[];_i8<_ref2.length;_i8++){var _encounters$method;var route=_ref2[_i8];
result.push({route:route,method:method,flatIndex:idx++});
}
}
return result;
}







function buildRouteGroups(flatEntries){
var map=new Map();for(var _i10=0;_i10<
flatEntries.length;_i10++){var entry=flatEntries[_i10];
var name=entry.route.route;
if(!map.has(name))map.set(name,{routeName:name,methods:[]});
map.get(name).methods.push(entry);
}
return Array.from(map.values());
}






function MethodPoolCard(_ref3)











{var _METHOD_LABELS$method;var method=_ref3.method,encounter=_ref3.encounter,ownedRoots=_ref3.ownedRoots,onScout=_ref3.onScout,caughtSpecies=_ref3.caughtSpecies;
var resolved=caughtSpecies!==undefined;
var allDupes=!resolved&&encounter.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));});
var dupeSet=new Set(
encounter.pokemon.
filter(function(e){return ownedRoots.has(getEvoRoot(e.species))&&!(resolved&&toID(e.species)===toID(caughtSpecies!=null?caughtSpecies:''));}).
map(function(e){return toID(e.species);})
);
var activeTotal=encounter.pokemon.
filter(function(e){return!dupeSet.has(toID(e.species));}).
reduce(function(sum,e){return sum+e.rate;},0);

var clickable=!resolved&&!allDupes;

return preact.h("div",{
"class":"nz-method-pool-card"+(allDupes?' nz-method-pool-card-dupe':'')+(clickable?' nz-method-pool-card-selectable':''),
onClick:clickable?onScout:undefined},

preact.h("div",{"class":"nz-method-pool-label"},(_METHOD_LABELS$method=METHOD_LABELS[method])!=null?_METHOD_LABELS$method:method),
preact.h("div",{"class":"nz-route-pool"},
encounter.pokemon.map(function(e){
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

preact.h("div",{"class":"nz-encounter-stats-types"},preact.h(NzTypeBadges,{species:pokemon.species})),
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
STAT_KEYS.map(function(_ref4){var label=_ref4.label,key=_ref4.key;
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






function GiftChoicePicker(_ref5)









{var gift=_ref5.gift,giftIndex=_ref5.giftIndex,ownedRoots=_ref5.ownedRoots,generation=_ref5.generation;
return preact.h("div",{"class":"nz-gift-choice-picker"},
preact.h("div",{"class":"nz-gift-choice-header"},
preact.h("div",{"class":"nz-gift-choice-label"},"Choose one to receive"),
preact.h("div",{"class":"nz-gift-choice-route"},gift.route)
),
preact.h("div",{"class":"nz-gift-choice-options"},
gift.pokemon.map(function(e){
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
preact.h(NzTypeBadges,{species:e.species}),
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
};return _this2;}_inheritsLoose(EncountersScreen,_preact$Component2);EncountersScreen.getDerivedStateFromProps=function getDerivedStateFromProps(props,state){var segment=props.game.segment;if(!segment)return null;var updated=Object.assign({},state.nicknames);var changed=false;props.game.box.forEach(function(p){if(!(p.uid in updated)){updated[p.uid]=p.nickname;changed=true;}});var selectedRoute=state.selectedRoute;if(!selectedRoute){var _pending$routeName;var flatEntries=buildFlatEntries(segment.encounters);var groups=buildRouteGroups(flatEntries);var ownedRoots=new Set([].concat(props.game.box.map(function(p){return getEvoRoot(p.species);}),props.game.graveyard.map(function(p){return getEvoRoot(p.species);})));var pending=groups.find(function(g){return!props.game.resolvedRoutes.includes(g.routeName)&&!g.methods.every(function(m){return m.route.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));});});});selectedRoute=(_pending$routeName=pending==null?void 0:pending.routeName)!=null?_pending$routeName:null;if(!selectedRoute){var _segment$gifts,_ref6,_unresolvedChoice$rou,_groups$;var unresolvedChoice=((_segment$gifts=segment.gifts)!=null?_segment$gifts:[]).find(function(g){return g.choice&&!props.game.resolvedRoutes.includes(g.route);});selectedRoute=(_ref6=(_unresolvedChoice$rou=unresolvedChoice==null?void 0:unresolvedChoice.route)!=null?_unresolvedChoice$rou:(_groups$=groups[0])==null?void 0:_groups$.routeName)!=null?_ref6:null;}if(selectedRoute!==state.selectedRoute)changed=true;}return changed?{nicknames:updated,selectedRoute:selectedRoute}:null;};var _proto2=EncountersScreen.prototype;_proto2.

render=function render(){var _segment$gifts2,_routeGroups$find,_game$box$find,_allGifts$find,_game$box$find2,_selectedGroup$method,_segment$battles$0$tr,_segment$battles$,_this3=this,_nicknames$selectedRe;
var game=this.props.game;
var _this$state=this.state,nicknames=_this$state.nicknames,selectedRoute=_this$state.selectedRoute;
var segment=game.segment;

var ownedRoots=new Set([].concat(
game.box.map(function(p){return getEvoRoot(p.species,game.generation);}),
game.graveyard.map(function(p){return getEvoRoot(p.species,game.generation);}))
);

var flatEntries=buildFlatEntries(segment.encounters);
var routeGroups=buildRouteGroups(flatEntries);
var allGifts=(_segment$gifts2=segment.gifts)!=null?_segment$gifts2:[];
var giftRouteNames=new Set(allGifts.map(function(r){return r.route;}));


var pendingRoutes=routeGroups.filter(function(g){return(
!game.resolvedRoutes.includes(g.routeName)&&
!g.methods.every(function(m){return m.route.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));});}));}
);
var unresolvedChoiceGifts=allGifts.filter(function(g){return g.choice&&!game.resolvedRoutes.includes(g.route);});
var canContinue=pendingRoutes.length===0&&unresolvedChoiceGifts.length===0;


var resolvedGiftPokemon=game.box.filter(function(p){return giftRouteNames.has(p.caughtRoute);});


var selectedGroup=(_routeGroups$find=routeGroups.find(function(g){return g.routeName===selectedRoute;}))!=null?_routeGroups$find:null;
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
var isMultiMethod=((_selectedGroup$method=selectedGroup==null?void 0:selectedGroup.methods.length)!=null?_selectedGroup$method:0)>1;

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
routeGroups.length>0&&preact.h("div",{"class":"nz-route-list-section-label"},"Routes"),
routeGroups.map(function(group){
var resolved=game.resolvedRoutes.includes(group.routeName);
var allDupes=!resolved&&group.methods.every(function(m){return(
m.route.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));}));}
);
var isSelected=selectedRoute===group.routeName;

var caughtPokemon=resolved?
game.box.find(function(p){return p.caughtRoute===group.routeName;}):
undefined;

return preact.h("div",{
key:group.routeName,
"class":"nz-route-list-row"+(isSelected?' selected':'')+(resolved?' resolved':''),
onClick:function(){return _this3.selectRoute(group.routeName);}},

preact.h("div",{"class":"nz-route-list-row-top"},
preact.h("span",{"class":"nz-route-list-status"},
resolved?'✓':allDupes?'—':''
),
preact.h("span",{"class":"nz-route-list-name"},group.routeName)
),
preact.h("div",{"class":"nz-route-list-sprites"},
group.methods.map(function(entry){
var uniqueSpecies=Array.from(
new Map(entry.route.pokemon.map(function(e){return[toID(e.species),e.species];})).values()
);
return preact.h("div",{key:entry.method,"class":"nz-route-sprite-group"},
uniqueSpecies.map(function(species){
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
);
})
)
);
}),

(unresolvedChoiceGifts.length>0||resolvedGiftPokemon.length>0)&&preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-route-list-divider"},"Gifts"),
unresolvedChoiceGifts.map(function(g){return(
preact.h("div",{
key:g.route,
"class":"nz-route-list-row nz-route-list-row-choice"+(selectedRoute===g.route?' selected':''),
onClick:function(){return _this3.selectRoute(g.route);}},

preact.h("div",{"class":"nz-route-list-row-top"},
preact.h("span",{"class":"nz-route-list-status nz-gift-status-choose"},"!"),
preact.h("span",{"class":"nz-route-list-name"},g.route)
),
preact.h("div",{"class":"nz-route-list-sprites"},
g.pokemon.map(function(e){return(
preact.h("img",{
key:toID(e.species),
"class":"nz-route-sprite",
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(e.species)+".png",
alt:e.species,
title:e.species}
));}
)
)
));}
),
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

!selectedChoiceGift&&!selectedResolvedGift&&selectedGroup&&preact.h(preact.Fragment,null,
isMultiMethod&&!isResolved&&preact.h("div",{"class":"nz-detail-choose-hint"},"Choose one method \u2014 you only get one encounter here"

),
preact.h("div",{"class":"nz-method-pools"},
selectedGroup.methods.map(function(entry){return(
preact.h(MethodPoolCard,{
key:entry.method,
method:entry.method,
encounter:entry.route,
ownedRoots:ownedRoots,
onScout:function(){return PS.send("/nuzlocke encounter "+entry.flatIndex);},
caughtSpecies:isResolved?selectedCaught==null?void 0:selectedCaught.species:undefined}
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