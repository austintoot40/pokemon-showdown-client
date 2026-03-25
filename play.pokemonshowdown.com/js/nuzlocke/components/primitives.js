"use strict";








function NzTypeBadges(_ref){var species=_ref.species;
var sp=Dex.species.get(species);
return preact.h(preact.Fragment,null,sp.types.map(function(t){return(
preact.h("span",{key:t,"class":"nz-type nz-type-"+t.toLowerCase()},t));}
));
}

function NzHpBar(_ref2){var current=_ref2.current,max=_ref2.max,label=_ref2.label;
var pct=max>0?Math.round(current/max*100):0;
var stateClass=pct>50?'nz-hp-high':pct>20?'nz-hp-mid':'nz-hp-low';
return preact.h("div",{"class":"nz-hp-bar "+stateClass},
label&&preact.h("div",{"class":"nz-hp-bar-meta"},preact.h("span",null,label),preact.h("span",null,current,"/",max)),
preact.h("div",{"class":"nz-hp-bar-track"},
preact.h("div",{"class":"nz-hp-bar-fill",style:"width:"+pct+"%"})
)
);
}

function NzBadge(_ref3)





{var children=_ref3.children,_ref3$variant=_ref3.variant,variant=_ref3$variant===void 0?'muted':_ref3$variant;
return preact.h("span",{"class":"nz-badge nz-badge-"+variant},children);
}

function NzBtn(_ref4)













{var children=_ref4.children,onClick=_ref4.onClick,disabled=_ref4.disabled,_ref4$variant=_ref4.variant,variant=_ref4$variant===void 0?'primary':_ref4$variant,size=_ref4.size,title=_ref4.title;
var cls=[
'nz-btn',"nz-btn-"+
variant,
size==='sm'?'nz-btn-sm':''].
filter(Boolean).join(' ');
return preact.h("button",{"class":cls,onClick:onClick,disabled:disabled,title:title},children);
}

function NzSprite(_ref5){var species=_ref5.species,shiny=_ref5.shiny,_ref5$size=_ref5.size,size=_ref5$size===void 0?60:_ref5$size;
var id=toID(species);
var src="https://play.pokemonshowdown.com/sprites/gen5/"+id+".png";
return preact.h("img",{
"class":"nz-card-sprite",
src:src,
alt:species,
style:"width:"+size+"px;height:"+size+"px;"+(shiny?'filter:hue-rotate(30deg) saturate(1.4)':'')}
);
}
//# sourceMappingURL=primitives.js.map