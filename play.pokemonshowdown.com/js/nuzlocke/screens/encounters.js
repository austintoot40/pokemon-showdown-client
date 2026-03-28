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

var METHOD_ICONS={
surf:'🌊',
oldRod:'🎣',
goodRod:'🎣',
superRod:'🎣',
rockSmash:'⛏'
};





function getEvoRoot(speciesName,generation){
var species=generation?
Dex.forGen(generation).species.get(speciesName):
Dex.species.get(speciesName);
while(species.prevo){
species=Dex.species.get(species.prevo);
}
return species.id;
}








function buildFlatEntries(encounters){
var result=[];
var idx=0;for(var _i2=0;_i2<
METHOD_ORDER.length;_i2++){var method=METHOD_ORDER[_i2];for(var _i4=0,_ref2=(_encounters$method=
encounters[method])!=null?_encounters$method:[];_i4<_ref2.length;_i4++){var _encounters$method;var route=_ref2[_i4];
result.push({route:route,method:method,flatIndex:idx++});
}
}
return result;
}







function buildRouteGroups(flatEntries){
var map=new Map();for(var _i6=0;_i6<
flatEntries.length;_i6++){var entry=flatEntries[_i6];
var name=entry.route.route;
if(!map.has(name))map.set(name,{routeName:name,methods:[]});
map.get(name).methods.push(entry);
}
return Array.from(map.values());
}






function MethodPoolCard(_ref3)









{var _METHOD_LABELS$method,_METHOD_LABELS$method2;var method=_ref3.method,encounter=_ref3.encounter,ownedRoots=_ref3.ownedRoots,onScout=_ref3.onScout;
var allDupes=encounter.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));});
var dupeSet=new Set(
encounter.pokemon.filter(function(e){return ownedRoots.has(getEvoRoot(e.species));}).map(function(e){return toID(e.species);})
);
var activeTotal=encounter.pokemon.
filter(function(e){return!dupeSet.has(toID(e.species));}).
reduce(function(sum,e){return sum+e.rate;},0);

return preact.h("div",{"class":"nz-method-pool-card"+(allDupes?' nz-method-pool-card-dupe':'')},
preact.h("div",{"class":"nz-method-pool-label"},(_METHOD_LABELS$method=METHOD_LABELS[method])!=null?_METHOD_LABELS$method:method),
preact.h("div",{"class":"nz-route-pool",style:"grid-template-columns: repeat("+Math.max(1,Math.ceil(encounter.pokemon.length/2))+", 80px)"},
encounter.pokemon.map(function(e){
var dupe=dupeSet.has(toID(e.species));
var pct=dupe||activeTotal===0?0:Math.round(e.rate/activeTotal*100);
return preact.h("div",{key:e.species,"class":"nz-encounter-slot"+(dupe?' nz-encounter-slot-dupe':'')},
preact.h("img",{src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(e.species)+".png",alt:e.species}),
preact.h("div",{"class":"nz-encounter-rate-bar"},
preact.h("div",{"class":"nz-encounter-rate-fill",style:"width:"+pct+"%"})
),
preact.h("div",{"class":"nz-encounter-rate-label"},dupe?'dupe':pct+"%")
);
})
),
allDupes?
preact.h("div",{"class":"nz-label"},"Duplicate clause"):
preact.h(NzBtn,{onClick:onScout},"Scout ",(_METHOD_LABELS$method2=
METHOD_LABELS[method])!=null?_METHOD_LABELS$method2:method
)

);
}var










EncountersScreen=function(_preact$Component){function EncountersScreen(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={selectedRoute:null,nicknames:{}};_this.





































selectRoute=function(routeName){
_this.setState({selectedRoute:routeName});
};_this.

setNick=function(uid,value){
_this.setState(function(s){var _Object$assign;return{nicknames:Object.assign({},s.nicknames,(_Object$assign={},_Object$assign[uid]=value,_Object$assign))};});
};_this.

submit=function(){
var game=_this.props.game;
var parts=game.box.
map(function(p){var _this$state$nicknames;return p.uid+" "+((_this$state$nicknames=_this.state.nicknames[p.uid])!=null?_this$state$nicknames:p.nickname).replace(/\s+/g,'_');}).
join(' ');
PS.send("/nuzlocke setnicks "+parts);
};return _this;}_inheritsLoose(EncountersScreen,_preact$Component);EncountersScreen.getDerivedStateFromProps=function getDerivedStateFromProps(props,state){var segment=props.game.segment;if(!segment)return null;var updated=Object.assign({},state.nicknames);var changed=false;props.game.box.forEach(function(p){if(!(p.uid in updated)){updated[p.uid]=p.nickname;changed=true;}});var selectedRoute=state.selectedRoute;if(!selectedRoute){var _ref4,_pending$routeName,_groups$;var flatEntries=buildFlatEntries(segment.encounters);var groups=buildRouteGroups(flatEntries);var ownedRoots=new Set([].concat(props.game.box.map(function(p){return getEvoRoot(p.species);}),props.game.graveyard.map(function(p){return getEvoRoot(p.species);})));var pending=groups.find(function(g){return!props.game.resolvedRoutes.includes(g.routeName)&&!g.methods.every(function(m){return m.route.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));});});});selectedRoute=(_ref4=(_pending$routeName=pending==null?void 0:pending.routeName)!=null?_pending$routeName:(_groups$=groups[0])==null?void 0:_groups$.routeName)!=null?_ref4:null;if(selectedRoute!==state.selectedRoute)changed=true;}return changed?{nicknames:updated,selectedRoute:selectedRoute}:null;};var _proto=EncountersScreen.prototype;_proto.

