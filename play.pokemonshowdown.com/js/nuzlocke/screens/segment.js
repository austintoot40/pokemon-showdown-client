"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}var




















Carousel=function(_preact$Component){function Carousel(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.




state={index:0,visible:true};_this.
timer=null;_this.
fadeTimer=null;return _this;}_inheritsLoose(Carousel,_preact$Component);var _proto=Carousel.prototype;_proto.

componentDidMount=function componentDidMount(){var _this2=this;
if(this.props.items.length>1)this.timer=setInterval(function(){return _this2.advance();},3000);
};_proto.

componentWillUnmount=function componentWillUnmount(){
if(this.timer!==null)clearInterval(this.timer);
if(this.fadeTimer!==null)clearTimeout(this.fadeTimer);
};_proto.

advance=function advance(){var _this3=this;
this.setState({visible:false});
this.fadeTimer=setTimeout(function(){
_this3.setState(function(s){return{index:(s.index+1)%_this3.props.items.length,visible:true};});
},250);
};_proto.

render=function render(){
var _this$props=this.props,items=_this$props.items,renderItem=_this$props.renderItem,empty=_this$props.empty;
if(items.length===0)return empty!=null?empty:null;
return renderItem(items[this.state.index],this.state.visible);
};return Carousel;}(preact.Component);


function TrainerCarousel(_ref){var sprites=_ref.sprites;
return preact.h(Carousel,{
items:sprites,
empty:preact.h("div",{"class":"nz-tl-trainer-placeholder"}),
renderItem:function(sprite,visible){var _ref2,_Dex;
var url=(_ref2=(_Dex=window.Dex)==null?void 0:_Dex.resolveAvatar(sprite))!=null?_ref2:"https://play.pokemonshowdown.com/sprites/trainers/"+
sprite+".png";
return preact.h("div",{"class":"nz-tl-trainer-wrap"+(visible?' nz-tl-trainer-visible':'')},
preact.h("img",{"class":"nz-tl-trainer-sprite",src:url,alt:sprite,width:80,height:80})
);
}}
);
}






function OutcomeBadge(_ref3){var deaths=_ref3.deaths;
var hasDeaths=deaths.length>0;
return preact.h("div",{"class":"nz-tl-badge"},
hasDeaths?'💀':'✓',hasDeaths&&deaths.length>1?deaths.length:''
);
}










var isDesktop=function(){return window.matchMedia('(min-width: 601px) and (hover: hover)').matches;};var

TimelineNode=function(_preact$Component2){function TimelineNode(){var _this4;for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}_this4=_preact$Component2.call.apply(_preact$Component2,[this].concat(args))||this;_this4.







anchorRef=preact.createRef();_this4.

handleClick=function(){
if(_this4.props.summary.status!=='completed'||!_this4.anchorRef.current||isDesktop())return;
_this4.props.onToggle(_this4.props.index,_this4.anchorRef.current);
};_this4.

handleMouseEnter=function(){
if(_this4.props.summary.status!=='completed'||!_this4.anchorRef.current||!isDesktop())return;
_this4.props.onOpen(_this4.props.index,_this4.anchorRef.current);
};_this4.

handleMouseLeave=function(){
if(!isDesktop())return;
_this4.props.onClose();
};return _this4;}_inheritsLoose(TimelineNode,_preact$Component2);var _proto2=TimelineNode.prototype;_proto2.

render=function render(){
var _this$props2=this.props,summary=_this$props2.summary,index=_this$props2.index,isOpen=_this$props2.isOpen;
var isDone=summary.status==='completed';
var isCurrent=summary.status==='current';

var trainerSprites=summary.battles.map(function(b){return b.sprite;}).filter(Boolean);

return preact.h("div",{
"class":"nz-tl-node nz-tl-node--"+summary.status+(isDone?' nz-tl-node--selectable':'')+(isOpen?' nz-tl-node--open':''),
onClick:this.handleClick,
onMouseEnter:this.handleMouseEnter,
onMouseLeave:this.handleMouseLeave,
role:isDone?'button':undefined,
tabIndex:isDone?0:undefined},


!isCurrent&&preact.h("div",{"class":"nz-tl-pip"+(isDone?' nz-tl-pip--done':'')},
index+1
),

preact.h("div",{"class":"nz-tl-body"+(isCurrent?' nz-tl-card':'')},
preact.h("div",{"class":"nz-tl-label"},summary.name),


preact.h("div",{"class":"nz-tl-trainers",ref:this.anchorRef},
isDone&&preact.h(OutcomeBadge,{deaths:summary.deaths}),
preact.h(TrainerCarousel,{sprites:trainerSprites})
)
)
);
};return TimelineNode;}(preact.Component);


function TimelineTooltip(_ref4)


{var deaths=_ref4.deaths,pos=_ref4.pos;
return preact.h("div",{"class":"nz-tl-tooltip",style:"top:"+pos.top+"px; left:"+pos.left+"px"},
deaths.length>0?deaths.map(function(d){return preact.h("div",{"class":"nz-tl-tooltip-row",key:d.uid},
preact.h(NzSprite,{species:d.species,size:44,"class":"nz-tl-tooltip-sprite"}),
preact.h("div",{"class":"nz-tl-tooltip-text"},
preact.h("div",{"class":"nz-tl-tooltip-name"},d.nickname)
)
);}):preact.h("div",{"class":"nz-tl-tooltip-row"},
preact.h("div",{"class":"nz-tl-tooltip-text"},
preact.h("div",{"class":"nz-tl-tooltip-name"},"No losses this segment")
)
)
);
}var











