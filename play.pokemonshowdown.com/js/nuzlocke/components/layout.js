"use strict";







function NzRoot(_ref){var children=_ref.children,cls=_ref["class"];
return preact.h("div",{"class":"nz-root"+(cls?" "+cls:'')},children);
}

function NzScreen(_ref2){var children=_ref2.children;
return preact.h("div",{"class":"nz-screen"},children);
}

function NzScreenHeader(_ref3)





{var title=_ref3.title,meta=_ref3.meta;
return preact.h("div",{"class":"nz-screen-header"},
preact.h("div",{"class":"nz-screen-title"},title),
meta&&meta.length>0&&preact.h("div",{"class":"nz-screen-meta"},
meta.map(function(m,i){return preact.h("span",{key:i},m.label,": ",preact.h("strong",{style:"color:var(--nz-text)"},m.value));})
)
);
}

function NzSection(_ref4){var title=_ref4.title,children=_ref4.children;
return preact.h("div",{"class":"nz-section"},
preact.h("div",{"class":"nz-section-title"},title),
children
);
}

function NzPanel(_ref5){var children=_ref5.children,cls=_ref5["class"];
return preact.h("div",{"class":"nz-panel"+(cls?" "+cls:'')},children);
}

function NzPanelFlat(_ref6){var children=_ref6.children,cls=_ref6["class"];
return preact.h("div",{"class":"nz-panel-flat"+(cls?" "+cls:'')},children);
}

function NzLoadingScreen(){
return(
preact.h(NzRoot,null,
preact.h(NzScreen,null,
preact.h("div",{"class":"nz-loading-screen"},
preact.h("div",{"class":"nz-loading-timeline"},
[0,1,2,3,4].map(function(i){return(
preact.h("div",{key:i,"class":"nz-loading-timeline-node"},
preact.h("div",{"class":"nz-loading-skel nz-loading-skel-pip",style:i===2?'opacity:1':"opacity:"+(0.35+i*0.1)}),
i<4&&preact.h("div",{"class":"nz-loading-skel nz-loading-skel-connector"})
));}
)
),
preact.h("div",{"class":"nz-loading-body"},
preact.h("div",{"class":"nz-loading-skel nz-loading-skel-title"}),
preact.h("div",{"class":"nz-loading-skel nz-loading-skel-meta",style:"margin-top:6px;"}),
preact.h("div",{"class":"nz-loading-skel nz-loading-skel-bar",style:"margin-top:20px;"}),
preact.h("div",{"class":"nz-loading-cards"},
[0,1,2].map(function(i){return(
preact.h("div",{key:i,"class":"nz-loading-card"},
preact.h("div",{"class":"nz-loading-skel nz-loading-skel-sprite"}),
preact.h("div",{"class":"nz-loading-card-lines"},
preact.h("div",{"class":"nz-loading-skel nz-loading-skel-name"}),
preact.h("div",{"class":"nz-loading-skel nz-loading-skel-type"})
)
));}
)
)
),
preact.h("div",{"class":"nz-connecting-dots",style:"margin-top:auto;padding-top:24px;"},
preact.h("span",null),preact.h("span",null),preact.h("span",null)
)
)
)
));

}
//# sourceMappingURL=layout.js.map