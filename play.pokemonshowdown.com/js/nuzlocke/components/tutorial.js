"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}
























var CARD_W=300;
var CARD_H=240;
var GAP=10;
var MARGIN=12;
var PAD=8;



function measureSpotlight(step){
if(!step.selector)return null;
var el=document.querySelector(step.selector);
return el?el.getBoundingClientRect():null;
}

function computeCardStyle(rect){
if(!rect){
return{top:'50%',left:'50%',transform:'translate(-50%,-50%)'};
}
var vw=window.innerWidth;
var vh=window.innerHeight;
var sTop=rect.top-PAD;
var sLeft=rect.left-PAD;
var sRight=rect.right+PAD;
var sBottom=rect.bottom+PAD;


if(sBottom+GAP+CARD_H+MARGIN<=vh){
var left=Math.max(MARGIN,Math.min(sLeft,vw-CARD_W-MARGIN));
return{top:sBottom+GAP,left:left};
}

if(sRight+GAP+CARD_W+MARGIN<=vw){
var top=Math.max(MARGIN,Math.min(sTop,vh-CARD_H-MARGIN));
return{top:top,left:sRight+GAP};
}

if(sTop-GAP-CARD_H>=MARGIN){
var _left=Math.max(MARGIN,Math.min(sLeft,vw-CARD_W-MARGIN));
return{top:sTop-GAP-CARD_H,left:_left};
}

if(sLeft-GAP-CARD_W>=MARGIN){
var _top=Math.max(MARGIN,Math.min(sTop,vh-CARD_H-MARGIN));
return{top:_top,left:sLeft-GAP-CARD_W};
}

return{top:'50%',left:'50%',transform:'translate(-50%,-50%)'};
}var

NzTutorial=function(_preact$Component){function NzTutorial(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.
state={stepIndex:0,spotlightRect:null};_this.
portalEl=null;_this.





















onResize=function(){
var steps=_this.props.steps;
var step=steps[_this.state.stepIndex];
if(step)_this.setState({spotlightRect:measureSpotlight(step)});
};_this.

















next=function(){return _this.goTo(_this.state.stepIndex+1,1);};_this.
prev=function(){return _this.goTo(_this.state.stepIndex-1,-1);};_this.
skip=function(){return _this.props.onDone();};return _this;}_inheritsLoose(NzTutorial,_preact$Component);var _proto=NzTutorial.prototype;_proto.componentDidMount=function componentDidMount(){this.portalEl=document.createElement('div');document.body.appendChild(this.portalEl);window.addEventListener('resize',this.onResize);this.goTo(0);};_proto.componentDidUpdate=function componentDidUpdate(){this.syncPortal();};_proto.componentWillUnmount=function componentWillUnmount(){window.removeEventListener('resize',this.onResize);if(this.portalEl){preact.render('',this.portalEl);document.body.removeChild(this.portalEl);this.portalEl=null;}};_proto.goTo=function goTo(from){var direction=arguments.length>1&&arguments[1]!==undefined?arguments[1]:1;var _this$props=this.props,steps=_this$props.steps,onDone=_this$props.onDone;var idx=from;while(idx>=0&&idx<steps.length){var step=steps[idx];if(!step.selector||document.querySelector(step.selector))break;idx+=direction;}if(idx<0||idx>=steps.length){onDone();return;}this.setState({stepIndex:idx,spotlightRect:measureSpotlight(steps[idx])});};_proto.

hasNext=function hasNext(from){
var steps=this.props.steps;
for(var i=from+1;i<steps.length;i++){
var s=steps[i];
if(!s.selector||document.querySelector(s.selector))return true;
}
return false;
};_proto.

countVisibleSteps=function countVisibleSteps(){
return this.props.steps.filter(function(s){return!s.selector||!!document.querySelector(s.selector);}).length;
};_proto.

visibleIndexOf=function visibleIndexOf(stepIndex){
var count=0;
for(var i=0;i<=stepIndex;i++){
var s=this.props.steps[i];
if(!s.selector||document.querySelector(s.selector))count++;
}
return count;
};_proto.

syncPortal=function syncPortal(){
if(!this.portalEl)return;
preact.render(this.renderOverlay(),this.portalEl);
};_proto.

renderOverlay=function renderOverlay(){
var steps=this.props.steps;
var _this$state=this.state,stepIndex=_this$state.stepIndex,spotlightRect=_this$state.spotlightRect;
var step=steps[stepIndex];
if(!step)return preact.h(preact.Fragment,null);

var isFirst=stepIndex===0;
var isLast=!this.hasNext(stepIndex);
var visNum=this.visibleIndexOf(stepIndex);
var visTotal=this.countVisibleSteps();
var cardStyle=computeCardStyle(spotlightRect);

var spotlightStyle=spotlightRect?{
top:spotlightRect.top-PAD,
left:spotlightRect.left-PAD,
width:spotlightRect.width+PAD*2,
height:spotlightRect.height+PAD*2,
boxShadow:'0 0 0 9999px rgba(0,0,0,0.72)'
}:undefined;

return preact.h(preact.Fragment,null,
preact.h("div",{"class":"nz-tutorial-backdrop"}),
spotlightRect?
preact.h("div",{"class":"nz-tutorial-spotlight",style:spotlightStyle}):
preact.h("div",{"class":"nz-tutorial-dim"}),

preact.h("div",{"class":"nz-tutorial-card",style:cardStyle},
preact.h("div",{"class":"nz-tutorial-step-count"},"Step ",visNum," of ",visTotal),
preact.h("div",{"class":"nz-tutorial-title"},step.title),
preact.h("div",{"class":"nz-tutorial-body"},step.body),
preact.h("div",{"class":"nz-tutorial-actions"},
!isFirst&&
preact.h("button",{"class":"nz-btn nz-btn-secondary",onClick:this.prev},"\u2190 Prev"),

isLast?
preact.h("button",{"class":"nz-btn nz-btn-primary",onClick:this.skip},"Done"):
preact.h("button",{"class":"nz-btn nz-btn-primary",onClick:this.next},"Next \u2192"),

isFirst?
preact.h("button",{"class":"nz-btn nz-btn-secondary nz-tutorial-skip",onClick:this.skip},"Skip Tutorial"):
preact.h("button",{"class":"nz-btn nz-btn-secondary nz-tutorial-skip",onClick:this.skip},"\u2715 Skip")

)
)
);
};_proto.

render=function render(){
return null;
};return NzTutorial;}(preact.Component);
//# sourceMappingURL=tutorial.js.map