
   //navigation
   $(".effect-change-button").on("click",function(e){
     e.preventDefault();
     $(this).toggleClass("on");
     $(".menu").toggleClass("on");
   });

$(window).on("load",function(){
  $(".main-texts").addClass("on");
  
});


