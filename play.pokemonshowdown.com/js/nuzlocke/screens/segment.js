"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}












function nzToID(str){
if(!str||typeof str!=='string')return'';
return str.toLowerCase().replace(/[^a-z0-9]/g,'');
}










function isZoneAccessible(zone,game){
var req=zone.requires;
if(!req)return true;
if(req.type==='hm'||req.type==='move')return game.tmMoves.includes(req.name);
if(req.type==='pokemon')return game.box.some(function(p){return nzToID(p.species)===nzToID(req.name);});
if(req.type==='battle')return game.completedBattles.includes(req.name);
return game.items.includes(req.name);
}

function getPreviewItems(game){var _game$segmentSummarie;
var current=((_game$segmentSummarie=game.segmentSummaries)!=null?_game$segmentSummarie:[]).find(function(s){return s.status==='current';});
if(!current)return[];
var seen=new Set();
var result=[];for(var _i2=0,_current$availableEnc2=
current.availableEncounters;_i2<_current$availableEnc2.length;_i2++){var enc=_current$availableEnc2[_i2];for(var _i4=0,_enc$zones2=
enc.zones;_i4<_enc$zones2.length;_i4++){var zone=_enc$zones2[_i4];
if(!isZoneAccessible(zone,game))continue;for(var _i6=0,_zone$pokemon2=
zone.pokemon;_i6<_zone$pokemon2.length;_i6++){var entry=_zone$pokemon2[_i6];
var id=nzToID(entry.species);
if(!seen.has(id)){
seen.add(id);
result.push({species:entry.species,route:enc.route});
}
}
}
}

for(var i=result.length-1;i>0;i--){
var j=Math.floor(Math.random()*(i+1));var _ref=
[result[j],result[i]];result[i]=_ref[0];result[j]=_ref[1];
}
return result.slice(0,40);
}







var CAROUSEL_VISIBLE=5;var

PreviewCarousel=function(_preact$Component){



function PreviewCarousel(props){var _this;
_this=_preact$Component.call(this,props)||this;_this.timer=null;_this.fadeTimer=null;
_this.state={index:0,visible:true};return _this;
}_inheritsLoose(PreviewCarousel,_preact$Component);var _proto=PreviewCarousel.prototype;_proto.

componentDidMount=function componentDidMount(){var _this2=this;
if(this.props.items.length>1){
this.timer=setInterval(function(){return _this2.advance();},3000);
}
};_proto.

componentWillUnmount=function componentWillUnmount(){
if(this.timer!==null)clearInterval(this.timer);
if(this.fadeTimer!==null)clearTimeout(this.fadeTimer);
};_proto.

visibleCount=function visibleCount(){
if(window.innerWidth<=600)return 1;
if(window.innerWidth<=900)return 3;
return 5;
};_proto.

advance=function advance(){var _this3=this;
this.setState({visible:false});
var step=this.visibleCount();
this.fadeTimer=setTimeout(function(){
_this3.setState(function(s){return{
index:(s.index+step)%_this3.props.items.length,
visible:true
};});
},250);
};_proto.

render=function render(){var _this4=this;
var items=this.props.items;
if(items.length===0){
return preact.h("div",{"class":"nz-carousel-empty"},"No wild encounters available yet.");
}

var count=Math.min(CAROUSEL_VISIBLE,items.length);
var slots=Array.from({length:count},function(_,i){return(
items[(_this4.state.index+i)%items.length]);}
);

return preact.h("div",{"class":"nz-carousel"},
preact.h("div",{"class":"nz-carousel-row"+(this.state.visible?' nz-carousel-visible':'')},
slots.map(function(item,i){
var id=nzToID(item.species);
var src="https://play.pokemonshowdown.com/sprites/gen5ani/"+id+".gif";
return preact.h("div",{key:item.species+"-"+i,"class":"nz-carousel-item nz-carousel-item-"+i},
preact.h("img",{"class":"nz-carousel-sprite",src:src,alt:item.species}),
preact.h("div",{"class":"nz-carousel-species"},item.species)
);
})
)
);
};return PreviewCarousel;}(preact.Component);var








