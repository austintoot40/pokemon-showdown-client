"use strict";










function ResultsScreen(_ref){var game=_ref.game;
var result=game.lastBattleResult;
var continueLabel=game.nextScreen==='done'?'Finish':
game.nextScreen==='battle'?'Next Battle':
'Continue';

if(!result){
return preact.h(NzScreen,null,
preact.h(NzScreenHeader,{title:"Battle Result"}),
preact.h("p",{"class":"nz-notice"},"No result data available."),
preact.h(NzBtn,{onClick:function(){return PS.send('/nuzlocke continue');}},continueLabel)
);
}

return preact.h(NzScreen,null,
preact.h(NzBattleBanner,{
won:result.won,
perfect:result.perfect,
trainerName:result.trainerName,
deaths:result.deaths}
),
preact.h("div",{style:"margin-top:16px; display:flex; gap:8px; flex-wrap:wrap;"},
preact.h(NzBtn,{onClick:function(){return PS.send('/nuzlocke continue');}},continueLabel),
!result.won&&preact.h(NzBtn,{variant:"danger",onClick:function(){return PS.send('/nuzlocke giveup');}},"Give Up")
)
);
}
//# sourceMappingURL=results.js.map