SegmentScreen=function(_preact$Component3){function SegmentScreen(){var _this5;for(var _len3=arguments.length,args=new Array(_len3),_key3=0;_key3<_len3;_key3++){args[_key3]=arguments[_key3];}_this5=_preact$Component3.call.apply(_preact$Component3,[this].concat(args))||this;_this5.
state={showTutorial:false,openIndex:null,tooltipPos:null};_this5.

toggleTooltip=function(index,anchor){
if(_this5.state.openIndex===index){
_this5.setState({openIndex:null,tooltipPos:null});
return;
}
_this5.openTooltip(index,anchor);
};_this5.

openTooltip=function(index,anchor){
var rect=anchor.getBoundingClientRect();
_this5.setState({openIndex:index,tooltipPos:{top:rect.bottom+6,left:rect.left+rect.width/2}});
};_this5.

closeTooltip=function(){
_this5.setState({openIndex:null,tooltipPos:null});
};_this5.









dismissSegmentTutorial=function(){
try{var _localStorage$getItem;
var key='nuzlocke_tutorial';
var seen=JSON.parse((_localStorage$getItem=localStorage.getItem(key))!=null?_localStorage$getItem:'{}');
seen.segment=true;
localStorage.setItem(key,JSON.stringify(seen));
}catch(_unused){}
_this5.setState({showTutorial:false});
};_this5.

handleProceed=function(){
PS.send('/nuzlocke proceed');
};return _this5;}_inheritsLoose(SegmentScreen,_preact$Component3);var _proto3=SegmentScreen.prototype;_proto3.componentDidMount=function componentDidMount(){try{var _localStorage$getItem2;var key='nuzlocke_tutorial';var seen=JSON.parse((_localStorage$getItem2=localStorage.getItem(key))!=null?_localStorage$getItem2:'{}');if(!seen.segment)this.setState({showTutorial:true});}catch(_unused2){}};_proto3.

render=function render(){var _game$segmentSummarie,_game$scenarioPokemon,_current$name,_this6=this,_current$name2;
var game=this.props.game;
var summaries=(_game$segmentSummarie=game.segmentSummaries)!=null?_game$segmentSummarie:[];
var current=summaries.find(function(s){return s.status==='current';});
var handleProceed=this.handleProceed;

var colorStyle=game.scenarioColor?"--scenario-color:"+game.scenarioColor:'';
var bgSpriteSrc=(_game$scenarioPokemon=game.scenarioPokemon)!=null?_game$scenarioPokemon:null;

return preact.h(NzScreen,null,
preact.h("div",{"class":"nz-seg-screen",style:colorStyle},

preact.h("div",{"class":"nz-seg-header"},
bgSpriteSrc&&preact.h(NzSprite,{species:bgSpriteSrc,"class":"nz-seg-bg-sprite",size:120,decorative:true}),
preact.h("div",{"class":"nz-seg-scenario"},game.scenarioName),
preact.h("div",{"class":"nz-seg-title"},(_current$name=current==null?void 0:current.name)!=null?_current$name:'New Segment'),
preact.h("div",{"class":"nz-seg-progress"},game.currentSegmentIndex+1," / ",game.totalSegments)
),


preact.h("div",{"class":"nz-seg-timeline-wrap"},
preact.h("div",{"class":"nz-seg-timeline"},
summaries.map(function(s,i){return preact.h(preact.Fragment,{key:s.id},
i>0&&preact.h("div",{"class":"nz-tl-line"+(s.status!=='upcoming'&&summaries[i-1].status!=='upcoming'?' nz-tl-line--done':'')}),
preact.h(TimelineNode,{
summary:s,index:i,isOpen:_this6.state.openIndex===i,
onToggle:_this6.toggleTooltip,onOpen:_this6.openTooltip,onClose:_this6.closeTooltip}
)
);})
)
),


this.state.openIndex!==null&&this.state.tooltipPos&&
preact.h(TimelineTooltip,{deaths:summaries[this.state.openIndex].deaths,pos:this.state.tooltipPos}),

preact.h("div",{"class":"nz-seg-footer"},
preact.h("button",{"class":"nz-btn nz-btn-primary nz-seg-proceed-btn",onClick:handleProceed},"Encounters"

)
),


preact.h("div",{"class":"nz-seg-mobile-bar"},
preact.h("div",{"class":"nz-seg-mobile-bar-info"},
preact.h("span",{"class":"nz-seg-mobile-bar-name"},(_current$name2=current==null?void 0:current.name)!=null?_current$name2:'New Segment'),
preact.h("span",{"class":"nz-seg-mobile-bar-progress"},game.currentSegmentIndex+1," / ",game.totalSegments)
),
preact.h("button",{"class":"nz-btn nz-btn-primary nz-seg-proceed-btn",onClick:handleProceed},"Encounters"

)
)

),

this.state.showTutorial&&function(){
var SEGMENT_STEPS=[
{
selector:'.nz-seg-timeline',
title:'Here\'s the Run',
body:'Beat all these fights to win! If a Pokémon faints, it\'s gone for good. Lose a fight entirely, and it\'s game over.'
},
{
selector:'.nz-seg-proceed-btn',
title:'Head to Encounters',
body:'Click here to go catch Pokémon before your first battle.'
}];

return preact.h(NzTutorial,{steps:SEGMENT_STEPS,onDone:_this6.dismissSegmentTutorial});
}()
);
};return SegmentScreen;}(preact.Component);
//# sourceMappingURL=segment.js.map