TrainerCarousel=function(_preact$Component2){



function TrainerCarousel(props){var _this5;
_this5=_preact$Component2.call(this,props)||this;_this5.timer=null;_this5.fadeTimer=null;
_this5.state={index:0,visible:true};return _this5;
}_inheritsLoose(TrainerCarousel,_preact$Component2);var _proto2=TrainerCarousel.prototype;_proto2.

componentDidMount=function componentDidMount(){var _this6=this;
if(this.props.sprites.length>1){
this.timer=setInterval(function(){return _this6.advance();},3000);
}
};_proto2.

componentWillUnmount=function componentWillUnmount(){
if(this.timer!==null)clearInterval(this.timer);
if(this.fadeTimer!==null)clearTimeout(this.fadeTimer);
};_proto2.

advance=function advance(){var _this7=this;
this.setState({visible:false});
this.fadeTimer=setTimeout(function(){
_this7.setState(function(s){return{
index:(s.index+1)%_this7.props.sprites.length,
visible:true
};});
},250);
};_proto2.

render=function render(){var _ref2,_Dex;
var sprites=this.props.sprites;
if(sprites.length===0)return preact.h("div",{"class":"nz-tl-trainer-placeholder"});
var sprite=sprites[this.state.index];
var url=(_ref2=(_Dex=window.Dex)==null?void 0:_Dex.resolveAvatar(sprite))!=null?_ref2:"https://play.pokemonshowdown.com/sprites/trainers/"+
sprite+".png";
return preact.h("div",{"class":"nz-tl-trainer-wrap"+(this.state.visible?' nz-tl-trainer-visible':'')},
preact.h("img",{"class":"nz-tl-trainer-sprite",src:url,alt:sprite,width:80,height:80})
);
};return TrainerCarousel;}(preact.Component);var













PokemonCarousel=function(_preact$Component3){






function PokemonCarousel(props){var _this8;
_this8=_preact$Component3.call(this,props)||this;_this8.timer=null;_this8.fadeTimer=null;
_this8.state={index:0,visible:true};return _this8;
}_inheritsLoose(PokemonCarousel,_preact$Component3);var _proto3=PokemonCarousel.prototype;_proto3.

componentDidMount=function componentDidMount(){var _this9=this;
if(this.props.items.length>1){
this.timer=setInterval(function(){return _this9.advance();},3000);
}
};_proto3.

componentWillUnmount=function componentWillUnmount(){
if(this.timer!==null)clearInterval(this.timer);
if(this.fadeTimer!==null)clearTimeout(this.fadeTimer);
};_proto3.

advance=function advance(){var _this10=this;
this.setState({visible:false});
this.fadeTimer=setTimeout(function(){
_this10.setState(function(s){return{
index:(s.index+1)%_this10.props.items.length,
visible:true
};});
},250);
};_proto3.

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






function TimelineNode(_ref3)


{var summary=_ref3.summary,index=_ref3.index;
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
src:"https://play.pokemonshowdown.com/sprites/gen5/"+nzToID(d.species)+".png",
label:d.nickname
};})}
)
);
}





function SegmentScreen(_ref4){var _game$segmentSummarie2,_current$name;var game=_ref4.game;
var summaries=(_game$segmentSummarie2=game.segmentSummaries)!=null?_game$segmentSummarie2:[];
var current=summaries.find(function(s){return s.status==='current';});
var previewItems=getPreviewItems(game);

function handleProceed(){
PS.send('/nuzlocke proceed');
}

var colorStyle=game.scenarioColor?"--scenario-color:"+game.scenarioColor:'';
var bgSpriteSrc=game.scenarioPokemon?"https://play.pokemonshowdown.com/sprites/gen5/"+
nzToID(game.scenarioPokemon)+".png":
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


previewItems.length>0&&preact.h("div",{"class":"nz-seg-preview"},
preact.h("div",{"class":"nz-seg-section-label"},"Available This Segment"),
preact.h(PreviewCarousel,{items:previewItems})
),

preact.h("div",{"class":"nz-seg-footer"},
preact.h("button",{"class":"nz-btn nz-btn-accent nz-seg-proceed-btn",onClick:handleProceed},"Begin Exploration \u25B6"

)
)

)
)
);
}
//# sourceMappingURL=segment.js.map