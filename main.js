import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

let scene, camera, renderer;

const startButton = document.getElementById( 'startButton' );
			startButton.addEventListener( 'click', init );

function init(){

//remove button from page 
const overlay = document.getElementById( 'overlay' );
				overlay.remove();
const container = document.getElementById( 'app' )

// scene
scene = new THREE.Scene;

//camera
camera = new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,45,30000);
//camera.position.set(-900,-200,-900);
//0, 200, 4000
camera.position.set(0, 200, 3000);
//light
const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

//audio
const listener = new THREE.AudioListener();
				camera.add( listener );

//renderer
renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

//enable webVR
renderer.xr.enabled = true;
renderer.xr.setReferenceSpaceType( 'local' );
document.body.appendChild( VRButton.createButton( renderer ) );

//ORBITcontrols 
let controls = new OrbitControls(camera,renderer.domElement);

controls.enableDamping = true;
controls.screenSpacePanning = false;
controls.minPolarAngle = Math.PI/2;
controls.minDistance = 500;
controls.maxDistance = 1500;


controls.update();
//window resize
windowResize();

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~skybox~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//create an array to store the materials of each side of the cube 
let materialArray = [];
//load images
let texture_ft = new THREE.TextureLoader().load( 'assets/trance_ft.jpg');
let texture_bk = new THREE.TextureLoader().load( 'assets/trance_bk.jpg');
let texture_up = new THREE.TextureLoader().load( 'assets/trance_up.jpg');
let texture_dn = new THREE.TextureLoader().load( 'assets/trance_dn.jpg');
let texture_rt = new THREE.TextureLoader().load( 'assets/trance_rt.jpg');
let texture_lf = new THREE.TextureLoader().load( 'assets/trance_lf.jpg');
  
// once loaded we will push each material to the array 
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));

//create a box geometry set with the material array
for (let i = 0; i < 6; i++)
           materialArray[i].side = THREE.BackSide;
        let skyboxGeo = new THREE.BoxGeometry( 10000, 10000, 10000);
        let skybox = new THREE.Mesh( skyboxGeo, materialArray );
      
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~/skybox/~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//load sound
const audioLoader = new THREE.AudioLoader();
const sound1 = new THREE.Audio( listener );
//const sound1 = new THREE.PositionalAudio( listener );
audioLoader.load( 'assets/505-tibetan-singingbowl.mp3', function ( buffer ) {

  sound1.setBuffer( buffer );
  sound1.setLoop( true );
	sound1.setVolume( 0.5 );
  sound1.play();
  

} );

//load models

const myLoader = new GLTFLoader();
myLoader.load( 'assets/stele_with_shakyamuni_and_maitreya (1)/scene.gltf', function ( gltf ) {

const steleShakyamuniMaitreya = gltf.scene;
//steleShakyamuniMaitreya.position.set(-6000, 300, 5100);
steleShakyamuniMaitreya.position.set(-5000, 200, 5400);
steleShakyamuniMaitreya.scale.set( 200, 200, 200 );
//rotate model by 180 
steleShakyamuniMaitreya.rotation.y = 3 * Math.PI / 4 ;
//steleShakyamuniMaitreya.rotation.y = Math.PI / 2;

	scene.add( steleShakyamuniMaitreya );
 
  //renderer.render(scene,camera);

}, undefined, function ( error ) {

	console.error( error );

} );




//stuffInside();
getQuotes();

//add to scene 
scene.add( skybox );  
animate();
}



//animate 
function animate() {
  renderer.render(scene,camera);
  requestAnimationFrame(animate);
 
}


//resize this makes it adapable for when the window size is changed 
function windowResize(){
// event listener for the window resize to update camera and renderer
    window.addEventListener('resize', ()=>{
// Update sizes
       var width = window.innerWidth;
       var height = window.innerHeight;
    
// Update camera
       camera.aspect = width / height;
       camera.updateProjectionMatrix();
    
// Update renderer
       renderer.setSize(width, height);
       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    })
}


//function to get quotes for text 

async function getQuotes(){
  const apiURL = "https://api.quotable.io/random"
  const response  = await fetch(apiURL);
  const data = await response.json();
  const {content} = data;
  const {author} = data;
  
var quote = data.content;

/*as some quotes bring back longer results it would be good to covert the
data intoa multiline text depending on quote length*/
var theAuthor = data.author;

console.log( quote, theAuthor);

animate();
//call the function load text which takes the quote as a parameter
loadText(quote, theAuthor);
         
}

const loader = new THREE.FontLoader();
    // promisify font loading
    function loadFont(url) {
      return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
    }
   
    //wait for font and create text mesh
    async function loadText(quote,theAuthor) {
      const font = await loadFont('node_modules/three/examples/fonts/helvetiker_regular.typeface.json');  /* threejsfundamentals: url */
      const quotegeometry = new THREE.TextGeometry(quote, {
        font: font,
        size: 150,
        height: .05,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: .3,
        bevelSegments: 5,
      });
      const material = new THREE.MeshBasicMaterial({color: 0xffffff});
      const myTextQuote = new THREE.Mesh(quotegeometry, material);
      //0, 200, 4000
      myTextQuote.position.set(-4500, 4000, -2000);
      myTextQuote.rotation.x = Math.PI / 2;

      //author text
      const authorGeometry = new THREE.TextGeometry(theAuthor, {
        font: font,
        size: 170,
        height: .01,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: .3,
        bevelSegments: 5,
      });

      const myTextAuthor = new THREE.Mesh(authorGeometry, material);
   myTextAuthor.position.set(5000, 1000, -2000);
   myTextAuthor.rotation.y = 3 * Math.PI / 2;
  // myTextAuthor.rotation.x = Math.PI/2 ;
  // myTextAuthor.rotation.z = Math.PI/2 ;
 
   scene.add(myTextQuote);
   scene.add(myTextAuthor);
    }


// function stuffInside(){
//   const geometry = new THREE.BoxGeometry(10, 10, 10);
// 	const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
// 	const cube = new THREE.Mesh( geometry, material );
//   cube.position.set(0,0,0);
// 	scene.add( cube );

// }