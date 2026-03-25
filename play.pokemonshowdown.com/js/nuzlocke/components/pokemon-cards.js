"use strict";










function NzPokemonCard(_ref)







{var pokemon=_ref.pokemon,levelCap=_ref.levelCap,actions=_ref.actions;
var sp=Dex.species.get(pokemon.species);
return preact.h("div",{"class":"nz-card"},
preact.h(NzSprite,{species:pokemon.species,shiny:pokemon.shiny}),
preact.h("div",{"class":"nz-card-nickname"},
pokemon.nickname,
pokemon.shiny&&preact.h("span",{style:"color:var(--nz-warning);margin-left:4px;"},"\u2605")
),
pokemon.nickname!==pokemon.species&&preact.h("div",{"class":"nz-card-species"},pokemon.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",levelCap!=null?levelCap:pokemon.level),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:pokemon.species})),
preact.h("div",{"class":"nz-card-nature"},pokemon.nature," \xB7 ",pokemon.ability),
actions&&preact.h("div",{"class":"nz-card-actions"},actions)
);
}

function NzBoxCard(_ref2)







{var pokemon=_ref2.pokemon,levelCap=_ref2.levelCap,actions=_ref2.actions;
return preact.h("div",{"class":"nz-card nz-card-compact"},
preact.h(NzSprite,{species:pokemon.species,shiny:pokemon.shiny,size:48}),
preact.h("div",{"class":"nz-card-nickname"},pokemon.nickname),
pokemon.nickname!==pokemon.species&&preact.h("div",{"class":"nz-card-species"},pokemon.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",levelCap!=null?levelCap:pokemon.level),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:pokemon.species})),
actions&&preact.h("div",{style:"margin-top:6px;width:100%;"},actions)
);
}

function NzGraveyardCard(_ref3)





{var dead=_ref3.dead,segmentName=_ref3.segmentName;
return preact.h("div",{"class":"nz-card nz-card-dead nz-card-compact"},
preact.h(NzSprite,{species:dead.species,size:48}),
preact.h("div",{"class":"nz-card-nickname"},dead.nickname),
dead.nickname!==dead.species&&preact.h("div",{"class":"nz-card-species"},dead.species),
preact.h("div",{"class":"nz-card-killed-by"},dead.killedBy),
preact.h("div",{"class":"nz-card-died-in"},segmentName)
);
}

function NzOpponentCard(_ref4){var pokemon=_ref4.pokemon;
return preact.h("div",{"class":"nz-card nz-card-opponent"},
preact.h(NzSprite,{species:pokemon.species,size:56}),
preact.h("div",{"class":"nz-card-nickname"},pokemon.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",pokemon.level),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:pokemon.species})),
preact.h("div",{"class":"nz-card-opponent nz-card-ability"},pokemon.ability),
pokemon.item&&preact.h("div",{"class":"nz-card-item",style:"margin-top:2px;padding-top:0;border:none;"},
preact.h("span",{"class":"nz-card-item-label"},pokemon.item)
),
preact.h("div",{"class":"nz-card-opponent nz-card-move-list"},pokemon.moves.join(' · '))
);
}

function NzStarterCard(_ref5)







{var species=_ref5.species,selected=_ref5.selected,onSelect=_ref5.onSelect;
var sp=Dex.species.get(species);
var s=sp.baseStats;
return preact.h("div",{
"class":"nz-starter-card"+(selected?' nz-starter-card-selected':''),
onClick:onSelect},

preact.h("div",{"class":"nz-starter-sprite"},
preact.h(NzSprite,{species:species,size:96})
),
preact.h("div",{"class":"nz-card-nickname",style:"margin-top:8px;"},sp.name),
preact.h("div",{"class":"nz-card-types",style:"justify-content:center;margin:4px 0;"},
preact.h(NzTypeBadges,{species:species})
),
preact.h("div",{"class":"nz-starter-stats"},
preact.h("div",{"class":"nz-starter-stat"},"HP",preact.h("span",null,s.hp)),
preact.h("div",{"class":"nz-starter-stat"},"Atk",preact.h("span",null,s.atk)),
preact.h("div",{"class":"nz-starter-stat"},"Def",preact.h("span",null,s.def)),
preact.h("div",{"class":"nz-starter-stat"},"SpA",preact.h("span",null,s.spa)),
preact.h("div",{"class":"nz-starter-stat"},"SpD",preact.h("span",null,s.spd)),
preact.h("div",{"class":"nz-starter-stat"},"Spe",preact.h("span",null,s.spe))
)
);
}
//# sourceMappingURL=pokemon-cards.js.map