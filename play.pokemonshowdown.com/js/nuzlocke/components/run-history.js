"use strict";










function NzBattleBanner(_ref)









{var won=_ref.won,perfect=_ref.perfect,trainerName=_ref.trainerName,deaths=_ref.deaths;
var variant=perfect?'flawless':won?'win':'loss';
var title=perfect?
'★ Flawless Victory':
won?"Victory \u2014 "+
trainerName:"Defeated by "+
trainerName;
var sub=perfect?"You swept "+
trainerName+" without losing a single Pok\xE9mon.":
won?
'Objective complete. Advance to next segment.':
'All units down. Run over.';

return preact.h("div",{"class":"nz-banner nz-banner-"+variant},
preact.h("div",{"class":"nz-banner-title"},title),
preact.h("div",{"class":"nz-banner-sub"},sub),
deaths.length>0&&preact.h("div",{"class":"nz-banner-deaths"},
preact.h("div",{"class":"nz-banner-deaths-label"},"Units Lost (",deaths.length,")"),
deaths.map(function(d){
var src="https://play.pokemonshowdown.com/sprites/gen5/"+toID(d.species)+".png";
return preact.h("div",{key:d.uid,"class":"nz-death-entry"},
preact.h("img",{src:src,alt:d.species}),
preact.h("span",null,preact.h("strong",null,d.nickname)," \u2014 ",d.killedBy)
);
})
)
);
}

function NzProgress(_ref2)





{var segments=_ref2.segments,currentIndex=_ref2.currentIndex;
return preact.h("div",{"class":"nz-progress"},
segments.map(function(name,i){
var state=i<currentIndex?'done':i===currentIndex?'current':'locked';
var dot=state==='done'?'✓':state==='current'?'▸':String(i+1);
return preact.h("div",{key:i,"class":"nz-progress-node"},
preact.h("div",{"class":"nz-progress-pip"},
preact.h("div",{"class":"nz-progress-dot "+state},dot),
preact.h("div",{"class":"nz-progress-label "+state},name)
),
i<segments.length-1&&preact.h("div",{"class":"nz-progress-line "+(state==='done'?'done':'')})
);
})
);
}

function NzRunEntry(_ref3)



















{var _run$ai;var run=_ref3.run,segmentNames=_ref3.segmentNames,expanded=_ref3.expanded,onToggle=_ref3.onToggle;
var won=run.outcome==='victory';
var date=new Date(run.date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
return preact.h("div",{"class":"nz-run-entry"},
preact.h("div",{"class":"nz-run-entry-header",onClick:onToggle},
preact.h(NzBadge,{variant:won?'active':'danger'},won?'Victory':'Wipe'),
preact.h("span",{"class":"nz-run-entry-name"},run.scenarioName),
preact.h("span",{"class":"nz-run-entry-meta"},
date," \xB7 ",run.deathCount," death",run.deathCount!==1?'s':''," \xB7 ",(_run$ai=run.ai)!=null?_run$ai:'game-accurate',
run.finalBattle?" \xB7 "+run.finalBattle:''
),
preact.h("span",{"class":"nz-run-entry-chevron"},expanded?'▲':'▼')
),
expanded&&preact.h("div",{"class":"nz-run-entry-body"},
run.survivors.length>0&&preact.h("div",{style:"margin-bottom:8px;"},
preact.h("div",{"class":"nz-label",style:"margin-bottom:4px;"},"Survivors"),
preact.h("div",{style:"display:flex;flex-wrap:wrap;gap:4px;align-items:center;font-size:12px;color:var(--nz-text-muted);"},
run.survivors.map(function(s,i){
var src="https://play.pokemonshowdown.com/sprites/gen5/"+toID(s.species)+".png";
return preact.h("span",{key:i,style:"display:flex;align-items:center;gap:3px;"},
preact.h("img",{src:src,alt:s.species,style:"width:22px;height:22px;image-rendering:pixelated;object-fit:contain;"}),
s.nickname!==s.species?s.nickname+" ("+s.species+")":s.species
);
})
)
),
run.graveyard.length>0&&preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-label",style:"margin-bottom:4px;"},"Graveyard"),
preact.h("div",{"class":"nz-run-grave-chips"},
run.graveyard.map(function(d){var _segmentNames$d$segme;
var src="https://play.pokemonshowdown.com/sprites/gen5/"+toID(d.species)+".png";
var seg=(_segmentNames$d$segme=segmentNames==null?void 0:segmentNames[d.segment])!=null?_segmentNames$d$segme:d.segment;
return preact.h("div",{key:d.uid,"class":"nz-run-grave-chip"},
preact.h("img",{src:src,alt:d.species}),
d.nickname," ",preact.h("em",null,"\xB7 ",seg)
);
})
)
),
run.graveyard.length===0&&won&&preact.h("div",{"class":"nz-label nz-label-success"},"Deathless clear")
)
);
}

function NzActiveRunWidget(_ref4)

















{var scenarioName=_ref4.scenarioName,segmentName=_ref4.segmentName,segmentIndex=_ref4.segmentIndex,totalSegments=_ref4.totalSegments,deaths=_ref4.deaths,partySpecies=_ref4.partySpecies,onResume=_ref4.onResume,onAbandon=_ref4.onAbandon;
return preact.h("div",{"class":"nz-run-widget"},
preact.h("div",{"class":"nz-run-widget-header"},
preact.h("div",null,
preact.h("div",{"class":"nz-run-widget-name"},scenarioName),
preact.h("div",{"class":"nz-run-widget-meta"},
segmentName," \xB7 Segment ",segmentIndex+1,"/",totalSegments
)
),
preact.h(NzBadge,{variant:"active"},"Active")
),
preact.h("div",{"class":"nz-run-widget-party"},
partySpecies.map(function(s){
var src="https://play.pokemonshowdown.com/sprites/gen5/"+toID(s)+".png";
return preact.h("img",{key:s,src:src,alt:s});
})
),
deaths>0&&preact.h("div",{"class":"nz-run-widget-deaths"},
deaths," unit",deaths!==1?'s':''," lost"
),
preact.h("div",{"class":"nz-btn-group"},
preact.h(NzBtn,{onClick:onResume,size:"sm"},"Resume"),
preact.h(NzBtn,{onClick:onAbandon,variant:"danger",size:"sm"},"Abandon")
)
);
}
//# sourceMappingURL=run-history.js.map