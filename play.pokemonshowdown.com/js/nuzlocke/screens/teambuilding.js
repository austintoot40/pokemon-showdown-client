"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var












































TeambuildingScreen=function(_preact$Component){function TeambuildingScreen(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={moves:{},heldItems:{},errors:{},selectedUid:null,selectedOpponent:null,showTutorial:false,activeTab:'moves',drag:null,showItemWarning:false,mobileTab:'loadout',statsCollapsed:true};_this.


_drag=null;_this.
_dragJustEnded=false;_this.





















cancelDrag=function(){
document.removeEventListener('pointermove',_this.onDragMove);
document.removeEventListener('pointerup',_this.onDragEnd);
document.removeEventListener('pointercancel',_this.cancelDrag);
_this._drag=null;
_this.setState({drag:null});
};_this.

startPartyDrag=function(uid,fromIdx,e){
_this._startDrag({
source:{kind:'party',uid:uid,fromIdx:fromIdx},
overPartyIdx:fromIdx,
overBox:false,
clientX:e.clientX,
clientY:e.clientY,
startX:e.clientX,
startY:e.clientY,
active:false
});
};_this.

startBoxDrag=function(uid,e){
var game=_this.props.game;
if(game.boxDisabled||game.party.length>=6)return;
e.preventDefault();
e.stopPropagation();
_this._startDrag({
source:{kind:'box',uid:uid},
overPartyIdx:game.party.length,
overBox:false,
clientX:e.clientX,
clientY:e.clientY,
startX:e.clientX,
startY:e.clientY,
active:false
});
};_this.

onDragMove=function(e){
var drag=_this._drag;
if(!drag)return;
e.preventDefault();
var dx=e.clientX-drag.startX;
var dy=e.clientY-drag.startY;
var nowActive=drag.active||Math.hypot(dx,dy)>5;
var overPartyIdx=nowActive?_this.computeOverPartyIdx(e.clientY):drag.overPartyIdx;
var overBox=nowActive&&drag.source.kind==='party'&&_this.isOverBox(e.clientX,e.clientY);
_this._drag=Object.assign({},drag,{overPartyIdx:overPartyIdx,overBox:overBox,clientX:e.clientX,clientY:e.clientY,active:nowActive});
_this.setState({drag:_this._drag});
};_this.

onDragEnd=function(_e){
document.removeEventListener('pointermove',_this.onDragMove);
document.removeEventListener('pointerup',_this.onDragEnd);
document.removeEventListener('pointercancel',_this.cancelDrag);
var drag=_this._drag;
_this._drag=null;
_this.setState({drag:null});
if(!(drag!=null&&drag.active))return;
_this._dragJustEnded=true;
setTimeout(function(){_this._dragJustEnded=false;},50);

var game=_this.props.game;
if(drag.source.kind==='party'){
if(drag.overBox){
PS.send("/nuzlocke removefromparty "+drag.source.uid);
}else{
var fromIdx=drag.source.fromIdx;
var toIdx=drag.overPartyIdx;
if(fromIdx!==toIdx){
var newParty=[].concat(game.party);
var _newParty$splice=newParty.splice(fromIdx,1),moved=_newParty$splice[0];
newParty.splice(toIdx,0,moved);
PS.send("/nuzlocke partyreorder "+newParty.join(' '));
}
}
}else{
if(!drag.overBox){
var _newParty=[].concat(game.party);
_newParty.splice(drag.overPartyIdx,0,drag.source.uid);
PS.send("/nuzlocke partyreorder "+_newParty.slice(0,6).join(' '));
}
}
};_this.

computeOverPartyIdx=function(clientY){
var partyLen=_this.props.game.party.length;
var slots=document.querySelectorAll('.nz-tb-party-col .nz-party-slot:not(.nz-party-slot-empty), .nz-tb-mobile-party-list .nz-party-slot:not(.nz-party-slot-empty)');
var overIdx=partyLen;
for(var i=0;i<slots.length;i++){
var rect=slots[i].getBoundingClientRect();
if(clientY<rect.top+rect.height/2){
overIdx=i;
break;
}
}
return Math.max(0,Math.min(overIdx,partyLen));
};_this.

isOverBox=function(clientX,clientY){
var boxScroll=document.querySelector('.nz-tb-box-col .nz-tb-col-scroll, .nz-tb-mobile-box-grid');
if(!boxScroll)return false;
var rect=boxScroll.getBoundingClientRect();
return clientX>=rect.left&&clientX<=rect.right&&clientY>=rect.top&&clientY<=rect.bottom;
};_this.

dismissTeambuildingTutorial=function(){
try{var _localStorage$getItem;
var key="nuzlocke_tutorial_"+(PS.user.userid||PS.user.name);
var seen=JSON.parse((_localStorage$getItem=localStorage.getItem(key))!=null?_localStorage$getItem:'{}');
seen.teambuilding=true;
localStorage.setItem(key,JSON.stringify(seen));
}catch(_unused){}
_this.setState({showTutorial:false});
};_this.








































select=function(uid){
if(_this._dragJustEnded)return;
_this.setState({selectedUid:uid,selectedOpponent:null,activeTab:'moves'});
};_this.

selectMobileTeamSlot=function(uid){
if(_this._dragJustEnded)return;
_this.setState({selectedUid:uid,selectedOpponent:null,activeTab:'moves',mobileTab:'loadout'});
};_this.

selectOpponent=function(battleIdx,slotIdx){return _this.setState({selectedOpponent:{battleIdx:battleIdx,slotIdx:slotIdx},selectedUid:null,mobileTab:'vs'});};_this.

setMove=function(uid,slot,value){
_this.setState(function(s){var _s$moves$uid,_Object$assign;
var moves=Object.assign({},s.moves,(_Object$assign={},_Object$assign[uid]=[].concat((_s$moves$uid=s.moves[uid])!=null?_s$moves$uid:['','','','']),_Object$assign));
moves[uid][slot]=value;
return{moves:moves};
});
};_this.

setItem=function(uid,value){
_this.setState(function(s){var _Object$assign2;return{heldItems:Object.assign({},s.heldItems,(_Object$assign2={},_Object$assign2[uid]=value,_Object$assign2))};});
};_this.


















clickBattle=function(){
var errors=_this.validate();
if(Object.keys(errors).length>0){
_this.setState({errors:errors,mobileTab:'loadout'});
return;
}
var game=_this.props.game;
var heldItems=_this.state.heldItems;
var heldSet=new Set(Object.values(heldItems).filter(Boolean));
var partyMissingItem=game.party.some(function(uid){return!heldItems[uid];});
var itemsAvailable=game.holdableItems.some(function(i){return!heldSet.has(i.id);});
if(partyMissingItem&&itemsAvailable){
_this.setState({showItemWarning:true});
return;
}
_this.commitBattle();
};_this.

commitBattle=function(){
var game=_this.props.game;
var _this$state=_this.state,moves=_this$state.moves,heldItems=_this$state.heldItems;

var parts=game.box.filter(function(p){return p.alive;}).map(function(p){var _moves$uid;
var uid=p.uid;
var m=((_moves$uid=moves[uid])!=null?_moves$uid:[]).filter(Boolean).concat(['','','','']).slice(0,4).join(',');
var item=heldItems[uid]||'none';
return uid+" "+m+" "+item;
}).join(' ');
PS.send("/nuzlocke battlewithmoves "+parts);
};return _this;}_inheritsLoose(TeambuildingScreen,_preact$Component);var _proto=TeambuildingScreen.prototype;_proto.componentDidMount=function componentDidMount(){try{var _localStorage$getItem2;var key="nuzlocke_tutorial_"+(PS.user.userid||PS.user.name);var seen=JSON.parse((_localStorage$getItem2=localStorage.getItem(key))!=null?_localStorage$getItem2:'{}');if(!seen.teambuilding)this.setState({showTutorial:true});}catch(_unused2){}};_proto.componentWillUnmount=function componentWillUnmount(){this.cancelDrag();};_proto._startDrag=function _startDrag(initialState){this._drag=initialState;this.setState({drag:this._drag});document.addEventListener('pointermove',this.onDragMove);document.addEventListener('pointerup',this.onDragEnd);document.addEventListener('pointercancel',this.cancelDrag);};TeambuildingScreen.getDerivedStateFromProps=function getDerivedStateFromProps(props,state){var moves=Object.assign({},state.moves);var heldItems=Object.assign({},state.heldItems);var changed=false;props.game.box.filter(function(p){return p.alive;}).forEach(function(p){var uid=p.uid;var serverMoves=p.moves.map(function(m){return toID(m);});if(!(uid in moves)){moves[uid]=[].concat(serverMoves,['','','','']).slice(0,4);changed=true;}else{var serverFilled=serverMoves.filter(Boolean).length;var localFilled=moves[uid].filter(Boolean).length;if(serverFilled>localFilled){moves[uid]=[].concat(serverMoves,['','','','']).slice(0,4);changed=true;}}if(!(uid in heldItems)){heldItems[uid]=toID(p.item);changed=true;}});var selectedUid=state.selectedUid;if(!selectedUid){var _ref,_props$game$party$,_props$game$box$find;var defaultUid=(_ref=(_props$game$party$=props.game.party[0])!=null?_props$game$party$:(_props$game$box$find=props.game.box.find(function(p){return p.alive&&!props.game.party.includes(p.uid);}))==null?void 0:_props$game$box$find.uid)!=null?_ref:null;if(defaultUid){selectedUid=defaultUid;changed=true;}}return changed?{moves:moves,heldItems:heldItems,selectedUid:selectedUid}:null;};_proto.validate=function validate(){var game=this.props.game;var moves=this.state.moves;var errors={};for(var _i2=0,_game$party2=game.party;_i2<_game$party2.length;_i2++){var _moves$uid2;var uid=_game$party2[_i2];var selected=((_moves$uid2=moves[uid])!=null?_moves$uid2:[]).filter(Boolean);if(selected.length===0){errors[uid]='Must have at least 1 move.';continue;}if(new Set(selected).size!==selected.length){errors[uid]='Duplicate moves selected.';}}return errors;};_proto.



renderMobilePartyStrip=function renderMobilePartyStrip(){var _this2=this;
var game=this.props.game;
var _this$state2=this.state,selectedUid=_this$state2.selectedUid,heldItems=_this$state2.heldItems,errors=_this$state2.errors;

return preact.h("div",{"class":"nz-tb-mobile-strip"},
[0,1,2,3,4,5].map(function(i){var _game$box$find,_heldItems$pok$uid,_Dex$items$get$name,_Dex$items$get;
var uid=game.party[i];
var pok=uid?(_game$box$find=game.box.find(function(p){return p.uid===uid;}))!=null?_game$box$find:null:null;
if(!pok){
return preact.h("div",{key:i,"class":"nz-tb-strip-slot nz-tb-strip-slot-empty"},"\u2014");
}
var held=(_heldItems$pok$uid=heldItems[pok.uid])!=null?_heldItems$pok$uid:'';
var heldId=held?toID((_Dex$items$get$name=(_Dex$items$get=Dex.items.get(held))==null?void 0:_Dex$items$get.name)!=null?_Dex$items$get$name:held):'';
return preact.h("div",{
key:pok.uid,
"class":"nz-tb-strip-slot"+(selectedUid===pok.uid?' nz-tb-strip-slot-selected':'')+(errors[pok.uid]?' nz-tb-strip-slot-error':''),
title:pok.nickname,
onClick:function(){return _this2.select(pok.uid);}},

preact.h(NzSprite,{species:pok.species,size:36}),
preact.h("div",{"class":"nz-tb-strip-types"},
preact.h(NzTypeBadges,{species:pok.species,generation:game.generation})
),
heldId?
preact.h("span",{"class":"itemicon "+heldId+" nz-tb-strip-item"}):
preact.h("span",{"class":"nz-tb-strip-item-empty"})

);
})
);
};_proto.

renderMobileLoadout=function renderMobileLoadout(){var _game$box$find2,_game$legalMoves$sele,_moves$selectedPokemo,_game$availableEvolut,_this3=this,_heldItems$selectedPo;
var game=this.props.game;
var _this$state3=this.state,moves=_this$state3.moves,heldItems=_this$state3.heldItems,errors=_this$state3.errors,selectedUid=_this$state3.selectedUid,statsCollapsed=_this$state3.statsCollapsed;
var segment=game.segment;

var selectedPokemon=selectedUid?(_game$box$find2=game.box.find(function(p){return p.uid===selectedUid;}))!=null?_game$box$find2:null:null;
var isInParty=selectedUid?game.party.includes(selectedUid):false;
var legalMoves=selectedPokemon?(_game$legalMoves$sele=game.legalMoves[selectedPokemon.uid])!=null?_game$legalMoves$sele:[]:[];
var selectedMoves=selectedPokemon?(_moves$selectedPokemo=moves[selectedPokemon.uid])!=null?_moves$selectedPokemo:['','','','']:['','','',''];
var evos=selectedPokemon?(_game$availableEvolut=game.availableEvolutions[selectedPokemon.uid])!=null?_game$availableEvolut:[]:[];
var error=selectedPokemon&&isInParty?errors[selectedPokemon.uid]:undefined;

var infoBlock=null;
var statsPair=null;
if(selectedPokemon){var _BattleNatures;
var sp=Dex.forGen(game.generation).species.get(selectedPokemon.species);
var nat=(_BattleNatures=BattleNatures[selectedPokemon.nature])!=null?_BattleNatures:{};
var natureQuality=sp!=null&&sp.exists?calcNatureQuality(nat,sp.baseStats):'neutral';
var ivScore=sp!=null&&sp.exists&&selectedPokemon.ivs?calcIvScore(selectedPokemon.ivs,sp.baseStats):0;
var ivPct=Math.round(ivScore*100);
var ivTier=ivPct>=62?'high':ivPct>=50?'mid':ivPct>=38?'low':'poor';
var ivLabel=ivTier==='high'?'Great':ivTier==='mid'?'Good':ivTier==='low'?'Fair':'Poor';
var combinedPct=sp!=null&&sp.exists?calcCombinedPercentile(ivScore,natureQuality,sp.baseStats):null;
var topPercentile=combinedPct!==null&&combinedPct<=0.05?combinedPct:null;
var worsePercentile=combinedPct!==null&&combinedPct>=0.95?combinedPct:null;

infoBlock=preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-tb-detail-header"},
preact.h("div",{"class":"nz-tb-detail-sprite"},
preact.h(NzSprite,{species:selectedPokemon.species,size:60})
),
preact.h("div",{"class":"nz-tb-detail-info"},
preact.h("div",{"class":"nz-card-nickname"},
preact.h("span",null,selectedPokemon.nickname),
topPercentile&&preact.h("span",{"class":"nz-tb-percentile-badge nz-tb-percentile-top"},"Top ",formatTopPct(topPercentile)),
worsePercentile&&preact.h("span",{"class":"nz-tb-percentile-badge nz-tb-percentile-worse"},"Bottom ",formatTopPct(worsePercentile))
),
selectedPokemon.nickname!==selectedPokemon.species&&
preact.h("div",{"class":"nz-card-species"},selectedPokemon.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",segment.levelCap),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:selectedPokemon.species,generation:game.generation}))
)
),
preact.h("div",{"class":"nz-tb-nature-ability"},
preact.h("div",{"class":"nz-tb-nature-col"},
preact.h("div",{"class":"nz-card-nature",style:"display:flex;align-items:center;gap:6px"},
preact.h("span",null,selectedPokemon.nature),
natureQuality!=='neutral'&&
preact.h("span",{"class":"nz-nature-quality nz-nature-quality-"+natureQuality},natureQuality)

),
nat.plus&&nat.minus?
preact.h("div",{"class":"nz-card-subdesc"},"+",nat.plus.toUpperCase()," \u2212",nat.minus.toUpperCase()):
preact.h("div",{"class":"nz-card-subdesc"},"Neutral")

),
preact.h("div",{"class":"nz-tb-ability-col"},
preact.h("div",{"class":"nz-card-nature"},selectedPokemon.ability),
function(){
var desc=Dex.forGen(game.generation).abilities.get(selectedPokemon.ability).shortDesc;
return desc?preact.h("div",{"class":"nz-card-subdesc"},desc):null;
}()
)
)
);

statsPair=preact.h(NzStatPair,{species:selectedPokemon.species,nature:selectedPokemon.nature,generation:game.generation,ivs:selectedPokemon.ivs,ivsExtra:selectedPokemon.ivs&&ivLabel!=='Fair'?preact.h("span",{"class":"nz-iv-score nz-iv-score-"+ivTier},ivLabel):undefined});
}

return preact.h("div",{"class":"nz-tb-mobile-tab nz-tb-mobile-loadout"},
this.renderMobilePartyStrip(),

!selectedPokemon?
preact.h("div",{"class":"nz-tb-detail-empty"},preact.h("p",{"class":"nz-notice"},"Tap a party slot above to edit")):
preact.h(preact.Fragment,null,
infoBlock,

preact.h("button",{
"class":"nz-tb-mobile-section nz-tb-mobile-section-toggle"+(statsCollapsed?'':' nz-tb-mobile-section-open'),
onClick:function(){return _this3.setState(function(s){return{statsCollapsed:!s.statsCollapsed};});}},
"Stats ",
statsCollapsed?'▸':'▾'
),
!statsCollapsed&&statsPair,

error&&preact.h("div",{"class":"nz-card-error",style:"margin-bottom:8px;"},"\u26A0 ",error),

preact.h("div",{"class":"nz-tb-mobile-section"},"Moves"),
preact.h(NzMovePanel,{
moves:selectedMoves,
legalMoves:legalMoves,
generation:game.generation,
onChange:function(newMoves){
newMoves.forEach(function(id,slot){return _this3.setMove(selectedPokemon.uid,slot,id);});
}}
),

isInParty&&preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-tb-mobile-section"},"Held Item"),
preact.h(NzItemTable,{
value:(_heldItems$selectedPo=heldItems[selectedPokemon.uid])!=null?_heldItems$selectedPo:'',
items:game.holdableItems,
onChange:function(id){return _this3.setItem(selectedPokemon.uid,id);}}
)
),

evos.length>0&&preact.h("div",{"class":"nz-tb-detail-evos",style:"margin-top:10px;"},
evos.map(function(evo){return(
preact.h(NzBtn,{key:evo.species,size:"sm",variant:"evolve",
onClick:function(){return PS.send("/nuzlocke evolve "+selectedPokemon.uid+" "+toID(evo.species));}},
evo.type==='item'?"Evolve \u2192 "+
evo.species+" ("+evo.item+")":
selectedPokemon.species==='Nincada'&&evo.species==='Ninjask'?
'Evolve → Ninjask (+Shedinja)':"Evolve \u2192 "+
evo.species
));}
)
)
)

);
};_proto.

