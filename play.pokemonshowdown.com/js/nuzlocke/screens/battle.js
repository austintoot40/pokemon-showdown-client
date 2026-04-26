"use strict";








function BattleScreen(_ref){var _game$segment;var game=_ref.game;
var battle=(_game$segment=game.segment)==null?void 0:_game$segment.battles[game.currentBattleIndex];
var battleRoomId=game.battleRoomId;

function handleLoadBattle(){
if(!battleRoomId)return;
if(PS.rooms[battleRoomId]){
PS.focusRoom(battleRoomId);
}else{
PS.join(battleRoomId);
}
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