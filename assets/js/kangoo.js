var kangoo = function(option){
  var error = function(mes){
    mes = mes ? mes : "some error happened";
    throw new Error(mes);
  };

  var flg_change = false; 

  var render = function(next_num){
    if(stop_flg) return;
    renderer.render( scene, camera );
    
    var now_time = count/60;
    var is_change_time = now_time > ( _scene.current + 1 ) * delay + ( _scene.current + 1 ) * dulation;

    if(_scene.current < images.length-1){
      if(flg_change && _scene.change_finished){
        _scene.change_finished = false;
        _scene.changing = true;
        var next = next_num >= 0 ? next_num : _scene.current + 1;
        change(textures[_scene.current],textures[next],next);
      }else if( auto_slide && (is_change_time && _scene.change_finished) ) {
        _scene.change_finished = false;
        _scene.changing = true;
        change(textures[_scene.current],textures[_scene.current + 1]);
      }
    }else{
      if(auto_slide && !loop && callbacks.ended && typeof callbacks.ended === "function" ) {
        callbacks.ended();
        callbacks.ended = false;
      }
      if(loop){
        if(_scene.current == images.length-1){
          if(  (flg_change && _scene.change_finished) || (is_change_time && _scene.change_finished) ) {
            _scene.change_finished = false;
            _scene.changing = true;
            change(textures[_scene.current],textures[0]);
            }
        }else{
          _scene.current = 0;
          count = 0;
        }
      }else if(flg_change && _scene.change_finished){
        _scene.change_finished = false;
        _scene.changing = true;
        var next = next_num >= 0 ? next_num : _scene.current + 1;
        change(textures[_scene.current],textures[next],next);
      }
    }
    console.log(auto_play,_scene,material);
    if(!_scene.change_finished){
      flg_change = false;
    }
    count++;
    if(auto_slide || !_scene.change_finished){
      requestAnimationFrame(render);
    }
  };


  var _scene = {
    current: 0,
    changing: false,
    change_finished: true
  };
  var stop_flg = false;
  var count = 1;
  var change =function(now_tex,next_tex,num){
    mesh.material.uniforms.changingFlg.value = true;
    mesh.material.uniforms.uTex.value = now_tex;
    mesh.material.uniforms.uTex2.value = next_tex;
    TweenMax.to(mesh.material.uniforms.changing, dulation, {
      value: 1,
      ease: Circ.easeIn,
      onComplete: function(){
        mesh.material.uniforms.uTex.value = next_tex;
        mesh.material.uniforms.changing.value = 0.0;
        var next = num >= 0 ? num : _scene.current + 1;
        _scene.current = next;
        _scene.changing = false;
        _scene.change_finished = true;
      }
    });
  };

  

  var parent = option.parent || error("no selected dom obj"); // need dom obj
  var images = option.images || error("no selected images");// need slide images
  var mix_file = option.mix_file || error("no selected mix_file");//need dist image name
  var loop = option.loop === false? false :  true;// need slide images
  var dulation = option.dulation || 0.5; // set transform dulation at seconds
  var delay = option.delay || 5;// set each slide delay at seconds
  var direction = option.direction || "default";
  var auto_slide = option.auto_slide === false ? false :  true;
  var auto_play = option.auto_play === false ? false :  true;
  var callbacks = option.callbacks || {loaded:"",ended:""};

  var renderer = new THREE.WebGLRenderer({
    alpha:true, antialias: true
  });


  renderer.setSize(parent.clientWidth, parent.clientHeight); // レンダラーのサイズをdivのサイズに設定
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setClearColor(0x000000, 1.0); // レンダラーの背景色を黒色（不透過）に設定

  parent.appendChild(renderer.domElement); // div領域にレンダラーを配置

  var camera = new THREE.OrthographicCamera(
    parent.offsetWidth / -2,
    parent.offsetWidth / 2,
    parent.offsetHeight / 2,
    parent.offsetHeight / -2,
    1,
    1000
  );
  camera.position.z = 1;

  var loader = new THREE.TextureLoader();
  var scene;
  var material;
  var geometry;
  var mesh;
  var size = 1;
  var changing = 0.0;
  var canvas = parent;
  var textures = [];
  var disp = loader.load(mix_file);

  var texture = loader.load(option.images[0],function(){
    texture.minFilter = THREE.LinearFilter;
    if(callbacks.loaded && typeof callbacks.loaded === "function" ) callbacks.loaded();

    option.images.forEach(function(src){
      textures.push(loader.load(src));
    });

    material = new THREE.ShaderMaterial({
      uniforms: {
        uTex : { type:"t", value: textures[0]},
        uTex2 : { type:"t", value: textures[1] },
        disp : { type:"t", value: disp },
        changingFlg : { type:"b", value: false },
        changing :{type: "f",value: changing }
      },
      vertexShader: vertex,
      fragmentShader: flagment
    });

    var parent_w = parent.clientWidth;
    var parent_h = parent.clientHeight;
    var asp_h = texture.image.width / texture.image.height;
    var gw,gh;
    if(parent_w >= parent_h*asp_h){
      gw = parent_w;
      gh = parent_h;
    }else{
      gw = parent_w;
      gh = parent_h;
    }
    geometry = new THREE.PlaneGeometry(gw, gh);
    mesh = new THREE.Mesh( geometry,material );
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;
    scene = new THREE.Scene();
    scene.add( mesh );
    //obj = {"mesh": mesh};
    

    window.addEventListener("resize", function() {
      var img_w = texture.image.width;
      var img_h = texture.image.height;
      var ww = parent.clientWidth;
      var wh = parent.clientHeight;
      var img_aspect = img_h/img_w;
      var img_aspect_yoko = img_w/img_h;
      var width = 0;
      var height = 0;
      if(wh >= ww*img_aspect){
        width = img_aspect_yoko * wh;
        height = wh;
      }else{
        width = ww;
        height = img_aspect*ww;
      }
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    },false);

    window.dispatchEvent(new Event("resize"));
    if(auto_play){
      render();
    }
    
});//End  callBack texture loaded

  var directions = {
    "default": '       vec2 dispP = vec2(vUv.x + changing*disp.r,vUv.y);'+'       vec2 dispP2 = vec2(vUv.x - (1.0 - changing) * disp.r , vUv.y);',
    "up": '       vec2 dispP = vec2(vUv.x,vUv.y - changing*disp.r);'+'       vec2 dispP2 = vec2(vUv.x , vUv.y + (1.0 - changing) * disp.r);',
    "down": '       vec2 dispP = vec2(vUv.x,vUv.y + changing*disp.r);'+'       vec2 dispP2 = vec2(vUv.x , vUv.y - (1.0 - changing) * disp.r);',
    "left": '       vec2 dispP = vec2(vUv.x - changing*disp.r,vUv.y);'+'       vec2 dispP2 = vec2(vUv.x + (1.0 - changing) * disp.r , vUv.y);'
  };
  var vertex = '   varying vec2 vUv;'+
'   void main(){'+
'     vUv = uv;'+
'     gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );'+
'   }';

  var  flagment = 'varying vec2 vUv;'+
'   uniform sampler2D uTex;'+
'   uniform bool changingFlg;'+
'   uniform float changing;'+
'   uniform sampler2D uTex2;'+
'   uniform sampler2D disp;'+
'   void main(){'+

'     if(changingFlg == false){'+
'       vec4 smpColor0 = texture2D(uTex,vUv);'+
'       gl_FragColor = smpColor0;'+
'     }else{'+
'       vec4 disp =  texture2D(disp, vUv);'+directions[direction]+

'       vec4 smpColor0 = texture2D(uTex,dispP);'+
'       vec4 smpColor1 = texture2D(uTex2,dispP2);'+
'       gl_FragColor = mix(smpColor0,smpColor1,changing);'+
'     }'+
'    }';


  this.changematelial = function(name){
    if(!mesh) return false;
    var new_disp = loader.load('assets/images/dist/'+name+'.jpg');
    mesh.material.uniforms.disp.value = new_disp;
    return true;
  };

  this.stop = function(){
    stop_flg = true;
  };
  this.auto_slide = auto_slide;

  this.trigger = function(num){
    if(flg_change || this.auto_slide || !_scene.change_finished) return;
    console.log("fired",this.auto_slide);
    flg_change = true;
    render(num);
  };

  this.start = function(){
    render();
  };
  
  return this;
};//End kangoo