render=function render(){var _segment$gifts,_routeGroups$find,_game$box$find,_game$box$find2,_selectedGroup$method,_segment$battles$0$tr,_segment$battles$,_this2=this,_nicknames$selectedGi,_selectedGroup$method2,_nicknames$selectedCa;
var game=this.props.game;
var _this$state=this.state,nicknames=_this$state.nicknames,selectedRoute=_this$state.selectedRoute;
var segment=game.segment;

var ownedRoots=new Set([].concat(
game.box.map(function(p){return getEvoRoot(p.species,game.generation);}),
game.graveyard.map(function(p){return getEvoRoot(p.species,game.generation);}))
);

var flatEntries=buildFlatEntries(segment.encounters);
var routeGroups=buildRouteGroups(flatEntries);
var giftRouteNames=new Set(((_segment$gifts=segment.gifts)!=null?_segment$gifts:[]).map(function(r){return r.route;}));


var pendingRoutes=routeGroups.filter(function(g){return(
!game.resolvedRoutes.includes(g.routeName)&&
!g.methods.every(function(m){return m.route.pokemon.every(function(e){return ownedRoots.has(getEvoRoot(e.species));});}));}
);
var canContinue=pendingRoutes.length===0;


var giftPokemon=game.box.filter(function(p){return giftRouteNames.has(p.caughtRoute);});


var selectedGroup=(_routeGroups$find=routeGroups.find(function(g){return g.routeName===selectedRoute;}))!=null?_routeGroups$find:null;
var selectedCaught=selectedRoute?(_game$box$find=
game.box.find(function(p){return p.caughtRoute===selectedRoute;}))!=null?_game$box$find:null:
null;
var selectedGift=selectedRoute&&giftRouteNames.has(selectedRoute)?(_game$box$find2=
game.box.find(function(p){return p.caughtRoute===selectedRoute;}))!=null?_game$box$find2:null:
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
var nonWalkMethods=group.methods.
filter(function(m){return m.method!=='walk';}).
map(function(m){return m.method;});
var isSelected=selectedRoute===group.routeName;

return preact.h("div",{
key:group.routeName,
"class":"nz-route-list-row"+(isSelected?' selected':'')+(resolved?' resolved':''),
onClick:function(){return _this2.selectRoute(group.routeName);}},

preact.h("span",{"class":"nz-route-list-status"},
resolved?'✓':allDupes?'—':''
),
preact.h("span",{"class":"nz-route-list-name"},group.routeName),
nonWalkMethods.map(function(m){var _METHOD_ICONS$m;return(
preact.h("span",{key:m,"class":"nz-method-pill"},(_METHOD_ICONS$m=METHOD_ICONS[m])!=null?_METHOD_ICONS$m:m));}
)
);
}),

giftPokemon.length>0&&preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-route-list-divider"},"Gifts"),
giftPokemon.map(function(p){return(
preact.h("div",{
key:p.uid,
"class":"nz-route-list-row resolved"+(selectedRoute===p.caughtRoute?' selected':''),
onClick:function(){return _this2.selectRoute(p.caughtRoute);}},

preact.h("span",{"class":"nz-route-list-status"},"\u2713"),
preact.h("span",{"class":"nz-route-list-name"},p.caughtRoute)
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
)
),


preact.h("div",{"class":"nz-encounter-detail"},
selectedGift&&preact.h(NzRouteCardCaught,{
pokemon:selectedGift,
nickname:(_nicknames$selectedGi=nicknames[selectedGift.uid])!=null?_nicknames$selectedGi:selectedGift.nickname,
onNickChange:this.setNick}
),

!selectedGift&&isResolved&&selectedCaught&&preact.h(NzRouteCardCaught,{
pokemon:selectedCaught,
pool:selectedGroup==null||(_selectedGroup$method2=selectedGroup.methods[0])==null?void 0:_selectedGroup$method2.route.pokemon,
nickname:(_nicknames$selectedCa=nicknames[selectedCaught.uid])!=null?_nicknames$selectedCa:selectedCaught.nickname,
onNickChange:this.setNick}
),

!selectedGift&&!isResolved&&selectedGroup&&preact.h(preact.Fragment,null,
isMultiMethod&&preact.h("div",{"class":"nz-detail-choose-hint"},"Choose one method \u2014 you only get one encounter here"

),
preact.h("div",{"class":"nz-method-pools"},
selectedGroup.methods.map(function(entry){return(
preact.h(MethodPoolCard,{
key:entry.method,
method:entry.method,
encounter:entry.route,
ownedRoots:ownedRoots,
onScout:function(){return PS.send("/nuzlocke encounter "+entry.flatIndex);}}
));}
)
)
),

!selectedRoute&&preact.h("div",{"class":"nz-detail-empty"},"Select a route to scout")
)
),

preact.h("div",{style:"margin-top:8px;"},
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