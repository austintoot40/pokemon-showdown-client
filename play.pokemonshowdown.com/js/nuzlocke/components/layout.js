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
//# sourceMappingURL=layout.js.map