renderMobileTeam=function renderMobileTeam(){var _this4=this;
var game=this.props.game;
var _this$state4=this.state,selectedUid=_this$state4.selectedUid,drag=_this$state4.drag;
var isDragging=!!(drag!=null&&drag.active);
var dragUid=isDragging?drag.source.uid:null;
var boxDisabled=game.boxDisabled;
var segment=game.segment;
var partyPokemon=game.party.map(function(uid){return game.box.find(function(p){return p.uid===uid;});}).filter(Boolean);
var boxOnly=game.box.filter(function(p){return p.alive&&!game.party.includes(p.uid);});

return preact.h("div",{"class":"nz-tb-mobile-tab nz-tb-mobile-team"},
preact.h("div",{"class":"nz-section-title"},"Party (",partyPokemon.length,"/6)"),
preact.h("div",{"class":"nz-tb-mobile-party-list"+(isDragging&&drag.overBox?' nz-party-col-drop-box':'')},
[0,1,2,3,4,5].map(function(i){
var pok=partyPokemon[i];
var isLast=i===partyPokemon.length-1;
var dropIndicator=isDragging&&!drag.overBox?
drag.overPartyIdx===i?'before':
isLast&&drag.overPartyIdx>=partyPokemon.length?'after':
null:
null;
if(pok){var _game$availableEvolut2,_this4$state$heldItem;
return preact.h(NzPartySlot,{
key:pok.uid,
pokemon:pok,
levelCap:segment.levelCap,
generation:game.generation,
selected:selectedUid===pok.uid,
isDragging:isDragging&&pok.uid===dragUid,
dropIndicator:dropIndicator,
onSelect:function(){return _this4.selectMobileTeamSlot(pok.uid);},
onDragPointerDown:function(e){return _this4.startPartyDrag(pok.uid,i,e);},
hasError:!!_this4.state.errors[pok.uid],
canEvolve:!!((_game$availableEvolut2=game.availableEvolutions[pok.uid])!=null&&_game$availableEvolut2.length),
heldItem:(_this4$state$heldItem=_this4.state.heldItems[pok.uid])!=null?_this4$state$heldItem:''}
);
}
return preact.h("div",{key:i,"class":"nz-party-slot nz-party-slot-empty"},"\u2014 empty \u2014");
})
),

preact.h("div",{"class":"nz-section-title",style:"margin-top:12px;"},"Box (",
boxOnly.length,")",
boxDisabled&&preact.h("span",{"class":"nz-tb-hint"},"locked during battle sequence")
),
preact.h("div",{"class":"nz-tb-mobile-box-grid"+(isDragging&&drag.overBox?' nz-box-drop-target':'')},
boxOnly.map(function(mon){var _game$availableEvolut3;return(
preact.h("div",{
key:mon.uid,
"class":"nz-tb-box-card"+(selectedUid===mon.uid?' nz-tb-box-card-selected':'')+((_game$availableEvolut3=game.availableEvolutions[mon.uid])!=null&&_game$availableEvolut3.length?' nz-tb-box-card-evolve':'')+(boxDisabled?' nz-tb-box-card-disabled':'')+(isDragging&&mon.uid===dragUid?' nz-tb-box-card-dragging':''),
onClick:function(){return!isDragging&&_this4.selectMobileTeamSlot(mon.uid);},
onPointerDown:!boxDisabled&&game.party.length<6?function(e){return _this4.startBoxDrag(mon.uid,e);}:undefined},

preact.h(NzSprite,{species:mon.species,size:40}),
preact.h("div",{"class":"nz-tb-box-card-name"},mon.nickname)
));}
)
)
);
};_proto.

