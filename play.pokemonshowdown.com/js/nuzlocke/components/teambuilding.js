"use strict";function _inheritsLoose(t,o){t.prototype=Object.create(o.prototype),t.prototype.constructor=t,_setPrototypeOf(t,o);}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t;},_setPrototypeOf(t,e);}















var STAT_VIEW_KEY='nuzlocke_stat_view';

function getStatViewPref(){
try{return localStorage.getItem(STAT_VIEW_KEY)==='radar';}catch(_unused){return false;}
}

function setStatViewPref(radar){
try{localStorage.setItem(STAT_VIEW_KEY,radar?'radar':'bars');}catch(_unused2){}
window.dispatchEvent(new CustomEvent('nzstatview'));
}





var CX=80,CY=80,MAX_R=54,LABEL_R=67;
var STAT_LABELS=['HP','Atk','Def','Spe','SpD','SpA'];
var STAT_KEYS_ORDERED=['hp','atk','def','spe','spd','spa'];


function radarPathD(vals,max){
var pts=vals.map(function(v,i){
var a=-Math.PI/2+i*(2*Math.PI/6);
var r=v/max*MAX_R;
return(CX+r*Math.cos(a)).toFixed(2)+" "+(CY+r*Math.sin(a)).toFixed(2);
});
return"M "+pts.join(' L ')+" Z";
}

function gridPoly(frac){
return STAT_KEYS_ORDERED.map(function(_,i){
var a=-Math.PI/2+i*(2*Math.PI/6);
var r=frac*MAX_R;
return(CX+r*Math.cos(a)).toFixed(2)+","+(CY+r*Math.sin(a)).toFixed(2);
}).join(' ');
}





function StatBarsInner(_ref){var _BattleNatures;var species=_ref.species,nature=_ref.nature,generation=_ref.generation;
var sp=(generation?Dex.forGen(generation):Dex).species.get(species);
var s=sp.baseStats;
var MAX=255;
var nat=nature?(_BattleNatures=BattleNatures[nature])!=null?_BattleNatures:{}:{};
var boosted=nat.plus;
var reduced=nat.minus;
var stats=[
{label:'HP',key:'hp'},
{label:'Atk',key:'atk'},
{label:'Def',key:'def'},
{label:'SpA',key:'spa'},
{label:'SpD',key:'spd'},
{label:'Spe',key:'spe'}];

return preact.h("div",{"class":"nz-stat-bars"},
stats.map(function(_ref2){var label=_ref2.label,key=_ref2.key;
var val=s[key];
var pct=Math.round(val/MAX*100);
var hue=Math.min(Math.floor(val*120/MAX),120);
var mod=key===boosted?' nz-stat-nature-up':key===reduced?' nz-stat-nature-down':'';
return preact.h("div",{key:key,"class":"nz-stat-row"},
preact.h("div",{"class":"nz-stat-label"+mod},label),
preact.h("div",{"class":"nz-stat-bar-track"},
preact.h("div",{"class":"nz-stat-bar-fill",style:"width:"+pct+"%;background:hsl("+hue+",85%,45%);box-shadow:0 0 4px hsla("+hue+",85%,45%,0.4)"})
),
preact.h("div",{"class":"nz-stat-value"+mod},val)
);
})
);
}

function NzIvBars(_ref3){var ivs=_ref3.ivs;
var MAX=31;
var stats=[
{label:'HP',key:'hp'},
{label:'Atk',key:'atk'},
{label:'Def',key:'def'},
{label:'SpA',key:'spa'},
{label:'SpD',key:'spd'},
{label:'Spe',key:'spe'}];

return preact.h("div",{"class":"nz-stat-bars"},
stats.map(function(_ref4){var label=_ref4.label,key=_ref4.key;
var val=ivs[key];
var pct=Math.round(val/MAX*100);
var hue=Math.min(Math.floor(val*120/MAX),120);
return preact.h("div",{key:key,"class":"nz-stat-row"},
preact.h("div",{"class":"nz-stat-label"},label),
preact.h("div",{"class":"nz-stat-bar-track"},
preact.h("div",{"class":"nz-stat-bar-fill",style:"width:"+pct+"%;background:hsl("+hue+",85%,45%);box-shadow:0 0 4px hsla("+hue+",85%,45%,0.4)"})
),
preact.h("div",{"class":"nz-stat-value"},val)
);
})
);
}





