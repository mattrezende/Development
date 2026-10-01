import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function createOrbitControls(
  camera: THREE.Camera,
  domElement: HTMLElement
): OrbitControls {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0, 0);

  // Convenção estilo SketchUp: botão direito/do meio sempre orbita/panorâmica,
  // deixando o botão esquerdo livre para as ferramentas de desenho.
  controls.mouseButtons = {
    LEFT: undefined as unknown as THREE.MOUSE,
    MIDDLE: THREE.MOUSE.PAN,
    RIGHT: THREE.MOUSE.ROTATE
  };
  controls.touches = {
    ONE: undefined as unknown as THREE.TOUCH,
    TWO: THREE.TOUCH.DOLLY_PAN
  };

  return controls;
}
