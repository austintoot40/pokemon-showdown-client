"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var





















TeambuildingScreen=function(_preact$Component){function TeambuildingScreen(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={moves:{},heldItems:{},errors:{},selectedUid:null,selectedOpponentIndex:null};_this.








































select=function(uid){return _this.setState({selectedUid:uid,selectedOpponentIndex:null});};_this.
selectOpponent=function(index){return _this.setState({selectedOpponentIndex:index,selectedUid:null});};_this.

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
};return _this;}_inheritsLoose(TeambuildingScreen,_preact$Component);TeambuildingScreen.getDerivedStateFromProps=function getDerivedStateFromProps(props,state){var moves=Object.assign({},state.moves);var heldItems=Object.assign({},state.heldItems);var changed=false;props.game.box.filter(function(p){return p.alive;}).forEach(function(p){var uid=p.uid;var serverMoves=p.moves.map(function(m){return toID(m);});if(!(uid in moves)){moves[uid]=[].concat(serverMoves,['','','','']).slice(0,4);changed=true;}else{var serverFilled=serverMoves.filter(Boolean).length;var localFilled=moves[uid].filter(Boolean).length;if(serverFilled>localFilled){moves[uid]=[].concat(serverMoves,['','','','']).slice(0,4);changed=true;}}if(!(uid in heldItems)){heldItems[uid]=toID(p.item);changed=true;}});var selectedUid=state.selectedUid;if(!selectedUid){var _ref,_props$game$party$,_props$game$box$find;var defaultUid=(_ref=(_props$game$party$=props.game.party[0])!=null?_props$game$party$:(_props$game$box$find=props.game.box.find(function(p){return p.alive&&!props.game.party.includes(p.uid);}))==null?void 0:_props$game$box$find.uid)!=null?_ref:null;if(defaultUid){selectedUid=defaultUid;changed=true;}}return changed?{moves:moves,heldItems:heldItems,selectedUid:selectedUid}:null;};var _proto=TeambuildingScreen.prototype;_proto.validate=function validate(){var game=this.props.game;var moves=this.state.moves;var errors={};for(var _i2=0,_game$party2=game.party;_i2<_game$party2.length;_i2++){var _moves$uid2;var uid=_game$party2[_i2];var selected=((_moves$uid2=moves[uid])!=null?_moves$uid2:[]).filter(Boolean);if(selected.length===0){errors[uid]='Must have at least 1 move.';continue;}if(new Set(selected).size!==selected.length){errors[uid]='Duplicate moves selected.';}}return errors;};_proto.

