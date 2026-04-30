"use strict";









function GenderSymbol(_ref){var gender=_ref.gender;
if(gender==='M')return preact.h("span",{"class":"nz-gender nz-gender-m"},"\u2642");
if(gender==='F')return preact.h("span",{"class":"nz-gender nz-gender-f"},"\u2640");
return null;
}

function NzPokemonCard(_ref2)









{var pokemon=_ref2.pokemon,levelCap=_ref2.levelCap,generation=_ref2.generation,actions=_ref2.actions;
return preact.h("div",{"class":"nz-card"},
preact.h(NzSprite,{species:pokemon.species}),
preact.h("div",{"class":"nz-card-nickname"},
pokemon.nickname,preact.h(GenderSymbol,{gender:pokemon.gender})
),
pokemon.nickname!==pokemon.species&&preact.h("div",{"class":"nz-card-species"},pokemon.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",levelCap!=null?levelCap:pokemon.level),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:pokemon.species,generation:generation})),
preact.h("div",{"class":"nz-card-nature"},pokemon.nature," \xB7 ",pokemon.ability),
actions&&preact.h("div",{"class":"nz-card-actions"},actions)
);
}

function NzBoxCard(_ref3)









{var pokemon=_ref3.pokemon,levelCap=_ref3.levelCap,generation=_ref3.generation,actions=_ref3.actions;
return preact.h("div",{"class":"nz-card nz-card-compact"},
preact.h(NzSprite,{species:pokemon.species,size:48}),
preact.h("div",{"class":"nz-card-nickname"},pokemon.nickname,preact.h(GenderSymbol,{gender:pokemon.gender})),
pokemon.nickname!==pokemon.species&&preact.h("div",{"class":"nz-card-species"},pokemon.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",levelCap!=null?levelCap:pokemon.level),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:pokemon.species,generation:generation})),
actions&&preact.h("div",{style:"margin-top:6px;width:100%;"},actions)
);
}

function NzGraveyardCard(_ref4)





{var dead=_ref4.dead,segmentName=_ref4.segmentName;
return preact.h("div",{"class":"nz-card nz-card-dead nz-card-compact"},
preact.h(NzSprite,{species:dead.species,size:48}),
preact.h("div",{"class":"nz-card-nickname"},dead.nickname),
dead.nickname!==dead.species&&preact.h("div",{"class":"nz-card-species"},dead.species),
preact.h("div",{"class":"nz-card-killed-by"},dead.killedBy),
preact.h("div",{"class":"nz-card-died-in"},segmentName)
);
}

function NzOpponentCard(_ref5){var pokemon=_ref5.pokemon,generation=_ref5.generation;
return preact.h("div",{"class":"nz-card nz-card-opponent"},
preact.h(NzSprite,{species:pokemon.species,size:56}),
preact.h("div",{"class":"nz-card-nickname"},pokemon.species),
preact.h("div",{"class":"nz-card-level"},"Lv. ",pokemon.level),
preact.h("div",{"class":"nz-card-types"},preact.h(NzTypeBadges,{species:pokemon.species,generation:generation})),
preact.h("div",{"class":"nz-card-opponent nz-card-ability"},pokemon.ability),
pokemon.item&&preact.h("div",{"class":"nz-card-item",style:"margin-top:2px;padding-top:0;border:none;"},
preact.h("span",{"class":"nz-card-item-label"},pokemon.item)
),
preact.h("div",{"class":"nz-card-opponent nz-card-move-list"},pokemon.moves.join(' · '))
);
}
//# sourceMappingURL=pokemon-cards.js.map