renderMobileVs=function renderMobileVs(){var _remainingBattles$sel,_battle$trainer,_this5=this;
var game=this.props.game;
var selectedOpponent=this.state.selectedOpponent;
var segment=game.segment;
var battle=segment.battles[game.currentBattleIndex];
var remainingBattles=segment.battles.slice(game.currentBattleIndex);

var selectedOppPokemon=selectedOpponent!==null?(_remainingBattles$sel=
remainingBattles[selectedOpponent.battleIdx])==null?void 0:_remainingBattles$sel.team[selectedOpponent.slotIdx]:
null;

return preact.h("div",{"class":"nz-tb-mobile-tab nz-tb-mobile-vs"},
preact.h("div",{"class":"nz-section-title nz-section-title-danger"},"vs. ",(_battle$trainer=battle==null?void 0:battle.trainer)!=null?_battle$trainer:'Opponent'),
preact.h("div",{"class":"nz-tb-mobile-opp-list"},
remainingBattles.map(function(b,bi){return preact.h(preact.Fragment,{key:bi},
bi>0&&preact.h("div",{"class":"nz-section-title nz-section-title-danger",style:"margin-top:12px;"},"vs. ",b.trainer),
b.team.map(function(opp,i){return(
preact.h(NzOpponentSlot,{
key:bi+"-"+i,
pokemon:opp,
generation:game.generation,
selected:(selectedOpponent==null?void 0:selectedOpponent.battleIdx)===bi&&(selectedOpponent==null?void 0:selectedOpponent.slotIdx)===i,
onSelect:function(){return _this5.selectOpponent(bi,i);}}
));}
)
);})
),

selectedOppPokemon&&function(){
var opp=selectedOppPokemon;
return preact.h("div",{"class":"nz-tb-mobile-opp-detail"},
preact.h("div",{"class":"nz-tb-detail-header",style:"margin-bottom:10px;"},
preact.h("div",{"class":"nz-tb-detail-sprite"},
preact.h(NzSprite,{species:opp.species,size:60})
),
preact.h("div",{"class":"nz-tb-detail-info"},
preact.h("div",{"class":"nz-card-nickname"},opp.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",opp.level),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:opp.species,generation:game.generation})),
preact.h("div",{"class":"nz-card-nature"},opp.ability),
function(){
var desc=Dex.forGen(game.generation).abilities.get(opp.ability).shortDesc;
return desc?preact.h("div",{"class":"nz-card-subdesc"},desc):null;
}()
)
),

preact.h("div",{"class":"nz-moves-grid"},
preact.h("span",{"class":"nz-moves-col-header"},"Move"),
preact.h("span",{"class":"nz-moves-col-header"},"Type"),
preact.h("span",{"class":"nz-moves-col-header"},"Cat"),
preact.h("span",{"class":"nz-moves-col-header"},"BP"),
preact.h("span",{"class":"nz-moves-col-header"},"Acc"),
preact.h("span",{"class":"nz-moves-col-header"},"Target"),
preact.h("span",{"class":"nz-moves-col-header"},"Effect"),
opp.moves.map(function(moveId,i){var _shortDesc;
var move=moveId?Dex.forGen(game.generation).moves.get(moveId):null;
var ex=!!(move!=null&&move.exists);
var cat=ex?move.category:'';
var power=ex&&move.basePower>0?""+move.basePower:ex?'—':'';
var acc=ex?move.accuracy===true?'—':move.accuracy+"%":'';
return preact.h(preact.Fragment,{key:i},
preact.h("div",{"class":"nz-tb-move-name"},ex?move.name:moveId||'—'),
ex?preact.h("span",{"class":"nz-type nz-type-"+move.type.toLowerCase()},move.type):preact.h("span",null),
ex?preact.h("span",{"class":"nz-move-cat nz-move-cat-"+move.category.toLowerCase()},cat):preact.h("span",null),
preact.h("span",{"class":ex?'nz-move-stat':''},power),
preact.h("span",{"class":ex?'nz-move-stat':''},acc),
preact.h("span",{"class":"nz-move-stat"},ex?formatTarget(move.target):''),
preact.h("span",{"class":"nz-move-grid-desc"},ex?(_shortDesc=move.shortDesc)!=null?_shortDesc:'':'')
);
})
),

opp.item&&function(){
var item=Dex.forGen(game.generation).items.get(opp.item);
return preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-label",style:"margin-top:12px;margin-bottom:5px;"},"Held Item"),
preact.h("div",{"class":"nz-move-slot"},
preact.h("div",{"class":"nz-tb-move-name"},item.exists?item.name:opp.item),
item.exists&&item.shortDesc&&preact.h("div",{"class":"nz-item-desc"},item.shortDesc)
)
);
}()
);
}()
);
};_proto.

