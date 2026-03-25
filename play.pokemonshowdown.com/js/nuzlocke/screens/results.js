"use strict";










function ResultsScreen(_ref){var game=_ref.game;
var result=game.lastBattleResult;
var continueLabel=game.nextScreen==='summary'?'View Summary':'Continue';

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
preact.h("div",{style:"margin-top:16px;"},
preact.h(NzBtn,{onClick:function(){return PS.send('/nuzlocke continue');}},continueLabel)
)
);
}
//# sourceMappingURL=results.js.map