function StatRadarInner(_ref5){var _BattleNatures2;var species=_ref5.species,nature=_ref5.nature,generation=_ref5.generation;
var sp=(generation?Dex.forGen(generation):Dex).species.get(species);
var s=sp.baseStats;
var nat=nature?(_BattleNatures2=BattleNatures[nature])!=null?_BattleNatures2:{}:{};
var boosted=nat.plus;
var reduced=nat.minus;
var vals=STAT_KEYS_ORDERED.map(function(k){return s[k];});
var pathD=radarPathD(vals,255);
return preact.h("svg",{"class":"nz-stat-radar",viewBox:"0 0 160 160"},
[0.25,0.5,0.75,1].map(function(f){return(
preact.h("polygon",{key:f,points:gridPoly(f),"class":"nz-radar-grid"}));}
),
STAT_KEYS_ORDERED.map(function(_,i){
var a=-Math.PI/2+i*(2*Math.PI/6);
return preact.h("line",{key:i,x1:CX,y1:CY,
x2:(CX+MAX_R*Math.cos(a)).toFixed(2),
y2:(CY+MAX_R*Math.sin(a)).toFixed(2),
"class":"nz-radar-axis"});
}),
preact.h("path",{style:"d:path(\""+pathD+"\")","class":"nz-radar-fill"}),
preact.h("path",{style:"d:path(\""+pathD+"\")","class":"nz-radar-stroke"}),
vals.map(function(v,i){
var a=-Math.PI/2+i*(2*Math.PI/6);
var r=v/255*MAX_R;
return preact.h("circle",{key:i,
cx:(CX+r*Math.cos(a)).toFixed(2),
cy:(CY+r*Math.sin(a)).toFixed(2),
r:"2.5","class":"nz-radar-dot"});
}),
STAT_LABELS.map(function(label,i){
var key=STAT_KEYS_ORDERED[i];
var a=-Math.PI/2+i*(2*Math.PI/6);
var x=CX+LABEL_R*Math.cos(a);
var y=CY+LABEL_R*Math.sin(a);
var anchor=Math.cos(a)>0.3?'start':Math.cos(a)<-0.3?'end':'middle';
var dy=Math.sin(a)<-0.3?'-0.3em':Math.sin(a)>0.3?'0.3em':'0';
var mod=key===boosted?' nz-stat-nature-up':key===reduced?' nz-stat-nature-down':'';
return preact.h("text",{key:i,
x:x.toFixed(2),y:y.toFixed(2),
"text-anchor":anchor,"dominant-baseline":"middle",dy:dy,
"class":"nz-radar-label"+mod},label);
})
);
}