render=function render(){var _game$box$find3,_remainingBattles$sel2,_this6=this,_battle$trainer2;
var game=this.props.game;
var _this$state5=this.state,moves=_this$state5.moves,heldItems=_this$state5.heldItems,errors=_this$state5.errors,selectedUid=_this$state5.selectedUid,selectedOpponent=_this$state5.selectedOpponent,drag=_this$state5.drag,showItemWarning=_this$state5.showItemWarning,mobileTab=_this$state5.mobileTab;
var isDragging=!!(drag!=null&&drag.active);
var dragUid=isDragging?drag.source.uid:null;
var boxDisabled=game.boxDisabled;
var segment=game.segment;
var battle=segment.battles[game.currentBattleIndex];
var remainingBattles=segment.battles.slice(game.currentBattleIndex);
var partyPokemon=game.party.map(function(uid){return game.box.find(function(p){return p.uid===uid;});}).filter(Boolean);
var boxOnly=game.box.filter(function(p){return p.alive&&!game.party.includes(p.uid);});

var evolveAllCount=game.box.filter(function(p){return p.alive;}).filter(function(p){var _game$availableEvolut4;
var evos=((_game$availableEvolut4=game.availableEvolutions[p.uid])!=null?_game$availableEvolut4:[]).filter(function(e){return e.item===null;});
return evos.length===1;
}).length;

var selectedPokemon=selectedUid?(_game$box$find3=game.box.find(function(p){return p.uid===selectedUid;}))!=null?_game$box$find3:null:null;
var isInParty=selectedUid?game.party.includes(selectedUid):false;
var hasErrors=Object.keys(errors).length>0;

var selectedOppPokemon=selectedOpponent!==null?(_remainingBattles$sel2=
remainingBattles[selectedOpponent.battleIdx])==null?void 0:_remainingBattles$sel2.team[selectedOpponent.slotIdx]:
null;


var detailContent;
if(selectedOppPokemon){

var opp=selectedOppPokemon;
detailContent=preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-tb-info-stats"},
preact.h("div",{"class":"nz-tb-detail-header"},
preact.h("div",{"class":"nz-tb-detail-sprite"},
preact.h(NzSprite,{species:opp.species,size:60})
),
preact.h("div",{"class":"nz-tb-detail-info"},
preact.h("div",{"class":"nz-card-nickname"},opp.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",opp.level),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:opp.species,generation:this.props.game.generation})),
preact.h("div",{"class":"nz-card-nature"},opp.ability),
function(){
var desc=Dex.forGen(_this6.props.game.generation).abilities.get(opp.ability).shortDesc;
return desc?preact.h("div",{"class":"nz-card-subdesc"},desc):null;
}()
)
),
preact.h(NzStatPair,{species:opp.species,generation:this.props.game.generation})
),

preact.h("div",{"class":"nz-moves-grid"},
preact.h("span",{"class":"nz-moves-col-header"},"Move"),
preact.h("span",{"class":"nz-moves-col-header"},"Type"),
preact.h("span",{"class":"nz-moves-col-header"},"Cat"),
preact.h("span",{"class":"nz-moves-col-header"},"BP"),
preact.h("span",{"class":"nz-moves-col-header"},"Acc"),
preact.h("span",{"class":"nz-moves-col-header"},"Target"),
preact.h("span",{"class":"nz-moves-col-header"},"Effect"),
opp.moves.map(function(moveId,i){var _shortDesc2;
var move=moveId?Dex.forGen(_this6.props.game.generation).moves.get(moveId):null;
var ex=!!(move!=null&&move.exists);
var cat=ex?move.category:'';
var power=ex&&move.basePower>0?""+move.basePower:ex?'—':'';
var acc=ex?move.accuracy===true?'—':move.accuracy+"%":'';
return preact.h(preact.Fragment,{key:i},
preact.h("div",{"class":"nz-tb-move-name"},ex?move.name:moveId||'—'),
ex?preact.h("span",{"class":"nz-type nz-type-"+move.type.toLowerCase()},move.type):preact.h("span",null),
ex?preact.h("span",{"class":"nz-move-cat nz-move-cat-"+move.category.toLowerCase()},cat):preact.h("span",null),
preact.h("span",{"class":ex?'nz-move-stat':''},power),
preact.h("span",{"class":ex?'nz-move-stat':''},acc),
preact.h("span",{"class":"nz-move-stat"},ex?formatTarget(move.target):''),
preact.h("span",{"class":"nz-move-grid-desc"},ex?(_shortDesc2=move.shortDesc)!=null?_shortDesc2:'':'')
);
})
),

opp.item&&function(){
var item=Dex.forGen(_this6.props.game.generation).items.get(opp.item);
return preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-label",style:"margin-top:12px;margin-bottom:5px;"},"Held Item"),
preact.h("div",{"class":"nz-move-slot"},
preact.h("div",{"class":"nz-tb-move-name"},item.exists?item.name:opp.item),
item.exists&&item.shortDesc&&preact.h("div",{"class":"nz-item-desc"},item.shortDesc)
)
);
}()
);
}else if(!selectedPokemon){
detailContent=preact.h("div",{"class":"nz-tb-detail-empty"},
preact.h("p",{"class":"nz-notice"},"Select a Pok\xE9mon to edit")
);
}else{var _game$legalMoves$sele2,_moves$selectedPokemo2,_game$availableEvolut5,_BattleNatures2,_heldItems$selectedPo2;
var legalMoves=(_game$legalMoves$sele2=game.legalMoves[selectedPokemon.uid])!=null?_game$legalMoves$sele2:[];
var selectedMoves=(_moves$selectedPokemo2=moves[selectedPokemon.uid])!=null?_moves$selectedPokemo2:['','','',''];
var evos=(_game$availableEvolut5=game.availableEvolutions[selectedPokemon.uid])!=null?_game$availableEvolut5:[];
var error=isInParty?errors[selectedPokemon.uid]:undefined;

var sp=Dex.forGen(this.props.game.generation).species.get(selectedPokemon.species);
var nat=(_BattleNatures2=BattleNatures[selectedPokemon.nature])!=null?_BattleNatures2:{};
var natureQuality=sp!=null&&sp.exists?calcNatureQuality(nat,sp.baseStats):'neutral';
var ivScore=sp!=null&&sp.exists&&selectedPokemon.ivs?calcIvScore(selectedPokemon.ivs,sp.baseStats):0;
var ivPct=Math.round(ivScore*100);
var ivTier=ivPct>=62?'high':ivPct>=50?'mid':ivPct>=38?'low':'poor';
var ivLabel=ivTier==='high'?'Great':ivTier==='mid'?'Good':ivTier==='low'?'Fair':'Poor';

var combinedPct=sp!=null&&sp.exists?calcCombinedPercentile(ivScore,natureQuality,sp.baseStats):null;
var topPercentile=combinedPct!==null&&combinedPct<=0.05?combinedPct:null;
var worsePercentile=combinedPct!==null&&combinedPct>=0.95?combinedPct:null;

detailContent=preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-tb-info-stats"},
preact.h("div",{"class":"nz-tb-left-col"},
preact.h("div",{"class":"nz-tb-detail-header"},
preact.h("div",{"class":"nz-tb-detail-sprite"},
preact.h(NzSprite,{species:selectedPokemon.species,size:60})
),
preact.h("div",{"class":"nz-tb-detail-info"},
preact.h("div",{"class":"nz-card-nickname"},
preact.h("span",null,selectedPokemon.nickname),
topPercentile&&preact.h("span",{"class":"nz-tb-percentile-badge nz-tb-percentile-top"},"Top ",formatTopPct(topPercentile)),
worsePercentile&&preact.h("span",{"class":"nz-tb-percentile-badge nz-tb-percentile-worse"},"Bottom ",formatTopPct(worsePercentile))
),
selectedPokemon.nickname!==selectedPokemon.species&&
preact.h("div",{"class":"nz-card-species"},selectedPokemon.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",segment.levelCap),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:selectedPokemon.species,generation:this.props.game.generation}))
)
),
preact.h("div",{"class":"nz-tb-nature-ability"},
preact.h("div",{"class":"nz-tb-nature-col"},
preact.h("div",{"class":"nz-card-nature",style:"display:flex;align-items:center;gap:6px"},
preact.h("span",null,selectedPokemon.nature),
natureQuality!=='neutral'&&
preact.h("span",{"class":"nz-nature-quality nz-nature-quality-"+natureQuality},natureQuality)

),
nat.plus&&nat.minus?
preact.h("div",{"class":"nz-card-subdesc"},"+",nat.plus.toUpperCase()," \u2212",nat.minus.toUpperCase()):
preact.h("div",{"class":"nz-card-subdesc"},"Neutral")

),
preact.h("div",{"class":"nz-tb-ability-col"},
preact.h("div",{"class":"nz-card-nature"},selectedPokemon.ability),
function(){
var desc=Dex.forGen(_this6.props.game.generation).abilities.get(selectedPokemon.ability).shortDesc;
return desc?preact.h("div",{"class":"nz-card-subdesc"},desc):null;
}()
)
)
),
preact.h(NzStatPair,{species:selectedPokemon.species,nature:selectedPokemon.nature,generation:this.props.game.generation,ivs:selectedPokemon.ivs,ivsExtra:selectedPokemon.ivs&&ivLabel!=='Fair'?preact.h("span",{"class":"nz-iv-score nz-iv-score-"+ivTier},ivLabel):undefined})
),

error&&preact.h("div",{"class":"nz-card-error",style:"margin-bottom:8px;"},"\u26A0 ",error),

preact.h("div",{"class":"nz-tb-tabs"},
preact.h("button",{
"class":"nz-tb-tab"+(this.state.activeTab==='moves'||!isInParty?' nz-tb-tab--active':''),
onClick:function(){return _this6.setState({activeTab:'moves'});}},
"Moves"),
isInParty&&preact.h("button",{
"class":"nz-tb-tab"+(this.state.activeTab==='items'?' nz-tb-tab--active':''),
onClick:function(){return _this6.setState({activeTab:'items'});}},
"Items")
),

(this.state.activeTab==='moves'||!isInParty)&&preact.h(NzMovePanel,{
moves:selectedMoves,
legalMoves:legalMoves,
generation:this.props.game.generation,
onChange:function(newMoves){
newMoves.forEach(function(id,slot){return _this6.setMove(selectedPokemon.uid,slot,id);});
}}
),

this.state.activeTab==='items'&&isInParty&&preact.h(NzItemTable,{
value:(_heldItems$selectedPo2=heldItems[selectedPokemon.uid])!=null?_heldItems$selectedPo2:'',
items:game.holdableItems,
onChange:function(id){return _this6.setItem(selectedPokemon.uid,id);}}
),

preact.h("div",{"class":"nz-tb-detail-actions"},
preact.h("div",null,
boxDisabled?null:isInParty?
preact.h(NzBtn,{size:"sm",variant:"danger",
onClick:function(){return PS.send("/nuzlocke removefromparty "+selectedPokemon.uid);}},"Remove from Party"

):
game.party.length<6?
preact.h(NzBtn,{size:"sm",variant:"secondary",
onClick:function(){return PS.send("/nuzlocke addtoparty "+selectedPokemon.uid);}},"Add to Party"

):
null

),
evos.length>0&&preact.h("div",{"class":"nz-tb-detail-evos"},
evos.map(function(evo){return(
preact.h(NzBtn,{key:evo.species,size:"sm",variant:"evolve",
onClick:function(){return PS.send("/nuzlocke evolve "+selectedPokemon.uid+" "+toID(evo.species));}},
evo.type==='item'?"Evolve \u2192 "+
evo.species+" ("+evo.item+")":
selectedPokemon.species==='Nincada'&&evo.species==='Ninjask'?
'Evolve → Ninjask (+Shedinja)':"Evolve \u2192 "+
evo.species
));}
)
)
)
);
}


