"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}








function nzToID(str){
if(!str||typeof str!=='string')return'';
return str.toLowerCase().replace(/[^a-z0-9]/g,'');
}

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
}var



NzTimeline=function(_preact$Component){function NzTimeline(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
stripRef=null;return _this;}_inheritsLoose(NzTimeline,_preact$Component);var _proto=NzTimeline.prototype;_proto.

componentDidMount=function componentDidMount(){this.scrollToCurrent();};_proto.
componentDidUpdate=function componentDidUpdate(){this.scrollToCurrent();};_proto.

scrollToCurrent=function scrollToCurrent(){
var el=this.stripRef;
if(!el)return;
var cur=el.querySelector('.nz-timeline-node--current');
if(cur){
var left=cur.offsetLeft;
var w=cur.offsetWidth;
el.scrollLeft=left-el.offsetWidth/2+w/2;
}
};_proto.

render=function render(){var _game$segmentSummarie,_this2=this;
var game=this.props.game;
var summaries=(_game$segmentSummarie=game.segmentSummaries)!=null?_game$segmentSummarie:[];


var curIdx=summaries.findIndex(function(s){return s.status==='current';});
var windowStart=Math.max(0,curIdx-1);
var windowEnd=Math.min(summaries.length-1,curIdx+1);

return preact.h("div",{"class":"nz-timeline-strip",ref:function(el){_this2.stripRef=el;}},
preact.h("div",{"class":"nz-timeline-nodes"},
summaries.map(function(s,i){
var isDone=s.status==='completed';
var isCurrent=s.status==='current';
var inWindow=i>=windowStart&&i<=windowEnd;

return preact.h(preact.Fragment,{key:s.id},
i>0&&preact.h("div",{"class":"nz-timeline-line"+(isDone||i<=curIdx?' nz-timeline-line--done':'')+" nz-timeline-line--idx-"+i}),
preact.h("div",{"class":"nz-timeline-node nz-timeline-node--"+s.status+(inWindow?' nz-timeline-in-window':'')},
preact.h("div",{"class":"nz-timeline-pip"+(isCurrent?' nz-timeline-pip--current':isDone?' nz-timeline-pip--done':'')},
isCurrent?'▶':i+1
),
preact.h("div",{"class":"nz-timeline-label"},isCurrent?s.name:'')
)
);
})
)
);
};return NzTimeline;}(preact.Component);
//# sourceMappingURL=layout.js.map