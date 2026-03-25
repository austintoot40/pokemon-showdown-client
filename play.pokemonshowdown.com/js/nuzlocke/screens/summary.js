"use strict";











function SummaryScreen(_ref){var game=_ref.game;
var alive=game.box.filter(function(p){return p.alive;});
var isVictory=game.currentSegmentIndex>=game.totalSegments;
var segmentList=Object.values(game.segmentNames);

return preact.h(NzScreen,null,
preact.h("div",{style:"margin-bottom:20px;"},
isVictory?
preact.h("div",{"class":"nz-banner nz-banner-flawless"},
preact.h("div",{"class":"nz-banner-title"},"\u2605 ",game.scenarioName," \u2014 Complete"),
preact.h("div",{"class":"nz-banner-sub"},
game.completedBattles.length," battles completed",
game.graveyard.length===0?
' — no casualties.':" \u2014 "+
game.graveyard.length+" unit"+(game.graveyard.length!==1?'s':'')+" lost."
)
):
preact.h("div",{"class":"nz-banner nz-banner-loss"},
preact.h("div",{"class":"nz-banner-title"},"Run Over"),
preact.h("div",{"class":"nz-banner-sub"},"Reached segment ",
game.currentSegmentIndex+1," of ",game.totalSegments,".",
' ',game.completedBattles.length," battle",game.completedBattles.length!==1?'s':''," completed."
)
)

),

segmentList.length>0&&preact.h(NzSection,{title:"Mission Progress"},
preact.h(NzProgress,{segments:segmentList,currentIndex:game.currentSegmentIndex})
),

alive.length>0&&preact.h(NzSection,{title:"Survivors ("+alive.length+")"},
preact.h("div",{style:"display:flex;flex-wrap:wrap;gap:10px;"},
alive.map(function(p){return preact.h(NzBoxCard,{key:p.uid,pokemon:p});})
)
),

game.graveyard.length>0&&preact.h(NzSection,{title:"Graveyard ("+game.graveyard.length+")"},
preact.h("div",{style:"display:flex;flex-wrap:wrap;gap:10px;"},
game.graveyard.map(function(d){var _game$segmentNames$d$;return(
preact.h(NzGraveyardCard,{
key:d.uid,
dead:d,
segmentName:(_game$segmentNames$d$=game.segmentNames[d.segment])!=null?_game$segmentNames$d$:d.segment}
));}
)
)
),

preact.h("div",{style:"margin-top:8px;"},
preact.h(NzBtn,{onClick:function(){return PS.send('/nuzlocke done');},variant:"secondary"},"Done"

)
)
);
}
//# sourceMappingURL=summary.js.map