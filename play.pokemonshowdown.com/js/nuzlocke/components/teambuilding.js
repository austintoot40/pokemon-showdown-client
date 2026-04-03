"use strict";











function NzStatBars(_ref){var _BattleNatures;var species=_ref.species,nature=_ref.nature;
var sp=Dex.species.get(species);
var s=sp.baseStats;
var MAX=255;
var nat=nature?(_BattleNatures=BattleNatures[nature])!=null?_BattleNatures:{}:{};
var boosted=nat.plus;
var reduced=nat.minus;
var stats=[
{label:'HP',key:'hp'},
{label:'Atk',key:'atk'},
{label:'Def',key:'def'},
{label:'SpA',key:'spa'},
{label:'SpD',key:'spd'},
{label:'Spe',key:'spe'}];

return preact.h("div",{"class":"nz-stat-bars"},
stats.map(function(_ref2){var label=_ref2.label,key=_ref2.key;
var val=s[key];
var pct=Math.round(val/MAX*100);
var tier=val>=100?'high':val>=70?'mid':val>=50?'low':'poor';
var mod=key===boosted?' nz-stat-nature-up':key===reduced?' nz-stat-nature-down':'';
return preact.h("div",{key:key,"class":"nz-stat-row"},
preact.h("div",{"class":"nz-stat-label"+mod},label),
preact.h("div",{"class":"nz-stat-bar-track"},
preact.h("div",{"class":"nz-stat-bar-fill nz-stat-"+tier,style:"width:"+pct+"%"})
),
preact.h("div",{"class":"nz-stat-value"+mod},val)
);
})
);
}

function NzIvBars(_ref3){var ivs=_ref3.ivs;
var MAX=31;
var stats=[
{label:'HP',key:'hp'},
{label:'Atk',key:'atk'},
{label:'Def',key:'def'},
{label:'SpA',key:'spa'},
{label:'SpD',key:'spd'},
{label:'Spe',key:'spe'}];

return preact.h("div",{"class":"nz-stat-bars"},
stats.map(function(_ref4){var label=_ref4.label,key=_ref4.key;
var val=ivs[key];
var pct=Math.round(val/MAX*100);
var tier=val>=28?'high':val>=20?'mid':val>=10?'low':'poor';
return preact.h("div",{key:key,"class":"nz-stat-row"},
preact.h("div",{"class":"nz-stat-label"},label),
preact.h("div",{"class":"nz-stat-bar-track"},
preact.h("div",{"class":"nz-stat-bar-fill nz-stat-"+tier,style:"width:"+pct+"%"})
),
preact.h("div",{"class":"nz-stat-value"},val)
);
})
);
}

function NzMoveInfo(_ref5){var moveId=_ref5.moveId;
if(!moveId)return null;
var move=Dex.moves.get(moveId);
if(!move.exists)return null;
var catLabel=move.category==='Physical'?'Phys':move.category==='Special'?'Spec':'Status';
var power=move.basePower>0?move.basePower+" BP":'—';
var acc=move.accuracy===true?'—':move.accuracy+"%";
return preact.h("div",null,
preact.h("div",{"class":"nz-move-info"},
preact.h("span",{"class":"nz-type nz-type-"+move.type.toLowerCase()},move.type),
preact.h("span",{"class":"nz-move-cat nz-move-cat-"+move.category.toLowerCase()},catLabel),
preact.h("span",{"class":"nz-move-stat"},power),
preact.h("span",{"class":"nz-move-stat"},acc)
),
move.shortDesc&&preact.h("div",{"class":"nz-item-desc"},move.shortDesc)
);
}

function NzPartySlot(_ref6)























{var pokemon=_ref6.pokemon,levelCap=_ref6.levelCap,selected=_ref6.selected,isFirst=_ref6.isFirst,isLast=_ref6.isLast,onSelect=_ref6.onSelect,onDoubleClick=_ref6.onDoubleClick,onMoveUp=_ref6.onMoveUp,onMoveDown=_ref6.onMoveDown,hasError=_ref6.hasError,canEvolve=_ref6.canEvolve;
var cls=[
'nz-party-slot',
selected?'nz-party-slot-selected':'',
hasError?'nz-party-slot-error':'',
canEvolve?'nz-party-slot-evolve':''].
filter(Boolean).join(' ');
return preact.h("div",{"class":cls,onClick:onSelect,onDblClick:onDoubleClick},
preact.h("img",{
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(pokemon.species)+".png",
alt:pokemon.species}
),
preact.h("div",{"class":"nz-party-slot-info"},
preact.h("div",{"class":"nz-party-slot-name"},
pokemon.nickname
),
preact.h("div",{"class":"nz-party-slot-sub"},
pokemon.nickname!==pokemon.species?pokemon.species+" \xB7 ":'',"Lv.",levelCap
),
preact.h("div",{"class":"nz-party-slot-types"},preact.h(NzTypeBadges,{species:pokemon.species}))
),
preact.h("div",{"class":"nz-party-slot-arrows",onClick:function(e){return e.stopPropagation();}},
preact.h("button",{"class":"nz-party-arrow",onClick:onMoveUp,disabled:isFirst},"\u25B2"),
preact.h("button",{"class":"nz-party-arrow",onClick:onMoveDown,disabled:isLast},"\u25BC")
)
);
}

function NzOpponentSlot(_ref7)







{var pokemon=_ref7.pokemon,selected=_ref7.selected,onSelect=_ref7.onSelect;
var cls=[
'nz-opponent-slot',
selected?'nz-opponent-slot-selected':''].
filter(Boolean).join(' ');
return preact.h("div",{"class":cls,onClick:onSelect},
preact.h("img",{
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(pokemon.species)+".png",
alt:pokemon.species}
),
preact.h("div",{"class":"nz-party-slot-info"},
preact.h("div",{"class":"nz-party-slot-name"},pokemon.species),
preact.h("div",{"class":"nz-party-slot-sub"},"Lv. ",pokemon.level),
preact.h("div",{"class":"nz-party-slot-types"},preact.h(NzTypeBadges,{species:pokemon.species}))
)
);
}
//# sourceMappingURL=teambuilding.js.map