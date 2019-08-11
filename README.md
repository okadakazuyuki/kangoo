# kangoo

three.js・webGlを利用した、スライドショープラグインです。
___
こちらのプロジェクトを元にスライドショーに仕立て直しました。  
https://github.com/robin-dela/hover-effect
___
  
  
  
利用法は
TweenMaxとthree.jsを読み込んでnewしてdomと必要情報入れ込みます。
___
    var domobj = document.getElementById("stage");  
    var _k =  new kangoo(  
    {  
      parent : domobj, // need dom obj  
       images : [  
         "assets/images/sample-images/mini/image01.jpg",  
         "assets/images/sample-images/mini/image02.jpg",  
         "assets/images/sample-images/mini/image03.jpg",  
         "assets/images/sample-images/mini/image04.jpg",  
         "assets/images/sample-images/mini/image05.jpg",  
         "assets/images/sample-images/mini/image06.jpg",  
         "assets/images/sample-images/mini/image07.jpg",  
         "assets/images/sample-images/mini/image08.jpg",  
         "assets/images/sample-images/mini/image09.jpg",  
         "assets/images/sample-images/mini/image10.jpg",  
         "assets/images/sample-images/mini/image11.jpg",  
         "assets/images/sample-images/mini/image12.jpg"  
       ],// need slide images  
       mix_file: "assets/images/dist/2-ultra-light.jpg",  
       dulation : 1, // set transform dulation at seconds  
       delay : 3.5,// set each slide delay at seconds  
     }  
    );  
___
