import {
  AssetType,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SessionMode,
  SRGBColorSpace,
  AssetManager,
  World,
  SphereGeometry,
  MeshStandardMaterial,
  LocomotionEnvironment,
  EnvironmentType,
  PanelUI,
  Interactable,
  ScreenSpace,
  MovementMode,
  DistanceGrabbable,
  PhysicsBody, PhysicsShape, PhysicsShapeType, PhysicsState, PhysicsSystem,
  createSystem
} from '@iwsdk/core';


import { PanelSystem } from './panel.js';


const assets = {
    plant : {
      url : '/gltf/plant/scene.gltf',
      type : AssetType.GLTF,
      priority: 'critical', 
    },
    television: {
      url: '/gltf/television/scene.gltf',
      type: AssetType.GLTF,
      priority: 'critical',
    },
    couch: {
      url: '/gltf/couch/scene.gltf',
      type: AssetType.GLTF,
      priority: 'critical',
    }
};

World.create(document.getElementById('scene-container'), {
  assets,
  xr: {
    sessionMode: SessionMode.ImmersiveAR,
    offer: 'always',
    // Optional structured features; layers/local-floor are offered by default
    features: { handTracking: true, layers: false } 
  },
  features: { locomotion: { useWorker: true }, grabbing: true, physics: true},
}).then((world) => {
  const { camera } = world;
  
   // create a floor
  const floorMesh = new Mesh(new PlaneGeometry(20, 20), new MeshStandardMaterial({color:"tan"}));
  floorMesh.rotation.x = -Math.PI / 2;
  const floorEntity = world.createTransformEntity(floorMesh);
  floorEntity.addComponent(LocomotionEnvironment, { type: EnvironmentType.STATIC });
  floorEntity.addComponent(PhysicsShape, { shape: PhysicsShapeType.Auto});
  floorEntity.addComponent(PhysicsBody, { state: PhysicsState.Static });

  //panel for displaying clues to the player (hidden initially)
  const task1Panel = world
  .createTransformEntity();
  
  // Position panel in front and to the left of the user
  task1Panel.object3D.position.set(-0.2, 1.8, -1);
  task1Panel.object3D.scale.set(1, 1, 1);
  task1Panel.object3D.visible = false; // Hide initially

  // Store reference on world for PanelSystem to access
  world.task1Panel = task1Panel;

  const plant = AssetManager.getGLTF('plant').scene;
  plant.scale.set(0.1, 0.1, 0.1);
  plant.position.set(-0.5, 1.3, 0);
  const plantEntity = world.createTransformEntity(plant);
  plantEntity.object3D.visible = false; // Reveal alongside task panel

  const television = AssetManager.getGLTF('television').scene;
  television.scale.set(0.02, 0.02, 0.02);
  television.position.set(-0.3, 1, 0);
  const televisionEntity = world.createTransformEntity(television);
  televisionEntity.object3D.visible = false; // Reveal alongside task panel

  const couch = AssetManager.getGLTF('couch').scene;
  couch.scale.set(0.001, 0.001, 0.001);
  couch.position.set(0.3, 1.3, 0);
  const couchEntity = world.createTransformEntity(couch);
  couchEntity.object3D.visible = false; // Reveal alongside task panel

  // Expose furniture entities for panel-driven visibility
  world.plantEntity = plantEntity;
  world.televisionEntity = televisionEntity;
  world.couchEntity = couchEntity;







  world.registerSystem(PhysicsSystem).registerComponent(PhysicsBody).registerComponent(PhysicsShape);
  
  





  // vvvvvvvv EVERYTHING BELOW WAS ADDED TO DISPLAY A BUTTON TO ENTER VR FOR QUEST 1 DEVICES vvvvvv
  //          (for some reason IWSDK doesn't show Enter VR button on Quest 1)
  world.registerSystem(PanelSystem);

    // Add spatial intro panel (centered)
    const spatialIntroEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: '/ui/intro-spatial.json',
        maxHeight: 0.7,
        maxWidth: 1.2
      })
      .addComponent(Interactable)
      // No ScreenSpace, use 3D position only
    spatialIntroEntity.object3D.position.set(-1.5, 2, -0.5); // Centered at eye level, in front
  
  if (isMetaQuest1()) {
    const panelEntity = world
      .createTransformEntity()
      .addComponent(PanelUI, {
        config: '/ui/welcome.json',
        maxHeight: 0.8,
        maxWidth: 1.6
      })
      .addComponent(Interactable)
      .addComponent(ScreenSpace, {
        top: '20px',
        left: '20px',
        height: '40%'
      });
    panelEntity.object3D.position.set(0, 1.29, -1.9);
  } else {
    // Skip panel on non-Meta-Quest-1 devices
    // Useful for debugging on desktop or newer headsets.
    console.log('Panel UI skipped: not running on Meta Quest 1 (heuristic).');
  }
  function isMetaQuest1() {
    try {
      const ua = (navigator && (navigator.userAgent || '')) || '';
      const hasOculus = /Oculus|Quest|Meta Quest/i.test(ua);
      const isQuest2or3 = /Quest\s?2|Quest\s?3|Quest2|Quest3|MetaQuest2|Meta Quest 2/i.test(ua);
      return hasOculus && !isQuest2or3;
    } catch (e) {
      return false;
    }
  }
});
