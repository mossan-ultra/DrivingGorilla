import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useTexture, OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

const straightnoise =
  "https://raw.githubusercontent.com/pizza3/asset/master/chaassets/straightnoise.webp";
const borderFront =
  "https://raw.githubusercontent.com/pizza3/asset/master/chaassets/fontborder.png";
const rampimg =
  "https://raw.githubusercontent.com/pizza3/asset/master/chaassets/ramp12.webp";
const borderBack =
  "https://raw.githubusercontent.com/pizza3/asset/master/chaassets/border9.png";

const BackImage = (props) => {
  const meshRef = useRef();
  const meshStandardMaterialRef = useRef();
  const viewport = useThree((state) => state.viewport);

  let scaleBase =
    viewport.width > viewport.height ? viewport.height : viewport.width;
  scaleBase -= 1;
  const scale = [scaleBase, scaleBase, 1];
  // const scale = [1, 1, 1];

  const { size } = useThree();
  let width, height;
  let rttWidth, rttHeight;
  let newfrontmaterial;
  let time;

  const [texture1, texture2] = useTexture([
    props.image,
    "/images/1851375.jpg",
    // "/images/holo.png",
  ]);

  function init() {
    cardBack();
  }

  function cardBack() {
    const uniforms = {
      renderBackTex: {
        type: "t",
        value: texture1,
      },
      btemplate: {
        type: "t",
        value: new THREE.TextureLoader().load(borderBack),
      },
      screenWidth: {
        value: width,
      },
      resolution: {
        value: new THREE.Vector2(rttWidth, rttHeight),
      },
      backtexture: {
        type: "t",
        value: texture2,
      },
      colorramp: {
        type: "t",
        value: new THREE.TextureLoader().load(rampimg),
      },
      time: {
        type: "f",
        value: time,
      },
    };
    newfrontmaterial = meshStandardMaterialRef.current;
    newfrontmaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        ...uniforms,
      };

      shader.vertexShader = `
          varying vec2 vUv2;
          varying vec2 vUv;
          varying vec3 camPos;
          // varying vec3 eyeVector;
          uniform float time;
        ${shader.vertexShader}
        `;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        `
          #include <project_vertex> 
          vUv2 = uv;
          vUv = uv;
          camPos = cameraPosition;
          vec4 worldPosition = modelViewMatrix * vec4( position, 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);`
      );

      shader.fragmentShader = `
    
      varying vec2 vUv;
      varying vec2 vUv2;
        varying vec3 camPos;
        uniform sampler2D renderBackTex;
        uniform sampler2D btemplate;
        uniform vec4 resolution;
        uniform float screenWidth;
        uniform sampler2D frontimg;
        uniform sampler2D backtexture;
        uniform sampler2D colorramp;
        uniform sampler2D demoimg;
  
        vec3 rgb(float r,float g,float b){
          return vec3(r/255.,g/255.,b/255.);
        }
        vec4 loadTexture(sampler2D tex){
          vec2 uv = vUv2;      
          vec2 distortedPosition = vec2(uv.x , uv.y);
          vec4 _texture = texture2D(tex, distortedPosition);
          return _texture;
        
        }

      ${shader.fragmentShader}
    `;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `
        #include <dithering_fragment>
  
        vec4 originalG = gl_FragColor;
        vec2 uv = gl_FragCoord.xy/resolution.xy ;
        float centerXAxis = screenWidth/resolution.x;
        vec4 backTemplete = texture2D(btemplate,mod(vUv2,1.));    
        // vec4 target = texture2D(renderBackTex,vec2(uv.x - centerXAxis + 0.5,uv.y));    
        vec4 target = loadTexture(renderBackTex);

        vec4 frontimgtex = texture2D(btemplate,mod(vUv2,1.));   
        vec3 backtexturetex = texture2D(backtexture,mod(vUv2,1.)).rgb;   
        float tone = pow(dot(normalize(camPos), normalize(backtexturetex.rgb)), 1.);
        vec4 colortex = texture2D( colorramp, vec2(tone,0.));
  
        gl_FragColor = vec4(frontimgtex);
        vec4 col = vec4(0.);
        col = vec4(vec3(colortex),1.);
        col += vec4(sin((tone + vUv2.x + vUv2.y/10.)*10.))/8.;
        col += vec4(0.3);
  
        vec4 shine = vUv.y*smoothstep(0.1,0.101,vec4(0.48)*sin((-normalize(camPos).x + vUv.x*2. - vUv.y*.7)/3.))/10.;
        vec4 finaltex = vec4(frontimgtex);
        if(frontimgtex.r<=0.99 && frontimgtex.g<=0.99 && frontimgtex.b<=0.99){
          finaltex = vec4(1.);
        }
        gl_FragColor = frontimgtex;
  
        if(gl_FragColor.g==1. && (gl_FragColor.r <= 0.055 && gl_FragColor.r >= 0.05 )){
          gl_FragColor = vec4(0.);
        }
  
        if(gl_FragColor.r == 0.0 && gl_FragColor.g >= 0.00){
          // gl_FragColor = (vec4(target) + originalG/5.)*gl_FragColor.a;
          gl_FragColor = (vec4(target))*gl_FragColor.a;
          // gl_FragColor += shine;
  
        } else {
          gl_FragColor =  col - vec4(vec3( 1.4 - col.r),1.) + 0.2 + originalG;
          gl_FragColor.b = 0.8;
          gl_FragColor.g *= 0.45;
          gl_FragColor.r *= 0.38;
          gl_FragColor += shine/5.;
        }
  
      `
      );
    };
  }

  useEffect(() => {
    // width = size.width;
    // height = size.height;
    // rttHeight = height * 2;
    // rttWidth = (rttHeight * 2) / 3;

    init();
  }, []);
  return (
    <mesh
      ref={meshRef}
      rotation={[0, 0, 0]}
      scale={scale}
      position={props.position}
    >
      <planeGeometry />
      <meshStandardMaterial
        ref={meshStandardMaterialRef}
        side={THREE.BackSide}
      />
    </mesh>
  );
};
const FrontImage = (props) => {
  const meshRef = useRef();
  const meshStandardMaterialRef = useRef();

  const { size } = useThree();
  let width, height;
  let rttWidth, rttHeight;
  let newfrontmaterial;
  let time;
  const viewport = useThree((state) => state.viewport);
  let scaleBase =
    viewport.width > viewport.height ? viewport.height : viewport.width;
  scaleBase -= 1;
  const scale = [scaleBase, scaleBase, 1];
  // const scale = [1, 1, 1];

  const [texture1, texture2] = useTexture([
    props.image,
    // "/images/1851375.jpg",
    // "/images/holo2.jpeg",
    "/images/holo3.jpeg",
    // "/images/holo.png",
  ]);

  function init() {
    cardFront();
  }

  function cardFront() {
    const uniforms = {
      renderBackTex: {
        type: "t",
        // value: effectComposerRef.current.inputBuffer.texture,
        value: texture1,
      },
      btemplate: {
        type: "t",
        value: new THREE.TextureLoader().load(borderFront),
      },
      screenWidth: {
        value: width,
      },
      resolution: {
        value: new THREE.Vector2(rttWidth, rttHeight),
      },
      backtexture: {
        type: "t",
        value: texture2,
      },
      colorramp: {
        type: "t",
        value: new THREE.TextureLoader().load(rampimg),
      },
      time: {
        type: "f",
        value: time,
      },
    };
    newfrontmaterial = meshStandardMaterialRef.current;
    newfrontmaterial.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        ...uniforms,
      };

      shader.vertexShader = `
          varying vec2 vUv2;
          varying vec3 camPos;
          // varying vec3 eyeVector;
          uniform float time;
        ${shader.vertexShader}
        `;

      shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        `
          #include <project_vertex>
          vUv2 = uv;
          camPos = cameraPosition + time;
          vec4 worldPosition2 = modelViewMatrix * vec4( position, 1.0);
          // eyeVector = normalize(worldPosition2.xyz - abs(cameraPosition));
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          `
      );

      shader.fragmentShader = `
          varying vec2 vUv2;
          varying vec3 camPos;
          // varying vec3 eyeVector;
          uniform sampler2D renderBackTex;
          uniform sampler2D btemplate;
          uniform vec4 resolution;
          uniform float screenWidth;
          uniform sampler2D frontimg;
          uniform sampler2D backtexture;
          uniform sampler2D colorramp;
          uniform sampler2D demoimg;
          uniform float time;

          vec4 loadTexture(sampler2D tex){
            vec2 uv = vUv2;      
            vec2 distortedPosition = vec2(uv.x , uv.y);
            vec4 _texture = texture2D(tex, distortedPosition);
            return _texture;
          
          }
        ${shader.fragmentShader}
      `;

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `
          #include <dithering_fragment>


          vec4 originalG = gl_FragColor;
          vec2 uv = gl_FragCoord.xy/resolution.xy ;
          vec2 vUv = vUv2;

          float centerXAxis = screenWidth/resolution.x;
          vec4 backTemplete = texture2D(btemplate,mod(vUv2,1.));
  
          float frequency = 100.0/(0.8 - vUv.y);
          float amplitude = 0.004;
          float distortion=sin(uv.y*frequency + time)*amplitude*(0.8 - vUv.y)*smoothstep(0.380,0.1,vUv.y);
  
        
          // vec4 target = texture2D(renderBackTex,vec2(uv.x - centerXAxis + distortion + 0.5,uv.y));
          vec4 target = loadTexture(renderBackTex);
  
          gl_FragColor = vec4(backTemplete);
          if(backTemplete.r >= .05 ){
            gl_FragColor = vec4(target);
          }
  
          vec4 frontimgtex = texture2D(btemplate,mod(vUv2,1.));
          vec4 _frontimgtex = texture2D(renderBackTex,mod(vUv2,1.));
          vec3 backtexturetex = texture2D(backtexture,mod(vec2(vUv2.x,vUv2.y*1.),1.)).rgb;
          float tone = pow(dot(normalize(camPos), normalize(backtexturetex.rgb)), 1.);
          vec4 colortex = texture2D( colorramp, vec2(mod(tone + 0.,1.),0.2));
  
          gl_FragColor = vec4(frontimgtex);
          // gl_FragColor = vec4(_frontimgtex);
          vec4 col = vec4(0.);
          col = vec4(vec3(colortex),1.);
          col += vec4(sin((tone + vUv2.x + vUv2.y/10.)*10.))/8.;
          col += vec4(0.3);
  
          vec4 finaltex = vec4(frontimgtex);
  
          if(frontimgtex.r<=0.99 && frontimgtex.g<=0.1){
            finaltex = vec4(0.);
          }
  
          vec4 shine = vUv.y*smoothstep(0.1,0.101,vec4(0.48)*sin((normalize(camPos).x + vUv.x*2. - vUv.y*.7)/3.))/10.;
          vec4 _tmp2;
          if(finaltex.r>=0.01 && finaltex.g <=0.003){
            _tmp2 = vec4(target) + originalG/5.;
            // gl_FragColor = vec4(target) + vec4(shine);
          } else {
            if(finaltex.r==0.&&finaltex.g==0.){
              // gl_FragColor = vec4(1.,1.,1.,finaltex.a) * (col - vec4(vec3( 1.4  - gl_FragColor.r),1.) + 0.2 + originalG);
              _tmp2 = vec4(0.2,0.2,0.2,1.) * (col - vec4(vec3(0.2),1.)  + originalG);
  
            }else{
              _tmp2 = vec4(1.,1.,1.,finaltex.a) * (col - vec4(vec3( 1.4  - gl_FragColor.r),1.) + 0.2 + originalG) + shine/5.;
            }
          }
          _tmp2 = vec4(1.,1.,1.,finaltex.a) * (col - vec4(vec3( 1.3  - gl_FragColor.r),1.) + 0.2 + originalG) + shine/5.;
          gl_FragColor = target * (_tmp2);
          // 輝度を調整する
          gl_FragColor.rgb *= 1.5;
          `
      );
    };
  }

  useEffect(() => {
    // width = size.width;
    // height = size.height;
    // rttHeight = height * 2;
    // rttWidth = (rttHeight * 2) / 3;

    init();
  }, []);

  return (
    <mesh
      ref={meshRef}
      rotation={[0, 0, 0]}
      scale={scale}
      position={props.position}
    >
      <planeGeometry />
      <meshStandardMaterial ref={meshStandardMaterialRef} />
    </mesh>
  );
};
export const HoloEffectCard = (props) => {
  const [isBack, setIsBack] = useState(false);
  const canvasRef = useRef();
  const controlRef = useRef();

  function onPositionChange(o) {
    const x = controlRef.current.getAzimuthalAngle();
    const z = controlRef.current.getPolarAngle();
    const angle = THREE.MathUtils.radToDeg(Math.atan2(x, z));

    if (angle >= 45 || angle <= -45) {
      setIsBack(true);
    } else if (angle < 45 || angle > -45) {
      setIsBack(false);
    }
  }
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (props.autorotate) {
      const id = setInterval(() => {
        if (!controlRef.current) return;
        setTime(time + 1);
        const yAngle = controlRef.current.getAzimuthalAngle();
        controlRef.current.setAzimuthalAngle(yAngle + 0.2);
      }, 10);
      return () => clearInterval(id);
    }
  }, [time]);

  return (
    <>
      <Canvas style={props.style}>
        {props.enableOrbitContorls && (
          <OrbitControls onChange={onPositionChange} ref={controlRef} />
        )}
        {isBack && <BackImage image={"/images/back.jpeg"} position={[0, 0, 0]} />}
        {!isBack && <FrontImage image={props.image} position={[0, 0, 0]} />}
      </Canvas>
    </>
  );
};
