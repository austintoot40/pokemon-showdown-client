"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var









































TeambuildingScreen=function(_preact$Component){function TeambuildingScreen(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={moves:{},heldItems:{},errors:{},selectedUid:null,selectedOpponent:null,showTutorial:false,activeTab:'moves',drag:null};_this.


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
var slots=document.querySelectorAll('.nz-tb-party-col .nz-party-slot:not(.nz-party-slot-empty)');
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
var boxScroll=document.querySelector('.nz-tb-box-col .nz-tb-col-scroll');
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
selectOpponent=function(battleIdx,slotIdx){return _this.setState({selectedOpponent:{battleIdx:battleIdx,slotIdx:slotIdx},selectedUid:null});};_this.

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
_this.setState({errors:errors});
return;
}
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

render=function render(){var _game$box$find,_remainingBattles$sel,_this2=this,_battle$trainer;
var game=this.props.game;
var _this$state2=this.state,moves=_this$state2.moves,heldItems=_this$state2.heldItems,errors=_this$state2.errors,selectedUid=_this$state2.selectedUid,selectedOpponent=_this$state2.selectedOpponent,drag=_this$state2.drag;
var isDragging=!!(drag!=null&&drag.active);
var dragUid=isDragging?drag.source.uid:null;
var boxDisabled=game.boxDisabled;
var segment=game.segment;
var battle=segment.battles[game.currentBattleIndex];
var remainingBattles=segment.battles.slice(game.currentBattleIndex);
var partyPokemon=game.party.map(function(uid){return game.box.find(function(p){return p.uid===uid;});}).filter(Boolean);
var boxOnly=game.box.filter(function(p){return p.alive&&!game.party.includes(p.uid);});

var evolveAllCount=game.box.filter(function(p){return p.alive;}).filter(function(p){var _game$availableEvolut;
var evos=((_game$availableEvolut=game.availableEvolutions[p.uid])!=null?_game$availableEvolut:[]).filter(function(e){return e.item===null;});
return evos.length===1;
}).length;

var selectedPokemon=selectedUid?(_game$box$find=game.box.find(function(p){return p.uid===selectedUid;}))!=null?_game$box$find:null:null;
var isInParty=selectedUid?game.party.includes(selectedUid):false;
var hasErrors=Object.keys(errors).length>0;

var selectedOppPokemon=selectedOpponent!==null?(_remainingBattles$sel=
remainingBattles[selectedOpponent.battleIdx])==null?void 0:_remainingBattles$sel.team[selectedOpponent.slotIdx]:
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
var desc=Dex.forGen(_this2.props.game.generation).abilities.get(opp.ability).shortDesc;
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
opp.moves.map(function(moveId,i){var _shortDesc;
var move=moveId?Dex.forGen(_this2.props.game.generation).moves.get(moveId):null;
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
var item=Dex.forGen(_this2.props.game.generation).items.get(opp.item);
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
}else{var _game$legalMoves$sele,_moves$selectedPokemo,_game$availableEvolut2,_BattleNatures,_heldItems$selectedPo;
var legalMoves=(_game$legalMoves$sele=game.legalMoves[selectedPokemon.uid])!=null?_game$legalMoves$sele:[];
var selectedMoves=(_moves$selectedPokemo=moves[selectedPokemon.uid])!=null?_moves$selectedPokemo:['','','',''];
var evos=(_game$availableEvolut2=game.availableEvolutions[selectedPokemon.uid])!=null?_game$availableEvolut2:[];
var error=isInParty?errors[selectedPokemon.uid]:undefined;

var sp=Dex.forGen(this.props.game.generation).species.get(selectedPokemon.species);
var nat=(_BattleNatures=BattleNatures[selectedPokemon.nature])!=null?_BattleNatures:{};
var natureQuality=sp!=null&&sp.exists?calcNatureQuality(nat,sp.baseStats):'neutral';
var ivScore=sp!=null&&sp.exists&&selectedPokemon.ivs?calcIvScore(selectedPokemon.ivs,sp.baseStats):0;
var ivPct=Math.round(ivScore*100);
var ivTier=ivPct>=62?'high':ivPct>=50?'mid':ivPct>=38?'low':'poor';
var ivLabel=ivTier==='high'?'Great':ivTier==='mid'?'Good':ivTier==='low'?'Fair':'Poor';

var combinedPct=sp!=null&&sp.exists?calcCombinedPercentile(ivScore,natureQuality,sp.baseStats):null;
var topPercentile=combinedPct!==null&&combinedPct<=0.05?combinedPct:null;
var worsePercentile=combinedPct!==null&&combinedPct>=0.95?combinedPct:null;
var formatTopPct=function(p){
var pct=p*100;
return pct<1?pct.toFixed(1)+"%":Math.round(pct)+"%";
};

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
var desc=Dex.forGen(_this2.props.game.generation).abilities.get(selectedPokemon.ability).shortDesc;
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
onClick:function(){return _this2.setState({activeTab:'moves'});}},
"Moves"),
isInParty&&preact.h("button",{
"class":"nz-tb-tab"+(this.state.activeTab==='items'?' nz-tb-tab--active':''),
onClick:function(){return _this2.setState({activeTab:'items'});}},
"Items")
),

(this.state.activeTab==='moves'||!isInParty)&&preact.h(NzMovePanel,{
moves:selectedMoves,
legalMoves:legalMoves,
generation:this.props.game.generation,
onChange:function(newMoves){
newMoves.forEach(function(id,slot){return _this2.setMove(selectedPokemon.uid,slot,id);});
}}
),

this.state.activeTab==='items'&&isInParty&&preact.h(NzItemTable,{
value:(_heldItems$selectedPo=heldItems[selectedPokemon.uid])!=null?_heldItems$selectedPo:'',
items:game.holdableItems,
onChange:function(id){return _this2.setItem(selectedPokemon.uid,id);}}
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
preact.h(NzTimeline,{game:game}),

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
if(pok){var _game$availableEvolut3;
return preact.h(NzPartySlot,{
key:pok.uid,
pokemon:pok,
levelCap:segment.levelCap,
generation:_this2.props.game.generation,
selected:selectedUid===pok.uid,
isDragging:isDragging&&pok.uid===dragUid,
dropIndicator:dropIndicator,
onSelect:function(){return _this2.select(pok.uid);},
onDragPointerDown:function(e){return _this2.startPartyDrag(pok.uid,i,e);},
hasError:!!errors[pok.uid],
canEvolve:!!((_game$availableEvolut3=game.availableEvolutions[pok.uid])!=null&&_game$availableEvolut3.length)}
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
boxOnly.map(function(mon){var _game$availableEvolut4;return(
preact.h("div",{
key:mon.uid,
"class":"nz-tb-box-card"+(selectedUid===mon.uid?' nz-tb-box-card-selected':'')+((_game$availableEvolut4=game.availableEvolutions[mon.uid])!=null&&_game$availableEvolut4.length?' nz-tb-box-card-evolve':'')+(boxDisabled?' nz-tb-box-card-disabled':'')+(isDragging&&mon.uid===dragUid?' nz-tb-box-card-dragging':''),
onClick:function(){return!isDragging&&_this2.select(mon.uid);},
onPointerDown:!boxDisabled&&game.party.length<6?function(e){return _this2.startBoxDrag(mon.uid,e);}:undefined},

preact.h(NzSprite,{species:mon.species,size:40}),
preact.h("div",{"class":"nz-tb-box-card-name"},mon.nickname)
));}
)
)
)
),

preact.h("div",{"class":"nz-tb-opponent-col"},
preact.h("div",{"class":"nz-section-title nz-section-title-danger"},"vs. ",(_battle$trainer=battle==null?void 0:battle.trainer)!=null?_battle$trainer:'Opponent'),
preact.h("div",{"class":"nz-tb-col-scroll"},
remainingBattles.map(function(b,bi){return preact.h(preact.Fragment,{key:bi},
bi>0&&preact.h("div",{"class":"nz-section-title nz-section-title-danger",style:"margin-top:12px;"},"vs. ",b.trainer),
b.team.map(function(opp,i){return(
preact.h(NzOpponentSlot,{
key:bi+"-"+i,
pokemon:opp,
generation:_this2.props.game.generation,
selected:(selectedOpponent==null?void 0:selectedOpponent.battleIdx)===bi&&(selectedOpponent==null?void 0:selectedOpponent.slotIdx)===i,
onSelect:function(){return _this2.selectOpponent(bi,i);}}
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

this.state.showTutorial&&function(){
var TEAMBUILDING_STEPS=[
{
title:'Prepare Your Team',
body:'Before each battle, set your party, assign moves and held items, and view the opponent\'s team. Everything here carries into the fight.'
},
{
selector:'.nz-move-panel',
title:'Move Slots',
body:'Click a move slot to activate it, then click a move in the table to assign it. Each party Pokémon needs at least one move before you can battle.',
onActivate:function(){return _this2.setState({activeTab:'moves'});}
},
{
selector:'.nz-item-panel',
title:'Held Items',
body:'Click the Items tab to assign a held item to your Pokémon. Items already held by other party members are dimmed.',
onActivate:function(){return _this2.setState({activeTab:'items'});}
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

return preact.h(NzTutorial,{steps:TEAMBUILDING_STEPS,onDone:_this2.dismissTeambuildingTutorial});
}()
);
};return TeambuildingScreen;}(preact.Component);
//# sourceMappingURL=teambuilding.js.map