render=function render(){var _game$box$find,_this2=this,_battle$trainer,_battle$trainer2;
var game=this.props.game;
var _this$state2=this.state,moves=_this$state2.moves,heldItems=_this$state2.heldItems,errors=_this$state2.errors,selectedUid=_this$state2.selectedUid,selectedOpponentIndex=_this$state2.selectedOpponentIndex;
var segment=game.segment;
var battle=segment.battles[game.currentBattleIndex];
var partyPokemon=game.party.map(function(uid){return game.box.find(function(p){return p.uid===uid;});}).filter(Boolean);
var boxOnly=game.box.filter(function(p){return p.alive&&!game.party.includes(p.uid);});

var selectedPokemon=selectedUid?(_game$box$find=game.box.find(function(p){return p.uid===selectedUid;}))!=null?_game$box$find:null:null;
var isInParty=selectedUid?game.party.includes(selectedUid):false;
var hasErrors=Object.keys(errors).length>0;

var itemCount=function(id){return(
game.items.filter(function(i){return toID(i)===id;}).length);};
var heldByOthers=function(uid,id){return(
game.party.
filter(function(pid){return pid!==uid;}).
filter(function(pid){var _ref2,_heldItems$pid,_game$box$find2;return toID((_ref2=(_heldItems$pid=heldItems[pid])!=null?_heldItems$pid:(_game$box$find2=game.box.find(function(p){return p.uid===pid;}))==null?void 0:_game$box$find2.item)!=null?_ref2:'')===id;}).
length);};


var detailContent;
if(selectedOpponentIndex!==null&&battle!=null&&battle.team[selectedOpponentIndex]){

var opp=battle.team[selectedOpponentIndex];
detailContent=preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-tb-info-stats"},
preact.h("div",{"class":"nz-tb-detail-header"},
preact.h("div",{"class":"nz-tb-detail-sprite"},
preact.h("img",{
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(opp.species)+".png",
alt:opp.species}
)
),
preact.h("div",{"class":"nz-tb-detail-info"},
preact.h("div",{"class":"nz-card-nickname"},opp.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",opp.level),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:opp.species,generation:this.props.game.generation})),
preact.h("div",{"class":"nz-card-nature"},opp.ability)
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
preact.h("span",{"class":"nz-moves-col-header"},"Effect"),
opp.moves.map(function(moveId,i){var _shortDesc;
var move=moveId?Dex.forGen(_this2.props.game.generation).moves.get(moveId):null;
var ex=!!(move!=null&&move.exists);
var cat=ex?move.category==='Physical'?'Phys':move.category==='Special'?'Spec':'Status':'';
var power=ex&&move.basePower>0?""+move.basePower:ex?'—':'';
var acc=ex?move.accuracy===true?'—':move.accuracy+"%":'';
return preact.h(preact.Fragment,{key:i},
preact.h("div",{"class":"nz-tb-move-name"},ex?move.name:moveId||'—'),
ex?preact.h("span",{"class":"nz-type nz-type-"+move.type.toLowerCase()},move.type):preact.h("span",null),
ex?preact.h("span",{"class":"nz-move-cat nz-move-cat-"+move.category.toLowerCase()},cat):preact.h("span",null),
preact.h("span",{"class":ex?'nz-move-stat':''},power),
preact.h("span",{"class":ex?'nz-move-stat':''},acc),
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
}else{var _game$legalMoves$sele,_moves$selectedPokemo,_game$availableEvolut,_BattleNatures;
var legalMoves=(_game$legalMoves$sele=game.legalMoves[selectedPokemon.uid])!=null?_game$legalMoves$sele:[];
var selectedMoves=(_moves$selectedPokemo=moves[selectedPokemon.uid])!=null?_moves$selectedPokemo:['','','',''];
var evos=(_game$availableEvolut=game.availableEvolutions[selectedPokemon.uid])!=null?_game$availableEvolut:[];
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
preact.h("img",{
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(selectedPokemon.species)+".png",
alt:selectedPokemon.species}
)
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

preact.h("div",{"class":"nz-moves-grid"},
preact.h("span",{"class":"nz-moves-col-header"},"Move"),
preact.h("span",{"class":"nz-moves-col-header"},"Type"),
preact.h("span",{"class":"nz-moves-col-header"},"Cat"),
preact.h("span",{"class":"nz-moves-col-header"},"BP"),
preact.h("span",{"class":"nz-moves-col-header"},"Acc"),
preact.h("span",{"class":"nz-moves-col-header"},"Effect"),
[0,1,2,3].map(function(slot){var _selectedMoves$slot,_shortDesc2;
var moveId=(_selectedMoves$slot=selectedMoves[slot])!=null?_selectedMoves$slot:'';
var move=moveId?Dex.forGen(_this2.props.game.generation).moves.get(moveId):null;
var ex=!!(move!=null&&move.exists);
var cat=ex?move.category==='Physical'?'Phys':move.category==='Special'?'Spec':'Status':'';
var power=ex&&move.basePower>0?""+move.basePower:ex?'—':'';
var acc=ex?move.accuracy===true?'—':move.accuracy+"%":'';
return preact.h(preact.Fragment,{key:slot},
preact.h(NzMoveSelect,{
value:moveId,
moves:legalMoves,
disabledMoves:selectedMoves.filter(function(id){return id!==moveId;}),
generation:_this2.props.game.generation,
onChange:function(id){return _this2.setMove(selectedPokemon.uid,slot,id);}}
),
ex?preact.h("span",{"class":"nz-type nz-type-"+move.type.toLowerCase()},move.type):preact.h("span",null),
ex?preact.h("span",{"class":"nz-move-cat nz-move-cat-"+move.category.toLowerCase()},cat):preact.h("span",null),
preact.h("span",{"class":ex?'nz-move-stat':''},power),
preact.h("span",{"class":ex?'nz-move-stat':''},acc),
preact.h("span",{"class":"nz-move-grid-desc"},ex?(_shortDesc2=move.shortDesc)!=null?_shortDesc2:'':'')
);
})
),

isInParty&&preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-label",style:"margin-top:12px;margin-bottom:5px;"},"Held Item"),
preact.h("div",{"class":"nz-move-slot"},
function(_heldItems$selectedPo){
var itemEntries=Array.from(new Map(game.items.map(function(item){return[toID(item),item];})).entries()).
map(function(_ref3){var id=_ref3[0],name=_ref3[1];return{id:id,name:name};});
var disabledItemIds=itemEntries.
filter(function(_ref4){var id=_ref4.id;return heldByOthers(selectedPokemon.uid,id)>=itemCount(id);}).
map(function(_ref5){var id=_ref5.id;return id;});
return preact.h(NzItemSelect,{
value:(_heldItems$selectedPo=heldItems[selectedPokemon.uid])!=null?_heldItems$selectedPo:'',
items:itemEntries,
disabledIds:disabledItemIds,
onChange:function(id){return _this2.setItem(selectedPokemon.uid,id);}}
);
}(),
function(_heldItems$selectedPo2){
var itemId=(_heldItems$selectedPo2=heldItems[selectedPokemon.uid])!=null?_heldItems$selectedPo2:'';
var item=itemId?Dex.forGen(_this2.props.game.generation).items.get(itemId):null;
var desc=item!=null&&item.exists?item.shortDesc:'';
return desc?preact.h("div",{"class":"nz-item-desc"},desc):null;
}()
)
),

preact.h("div",{"class":"nz-tb-detail-actions"},
preact.h("div",null,
isInParty?
preact.h(NzBtn,{size:"sm",variant:"danger",
onClick:function(){return PS.send("/nuzlocke removefromparty "+selectedPokemon.uid);}},"Remove from Party"

):
game.party.length<6&&
preact.h(NzBtn,{size:"sm",variant:"secondary",
onClick:function(){return PS.send("/nuzlocke addtoparty "+selectedPokemon.uid);}},"Add to Party"

)

),
evos.length>0&&preact.h("div",{"class":"nz-tb-detail-evos"},
evos.map(function(evo){return(
preact.h(NzBtn,{key:evo.species,size:"sm",variant:"evolve",
onClick:function(){return PS.send("/nuzlocke evolve "+selectedPokemon.uid+" "+toID(evo.species));}},
evo.type==='item'?"Evolve \u2192 "+
evo.species+" ("+evo.item+")":"Evolve \u2192 "+
evo.species
));}
)
)
)
);
}


return preact.h(NzScreen,null,
preact.h(NzScreenHeader,{
title:"vs. "+((_battle$trainer=battle==null?void 0:battle.trainer)!=null?_battle$trainer:'Unknown'),
meta:[
{label:'Level Cap',value:String(segment.levelCap)},
{label:'Segment',value:segment.name}]}

),

preact.h("div",{"class":"nz-tb-layout"},


preact.h("div",{"class":"nz-tb-detail"+(selectedOpponentIndex!==null?' nz-tb-detail-opponent':'')},
detailContent
),


preact.h("div",{"class":"nz-tb-columns"},
preact.h("div",{"class":"nz-section-title"},"Party (",partyPokemon.length,"/6)",preact.h("span",{"class":"nz-tb-hint"},"double-click to move to box")),
preact.h("div",{"class":"nz-section-title"},"Box (",boxOnly.length,")",preact.h("span",{"class":"nz-tb-hint"},"double-click to add to party")),
preact.h("div",{"class":"nz-section-title nz-section-title-danger"},"vs. ",(_battle$trainer2=battle==null?void 0:battle.trainer)!=null?_battle$trainer2:'Opponent'),
[0,1,2,3,4,5].map(function(i){var _game$availableEvolut2;
var pok=partyPokemon[i];
var opp=battle==null?void 0:battle.team[i];
var chunk=boxOnly.slice(i*3,i*3+3);
return preact.h(preact.Fragment,{key:i},
pok?
preact.h(NzPartySlot,{
pokemon:pok,
levelCap:segment.levelCap,
generation:_this2.props.game.generation,
selected:selectedUid===pok.uid,
isFirst:i===0,
isLast:i===partyPokemon.length-1,
onSelect:function(){return _this2.select(pok.uid);},
onDoubleClick:function(){return PS.send("/nuzlocke removefromparty "+pok.uid);},
onMoveUp:function(){return PS.send("/nuzlocke partymove "+pok.uid+" left");},
onMoveDown:function(){return PS.send("/nuzlocke partymove "+pok.uid+" right");},
hasError:!!errors[pok.uid],
canEvolve:!!((_game$availableEvolut2=game.availableEvolutions[pok.uid])!=null&&_game$availableEvolut2.length)}
):
preact.h("div",{"class":"nz-party-slot nz-party-slot-empty"},"\u2014 empty \u2014"),

preact.h("div",{"class":"nz-box-row-cell"},
[0,1,2].map(function(j){var _game$availableEvolut3;return chunk[j]?
preact.h("div",{
key:chunk[j].uid,
"class":"nz-tb-box-card"+(selectedUid===chunk[j].uid?' nz-tb-box-card-selected':'')+((_game$availableEvolut3=game.availableEvolutions[chunk[j].uid])!=null&&_game$availableEvolut3.length?' nz-tb-box-card-evolve':''),
onClick:function(){return _this2.select(chunk[j].uid);},
onDblClick:function(){return game.party.length<6&&PS.send("/nuzlocke addtoparty "+chunk[j].uid);}},

preact.h("img",{
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(chunk[j].species)+".png",
alt:chunk[j].species}
),
preact.h("div",{"class":"nz-tb-box-card-name"},chunk[j].nickname)
):
null;}
)
),
opp?
preact.h(NzOpponentSlot,{
pokemon:opp,
generation:_this2.props.game.generation,
selected:selectedOpponentIndex===i,
onSelect:function(){return _this2.selectOpponent(i);}}
):
preact.h("div",{"class":"nz-party-slot nz-party-slot-empty"})

);
}),
boxOnly.length>18&&Array.from({length:Math.ceil((boxOnly.length-18)/3)},function(_,i){
var chunk=boxOnly.slice(18+i*3,21+i*3);
return preact.h(preact.Fragment,{key:"overflow-"+i},
preact.h("div",null),
preact.h("div",{"class":"nz-box-row-cell"},
[0,1,2].map(function(j){var _game$availableEvolut4;return chunk[j]?
preact.h("div",{
key:chunk[j].uid,
"class":"nz-tb-box-card"+(selectedUid===chunk[j].uid?' nz-tb-box-card-selected':'')+((_game$availableEvolut4=game.availableEvolutions[chunk[j].uid])!=null&&_game$availableEvolut4.length?' nz-tb-box-card-evolve':''),
onClick:function(){return _this2.select(chunk[j].uid);},
onDblClick:function(){return game.party.length<6&&PS.send("/nuzlocke addtoparty "+chunk[j].uid);}},

preact.h("img",{
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(chunk[j].species)+".png",
alt:chunk[j].species}
),
preact.h("div",{"class":"nz-tb-box-card-name"},chunk[j].nickname)
):
null;}
)
),
preact.h("div",null)
);
})
)

),


preact.h("div",{"class":"nz-tb-battle-footer"},
hasErrors&&preact.h("p",{"class":"nz-error"},"\u26A0 Fix errors before battling."),
preact.h(NzBtn,{
onClick:this.clickBattle,
disabled:partyPokemon.length===0,
title:partyPokemon.length===0?'Add Pokémon to party first':''},
"Battle!"

)
)
);
};return TeambuildingScreen;}(preact.Component);
//# sourceMappingURL=teambuilding.js.map