"use strict";











function SpriteSlot(_ref){var mon=_ref.mon,index=_ref.index;
var speciesId=mon.species.toLowerCase().replace(/[^a-z0-9]/g,'');
var src="https://play.pokemonshowdown.com/sprites/gen5/"+speciesId+".png";
return(
preact.h("div",{"class":"nz-victory-slot",style:"animation-delay:"+index+"s"},
preact.h("div",{"class":"nz-victory-sprite-wrap"},
preact.h("img",{
"class":"nz-victory-sprite",
src:src,
alt:mon.species,
width:120,
height:120}
)
),
preact.h("div",{"class":"nz-victory-mon-name"},mon.nickname||mon.species),
mon.nickname&&mon.nickname!==mon.species&&
preact.h("div",{"class":"nz-victory-mon-species"},mon.species),

preact.h("div",{"class":"nz-victory-mon-level"},"Lv. ",mon.level)
));

}

function VictoryScreen(_ref2){var _game$lastBattleResul,_game$lastBattleResul2;var game=_ref2.game;
var partyMembers=game.party.
map(function(uid){return game.box.find(function(p){return p.uid===uid;});}).
filter(function(p){return!!p;});

var pokemonStartDelay=1;
var lastDelay=pokemonStartDelay+partyMembers.length;
var footerDelay=lastDelay+0.5;

var finalTrainer=(_game$lastBattleResul=(_game$lastBattleResul2=game.lastBattleResult)==null?void 0:_game$lastBattleResul2.trainerName)!=null?_game$lastBattleResul:null;

function handleMainMenu(){
PS.send('/nuzlocke done');
}

return(
preact.h(NzRoot,null,
preact.h(NzScreen,null,
preact.h("div",{"class":"nz-victory-screen"},
preact.h("div",{"class":"nz-victory-stars","aria-hidden":"true"}),

preact.h("div",{"class":"nz-victory-header"},
preact.h("div",{"class":"nz-victory-title"},"\u2605 HALL OF FAME \u2605"

),
preact.h("div",{"class":"nz-victory-subtitle"},
game.scenarioName?"You conquered "+game.scenarioName+"!":'Run complete!'
),
finalTrainer&&
preact.h("div",{"class":"nz-victory-trainer"},"Defeated ",
finalTrainer
)

),

preact.h("div",{"class":"nz-victory-party"},
partyMembers.map(function(mon,i){return(
preact.h(SpriteSlot,{key:mon.uid,mon:mon,index:pokemonStartDelay+i}));}
)
),

preact.h("div",{"class":"nz-victory-footer",style:"animation-delay:"+footerDelay+"s"},
preact.h("button",{"class":"nz-btn nz-victory-menu-btn",onClick:handleMainMenu},"Main Menu"

)
)
)
)
));

}
//# sourceMappingURL=victory.js.map