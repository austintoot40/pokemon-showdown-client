"use strict";











function SectionHeader(_ref){var color=_ref.color,children=_ref.children;
return preact.h("div",{"class":"nz-about-section-header nz-about-section-header-"+color},children);
}

function SpriteRow(_ref2){var pokemon=_ref2.pokemon;
return(
preact.h("div",{"class":"nz-about-sprite-row"},
pokemon.map(function(p){return(
preact.h(NzSprite,{key:p,species:p,size:60,"class":"nz-about-sprite",animate:false}));}
)
));

}

function TrainerSprite(_ref3){var _ref4,_Dex;var sprite=_ref3.sprite,alt=_ref3.alt;
var url=(_ref4=(_Dex=window.Dex)==null?void 0:_Dex.resolveAvatar(sprite))!=null?_ref4:"https://play.pokemonshowdown.com/sprites/trainers/"+
sprite+".png";
return preact.h("img",{"class":"nz-about-trainer",src:url,alt:alt,width:96,height:96});
}

var _spriteSheetReady=false;

function AboutPage(){
if(!window.BattlePokedex)return preact.h(NzLoadingScreen,null);

if(!_spriteSheetReady){
var sheet=new Image();
sheet.onload=function(){_spriteSheetReady=true;PS.update();};
sheet.src=Dex.resourcePrefix+"sprites/pokemonicons-sheet.png?v21";
if(sheet.complete){
_spriteSheetReady=true;
}else{
return preact.h(NzLoadingScreen,null);
}
}
return(
preact.h("div",{"class":"nz-about-content"},
preact.h("div",{"class":"nz-about-sections-grid"},

preact.h("section",{"class":"nz-about-section"},
preact.h(SectionHeader,{color:"fire"},"The Origin Story"),
preact.h("div",{"class":"nz-about-section-inner"},
preact.h("div",{"class":"nz-about-text-col"},
preact.h("p",null,"Thank you so much for playing my game!"

),
preact.h("p",null,"I've had this idea rolling around in my head for years. I love nuzlockes, but I never have the motivation to start a new one, since the best parts were buried under hours of filler. If I have to fight ten more Team Rocket grunts with four Zubats each I'm going to end up on the news. I made this to focus on just the good parts of the nuzlocke and skip over the BS."





)
),
preact.h("div",{"class":"nz-about-sprite-col"},
preact.h("div",{"class":"nz-about-sprite-card"},
preact.h("div",{"class":"nz-about-sprite-caption"},"\"Go! My 14 underleveled zubats!\""),
preact.h(TrainerSprite,{sprite:"teamrocketgruntm-gen3",alt:"Team Rocket Grunt"}),
preact.h(SpriteRow,{pokemon:['Zubat','Zubat','Zubat']})
)
)
)
),

preact.h("section",{"class":"nz-about-section"},
preact.h(SectionHeader,{color:"water"},"Strategy Focused"),
preact.h("div",{"class":"nz-about-section-inner nz-about-section-inner-flip"},
preact.h("div",{"class":"nz-about-sprite-col"},
preact.h("div",{"class":"nz-about-sprite-card"},
preact.h(SpriteRow,{pokemon:['Torchic','Mudkip','Treecko']}),
preact.h(TrainerSprite,{sprite:"steven",alt:"Champion"}),
preact.h("div",{"class":"nz-about-sprite-caption"},"\"Hey wait, I still need that letter delivered!\"")
)
),
preact.h("div",{"class":"nz-about-text-col"},
preact.h("p",null,"This game is my best attempt to design purely for nuzlocke strategy. Get your random encounters, build a team, and try to beat the next major fight. No grinding, no filler fights, no scouring Bulbapedia for which strength puzzle they hid the Water Stone behind."




)
)
)
),

preact.h("section",{"class":"nz-about-section"},
preact.h(SectionHeader,{color:"grass"},"Under the Hood"),
preact.h("div",{"class":"nz-about-section-inner"},
preact.h("div",{"class":"nz-about-text-col"},
preact.h("p",null,"If you're curious how it works, it's a heavily modified Pok\xE9mon Showdown fork, which is open source and the only full Pok\xE9mon battle sim I could find that runs in a browser. On top of that I wrote the AI from scratch and mapped out all the encounters, items, and battles for each scenario."




)
),
preact.h("div",{"class":"nz-about-sprite-col"},
preact.h("div",{"class":"nz-about-sprite-card"},
preact.h(SpriteRow,{pokemon:['Rotom','Porygon2']}),
preact.h(TrainerSprite,{sprite:"scientist",alt:"Scientist"}),
preact.h("div",{"class":"nz-about-sprite-caption"},"\"It's all spaghetti code of course.\"")
)
)
)
),

preact.h("section",{"class":"nz-about-section"},
preact.h(SectionHeader,{color:"electric"},"What's Next"),
preact.h("div",{"class":"nz-about-section-inner nz-about-section-inner-flip"},
preact.h("div",{"class":"nz-about-sprite-col"},
preact.h("div",{"class":"nz-about-sprite-card"},
preact.h("div",{"class":"nz-about-sprite-caption"},"\"That's right, I send out my SIXTH Garchomp!\""),
preact.h(TrainerSprite,{sprite:"cynthia",alt:"Champion"}),
preact.h(SpriteRow,{pokemon:['Garchomp','Rayquaza']})
)
),
preact.h("div",{"class":"nz-about-text-col"},
preact.h("p",null,"There's a lot of things I want to add eventually. Difficult ROM hacks like Emerald Kaizo, the rest of the mainline games, a custom scenario editor, and more."



),
preact.h("p",null,"I'll keep adding content as long as you all keep playing, so have fun and tell your friends about it!"


)
)
)
)

),
preact.h("div",{"class":"nz-about-footer"},
preact.h("button",{"class":"nz-btn nz-btn-primary nz-about-footer-btn",onClick:function(){return PS.leave('view-about');}},"Close")
)
));

}
//# sourceMappingURL=about.js.map