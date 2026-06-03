"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}











function nzToID(str){
if(!str||typeof str!=='string')return'';
return str.toLowerCase().replace(/[^a-z0-9]/g,'');
}var







TrainerCarousel=function(_preact$Component){



function TrainerCarousel(props){var _this;
_this=_preact$Component.call(this,props)||this;_this.timer=null;_this.fadeTimer=null;
_this.state={index:0,visible:true};return _this;
}_inheritsLoose(TrainerCarousel,_preact$Component);var _proto=TrainerCarousel.prototype;_proto.

componentDidMount=function componentDidMount(){var _this2=this;
if(this.props.sprites.length>1){
this.timer=setInterval(function(){return _this2.advance();},3000);
}
};_proto.

componentWillUnmount=function componentWillUnmount(){
if(this.timer!==null)clearInterval(this.timer);
if(this.fadeTimer!==null)clearTimeout(this.fadeTimer);
};_proto.

advance=function advance(){var _this3=this;
this.setState({visible:false});
this.fadeTimer=setTimeout(function(){
_this3.setState(function(s){return{
index:(s.index+1)%_this3.props.sprites.length,
visible:true
};});
},250);
};_proto.

render=function render(){var _ref,_Dex;
var sprites=this.props.sprites;
if(sprites.length===0)return preact.h("div",{"class":"nz-tl-trainer-placeholder"});
var sprite=sprites[this.state.index];
var url=(_ref=(_Dex=window.Dex)==null?void 0:_Dex.resolveAvatar(sprite))!=null?_ref:"https://play.pokemonshowdown.com/sprites/trainers/"+
sprite+".png";
return preact.h("div",{"class":"nz-tl-trainer-wrap"+(this.state.visible?' nz-tl-trainer-visible':'')},
preact.h("img",{"class":"nz-tl-trainer-sprite",src:url,alt:sprite,width:80,height:80})
);
};return TrainerCarousel;}(preact.Component);var













PokemonCarousel=function(_preact$Component2){






function PokemonCarousel(props){var _this4;
_this4=_preact$Component2.call(this,props)||this;_this4.timer=null;_this4.fadeTimer=null;
_this4.state={index:0,visible:true};return _this4;
}_inheritsLoose(PokemonCarousel,_preact$Component2);var _proto2=PokemonCarousel.prototype;_proto2.

componentDidMount=function componentDidMount(){var _this5=this;
if(this.props.items.length>1){
this.timer=setInterval(function(){return _this5.advance();},3000);
}
};_proto2.

componentWillUnmount=function componentWillUnmount(){
if(this.timer!==null)clearInterval(this.timer);
if(this.fadeTimer!==null)clearTimeout(this.fadeTimer);
};_proto2.

advance=function advance(){var _this6=this;
this.setState({visible:false});
this.fadeTimer=setTimeout(function(){
_this6.setState(function(s){return{
index:(s.index+1)%_this6.props.items.length,
visible:true
};});
},250);
};_proto2.

render=function render(){
var _this$props=this.props,items=_this$props.items,variant=_this$props.variant;
if(items.length===0)return null;
var item=items[this.state.index];
var wrapCls="nz-pkmn-carousel nz-pkmn-carousel--"+variant+(this.state.visible?' nz-pkmn-carousel-visible':'');
return preact.h("div",{"class":wrapCls},
preact.h("img",{"class":"nz-pkmn-carousel-sprite",src:item.src,alt:item.label}),
preact.h("div",{"class":"nz-pkmn-carousel-label"},item.label)
);
};return PokemonCarousel;}(preact.Component);






function TimelineNode(_ref2)


{var summary=_ref2.summary,index=_ref2.index;
var isDone=summary.status==='completed';
var isCurrent=summary.status==='current';

var trainerSprites=summary.battles.map(function(b){return b.sprite;}).filter(Boolean);

return preact.h("div",{"class":"nz-tl-node nz-tl-node--"+summary.status},

preact.h("div",{"class":"nz-tl-pip"+(isCurrent?' nz-tl-pip--current':isDone?' nz-tl-pip--done':'')},
isCurrent?'▶':index+1
),

preact.h("div",{"class":"nz-tl-label"},summary.name),


preact.h("div",{"class":"nz-tl-trainers"},
preact.h(TrainerCarousel,{sprites:trainerSprites})
),


isDone&&summary.deaths.length>0&&preact.h(PokemonCarousel,{
variant:"death",
items:summary.deaths.map(function(d){return{
src:"https://play.pokemonshowdown.com/sprites/ani/"+nzToID(d.species)+".gif",
label:d.nickname
};})}
)
);
}





function SegmentScreen(_ref3){var _game$segmentSummarie,_current$name;var game=_ref3.game;
var summaries=(_game$segmentSummarie=game.segmentSummaries)!=null?_game$segmentSummarie:[];
var current=summaries.find(function(s){return s.status==='current';});

function handleProceed(){
PS.send('/nuzlocke proceed');
}

var colorStyle=game.scenarioColor?"--scenario-color:"+game.scenarioColor:'';
var bgSpriteSrc=game.scenarioPokemon?"https://play.pokemonshowdown.com/sprites/ani/"+
nzToID(game.scenarioPokemon)+".gif":
null;

return preact.h(NzRoot,null,
preact.h(NzScreen,null,
preact.h("div",{"class":"nz-seg-screen",style:colorStyle},

preact.h("div",{"class":"nz-seg-header"},
bgSpriteSrc&&preact.h("img",{"class":"nz-seg-bg-sprite",src:bgSpriteSrc,alt:"","aria-hidden":"true"}),
preact.h("div",{"class":"nz-seg-scenario"},game.scenarioName),
preact.h("div",{"class":"nz-seg-title"},(_current$name=current==null?void 0:current.name)!=null?_current$name:'New Segment'),
preact.h("div",{"class":"nz-seg-progress"},game.currentSegmentIndex+1," / ",game.totalSegments)
),


preact.h("div",{"class":"nz-seg-timeline-wrap"},
preact.h("div",{"class":"nz-seg-timeline"},
summaries.map(function(s,i){return preact.h(preact.Fragment,{key:s.id},
i>0&&preact.h("div",{"class":"nz-tl-line"+(s.status!=='upcoming'&&summaries[i-1].status!=='upcoming'?' nz-tl-line--done':'')}),
preact.h(TimelineNode,{summary:s,index:i})
);})
)
),

preact.h("div",{"class":"nz-seg-footer"},
preact.h("button",{"class":"nz-btn nz-btn-primary",onClick:handleProceed},"Continue"

)
)

)
)
);
}
//# sourceMappingURL=segment.js.map