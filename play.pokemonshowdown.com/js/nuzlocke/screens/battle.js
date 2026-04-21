"use strict";








function BattleScreen(_ref){var _game$segment;var game=_ref.game;
var battle=(_game$segment=game.segment)==null?void 0:_game$segment.battles[game.currentBattleIndex];
var battleRoomId=game.battleRoomId;
var result=game.lastBattleResult;
var isPostLoss=!game.inBattle&&result&&!result.won;

function handleLoadBattle(){
if(!battleRoomId)return;
if(PS.rooms[battleRoomId]){
PS.focusRoom(battleRoomId);
}else{
PS.join(battleRoomId);
}
}

if(isPostLoss){
return preact.h(NzScreen,null,
preact.h(NzScreenHeader,{title:"Battle Lost",meta:[{label:'Opponent',value:result.trainerName}]}),
preact.h(NzPanelFlat,null,
result.deaths.length>0&&
preact.h("p",{style:"color:var(--nz-danger);font-size:13px;margin-bottom:12px;"},"Lost: ",
result.deaths.map(function(d){return d.nickname||d.species;}).join(', ')
),

preact.h("div",{style:"display:flex;gap:8px;"},
preact.h("button",{"class":"nz-btn nz-btn-secondary",onClick:function(){return PS.send('/nuzlocke continue');}},"Retry"

),
preact.h("button",{"class":"nz-btn nz-btn-danger",onClick:function(){return PS.send('/nuzlocke giveup');}},"Give Up"

)
)
)
);
}

return preact.h(NzScreen,null,
preact.h(NzScreenHeader,{
title:"Battle in Progress",
meta:battle?[{label:'Opponent',value:battle.trainer}]:[]}
),
preact.h(NzPanelFlat,null,
preact.h("p",{style:"color:var(--nz-text-muted);font-size:13px;"},"Battle in progress. Return here when it ends."

),
battleRoomId&&
preact.h("button",{"class":"nz-btn nz-btn-accent",onClick:handleLoadBattle,style:"margin-top:12px;"},"Go to Battle"

)

)
);
}
//# sourceMappingURL=battle.js.map