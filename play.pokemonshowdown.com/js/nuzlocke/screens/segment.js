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



function PokemonCarousel(_ref3){var items=_ref3.items,variant=_ref3.variant;
return preact.h(Carousel,{
items:items,
renderItem:function(item,visible){
var wrapCls="nz-pkmn-carousel nz-pkmn-carousel--"+variant+(visible?' nz-pkmn-carousel-visible':'');
return preact.h("div",{"class":wrapCls},
preact.h(NzSprite,{species:item.species,"class":"nz-pkmn-carousel-sprite"}),
preact.h("div",{"class":"nz-pkmn-carousel-label"},item.label)
);
}}
);
}





function TimelineNode(_ref4)


{var summary=_ref4.summary,index=_ref4.index;
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
species:d.species,
label:d.nickname
};})}
)
);
}





function SegmentScreen(_ref5){var _game$segmentSummarie,_game$scenarioPokemon,_current$name,_current$name2;var game=_ref5.game;
var summaries=(_game$segmentSummarie=game.segmentSummaries)!=null?_game$segmentSummarie:[];
var current=summaries.find(function(s){return s.status==='current';});

function handleProceed(){
PS.send('/nuzlocke proceed');
}

var colorStyle=game.scenarioColor?"--scenario-color:"+game.scenarioColor:'';
var bgSpriteSrc=(_game$scenarioPokemon=game.scenarioPokemon)!=null?_game$scenarioPokemon:null;

return preact.h(NzRoot,null,
preact.h(NzScreen,null,
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
preact.h(TimelineNode,{summary:s,index:i})
);})
)
),

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

)
)
);
}
//# sourceMappingURL=segment.js.map