function IvRadarInner(_ref6){var ivs=_ref6.ivs;
var vals=STAT_KEYS_ORDERED.map(function(k){return ivs[k];});
var pathD=radarPathD(vals,31);
return preact.h("svg",{"class":"nz-stat-radar",viewBox:"0 0 160 160"},
[0.25,0.5,0.75,1].map(function(f){return(
preact.h("polygon",{key:f,points:gridPoly(f),"class":"nz-radar-grid"}));}
),
STAT_KEYS_ORDERED.map(function(_,i){
var a=-Math.PI/2+i*(2*Math.PI/6);
return preact.h("line",{key:i,x1:CX,y1:CY,
x2:(CX+MAX_R*Math.cos(a)).toFixed(2),
y2:(CY+MAX_R*Math.sin(a)).toFixed(2),
"class":"nz-radar-axis"});
}),
preact.h("path",{style:"d:path(\""+pathD+"\")","class":"nz-radar-fill"}),
preact.h("path",{style:"d:path(\""+pathD+"\")","class":"nz-radar-stroke"}),
vals.map(function(v,i){
var a=-Math.PI/2+i*(2*Math.PI/6);
var r=v/31*MAX_R;
return preact.h("circle",{key:i,
cx:(CX+r*Math.cos(a)).toFixed(2),
cy:(CY+r*Math.sin(a)).toFixed(2),
r:"2.5","class":"nz-radar-dot"});
}),
STAT_LABELS.map(function(label,i){
var a=-Math.PI/2+i*(2*Math.PI/6);
var x=CX+LABEL_R*Math.cos(a);
var y=CY+LABEL_R*Math.sin(a);
var anchor=Math.cos(a)>0.3?'start':Math.cos(a)<-0.3?'end':'middle';
var dy=Math.sin(a)<-0.3?'-0.3em':Math.sin(a)>0.3?'0.3em':'0';
return preact.h("text",{key:i,
x:x.toFixed(2),y:y.toFixed(2),
"text-anchor":anchor,"dominant-baseline":"middle",dy:dy,
"class":"nz-radar-label"},label);
})
);
}var









NzStatPair=function(_preact$Component){function NzStatPair(){var _this;for(var _len=arguments.length,args=new Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}_this=_preact$Component.call.apply(_preact$Component,[this].concat(args))||this;_this.






state={radar:getStatViewPref()};_this.
_onSync=function(){return _this.setState({radar:getStatViewPref()});};_this.


toggle=function(){return setStatViewPref(!_this.state.radar);};return _this;}_inheritsLoose(NzStatPair,_preact$Component);var _proto=NzStatPair.prototype;_proto.componentDidMount=function componentDidMount(){window.addEventListener('nzstatview',this._onSync);};_proto.componentWillUnmount=function componentWillUnmount(){window.removeEventListener('nzstatview',this._onSync);};_proto.

render=function render(){
var radar=this.state.radar;
var _this$props=this.props,species=_this$props.species,nature=_this$props.nature,generation=_this$props.generation,ivs=_this$props.ivs,ivsExtra=_this$props.ivsExtra;

var ivsLabel=preact.h("div",{"class":"nz-label",style:"margin-bottom:4px;display:flex;align-items:center;gap:6px"},"IVs ",
ivsExtra
);

if(radar){
return preact.h("div",{"class":"nz-stat-view"},
preact.h("button",{"class":"nz-stat-view-toggle",onClick:this.toggle},"\u2261 Bars"),
preact.h("div",{"class":"nz-stat-radar-row"},
preact.h("div",{"class":"nz-stat-radar-col"},
preact.h("div",{"class":"nz-label",style:"margin-bottom:4px"},"Base"),
preact.h(StatRadarInner,{species:species,nature:nature,generation:generation})
),
ivs&&preact.h("div",{"class":"nz-stat-radar-col"},
ivsLabel,
preact.h(IvRadarInner,{ivs:ivs})
)
)
);
}

return preact.h("div",{"class":"nz-stat-view"},
preact.h("button",{"class":"nz-stat-view-toggle",onClick:this.toggle},"\u2B21 Radar"),
preact.h("div",{"class":"nz-stat-split"},
preact.h("div",null,
preact.h("div",{"class":"nz-label",style:"margin-bottom:4px"},"Base"),
preact.h(StatBarsInner,{species:species,nature:nature,generation:generation})
),
preact.h("div",null,
ivsLabel,
ivs?
preact.h(NzIvBars,{ivs:ivs}):
preact.h("div",{"class":"nz-stat-no-ivs"},"Enemy Pok\xE9mon don't have IVs.")

)
)
);
};return NzStatPair;}(preact.Component);


