var kangoo = function(option){
  var error = function(mes){
    mes = mes ? mes : "some error happened";
    throw new Error(mes);
  };

  var render = function(){
    renderer.render( scene, camera );
    var now_time = (Date.now() - start_time)/1000;
    if(_scene.current < images.length-1){
      if( now_time > ( _scene.current + 1 ) * delay + ( _scene.current + 1 ) * dulation && _scene.change_finished ) {
        _scene.change_finished = false;
        _scene.changing = true;
        change(textures[_scene.current],textures[_scene.current + 1]);
      }
    }
    requestAnimationFrame(render);
  };


  var _scene = {
    current: 0,
    changing: false,
    change_finished: true
  };
  var count = 0;
  var change =function(now_tex,next_tex){
    mesh.material.uniforms.changingFlg.value = true;
    mesh.material.uniforms.uTex.value = now_tex;
    mesh.material.uniforms.uTex2.value = next_tex;
    TweenMax.to(mesh.material.uniforms.changing, dulation, {
      value: 1,
      ease: Circ.easeIn,
      onComplete: function(){
        mesh.material.uniforms.uTex.value = next_tex;
        mesh.material.uniforms.changing.value = 0.0;
        _scene.current++;
        _scene.changing = false;
        _scene.change_finished = true;
      }
    });
  };

  var parent = option.parent || error("no selected dom obj"); // need dom obj
  var images = option.images || error("no selected images");// need slide images
  var dulation = option.dulation || 0.5; // set transform dulation at seconds
  var delay = option.delay || 5;// set each slide delay at seconds
  var mode = option.mode || 1;//set by dist image name
  var autoPlay = option.autoPlay || false;
  var start_time = Date.now();

  var renderer = new THREE.WebGLRenderer({alpha:true, antialias: true });
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
  var disp = loader.load('assets/images/dist/'+mode+'.jpg');

  var texture = loader.load(option.images[0],function(){
    texture.minFilter = THREE.LinearFilter;

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
    render();
    
});//End  callBack texture loaded


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
'       vec4 disp =  texture2D(disp, vUv);'+
'       vec2 dispP = vec2(vUv.x + changing*disp.r,vUv.y);'+
'       vec2 dispP2 = vec2(vUv.x - (1.0 - changing) * disp.r , vUv.y);'+

'       vec4 smpColor0 = texture2D(uTex,dispP);'+
'       vec4 smpColor1 = texture2D(uTex2,dispP2);'+
'       gl_FragColor = mix(smpColor0,smpColor1,changing);'+
'     }'+
'    }';

};//End kangoo

