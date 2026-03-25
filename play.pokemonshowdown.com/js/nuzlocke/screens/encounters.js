"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var















EncountersScreen=function(_preact$Component){function EncountersScreen(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={nicknames:{}};_this.
















setNick=function(uid,value){
_this.setState(function(s){var _Object$assign;return{nicknames:Object.assign({},s.nicknames,(_Object$assign={},_Object$assign[uid]=value,_Object$assign))};});
};_this.

submit=function(){
var game=_this.props.game;
var parts=game.box.
map(function(p){var _this$state$nicknames;return p.uid+" "+((_this$state$nicknames=_this.state.nicknames[p.uid])!=null?_this$state$nicknames:p.nickname).replace(/\s+/g,'_');}).
join(' ');
PS.send("/nuzlocke setnicks "+parts);
};return _this;}_inheritsLoose(EncountersScreen,_preact$Component);EncountersScreen.getDerivedStateFromProps=function getDerivedStateFromProps(props,state){var updated=Object.assign({},state.nicknames);var changed=false;props.game.box.forEach(function(p){if(!(p.uid in updated)){updated[p.uid]=p.nickname;changed=true;}});return changed?{nicknames:updated}:null;};var _proto=EncountersScreen.prototype;_proto.

render=function render(){var _segment$battles$0$tr,_segment$battles$,_nicknames$starter$ui,_this2=this;
var game=this.props.game;
var nicknames=this.state.nicknames;
var segment=game.segment;

var pendingRoutes=segment.encounters.filter(function(r){return(
r.type!=='gift'&&!game.resolvedRoutes.includes(r.route));}
);
var canContinue=pendingRoutes.length===0;

var starter=game.box.find(function(p){return p.caughtRoute==='Starter';});
var wildRoutes=segment.encounters.filter(function(r){return r.type!=='gift';});
var giftPokemon=game.box.filter(function(p){return(
segment.encounters.some(function(r){return r.type==='gift'&&r.route===p.caughtRoute;}));}
);

var hasBottom=segment.items.length>0||giftPokemon.length>0;

return preact.h(NzScreen,null,
preact.h(NzScreenHeader,{
title:segment.name,
meta:[
{label:'Level Cap',value:String(segment.levelCap)},
{label:'Next Battle',value:(_segment$battles$0$tr=(_segment$battles$=segment.battles[0])==null?void 0:_segment$battles$.trainer)!=null?_segment$battles$0$tr:'?'},
{label:'Routes Remaining',value:String(pendingRoutes.length)}]}

),

starter&&preact.h(NzSection,{title:"Starter"},
preact.h("div",{"class":"nz-encounters-grid"},
preact.h(NzRouteCardCaught,{
pokemon:starter,
nickname:(_nicknames$starter$ui=nicknames[starter.uid])!=null?_nicknames$starter$ui:starter.nickname,
onNickChange:this.setNick}
)
)
),

wildRoutes.length>0&&preact.h(NzSection,{title:"Routes"},
preact.h("div",{"class":"nz-encounters-grid"},
segment.encounters.map(function(route,i){
if(route.type==='gift')return null;
var caught=game.box.find(function(p){return p.caughtRoute===route.route;});
if(caught){var _nicknames$caught$uid;
return preact.h(NzRouteCardCaught,{
key:route.route,
pokemon:caught,
pool:route.pokemon,
nickname:(_nicknames$caught$uid=nicknames[caught.uid])!=null?_nicknames$caught$uid:caught.nickname,
onNickChange:_this2.setNick}
);
}

var ownedSpecies=new Set([].concat(
game.box.map(function(p){return toID(p.species);}),
game.box.map(function(p){return toID(p.baseSpecies);}),
game.graveyard.map(function(p){return toID(p.species);}))
);
var allDupes=route.pokemon.every(function(s){return ownedSpecies.has(toID(s));});

return preact.h(NzRouteCard,{
key:route.route,
routeName:route.route,
pool:route.pokemon,
dupeSpecies:ownedSpecies,
allDupes:allDupes,
onExplore:function(){return PS.send("/nuzlocke encounter "+i);}}
);
})
)
),

hasBottom&&preact.h("div",{"class":"nz-encounters-bottom"},
segment.items.length>0&&preact.h(NzSection,{title:"Items Received"},
preact.h("div",{"class":"nz-items-list"},
segment.items.map(function(item){return preact.h("span",{key:item,"class":"nz-item-chip"},item);})
)
),

giftPokemon.length>0&&preact.h(NzSection,{title:"Gift Pok\xE9mon"},
preact.h("div",{"class":"nz-encounters-grid"},
giftPokemon.map(function(p){var _nicknames$p$uid;return(
preact.h(NzRouteCardCaught,{
key:p.uid,
pokemon:p,
nickname:(_nicknames$p$uid=nicknames[p.uid])!=null?_nicknames$p$uid:p.nickname,
onNickChange:_this2.setNick}
));}
)
)
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