function NzMoveInfo(_ref7){var moveId=_ref7.moveId;
if(!moveId)return null;
var move=Dex.moves.get(moveId);
if(!move.exists)return null;
var catLabel=move.category;
var power=move.basePower>0?move.basePower+" BP":'—';
var acc=move.accuracy===true?'—':move.accuracy+"%";
return preact.h("div",null,
preact.h("div",{"class":"nz-move-info"},
preact.h("span",{"class":"nz-type nz-type-"+move.type.toLowerCase()},move.type),
preact.h("span",{"class":"nz-move-cat nz-move-cat-"+move.category.toLowerCase()},catLabel),
preact.h("span",{"class":"nz-move-stat"},power),
preact.h("span",{"class":"nz-move-stat"},acc)
),
move.shortDesc&&preact.h("div",{"class":"nz-item-desc"},move.shortDesc)
);
}

function NzPartySlot(_ref8)

























{var pokemon=_ref8.pokemon,levelCap=_ref8.levelCap,generation=_ref8.generation,selected=_ref8.selected,isFirst=_ref8.isFirst,isLast=_ref8.isLast,onSelect=_ref8.onSelect,onDoubleClick=_ref8.onDoubleClick,onMoveUp=_ref8.onMoveUp,onMoveDown=_ref8.onMoveDown,hasError=_ref8.hasError,canEvolve=_ref8.canEvolve;
var cls=[
'nz-party-slot',
selected?'nz-party-slot-selected':'',
hasError?'nz-party-slot-error':'',
canEvolve?'nz-party-slot-evolve':''].
filter(Boolean).join(' ');
return preact.h("div",{"class":cls,onClick:onSelect,onDblClick:onDoubleClick},
preact.h("img",{
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(pokemon.species)+".png",
alt:pokemon.species}
),
preact.h("div",{"class":"nz-party-slot-info"},
preact.h("div",{"class":"nz-party-slot-name"},
pokemon.nickname,pokemon.gender==='M'?preact.h("span",{"class":"nz-gender nz-gender-m"},"\u2642"):pokemon.gender==='F'?preact.h("span",{"class":"nz-gender nz-gender-f"},"\u2640"):null
),
preact.h("div",{"class":"nz-party-slot-sub"},
pokemon.nickname!==pokemon.species?pokemon.species+" \xB7 ":'',"Lv.",levelCap
),
preact.h("div",{"class":"nz-party-slot-types"},preact.h(NzTypeBadges,{species:pokemon.species,generation:generation}))
),
preact.h("div",{"class":"nz-party-slot-arrows",onClick:function(e){return e.stopPropagation();}},
preact.h("button",{"class":"nz-party-arrow",onClick:onMoveUp,disabled:isFirst},"\u25B2"),
preact.h("button",{"class":"nz-party-arrow",onClick:onMoveDown,disabled:isLast},"\u25BC")
)
);
}

function NzOpponentSlot(_ref9)









{var pokemon=_ref9.pokemon,generation=_ref9.generation,selected=_ref9.selected,onSelect=_ref9.onSelect;
var cls=[
'nz-opponent-slot',
selected?'nz-opponent-slot-selected':''].
filter(Boolean).join(' ');
return preact.h("div",{"class":cls,onClick:onSelect},
preact.h("img",{
src:"https://play.pokemonshowdown.com/sprites/gen5/"+toID(pokemon.species)+".png",
alt:pokemon.species}
),
preact.h("div",{"class":"nz-party-slot-info"},
preact.h("div",{"class":"nz-party-slot-name"},pokemon.species),
preact.h("div",{"class":"nz-party-slot-sub"},"Lv. ",pokemon.level),
preact.h("div",{"class":"nz-party-slot-types"},preact.h(NzTypeBadges,{species:pokemon.species,generation:generation}))
)
);
}
//# sourceMappingURL=teambuilding.js.map