return preact.h(NzScreen,null,

preact.h("div",{"class":"nz-tb-layout"},


preact.h("div",{"class":"nz-tb-detail"+(selectedOpponent!==null?' nz-tb-detail-opponent':'')},
detailContent
),


preact.h("div",{"class":"nz-tb-columns"},

preact.h("div",{"class":"nz-tb-party-col"},
preact.h("div",{"class":"nz-section-title"},"Party (",partyPokemon.length,"/6)"),
preact.h("div",{"class":"nz-tb-col-scroll"+(isDragging&&drag.overBox?' nz-party-col-drop-box':'')},
[0,1,2,3,4,5].map(function(i){
var pok=partyPokemon[i];
var isLast=i===partyPokemon.length-1;
var dropIndicator=isDragging&&!drag.overBox?
drag.overPartyIdx===i?'before':
isLast&&drag.overPartyIdx>=partyPokemon.length?'after':
null:
null;
if(pok){var _game$availableEvolut6,_heldItems$pok$uid2;
return preact.h(NzPartySlot,{
key:pok.uid,
pokemon:pok,
levelCap:segment.levelCap,
generation:_this6.props.game.generation,
selected:selectedUid===pok.uid,
isDragging:isDragging&&pok.uid===dragUid,
dropIndicator:dropIndicator,
onSelect:function(){return _this6.select(pok.uid);},
onDragPointerDown:function(e){return _this6.startPartyDrag(pok.uid,i,e);},
hasError:!!errors[pok.uid],
canEvolve:!!((_game$availableEvolut6=game.availableEvolutions[pok.uid])!=null&&_game$availableEvolut6.length),
heldItem:(_heldItems$pok$uid2=heldItems[pok.uid])!=null?_heldItems$pok$uid2:''}
);
}
return preact.h("div",{key:i,"class":"nz-party-slot nz-party-slot-empty"},"\u2014 empty \u2014");
})
)
),

preact.h("div",{"class":"nz-tb-box-col"},
preact.h("div",{"class":"nz-section-title"},"Box (",
boxOnly.length,")",
boxDisabled&&preact.h("span",{"class":"nz-tb-hint"},"locked during battle sequence")
),
preact.h("div",{"class":"nz-tb-col-scroll"+(isDragging&&drag.overBox?' nz-box-drop-target':'')},
preact.h("div",{"class":"nz-tb-box-grid"},
boxOnly.map(function(mon){var _game$availableEvolut7;return(
preact.h("div",{
key:mon.uid,
"class":"nz-tb-box-card"+(selectedUid===mon.uid?' nz-tb-box-card-selected':'')+((_game$availableEvolut7=game.availableEvolutions[mon.uid])!=null&&_game$availableEvolut7.length?' nz-tb-box-card-evolve':'')+(boxDisabled?' nz-tb-box-card-disabled':'')+(isDragging&&mon.uid===dragUid?' nz-tb-box-card-dragging':''),
onClick:function(){return!isDragging&&_this6.select(mon.uid);},
onPointerDown:!boxDisabled&&game.party.length<6?function(e){return _this6.startBoxDrag(mon.uid,e);}:undefined},

preact.h(NzSprite,{species:mon.species,size:40}),
preact.h("div",{"class":"nz-tb-box-card-name"},mon.nickname)
));}
)
)
)
),

preact.h("div",{"class":"nz-tb-opponent-col"},
preact.h("div",{"class":"nz-section-title nz-section-title-danger"},"vs. ",(_battle$trainer2=battle==null?void 0:battle.trainer)!=null?_battle$trainer2:'Opponent'),
preact.h("div",{"class":"nz-tb-col-scroll"},
remainingBattles.map(function(b,bi){return preact.h(preact.Fragment,{key:bi},
bi>0&&preact.h("div",{"class":"nz-section-title nz-section-title-danger",style:"margin-top:12px;"},"vs. ",b.trainer),
b.team.map(function(opp,i){return(
preact.h(NzOpponentSlot,{
key:bi+"-"+i,
pokemon:opp,
generation:_this6.props.game.generation,
selected:(selectedOpponent==null?void 0:selectedOpponent.battleIdx)===bi&&(selectedOpponent==null?void 0:selectedOpponent.slotIdx)===i,
onSelect:function(){return _this6.selectOpponent(bi,i);}}
));}
)
);})
)
)

)

),


preact.h("div",{"class":"nz-tb-battle-footer"},
hasErrors&&preact.h("p",{"class":"nz-error"},"\u26A0 Fix errors before battling."),
preact.h("div",{"class":"nz-tb-footer-row"},
evolveAllCount>0&&preact.h(NzBtn,{
size:"sm",
variant:"evolve",
onClick:function(){return PS.send('/nuzlocke evolveall');},
title:"Evolves all Pok\xE9mon with exactly one available evolution that uses no items. Level-up and trade evolutions qualify; stone evolutions and branching choices (e.g. Wurmple) are skipped."},
"Evolve All (",
evolveAllCount,")"
),
preact.h(NzBtn,{
onClick:this.clickBattle,
disabled:partyPokemon.length===0,
title:partyPokemon.length===0?'Add Pokémon to party first':''},
"Battle!"

)
)
),


preact.h("div",{"class":"nz-tb-mobile"},
preact.h("div",{"class":"nz-tb-mobile-content"},
mobileTab==='loadout'&&this.renderMobileLoadout(),
mobileTab==='team'&&this.renderMobileTeam(),
mobileTab==='vs'&&this.renderMobileVs()
),
preact.h("div",{"class":"nz-tb-mobile-bar"},
hasErrors&&preact.h("span",{"class":"nz-tb-mobile-bar-error"},"\u26A0 Fix errors"),
preact.h("div",{"class":"nz-tb-mobile-tabs"},
preact.h("button",{
"class":"nz-tb-mobile-nav"+(mobileTab==='loadout'?' nz-tb-mobile-nav-active':''),
onClick:function(){return _this6.setState({mobileTab:'loadout'});}},
"Loadout"),
preact.h("button",{
"class":"nz-tb-mobile-nav"+(mobileTab==='team'?' nz-tb-mobile-nav-active':''),
onClick:function(){return _this6.setState({mobileTab:'team'});}},
"Team"),
preact.h("button",{
"class":"nz-tb-mobile-nav"+(mobileTab==='vs'?' nz-tb-mobile-nav-active':''),
onClick:function(){return _this6.setState({mobileTab:'vs'});}},
"Vs.")
),
evolveAllCount>0&&preact.h(NzBtn,{size:"sm",variant:"evolve",onClick:function(){return PS.send('/nuzlocke evolveall');}},"Evo (",
evolveAllCount,")"
),
preact.h(NzBtn,{
onClick:this.clickBattle,
disabled:partyPokemon.length===0},
"Battle!"

)
)
),

isDragging&&function(){
var pok=game.box.find(function(p){return p.uid===dragUid;});
if(!pok)return null;
return preact.h("div",{
"class":"nz-drag-ghost"+(drag.overBox?' nz-drag-ghost-remove':''),
style:"left:"+(drag.clientX+14)+"px;top:"+(drag.clientY+14)+"px"},

preact.h(NzSprite,{species:pok.species,size:32}),
preact.h("span",{"class":"nz-drag-ghost-name"},pok.nickname)
);
}(),

showItemWarning&&function(){
var missingCount=game.party.filter(function(uid){return!heldItems[uid];}).length;
return preact.h("div",{"class":"nz-item-warning-overlay"},
preact.h("div",{"class":"nz-item-warning-dialog"},
preact.h("div",{"class":"nz-item-warning-title"},"Items not assigned"),
preact.h("div",{"class":"nz-item-warning-body"},
missingCount===1?
'1 party member has no held item.':
missingCount+" party members have no held item.",
' ',"There are items available to assign."
),
preact.h("div",{"class":"nz-item-warning-actions"},
preact.h(NzBtn,{variant:"secondary",size:"sm",onClick:function(){
_this6.setState({showItemWarning:false,activeTab:'items',mobileTab:'loadout'});
var firstUnequipped=game.party.find(function(uid){return!heldItems[uid];});
if(firstUnequipped)_this6.setState({selectedUid:firstUnequipped});
}},"Assign Items"),
preact.h(NzBtn,{size:"sm",onClick:function(){
_this6.setState({showItemWarning:false});
_this6.commitBattle();
}},"Battle Anyway")
)
)
);
}(),

this.state.showTutorial&&function(){
var TEAMBUILDING_STEPS=[
{
title:'Prepare Your Team',
body:'Before each battle, set your party, assign moves and held items, and view the opponent\'s team. Everything here carries into the fight.'
},
{
selector:'.nz-move-panel',
title:'Assigning Moves',
body:'Click a slot, then click a move to assign it — the pulsing outline shows where to click next. On desktop you can also drag: pull a move row onto a slot, drag a slot onto a row to swap, or drag one slot onto another to reorder.',
onActivate:function(){return _this6.setState({activeTab:'moves'});}
},
{
selector:'.nz-item-panel',
title:'Held Items',
body:'Click any item in the list to equip it. On desktop you can also drag an item row onto the equipped slot at the top. Each Pokémon can hold one item.',
onActivate:function(){return _this6.setState({activeTab:'items'});}
},
{
selector:'.nz-tb-party-col',
title:'Your Party',
body:'Drag a box Pokémon into the party to add it, drag a party slot to reorder, or drag a party Pokémon into the box to swap it out.'
},
{
selector:'.nz-tb-opponent-col',
title:'Opponent Preview',
body:'Click any opponent Pokémon to see their full stats, moves, and ability in the detail panel.'
}];

return preact.h(NzTutorial,{steps:TEAMBUILDING_STEPS,onDone:_this6.dismissTeambuildingTutorial});
}()
);
};return TeambuildingScreen;}(preact.Component);
//# sourceMappingURL=teambuilding.js.map